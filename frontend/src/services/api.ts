import * as types from '../types';

const API_BASE = 'http://localhost:3000';

// ============================================================================
// API Client
// ============================================================================

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// ============================================================================
// Compile API
// ============================================================================

export async function compileCode(code: string): Promise<types.CompileResponse> {
  return request<types.CompileResponse>('/api/compile', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getAST(): Promise<any> {
  return request<any>('/api/compile/ast');
}

export async function getBytecode(): Promise<any> {
  return request<any>('/api/compile/bytecode');
}

// ============================================================================
// Sandbox API
// ============================================================================

export async function runSandbox(req: types.SandboxRunRequest): Promise<types.SandboxRun> {
  return request<types.SandboxRun>('/api/sandbox/run', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getSandboxLogs(id: string): Promise<{ stdout: string; stderr: string; syscall_log: types.SyscallEntry[] }> {
  return request(`/api/sandbox/logs/${id}`);
}

export async function getSandboxResources(id: string): Promise<types.ResourceUsage> {
  return request<types.ResourceUsage>(`/api/sandbox/resources/${id}`);
}

export async function listSandboxRuns(): Promise<types.SandboxRun[]> {
  return request<types.SandboxRun[]>('/api/sandbox/runs');
}

// ============================================================================
// Fuzzing API
// ============================================================================

export async function startFuzzing(req: types.FuzzStartRequest): Promise<types.FuzzCampaign> {
  return request<types.FuzzCampaign>('/api/fuzz/start', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function stopFuzzing(id: string): Promise<{ success: boolean; campaign_id: string }> {
  return request(`/api/fuzz/stop/${id}`, {
    method: 'POST',
  });
}

export async function getFuzzStatus(id: string): Promise<types.FuzzCampaign> {
  return request<types.FuzzCampaign>(`/api/fuzz/status/${id}`);
}

export async function getFuzzCrashes(id: string): Promise<types.CrashInfo[]> {
  return request<types.CrashInfo[]>(`/api/fuzz/crashes/${id}`);
}

export async function listCampaigns(): Promise<types.FuzzCampaign[]> {
  return request<types.FuzzCampaign[]>('/api/fuzz/campaigns');
}

// ============================================================================
// Logs API
// ============================================================================

export async function getLogs(): Promise<types.LogEntry[]> {
  return request<types.LogEntry[]>('/api/logs');
}

export async function getTimeline(): Promise<types.TimelineResponse> {
  return request<types.TimelineResponse>('/api/logs/timeline');
}

// ============================================================================
// Projects API
// ============================================================================

export async function listProjects(): Promise<types.Project[]> {
  return request<types.Project[]>('/api/projects');
}

export async function createProject(req: types.CreateProjectRequest): Promise<types.Project> {
  return request<types.Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// ============================================================================
// Health Check
// ============================================================================

export async function healthCheck(): Promise<{ status: string; version: string; service: string }> {
  return request('/health');
}
