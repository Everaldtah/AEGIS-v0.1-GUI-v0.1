import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Shield, Terminal, Activity, Wifi } from 'lucide-react';
import * as api from '../services/api';
import * as types from '../types';

const DEFAULT_CODE = `fn main() {
    let x = 100;
    let y = x / 2;
    print(y);
}`;

export default function SandboxRunner() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [memoryLimit, setMemoryLimit] = useState('100M');
  const [timeout, setTimeout] = useState('5s');
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [runResult, setRunResult] = useState<types.SandboxRun | null>(null);

  const handleRun = async () => {
    setRunning(true);
    try {
      const result = await api.runSandbox({
        code,
        memory_limit: memoryLimit,
        timeout: timeout,
        network_enabled: networkEnabled,
      });
      setRunResult(result);
    } catch (error) {
      console.error('Sandbox run failed:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Configuration & Editor */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Sandbox Runner</h2>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Play size={18} />
            {running ? 'Running...' : 'Run in Sandbox'}
          </button>
        </div>

        {/* Sandbox Controls */}
        <div className="aegis-card">
          <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
            <Shield size={18} className="text-blue-400" />
            Sandbox Configuration
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Memory Limit */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Memory Limit</label>
              <select
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
                className="w-full aegis-input"
              >
                <option value="50M">50 MB</option>
                <option value="100M">100 MB</option>
                <option value="256M">256 MB</option>
                <option value="512M">512 MB</option>
                <option value="1G">1 GB</option>
              </select>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Timeout</label>
              <select
                value={timeout}
                onChange={(e) => setTimeout(e.target.value)}
                className="w-full aegis-input"
              >
                <option value="1s">1 second</option>
                <option value="5s">5 seconds</option>
                <option value="10s">10 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="60s">1 minute</option>
              </select>
            </div>

            {/* Network */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Network Access</label>
              <button
                onClick={() => setNetworkEnabled(!networkEnabled)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  networkEnabled
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                <Wifi size={18} />
                {networkEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 aegis-card">
          <Editor
            height="100%"
            defaultLanguage="rust"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
            }}
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="w-96 flex flex-col gap-4">
        {/* Resource Usage */}
        <div className="aegis-card">
          <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
            <Activity size={18} className="text-green-400" />
            Resource Usage
          </h3>
          {runResult?.resource_usage ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Memory</span>
                  <span className="text-white">{runResult.resource_usage.memory_mb} MB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(runResult.resource_usage.memory_mb / 1000) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-white">{runResult.resource_usage.cpu_percent}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${runResult.resource_usage.cpu_percent}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                <span className="text-slate-400">Execution Time</span>
                <span className="text-white">{runResult.resource_usage.execution_time_ms} ms</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Syscalls</span>
                <span className="text-white">{runResult.resource_usage.syscalls_count}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Run code to see resource usage</p>
          )}
        </div>

        {/* Output */}
        <div className="aegis-card flex-1 overflow-auto">
          <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
            <Terminal size={18} className="text-purple-400" />
            Output
          </h3>
          {runResult?.stdout && (
            <pre className="text-sm text-green-400 whitespace-pre-wrap">{runResult.stdout}</pre>
          )}
          {runResult?.stderr && (
            <pre className="text-sm text-red-400 whitespace-pre-wrap">{runResult.stderr}</pre>
          )}
          {!runResult && (
            <p className="text-slate-400 text-sm">Output will appear here</p>
          )}
        </div>

        {/* Syscall Log */}
        {runResult?.syscall_log && runResult.syscall_log.length > 0 && (
          <div className="aegis-card max-h-48 overflow-auto">
            <h3 className="font-semibold text-white mb-2 text-sm">Syscall Log</h3>
            <div className="space-y-1">
              {runResult.syscall_log.map((log, i) => (
                <div key={i} className="text-xs">
                  <span className={log.allowed ? 'text-green-400' : 'text-red-400'}>
                    {log.syscall}
                  </span>
                  <span className="text-slate-500 ml-2">{log.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
