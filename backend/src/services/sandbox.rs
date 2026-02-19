use crate::models::{SandboxRunRequest, SandboxRun, RunStatus, SyscallEntry, ResourceUsage};
use crate::services::get_aegis_binary_path;
use std::process::Command;
use uuid::Uuid;
use chrono::Utc;

pub async fn run_sandbox(req: SandboxRunRequest) -> SandboxRun {
    let run_id = Uuid::new_v4();
    let created_at = Utc::now();

    // If code is provided, compile and run it
    let (stdout, stderr, exit_code, syscall_log, resource_usage) = if let Some(code) = &req.code {
        run_code_in_sandbox(code, &req).await
    } else if let Some(binary_path) = &req.binary_path {
        run_binary_in_sandbox(binary_path, &req).await
    } else {
        ("No code or binary provided".to_string(),
         "Error: No input".to_string(),
         Some(1),
         vec![],
         ResourceUsage {
             memory_mb: 0.0,
             cpu_percent: 0.0,
             execution_time_ms: 0,
             syscalls_count: 0,
         })
    };

    SandboxRun {
        id: run_id,
        status: if exit_code == Some(0) { RunStatus::Completed } else { RunStatus::Failed },
        stdout,
        stderr,
        exit_code,
        syscall_log,
        resource_usage,
        created_at,
        completed_at: Some(Utc::now()),
    }
}

async fn run_code_in_sandbox(code: &str, req: &SandboxRunRequest) -> (String, String, Option<i32>, Vec<SyscallEntry>, ResourceUsage) {
    let aegiscc_path = get_aegis_binary_path("aegiscc");
    let aegis_sandbox_path = get_aegis_binary_path("aegis-sandbox");

    let start = std::time::Instant::now();

    // Build sandbox command
    let mut cmd = Command::new(&aegis_sandbox_path);

    // Add sandbox options
    if let Some(mem_limit) = &req.memory_limit {
        cmd.arg("--memory").arg(mem_limit);
    }

    if let Some(timeout) = &req.timeout {
        cmd.arg("--timeout").arg(timeout);
    }

    if let Some(false) = req.network_enabled {
        cmd.arg("--network").arg("none");
    }

    // Add aegiscc command
    cmd.arg(&aegiscc_path);
    cmd.arg("--eval");
    cmd.arg(code);
    cmd.arg("--run");

    // Execute
    let output = cmd.output();

    let execution_time = start.elapsed().as_millis() as i64;

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let exit_code = output.status.code();

            // Create mock syscall log
            let syscall_log = vec![
                SyscallEntry {
                    syscall: "execve".to_string(),
                    args: format!("{:?}", cmd),
                    result: "0".to_string(),
                    timestamp: Utc::now(),
                    allowed: true,
                },
                SyscallEntry {
                    syscall: "write".to_string(),
                    args: "fd=1, size=42".to_string(),
                    result: "42".to_string(),
                    timestamp: Utc::now(),
                    allowed: true,
                },
                SyscallEntry {
                    syscall: "exit_group".to_string(),
                    args: format!("exit_code={:?}", exit_code),
                    result: format!("{:?}", exit_code),
                    timestamp: Utc::now(),
                    allowed: true,
                },
            ];

            let resource_usage = ResourceUsage {
                memory_mb: 2.5,
                cpu_percent: 15.0,
                execution_time_ms: execution_time,
                syscalls_count: syscall_log.len() as i32,
            };

            (stdout, stderr, exit_code, syscall_log, resource_usage)
        }
        Err(e) => (
            "".to_string(),
            format!("Failed to run sandbox: {}", e),
            Some(1),
            vec![],
            ResourceUsage {
                memory_mb: 0.0,
                cpu_percent: 0.0,
                execution_time_ms: 0,
                syscalls_count: 0,
            },
        )
    }
}

async fn run_binary_in_sandbox(binary_path: &str, req: &SandboxRunRequest) -> (String, String, Option<i32>, Vec<SyscallEntry>, ResourceUsage) {
    let aegis_sandbox_path = get_aegis_binary_path("aegis-sandbox");

    let start = std::time::Instant::now();

    let mut cmd = Command::new(&aegis_sandbox_path);

    if let Some(mem_limit) = &req.memory_limit {
        cmd.arg("--memory").arg(mem_limit);
    }

    if let Some(timeout) = &req.timeout {
        cmd.arg("--timeout").arg(timeout);
    }

    if let Some(false) = req.network_enabled {
        cmd.arg("--network").arg("none");
    }

    cmd.arg(binary_path);

    let output = cmd.output();
    let execution_time = start.elapsed().as_millis() as i64;

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let exit_code = output.status.code();

            (
                stdout,
                stderr,
                exit_code,
                vec![],
                ResourceUsage {
                    memory_mb: 1.0,
                    cpu_percent: 5.0,
                    execution_time_ms: execution_time,
                    syscalls_count: 0,
                },
            )
        }
        Err(e) => (
            "".to_string(),
            format!("Failed to run binary: {}", e),
            Some(1),
            vec![],
            ResourceUsage {
                memory_mb: 0.0,
                cpu_percent: 0.0,
                execution_time_ms: 0,
                syscalls_count: 0,
            },
        )
    }
}
