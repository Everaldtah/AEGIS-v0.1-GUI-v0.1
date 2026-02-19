import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Search } from 'lucide-react';
import * as api from '../services/api';
import * as types from '../types';

const levelColors: Record<types.LogLevel, string> = {
  Debug: 'text-slate-400',
  Info: 'text-blue-400',
  Warning: 'text-yellow-400',
  Error: 'text-red-400',
  Critical: 'text-red-500',
};

const sourceColors: Record<types.LogSource, string> = {
  Compiler: 'bg-purple-600',
  Sandbox: 'bg-green-600',
  Fuzzer: 'bg-yellow-600',
  System: 'bg-slate-600',
};

export default function SecurityTimeline() {
  const [timeline, setTimeline] = useState<types.TimelineResponse | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadTimeline();
    const interval = setInterval(loadTimeline, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await api.getTimeline();
      setTimeline(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  };

  const filteredEntries = timeline?.entries.filter((entry) => {
    const matchesFilter = filter === 'all' || entry.level.toLowerCase() === filter.toLowerCase();
    const matchesSearch = search === '' ||
      entry.message.toLowerCase().includes(search.toLowerCase()) ||
      entry.source.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Security Timeline</h2>
        <button
          onClick={loadTimeline}
          className="flex items-center gap-2 aegis-btn-secondary"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="aegis-card mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="aegis-input"
            >
              <option value="all">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 aegis-input"
            />
          </div>

          <div className="text-sm text-slate-400">
            {filteredEntries.length} of {timeline?.total_count || 0} events
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />

          {/* Timeline Items */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="relative pl-12">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    entry.level === 'Critical' || entry.level === 'Error'
                      ? 'bg-red-500'
                      : entry.level === 'Warning'
                      ? 'bg-yellow-500'
                      : entry.level === 'Info'
                      ? 'bg-blue-500'
                      : 'bg-slate-500'
                  }`}
                />

                {/* Card */}
                <div className="aegis-card">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${sourceColors[entry.source]}`}>
                        {entry.source}
                      </span>
                      <span className={`text-xs font-medium ${levelColors[entry.level]}`}>
                        {entry.level.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-white text-sm">{entry.message}</p>

                  {entry.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        Details
                      </summary>
                      <pre className="mt-2 text-xs text-slate-300 overflow-auto bg-slate-900 p-2 rounded">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
