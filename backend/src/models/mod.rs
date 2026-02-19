use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

// ============================================================================
// Compile Models
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileRequest {
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileResponse {
    pub success: bool,
    pub ast: Option<serde_json::Value>,
    pub bytecode: Option<String>,
    pub policy_validation: PolicyValidationResult,
    pub error: Option<String>,
    pub output: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PolicyValidationResult {
    pub passed: bool,
    pub violations: Vec<String>,
    pub warnings: Vec<String>,
}

// ============================================================================
// Sandbox Models
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct SandboxRunRequest {
    pub binary_path: Option<String>,
    pub code: Option<String>,  // If provided, compiles and runs AegisLang
    pub memory_limit: Option<String>,
    pub timeout: Option<String>,
    pub network_enabled: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SandboxRun {
    pub id: Uuid,
    pub status: RunStatus,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
    pub syscall_log: Vec<SyscallEntry>,
    pub resource_usage: ResourceUsage,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum RunStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Timeout,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyscallEntry {
    pub syscall: String,
    pub args: String,
    pub result: String,
    pub timestamp: DateTime<Utc>,
    pub allowed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResourceUsage {
    pub memory_mb: f64,
    pub cpu_percent: f64,
    pub execution_time_ms: i64,
    pub syscalls_count: i32,
}

// ============================================================================
// Fuzzing Models
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct FuzzStartRequest {
    pub target_binary: String,
    pub corpus_dir: String,
    pub crash_dir: String,
    pub timeout: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuzzCampaign {
    pub id: Uuid,
    pub name: String,
    pub status: FuzzStatus,
    pub target_binary: String,
    pub stats: FuzzStats,
    pub started_at: DateTime<Utc>,
    pub stopped_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum FuzzStatus {
    Idle,
    Running,
    Stopped,
    Error,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuzzStats {
    pub executions: u64,
    pub crashes: u64,
    pub corpus_size: u64,
    pub coverage_percent: f64,
    pub execs_per_second: f64,
    pub mutations_applied: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CrashInfo {
    pub id: Uuid,
    pub campaign_id: Uuid,
    pub input: String,
    pub signal: Option<i32>,
    pub output: String,
    pub discovered_at: DateTime<Utc>,
}

// ============================================================================
// Log Models
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub id: Uuid,
    pub level: LogLevel,
    pub source: LogSource,
    pub message: String,
    pub details: Option<serde_json::Value>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum LogLevel {
    Debug,
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum LogSource {
    Compiler,
    Sandbox,
    Fuzzer,
    System,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimelineResponse {
    pub entries: Vec<LogEntry>,
    pub total_count: u64,
}

// ============================================================================
// Project Models
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: String,
}
