// ============================================================================
// Compile Types
// ============================================================================

export interface CompileRequest {
  code: string;
}

export interface CompileResponse {
  success: boolean;
  ast?: any;
  bytecode?: string;
  policy_validation: PolicyValidationResult;
  error?: string;
  output?: string;
}

export interface PolicyValidationResult {
  passed: boolean;
  violations: string[];
  warnings: string[];
}

// ============================================================================
// Sandbox Types
// ============================================================================

export interface SandboxRunRequest {
  binary_path?: string;
  code?: string;
  memory_limit?: string;
  timeout?: string;
  network_enabled?: boolean;
}

export interface SandboxRun {
  id: string;
  status: RunStatus;
  stdout: string;
  stderr: string;
  exit_code?: number;
  syscall_log: SyscallEntry[];
  resource_usage: ResourceUsage;
  created_at: string;
  completed_at?: string;
}

export type RunStatus = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Timeout';

export interface SyscallEntry {
  syscall: string;
  args: string;
  result: string;
  timestamp: string;
  allowed: boolean;
}

export interface ResourceUsage {
  memory_mb: number;
  cpu_percent: number;
  execution_time_ms: number;
  syscalls_count: number;
}

// ============================================================================
// Fuzzing Types
// ============================================================================

export interface FuzzStartRequest {
  target_binary: string;
  corpus_dir: string;
  crash_dir: string;
  timeout?: string;
}

export interface FuzzCampaign {
  id: string;
  name: string;
  status: FuzzStatus;
  target_binary: string;
  stats: FuzzStats;
  started_at: string;
  stopped_at?: string;
}

export type FuzzStatus = 'Idle' | 'Running' | 'Stopped' | 'Error';

export interface FuzzStats {
  executions: number;
  crashes: number;
  corpus_size: number;
  coverage_percent: number;
  execs_per_second: number;
  mutations_applied: number;
}

export interface CrashInfo {
  id: string;
  campaign_id: string;
  input: string;
  signal?: number;
  output: string;
  discovered_at: string;
}

// ============================================================================
// Log Types
// ============================================================================

export interface LogEntry {
  id: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: any;
  timestamp: string;
}

export type LogLevel = 'Debug' | 'Info' | 'Warning' | 'Error' | 'Critical';
export type LogSource = 'Compiler' | 'Sandbox' | 'Fuzzer' | 'System';

export interface TimelineResponse {
  entries: LogEntry[];
  total_count: number;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}
