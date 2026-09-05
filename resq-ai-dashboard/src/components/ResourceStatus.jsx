import React from 'react';

export function SourceSummary({ sources = [] }) {
    const getStatusColor = (status) => {
        if (status === 'online') return 'bg-emerald-500';
        if (status === 'delayed') return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-y-auto max-h-full">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Sources</h3>
            <div className="space-y-3">
                {sources.length === 0 && <div className="text-xs text-slate-500">No sources active</div>}
                {sources.map((src, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(src.status)}`}></span>
                            <span className="text-slate-700 font-medium truncate max-w-[100px]">{src.name}</span>
                        </div>
                        <span className="text-slate-500 text-xs">{src.records} records</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ResourceStatus({ resources }) {
    if (!resources) return null;
    const { rescue, ambulances, shelter, medicalkits } = resources;
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between max-h-full">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Response Status</h3>
            <div className="text-[10px] text-emerald-600 mb-2 mt-[-10px] uppercase font-bold tracking-wider">Live Operational Demands</div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div>
                    <div className="font-semibold text-slate-800 mb-1">Rescue Teams</div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Available</span><span className="font-medium text-slate-900">{rescue?.available ?? 0}</span></div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Deployed</span><span className="font-medium text-slate-900">{rescue?.deployed ?? 0}</span></div>
                </div>

                <div>
                    <div className="font-semibold text-slate-800 mb-1">Ambulances</div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Available</span><span className="font-medium text-slate-900">{ambulances?.available ?? 0}</span></div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Deployed</span><span className="font-medium text-slate-900">{ambulances?.deployed ?? 0}</span></div>
                </div>

                <div>
                    <div className="font-semibold text-slate-800 mb-1">Shelter</div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Capacity</span><span className="font-medium text-slate-900">{shelter?.capacity ?? 0}</span></div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Occupied</span><span className="font-medium text-slate-900">{shelter?.occupied ?? 0}</span></div>
                </div>

                <div>
                    <div className="font-semibold text-slate-800 mb-1">Medical Kits</div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Available</span><span className="font-medium text-slate-900">{medicalkits?.available ?? 0}</span></div>
                    <div className="text-slate-600 flex justify-between text-xs"><span>Required</span><span className="font-medium text-red-600">{medicalkits?.required ?? 0}</span></div>
                </div>
            </div>
        </div>
    );
}
