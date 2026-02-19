use crate::models::*;
use std::process::Command;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::task::spawn_blocking;
use uuid::Uuid;

pub mod compiler;
pub mod sandbox;
pub mod fuzzer;
pub mod logger;

// ============================================================================
// AEGIS Binary Paths
// ============================================================================

pub fn get_aegis_binary_path(binary_name: &str) -> String {
    // Try to find AEGIS binaries in common locations
    let possible_paths = vec![
        format!("/mnt/c/Projects/AEGIS VERSION 2.0/target/release/{}", binary_name),
        format!("C:\\Projects\\AEGIS VERSION 2.0\\target\\release\\{}.exe", binary_name),
        format!("/usr/local/bin/{}", binary_name),
        format!("{}/.aegis/bin/{}", std::env::var("HOME").unwrap_or_else(|_| "~".to_string()), binary_name),
    ];

    for path in possible_paths {
        if std::path::Path::new(&path).exists() {
            return path;
        }
    }

    // Default to assuming it's in PATH
    binary_name.to_string()
}

// ============================================================================
// In-Memory State Store (for demo purposes)
// ============================================================================

#[derive(Clone)]
pub struct AppState {
    pub projects: Arc<Mutex<Vec<Project>>>,
    pub sandbox_runs: Arc<Mutex<HashMap<Uuid, SandboxRun>>>,
    pub fuzz_campaigns: Arc<Mutex<HashMap<Uuid, FuzzCampaign>>>,
    pub logs: Arc<Mutex<Vec<LogEntry>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            projects: Arc::new(Mutex::new(vec![
                Project {
                    id: Uuid::new_v4(),
                    name: "Demo Project".to_string(),
                    description: "Sample security research project".to_string(),
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                }
            ])),
            sandbox_runs: Arc::new(Mutex::new(HashMap::new())),
            fuzz_campaigns: Arc::new(Mutex::new(HashMap::new())),
            logs: Arc::new(Mutex::new(Vec::new())),
        }
    }
}
