import { useState, useEffect } from 'react';
import { Play, Square, AlertTriangle, Database, Zap, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as api from '../services/api';
import * as types from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FuzzingConsole() {
  const [activeCampaign, setActiveCampaign] = useState<types.FuzzCampaign | null>(null);
  const [crashes, setCrashes] = useState<types.CrashInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
    // Auto-refresh every 2 seconds
    const interval = setInterval(loadCampaigns, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.listCampaigns();
      const active = data.find((c) => c.status === 'Running');
      if (active) {
        setActiveCampaign(active);
        loadCrashes(active.id);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadCrashes = async (campaignId: string) => {
    try {
      const data = await api.getFuzzCrashes(campaignId);
      setCrashes(data);
    } catch (error) {
      console.error('Failed to load crashes:', error);
    }
  };

  const handleStartFuzzing = async () => {
    setLoading(true);
    try {
      const campaign = await api.startFuzzing({
        target_binary: 'test_target',
        corpus_dir: '/tmp/corpus',
        crash_dir: '/tmp/crashes',
      });
      setActiveCampaign(campaign);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to start fuzzing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopFuzzing = async () => {
    if (!activeCampaign) return;
    setLoading(true);
    try {
      await api.stopFuzzing(activeCampaign.id);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to stop fuzzing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for coverage
  const coverageData = {
    labels: ['0s', '10s', '20s', '30s', '40s', '50s', '60s'],
    datasets: [
      {
        label: 'Coverage %',
        data: [0, 15, 35, 52, 68, 75, 78.5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Panel */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Fuzzing Console</h2>
          <div className="flex gap-2">
            {activeCampaign?.status === 'Running' ? (
              <button
                onClick={handleStopFuzzing}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Square size={18} />
                {loading ? 'Stopping...' : 'Stop Campaign'}
              </button>
            ) : (
              <button
                onClick={handleStartFuzzing}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Play size={18} />
                {loading ? 'Starting...' : 'Start Campaign'}
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="aegis-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Executions</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activeCampaign?.stats.executions.toLocaleString() || '0'}
                </p>
              </div>
              <Zap size={32} className="text-yellow-400" />
            </div>
          </div>

          <div className="aegis-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Crashes</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {activeCampaign?.stats.crashes || '0'}
                </p>
              </div>
              <AlertTriangle size={32} className="text-red-400" />
            </div>
          </div>

          <div className="aegis-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Corpus Size</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {activeCampaign?.stats.corpus_size || '0'}
                </p>
              </div>
              <Database size={32} className="text-blue-400" />
            </div>
          </div>

          <div className="aegis-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Execs/sec</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {activeCampaign?.stats.execs_per_second.toFixed(0) || '0'}
                </p>
              </div>
              <Activity size={32} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Coverage Chart */}
        <div className="aegis-card flex-1">
          <h3 className="font-semibold text-white mb-4">Coverage Over Time</h3>
          <div className="h-64">
            <Line data={coverageData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Crashes Panel */}
      <div className="w-96 aegis-card overflow-auto">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          Crashes Found ({crashes.length})
        </h3>

        {crashes.length === 0 ? (
          <p className="text-slate-400 text-sm">No crashes found yet</p>
        ) : (
          <div className="space-y-3">
            {crashes.map((crash) => (
              <div key={crash.id} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    {new Date(crash.discovered_at).toLocaleTimeString()}
                  </span>
                  <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                    SIG {crash.signal}
                  </span>
                </div>
                <pre className="text-xs text-slate-300 overflow-auto max-h-20">
                  {crash.input}
                </pre>
                <p className="text-xs text-red-400 mt-2">{crash.output}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
