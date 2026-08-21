import React from 'react';
import { Home, Package, Activity, LineChart, Settings, AlertTriangle, Sparkles } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const navItems = [
        { icon: Home, label: 'Command Center', active: activeTab === 'Command Center' },
        { icon: AlertTriangle, label: 'Live Incidents', active: activeTab === 'Live Incidents' },
        { icon: Sparkles, label: 'AI Intelligence', active: activeTab === 'AI Intelligence' },
        { icon: Package, label: 'Resources', active: activeTab === 'Resources' },
        { icon: Activity, label: 'Response Operations', active: activeTab === 'Response Operations' },
        { icon: LineChart, label: 'Analytics', active: activeTab === 'Analytics' },
    ];

    return (
        <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-xl tracking-tight">
                    <AlertTriangle size={24} className="fill-red-100" />
                    RESQ-AI
                </div>
                <div className="text-xs text-slate-500 font-medium tracking-wide mt-1 uppercase">
                    Disaster Intelligence
                </div>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                {navItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(item.label)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${item.active
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon size={18} className={item.active ? 'text-slate-900' : 'text-slate-500'} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 w-full">
                    <Settings size={18} />
                    Settings
                </button>
            </div>
        </div>
    );
}
