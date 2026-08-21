import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Charts({ incidents = [] }) {
    const { typeData, severityData } = useMemo(() => {
        const tCounts = {};
        const sCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };

        incidents.forEach(inc => {
            const t = inc.disaster_type || 'Other';
            tCounts[t] = (tCounts[t] || 0) + 1;

            if (sCounts[inc.severity] !== undefined) {
                sCounts[inc.severity]++;
            } else {
                // Approximate unmapped severities
                if (inc.severity === 'Orange') sCounts['High']++;
                else if (inc.severity === 'Red') sCounts['Critical']++;
                else sCounts['Low']++;
            }
        });

        // Get top 5 types
        const typeData = Object.entries(tCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { typeData, severityData: sCounts };
    }, [incidents]);

    return (
        <div className="flex gap-4 h-[250px] max-h-full">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Incidents by Type</h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '10px', fill: '#64748b' }} width={80} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-48 flex flex-col shrink-0">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Severity</h3>
                <div className="flex-1 flex flex-col justify-around">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Critical</span><span className="text-sm font-bold text-red-600">{severityData.Critical}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">High</span><span className="text-sm font-bold text-orange-600">{severityData.High}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Medium</span><span className="text-sm font-bold text-yellow-600">{severityData.Medium}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Low</span><span className="text-sm font-bold text-green-600">{severityData.Low}</span></div>
                </div>
            </div>
        </div>
    );
}
