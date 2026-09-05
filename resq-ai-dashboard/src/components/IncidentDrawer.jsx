import React from 'react';
import { X, MapPin } from 'lucide-react';

export default function IncidentDrawer({ incident, onClose }) {
    if (!incident) return null;

    const affected = incident.people_affected || incident.affected || 0;
    const trapped = incident.trapped || 0;
    const reportsCount = incident.reportsCount || (incident.reports ? incident.reports.length : 1);
    const sourcesList = Array.isArray(incident.sources) ? incident.sources : [incident.source || 'GDACS'];
    const requiredItems = Array.isArray(incident.required) && incident.required.length > 0 
        ? incident.required 
        : ['Rescue Team', 'Emergency Supplies'];
    const statusText = incident.status || (incident.severity === 'Critical' || incident.severity === 'Red' ? 'Needs Immediate Response' : 'Monitoring');
    const locationName = incident.location_name || incident.location || 'Mapped Disaster Area';

    return (
        <>
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>
            <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-slate-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                    <div>
                        <div className="text-xs font-mono text-slate-500 mb-0.5">{incident.id}</div>
                        <h2 className="font-bold text-slate-800">Incident Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{incident.title}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                            <MapPin size={16} />
                            {locationName}
                        </div>
                    </div>

                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold uppercase tracking-wider">
                        {incident.severity || 'Notice'}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">People Affected</div>
                            <div className="text-xl font-bold text-slate-800">{affected}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">People Trapped</div>
                            <div className="text-xl font-bold text-red-600">{trapped}</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Information Metadata</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Reports volume:</span>
                                <span className="font-medium">{reportsCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sources:</span>
                                <span className="font-medium text-slate-700">{sourcesList.join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Resources Required</h4>
                        <div className="flex flex-wrap gap-2">
                            {requiredItems.map((req, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>


                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-2">Status</h4>
                        <div className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            {statusText}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-2">
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                        VIEW REPORTS
                    </button>
                    <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                        VIEW SOURCE
                    </button>
                </div>
            </div>
        </>
    );
}
