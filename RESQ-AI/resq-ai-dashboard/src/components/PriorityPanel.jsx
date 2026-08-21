import React from 'react';
import { Users, Truck } from 'lucide-react';

export default function PriorityPanel({ incidents = [], onIncidentClick }) {
    // Sort by priorityScore (not available from backend yet, so just use severity)
    const sorted = [...incidents].sort((a, b) => {
        if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
        if (a.severity !== 'Critical' && b.severity === 'Critical') return 1;
        return 0;
    }).slice(0, 5);

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'Critical': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">🔴 CRITICAL</span>;
            case 'High': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">🟠 HIGH</span>;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 tracking-tight">RESPONSE PRIORITY</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {sorted.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">No current disaster records available.</div>
                )}
                {sorted.map((inc, index) => (
                    <div
                        key={inc.id}
                        onClick={() => onIncidentClick(inc)}
                        className="p-3 mb-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <div className="flex gap-3">
                            <div className="text-xl font-light text-slate-300">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {getSeverityBadge(inc.severity)}
                                    <span className="text-xs font-semibold text-indigo-500 ml-auto">Score: Pending AI</span>
                                </div>

                                <h4 className="font-semibold text-slate-800 text-sm leading-snug">{inc.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 mb-2">{inc.location}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Users size={14} className="text-slate-400" />
                                        <span>{inc.people_affected || 'N/A'} affected</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="truncate w-32">Pending allocation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
