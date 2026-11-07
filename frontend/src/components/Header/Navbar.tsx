import React from 'react';
import { Shield, RefreshCw, Database } from 'lucide-react';

interface NavbarProps {
  totalRows: number;
  loading: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ totalRows, loading, onRefresh }) => {
  return (
    <header className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Corporate Risk Reporting <span className="text-emerald-400 font-extrabold">(CRR)</span>
              </h1>
              <span className="badge bg-emerald-950 text-emerald-400 border border-emerald-700/60 text-[10px]">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enterprise Risk Analytics & Exposure Monitor · Commodities, Freight & Currencies
            </p>
          </div>
        </div>

        {/* Status Badges & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Dataset: </span>
            <strong className="text-sky-300 font-mono">
              {totalRows > 0 ? totalRows.toLocaleString() : '50,000'} rows
            </strong>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>API Online</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Refresh active aggregations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
