import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, FileCode, Shield, CheckCircle, XCircle } from 'lucide-react';
import * as api from '../services/api';
import * as types from '../types';

const DEFAULT_CODE = `// Write your AegisLang code here
fn main() {
    let x = 42;
    let y = x * 2;
    print(y);
}`;

export default function CodeLab() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [compiling, setCompiling] = useState(false);
  const [result, setResult] = useState<types.CompileResponse | null>(null);

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const response = await api.compileCode(code);
      setResult(response);
    } catch (error) {
      console.error('Compilation failed:', error);
      setResult({
        success: false,
        policy_validation: {
          passed: false,
          violations: ['Failed to connect to backend'],
          warnings: [],
        },
        error: 'Backend connection failed',
      });
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Code Lab</h2>
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Play size={18} />
            {compiling ? 'Compiling...' : 'Compile & Run'}
          </button>
        </div>

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
              rulers: [80],
              padding: { top: 16 },
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="w-96 flex flex-col gap-4">
        {/* Policy Validation */}
        <div className="aegis-card">
          <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
            <Shield size={18} className="text-blue-400" />
            Policy Validation
          </h3>
          {result ? (
            <div className="space-y-2">
              {result.policy_validation.passed ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle size={16} />
                  <span>All policies passed</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {result.policy_validation.violations.map((violation, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-400 text-sm">
                      <XCircle size={16} className="mt-0.5" />
                      <span>{violation}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.policy_validation.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  {result.policy_validation.warnings.map((warning, i) => (
                    <div key={i} className="text-yellow-400 text-sm">
                      ⚠ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Compile code to see policy validation</p>
          )}
        </div>

        {/* AST Viewer */}
        <div className="aegis-card flex-1 overflow-auto">
          <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
            <FileCode size={18} className="text-purple-400" />
            Abstract Syntax Tree
          </h3>
          {result?.ast ? (
            <pre className="text-xs text-slate-300 overflow-auto">
              {JSON.stringify(result.ast, null, 2)}
            </pre>
          ) : (
            <p className="text-slate-400 text-sm">AST will appear here after compilation</p>
          )}
        </div>

        {/* Output */}
        {result?.output && (
          <div className="aegis-card">
            <h3 className="font-semibold text-white mb-2">Output</h3>
            <pre className="text-sm text-green-400 whitespace-pre-wrap">{result.output}</pre>
          </div>
        )}

        {result?.error && (
          <div className="aegis-card border-red-900">
            <h3 className="font-semibold text-red-400 mb-2">Error</h3>
            <pre className="text-sm text-red-300 whitespace-pre-wrap">{result.error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
