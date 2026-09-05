import React from 'react';

export default function IncidentTable({ incidents = [] }) {

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="font-semibold text-slate-800 tracking-tight text-sm">ACTIVE INCIDENTS</h3>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0">
                        <tr>
                            <th className="px-5 py-3 font-semibold">Incident</th>
                            <th className="px-5 py-3 font-semibold">Location</th>
                            <th className="px-5 py-3 font-semibold">Type</th>
                            <th className="px-5 py-3 font-semibold text-left">Affected</th>
                            <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {incidents.length === 0 && (
                            <tr><td colSpan="5" className="p-4 text-center text-slate-500">No active incidents</td></tr>
                        )}
                        {incidents.slice(0, 10).map(inc => (
                            <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3 font-medium text-slate-800 break-words max-w-[220px]">{inc.title}</td>
                                <td className="px-5 py-3 text-slate-600 truncate max-w-[120px]">{inc.location_name || inc.location || 'India'}</td>
                                <td className="px-5 py-3 text-slate-600">{inc.disaster_type || 'Disaster'}</td>
                                <td className="px-5 py-3 text-slate-700 font-medium text-left">{inc.people_affected || inc.affected || '-'}</td>
                                <td className="px-5 py-3 text-slate-600 text-xs">
                                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                                        inc.severity === 'Critical' || inc.severity === 'Red'
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : inc.severity === 'High' || inc.severity === 'Orange'
                                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                        {inc.status || (inc.severity === 'Critical' || inc.severity === 'Red' ? 'Immediate Action' : 'Monitoring')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
