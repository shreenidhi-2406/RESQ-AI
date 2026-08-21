import React from 'react';
import { X, MapPin, Clock, Users, ArrowUpRight, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';
import SourceBadge from './SourceBadge';

export default function IncidentDetailsDrawer({ incident, onClose }) {
    if (!incident) return null;

    const pubTime = incident.published_time 
        ? new Date(incident.published_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'Not reported';
        
    const retTime = incident.retrieved_at 
        ? new Date(incident.retrieved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Not reported';

    const locationName = incident.location_name || incident.location || 'Not reported';
    const hasCoords = typeof incident.latitude === 'number' && typeof incident.longitude === 'number';

    const peopleAffectedDisplay = typeof incident.people_affected === 'number' ? incident.people_affected : "Not reported";
    const peopleTrappedDisplay = typeof incident.people_trapped === 'number' ? incident.people_trapped : "Not reported";

    // AI fields compatibility check
    const aiNeeds = Array.isArray(incident.needs) ? incident.needs : null;
    const aiSituation = incident.situation || null;
    const aiUrgency = incident.urgency || null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
            <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">

                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-1 uppercase">Incident #{incident.id}</div>
                        <h2 className="text-lg font-bold text-slate-800 leading-snug">{incident.title || incident.disaster_type || "User Emergency Alert"}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

                    {/* LOCATION SECTION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Location</h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-2">
                            <div className="flex items-start gap-2.5 text-slate-800 font-semibold text-base">
                                <MapPin size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                <span>{locationName}</span>
                            </div>
                            {hasCoords && (
                                <div className="text-xs font-mono text-slate-500 pl-7 flex items-center gap-1">
                                    <span className="font-semibold text-slate-400">Coordinates:</span>
                                    <span>{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* INCIDENT SUMMARY SECTION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Incident Summary</h3>
                        <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                                <ShieldAlert size={18} className="text-rose-600" />
                                <span>{incident.severity || 'Critical'} Emergency</span>
                            </div>
                            <div className="text-sm font-medium text-slate-700 flex justify-between pt-1">
                                <span>People affected: <strong className="text-slate-900">{peopleAffectedDisplay}</strong></span>
                                <span className="text-slate-500 text-xs">Reported: {pubTime}</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* IMPACT SECTION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Impact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">People affected</div>
                                    <div className="text-lg font-bold text-slate-800">{peopleAffectedDisplay}</div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-500">People trapped</div>
                                    <div className="text-lg font-bold text-slate-800">{peopleTrappedDisplay}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* DETAILS SECTION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Details</h3>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-sm">
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Disaster type</span>
                                <span className="font-bold text-slate-800 capitalize">{incident.disaster_type || 'Not reported'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Severity</span>
                                <span className="font-bold text-slate-800">{incident.severity || 'Not reported'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Alert level</span>
                                <span className="font-bold text-slate-800">{incident.alert_level || 'Not reported'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Source</span>
                                <span className="font-bold text-slate-800">{incident.source || 'USER'}</span>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Reported time</span>
                                <span className="font-bold text-slate-800 text-xs">{pubTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* MESSAGE SECTION */}
                    {incident.description && (
                        <>
                            <hr className="border-slate-100" />
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    Original Emergency Message
                                </h3>
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                                    {incident.description}
                                </div>
                            </div>
                        </>
                    )}

                    {/* AI ANALYSIS SECTION */}
                    <hr className="border-slate-100" />
                    <div>
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-indigo-600" />
                            AI Analysis
                        </h3>
                        {incident.ai ? (
                            <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Informativeness */}
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100/80 shadow-xs">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Informativeness</div>
                                        <div className="font-bold text-emerald-700 text-xs">
                                            {(incident.ai.informativeness?.label || 'informative').toUpperCase()}
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                                            Confidence: {((incident.ai.informativeness?.confidence || 0) * 100).toFixed(2)}%
                                        </div>
                                    </div>

                                    {/* Humanitarian Category */}
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100/80 shadow-xs">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Humanitarian Category</div>
                                        <div className="font-bold text-indigo-700 text-xs truncate">
                                            {incident.ai.humanitarian?.category_display || incident.ai.humanitarian?.category?.replace(/_/g, ' ') || 'N/A'}
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                                            Confidence: {((incident.ai.humanitarian?.confidence || 0) * 100).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Top Alternatives */}
                                {incident.ai.humanitarian?.top_categories && incident.ai.humanitarian.top_categories.length > 0 && (
                                    <div className="bg-white p-3 rounded-lg border border-indigo-100/80 text-xs space-y-1.5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Alternatives</div>
                                        <div className="space-y-1 pt-1">
                                            {incident.ai.humanitarian.top_categories.slice(0, 3).map((cat, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-slate-700">
                                                    <span className="capitalize">{cat.category ? cat.category.replace(/_/g, ' ') : 'Category'}</span>
                                                    <span className="font-mono font-bold text-slate-900">{((cat.probability || 0) * 100).toFixed(2)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-semibold text-slate-500 italic text-center">
                                AI analysis unavailable
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100" />

                    {/* SOURCE INFORMATION */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Source Information</h3>
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="font-medium text-slate-600 text-sm">Verified Source:</span>
                            <SourceBadge source={incident.source} />
                        </div>
                    </div>

                    {/* EXTERNAL LINK */}
                    {incident.source_url && (
                        <a href={incident.source_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">
                            View Original Report <ArrowUpRight size={16} />
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
