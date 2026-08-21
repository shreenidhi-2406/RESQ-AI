import React from 'react';
import { Clock } from 'lucide-react';

export default function IncomingReports({ reports = [] }) {
    const getBadgeIcon = (source) => {
        switch (source?.toUpperCase()) {
            case 'GDACS': return '🔵 ';
            case 'NEWS': return '📰 ';
            case 'COMMUNITY': return '🟢 ';
            case 'SACHET': return '🟣 ';
            default: return '⚪ ';
        }
    };

    function getTimeAgo(dateString) {
        if (!dateString) return "Just now";
        const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff} min ago`;
        return `${Math.floor(diff / 60)} hours ago`;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 tracking-tight">LIVE INCOMING REPORTS</h3>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {reports.length === 0 && (
                    <div className="text-slate-500 text-sm">No incoming reports.</div>
                )}
                {reports.slice(0, 10).map(report => (
                    <div key={report.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold tracking-wider text-slate-700">
                                {getBadgeIcon(report.source)} {report.source}
                            </span>
                        </div>

                        <p className="text-sm text-slate-800 leading-relaxed font-medium mb-2">
                            {report.title}
                        </p>

                        <div className="flex justify-between items-center text-xs text-slate-500">
                            <span className="font-semibold text-slate-600 truncate max-w-[180px]">{report.location}</span>
                            <div className="flex items-center gap-1 shrink-0">
                                <Clock size={12} />
                                {getTimeAgo(report.retrieved_at)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
