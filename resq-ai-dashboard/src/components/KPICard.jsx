import React from 'react';

export default function KPICard({ label, value, subtext, icon: Icon, colorClass, highlight }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
                {Icon && (
                    <div className={`p-2 rounded-lg bg-slate-50`}>
                        <Icon size={18} className={colorClass} />
                    </div>
                )}
            </div>

            <div>
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                <div className={`text-sm mt-1 font-medium ${highlight ? 'text-red-600' : 'text-slate-500'}`}>
                    {subtext}
                </div>
            </div>
        </div>
    );
}
