use crate::models::{LogEntry, LogLevel, LogSource, TimelineResponse};
use uuid::Uuid;
use chrono::Utc;

pub fn add_log(
    logs: &std::sync::Arc<std::sync::Mutex<Vec<LogEntry>>>,
    level: LogLevel,
    source: LogSource,
    message: String,
    details: Option<serde_json::Value>,
) {
    let entry = LogEntry {
        id: Uuid::new_v4(),
        level,
        source,
        message,
        details,
        timestamp: Utc::now(),
    };

    if let Ok(mut logs) = logs.lock() {
        logs.push(entry);
        // Keep only last 1000 logs
        let len = logs.len();
        if len > 1000 {
            logs.drain(0..len - 1000);
        }
    }
}

pub fn get_timeline(
    logs: &std::sync::Arc<std::sync::Mutex<Vec<LogEntry>>>,
    limit: Option<usize>,
) -> TimelineResponse {
    let logs_guard = logs.lock().unwrap();
    let mut entries = logs_guard.clone();

    // Sort by timestamp descending
    entries.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    // Apply limit
    if let Some(limit) = limit {
        entries.truncate(limit);
    }

    TimelineResponse {
        total_count: entries.len() as u64,
        entries,
    }
}

pub fn get_logs_by_source(
    logs: &std::sync::Arc<std::sync::Mutex<Vec<LogEntry>>>,
    source: LogSource,
) -> Vec<LogEntry> {
    let logs_guard = logs.lock().unwrap();
    logs_guard
        .iter()
        .filter(|log| log.source == source)
        .cloned()
        .collect()
}
