import React from 'react';
import SourceBadge from './SourceBadge';
import { generateIncidentSentence, formatIncidentTime } from '../utils/incidentFormatter';
import { MapPin } from 'lucide-react';

export default function IncidentCard({ incident, isNew, isUpdated, onClick }) {
    const sentence = generateIncidentSentence(incident);
    const timeStr = formatIncidentTime(incident.retrieved_at || incident.published_time);




    return (
        <div className={'bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col p-5 '}>

            {/* Top row: Severity + Badges + Source */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    {isNew && <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest animate-pulse">NEW</span>}
                    {isUpdated && <span className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">UPDATED</span>}
                </div>

                <SourceBadge source={incident.source} />
            </div>

            {/* Main Sentence */}
            <p className="text-[15px] text-slate-900 font-medium leading-relaxed mb-4 pr-4">
                {sentence}
            </p>

            {/* Location + Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin size={14} className="text-slate-400" />
                    {incident.location || 'Unknown'}
                </div>
                <span>&middot;</span>
                <span>{timeStr}</span>
            </div>

            {/* Resources Need section if any */}
            {incident.resource_needs && Object.keys(incident.resource_needs).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Immediate needs</div>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(incident.resource_needs).map(([res, num]) => {
                            let icon = '📦';
                            const r = res.toLowerCase();
                            if (r === 'food') icon = '🍱';
                            if (r === 'water') icon = '💧';
                            if (r === 'ambulance') icon = '🚑';
                            if (r === 'rescue_team') icon = '🚁';

                            return (
                                <span key={res} className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                    {icon} {res.charAt(0).toUpperCase() + res.slice(1)} &times; {num}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            <button
                onClick={() => onClick(incident)}
                className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-800 text-left transition-colors self-start"
            >
                View Incident &rarr;
            </button>
        </div>
    );
}
