use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde_json::{json, Value};
use std::sync::Arc;
use uuid::Uuid;

use crate::models::*;
use crate::services::{self, AppState, compiler, sandbox, fuzzer, logger};

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        // Health check
        .route("/health", get(health_check))

        // Compile endpoints
        .route("/api/compile", post(compile_code))
        .route("/api/compile/ast", get(get_ast))
        .route("/api/compile/bytecode", get(get_bytecode))

        // Sandbox endpoints
        .route("/api/sandbox/run", post(run_sandbox))
        .route("/api/sandbox/logs/:id", get(get_sandbox_logs))
        .route("/api/sandbox/resources/:id", get(get_sandbox_resources))
        .route("/api/sandbox/runs", get(list_sandbox_runs))

        // Fuzzing endpoints
        .route("/api/fuzz/start", post(start_fuzzing))
        .route("/api/fuzz/stop/:id", post(stop_fuzzing))
        .route("/api/fuzz/status/:id", get(get_fuzz_status))
        .route("/api/fuzz/crashes/:id", get(get_fuzz_crashes))
        .route("/api/fuzz/campaigns", get(list_campaigns))

        // Logs endpoints
        .route("/api/logs", get(get_logs))
        .route("/api/logs/timeline", get(get_timeline))

        // Projects endpoints
        .route("/api/projects", get(list_projects).post(create_project))

        .with_state(state)
}

// ============================================================================
// Health Check
// ============================================================================

async fn health_check() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "version": "0.1.0",
        "service": "AEGIS Studio Backend"
    }))
}

// ============================================================================
// Compile Endpoints
// ============================================================================

async fn compile_code(State(state): State<Arc<AppState>>, Json(req): Json<CompileRequest>) -> impl IntoResponse {
    let response = compiler::compile_code(req).await;

    // Log the compilation
    logger::add_log(
        &state.logs,
        if response.success {
            LogLevel::Info
        } else {
            LogLevel::Error
        },
        LogSource::Compiler,
        if response.success {
            "Code compiled successfully".to_string()
        } else {
            "Code compilation failed".to_string()
        },
        Some(json!({ "success": response.success })),
    );

    Json(response)
}

async fn get_ast(State(_state): State<Arc<AppState>>) -> impl IntoResponse {
    Json(json!({
        "ast": {
            "type": "Program",
            "functions": []
        }
    }))
}

async fn get_bytecode(State(_state): State<Arc<AppState>>) -> impl IntoResponse {
    Json(json!({
        "bytecode": []
    }))
}

// ============================================================================
// Sandbox Endpoints
// ============================================================================

async fn run_sandbox(State(state): State<Arc<AppState>>, Json(req): Json<SandboxRunRequest>) -> impl IntoResponse {
    let run = sandbox::run_sandbox(req).await;
    let run_id = run.id;

    // Store the run
    {
        let mut runs = state.sandbox_runs.lock().unwrap();
        runs.insert(run_id, run.clone());
    }

    // Log the sandbox run
    logger::add_log(
        &state.logs,
        match run.status {
            RunStatus::Completed => LogLevel::Info,
            RunStatus::Failed | RunStatus::Timeout => LogLevel::Error,
            _ => LogLevel::Info,
        },
        LogSource::Sandbox,
        format!("Sandbox run {} completed with status {:?}", run_id, run.status),
        Some(json!({
            "run_id": run_id,
            "status": run.status,
            "exit_code": run.exit_code
        })),
    );

    Json(run)
}

async fn get_sandbox_logs(State(state): State<Arc<AppState>>, Path(id): Path<Uuid>) -> impl IntoResponse {
    let runs = state.sandbox_runs.lock().unwrap();
    if let Some(run) = runs.get(&id) {
        Json(json!({
            "stdout": run.stdout,
            "stderr": run.stderr,
            "syscall_log": run.syscall_log
        }))
    } else {
        Json(json!({ "error": "Run not found" }))
    }
}

async fn get_sandbox_resources(State(state): State<Arc<AppState>>, Path(id): Path<Uuid>) -> impl IntoResponse {
    let runs = state.sandbox_runs.lock().unwrap();
    if let Some(run) = runs.get(&id) {
        Json(json!({ "success": true, "data": run.resource_usage }))
    } else {
        Json(json!({ "success": false, "error": "Run not found" }))
    }
}

async fn list_sandbox_runs(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let runs = state.sandbox_runs.lock().unwrap();
    let run_list: Vec<SandboxRun> = runs.values().cloned().collect();
    Json(run_list)
}

// ============================================================================
// Fuzzing Endpoints
// ============================================================================

async fn start_fuzzing(State(state): State<Arc<AppState>>, Json(req): Json<FuzzStartRequest>) -> impl IntoResponse {
    let campaign = fuzzer::start_fuzzing(req).await;
    let campaign_id = campaign.id;

    // Store the campaign
    {
        let mut campaigns = state.fuzz_campaigns.lock().unwrap();
        campaigns.insert(campaign_id, campaign.clone());
    }

    // Log the campaign start
    logger::add_log(
        &state.logs,
        LogLevel::Info,
        LogSource::Fuzzer,
        format!("Fuzzing campaign {} started", campaign_id),
        Some(json!({ "campaign_id": campaign_id })),
    );

    Json(campaign)
}

async fn stop_fuzzing(State(state): State<Arc<AppState>>, Path(id): Path<Uuid>) -> impl IntoResponse {
    let stopped = fuzzer::stop_fuzzing(id).await;

    // Update campaign status
    {
        let mut campaigns = state.fuzz_campaigns.lock().unwrap();
        if let Some(campaign) = campaigns.get_mut(&id) {
            campaign.status = FuzzStatus::Stopped;
            campaign.stopped_at = Some(chrono::Utc::now());
        }
    }

    if stopped {
        logger::add_log(
            &state.logs,
            LogLevel::Info,
            LogSource::Fuzzer,
            format!("Fuzzing campaign {} stopped", id),
            Some(json!({ "campaign_id": id })),
        );
    }

    Json(json!({ "success": stopped, "campaign_id": id }))
}

async fn get_fuzz_status(State(_state): State<Arc<AppState>>, Path(id): Path<Uuid>) -> impl IntoResponse {
    if let Some(campaign) = fuzzer::get_campaign_status(id).await {
        Json(json!({ "success": true, "data": campaign }))
    } else {
        Json(json!({ "success": false, "error": "Campaign not found" }))
    }
}

async fn get_fuzz_crashes(State(_state): State<Arc<AppState>>, Path(id): Path<Uuid>) -> impl IntoResponse {
    let crashes = fuzzer::get_crashes(id).await;
    Json(crashes)
}

async fn list_campaigns(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let campaigns = state.fuzz_campaigns.lock().unwrap();
    let campaign_list: Vec<FuzzCampaign> = campaigns.values().cloned().collect();
    Json(campaign_list)
}

// ============================================================================
// Logs Endpoints
// ============================================================================

async fn get_logs(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let logs = state.logs.lock().unwrap();
    let log_entries: Vec<LogEntry> = logs.clone();
    Json(log_entries)
}

async fn get_timeline(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let timeline = logger::get_timeline(&state.logs, Some(100));
    Json(timeline)
}

// ============================================================================
// Projects Endpoints
// ============================================================================

async fn list_projects(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let projects = state.projects.lock().unwrap();
    Json(projects.clone())
}

async fn create_project(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateProjectRequest>
) -> impl IntoResponse {
    let project = Project {
        id: Uuid::new_v4(),
        name: req.name.clone(),
        description: req.description,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let mut projects = state.projects.lock().unwrap();
    projects.push(project.clone());

    Json(project)
}
