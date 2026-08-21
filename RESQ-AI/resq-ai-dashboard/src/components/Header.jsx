import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';

export default function Header({ onRefresh, lastFetchTime, error }) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time disaster intelligence and response overview</p>
                {error && <p className="text-xs text-red-600 bg-red-50 mt-2 px-2 py-1 rounded inline-block">⚠ {error}</p>}
            </div>
            <div className="flex items-center gap-6">
                <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <RefreshCw size={14} /> Refresh Data
                </button>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-600 tracking-wider">SYSTEM ONLINE</span>
                </div>

                <div className="text-right">
                    <div className="text-xs text-slate-400 flex flex-col">
                        <span>Last updated:</span>
                        <span className="font-medium text-slate-600">{lastFetchTime || 'Just now'}</span>
                    </div>
                </div>

                <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 relative">
                    <Bell size={18} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>
        </div>
    );
}
