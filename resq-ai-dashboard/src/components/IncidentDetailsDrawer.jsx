import React from 'react';
import { X, MapPin, Clock, Users, ArrowUpRight } from 'lucide-react';
import { generateIncidentSentence, formatIncidentTime } from '../utils/incidentFormatter';
import SourceBadge from './SourceBadge';

export default function IncidentDetailsDrawer({ incident, onClose }) {
    if (!incident) return null;

    const sentence = generateIncidentSentence(incident);
    const pubTime = new Date(incident.published_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const retTime = new Date(incident.retrieved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
            <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <div className="text-xs font-bold text-slate-400 tracking-wider mb-1 uppercase">Incident #{incident.id}</div>
                        <h2 className="text-lg font-bold text-slate-800">{incident.title || incident.disaster_type}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* Location & Severity */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <MapPin size={18} className="text-slate-400" />
                            {incident.location || 'Unknown Location'}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Summary */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incident Summary</h3>
                        <p className="text-[15px] font-medium text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {sentence}
                        </p>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Impact */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Impact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded text-blue-600">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">People affected</div>
                                    <div className="text-xl font-bold text-slate-800">{incident.people_affected || 0}</div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded text-orange-600">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">People trapped</div>
                                    <div className="text-xl font-bold text-slate-800">{incident.people_trapped || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Resource Needs */}
                    {incident.resource_needs && Object.keys(incident.resource_needs).length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resource Needs</h3>
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                {Object.entries(incident.resource_needs).map(([res, count], i) => (
                                    <div key={res} className={'px-4 py-3 flex justify-between items-center text-sm font-medium ' + (i > 0 ? 'border-t border-slate-100' : '')}>
                                        <div className="flex items-center gap-2 text-slate-700 capitalize">
                                            {res}
                                        </div>
                                        <div className="font-bold text-slate-900">{count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="border-slate-100" />

                    {/* Source Information */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Source Information</h3>
                        <div className="flex flex-col gap-4 text-sm text-slate-600">

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-500">Source:</span>
                                <SourceBadge source={incident.source} />
                            </div>



                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-500">Reported:</span>
                                <span className="font-bold text-slate-800">{pubTime}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-500">Last updated:</span>
                                <span className="font-bold text-slate-800">{retTime}</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Link */}
                    {incident.source_url && (
                        <a href={incident.source_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors">
                            View Original Report <ArrowUpRight size={16} />
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
