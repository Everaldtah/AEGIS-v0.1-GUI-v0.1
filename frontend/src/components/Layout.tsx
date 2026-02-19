import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Code2,
  Shield,
  Bug,
  History,
  FolderKanban,
  Crosshair,
  FlaskConical,
  FileText,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Code2, label: 'Code Lab' },
  { path: '/sandbox', icon: Shield, label: 'Sandbox Runner' },
  { path: '/fuzzing', icon: Bug, label: 'Fuzzing Console' },
  { path: '/timeline', icon: History, label: 'Security Timeline' },
];

const sidebarItems = [
  { icon: FolderKanban, label: 'Projects', count: 3 },
  { icon: Crosshair, label: 'Targets', count: 5 },
  { icon: FlaskConical, label: 'Fuzz Campaigns', count: 2 },
  { icon: FileText, label: 'Logs', count: 127 },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">AEGIS Studio</h1>
          <p className="text-xs text-slate-400 mt-1">Security Research Platform</p>
        </div>

        {/* Sidebar Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Explorer</div>
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <item.icon size={16} />
                <span>{item.label}</span>
              </div>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              U
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Researcher</div>
              <div className="text-xs text-slate-400">Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation */}
        <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
