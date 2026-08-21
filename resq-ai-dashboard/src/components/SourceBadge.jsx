import React from 'react';

export default function SourceBadge({ source }) {
    const s = (source || '').toUpperCase();

    let colorClass = 'bg-slate-100 text-slate-700';
    let icon = '⚪';

    if (s.includes('COMMUNITY')) {
        colorClass = 'bg-purple-100 text-purple-700';
        icon = '🟣';
    } else if (s.includes('GDACS')) {
        colorClass = 'bg-blue-100 text-blue-700';
        icon = '🔵';
    } else if (s.includes('NEWS')) {
        colorClass = 'bg-emerald-100 text-emerald-700';
        icon = '📰';
    } else if (s.includes('SACHET')) {
        colorClass = 'bg-orange-100 text-orange-700';
        icon = '🟠';
    }

    return (
        <span className={'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ' + colorClass}>
            {icon} {s}
        </span>
    );
}
