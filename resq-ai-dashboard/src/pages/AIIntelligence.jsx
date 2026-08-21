import React, { useState, useEffect, useMemo } from 'react';
import { getIncidents } from '../services/api';
import SourceBadge from '../components/SourceBadge';
import IncidentDetailsDrawer from '../components/IncidentDetailsDrawer';
import { groupIncidents } from '../utils/eventGrouper';
import { 
    Sparkles, 
    RefreshCw, 
    BrainCircuit, 
    CheckCircle2, 
    XCircle, 
    HeartHandshake, 
    MapPin, 
    Clock, 
    ShieldCheck, 
    Bot,
    Layers,
    ChevronDown,
    ChevronUp,
    FileText
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    PieChart, 
    Pie, 
    Cell, 
    Legend 
} from 'recharts';

const ALL_HUMANITARIAN_CATEGORIES = [
    { key: 'affected_individual', label: 'Affected Individual' },
    { key: 'infrastructure_and_utilities_damage', label: 'Infrastructure & Utilities Damage' },
    { key: 'requests_or_needs', label: 'Requests or Needs' },
    { key: 'displaced_and_evacuations', label: 'Displaced & Evacuations' },
    { key: 'injured_or_dead_people', label: 'Injured or Dead People' },
    { key: 'caution_and_advice', label: 'Caution & Advice' },
    { key: 'response_efforts', label: 'Response Efforts' },
    { key: 'missing_and_found_people', label: 'Missing & Found People' },
    { key: 'donation_and_volunteering', label: 'Donation & Volunteering' },
    { key: 'sympathy_and_support', label: 'Sympathy & Support' },
    { key: 'not_humanitarian', label: 'Not Humanitarian' }
];

export default function AIIntelligence() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(new Date().toLocaleTimeString());
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [expandedGroupIds, setExpandedGroupIds] = useState(new Set());

    const fetchData = async () => {
        try {
            const data = await getIncidents();
            setIncidents(data || []);
            setLastFetchTime(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            console.error("Failed to fetch incidents for AI Intelligence:", err);
            setError("Unable to load AI intelligence data. Please try refreshing the dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s sync
        return () => clearInterval(interval);
    }, []);

    // Filter valid AI-processed incidents defensively
    const aiIncidents = useMemo(() => {
        return incidents.filter(inc => inc && inc.ai && typeof inc.ai === 'object');
    }, [incidents]);

    // Consolidated Event Grouping Computation
    const consolidatedEvents = useMemo(() => {
        return groupIncidents(incidents);
    }, [incidents]);

    const toggleGroupExpand = (groupId) => {
        setExpandedGroupIds(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    // KPI Metrics Computation
    const metrics = useMemo(() => {
        const totalAi = aiIncidents.length;
        if (totalAi === 0) {
            return {
                totalAi: 0,
                informativeCount: 0,
                informativePct: '0.0',
                nonInformativeCount: 0,
                nonInformativePct: '0.0',
                humanitarianCount: 0,
                humanitarianPct: '0.0'
            };
        }

        let informativeCount = 0;
        let nonInformativeCount = 0;
        let humanitarianCount = 0;

        aiIncidents.forEach(inc => {
            const infoLabel = inc.ai?.informativeness?.label;
            if (infoLabel === 'informative') {
                informativeCount++;
            } else if (infoLabel === 'not_informative') {
                nonInformativeCount++;
            }

            const humCategory = inc.ai?.humanitarian?.category;
            if (humCategory && humCategory !== 'not_humanitarian') {
                humanitarianCount++;
            }
        });

        return {
            totalAi,
            informativeCount,
            informativePct: ((informativeCount / totalAi) * 100).toFixed(1),
            nonInformativeCount,
            nonInformativePct: ((nonInformativeCount / totalAi) * 100).toFixed(1),
            humanitarianCount,
            humanitarianPct: ((humanitarianCount / totalAi) * 100).toFixed(1)
        };
    }, [aiIncidents]);

    // Humanitarian Categories Bar Chart Data
    const humanitarianChartData = useMemo(() => {
        const counts = {};
        ALL_HUMANITARIAN_CATEGORIES.forEach(c => { counts[c.key] = 0; });

        aiIncidents.forEach(inc => {
            const cat = inc.ai?.humanitarian?.category;
            if (cat && counts[cat] !== undefined) {
                counts[cat]++;
            } else if (cat) {
                counts[cat] = 1;
            }
        });

        return ALL_HUMANITARIAN_CATEGORIES.map(c => ({
            name: c.label,
            key: c.key,
            count: counts[c.key] || 0
        })).sort((a, b) => b.count - a.count);
    }, [aiIncidents]);

    // Informativeness Pie Chart Data
    const informativenessPieData = useMemo(() => {
        return [
            { name: 'Informative', value: metrics.informativeCount, color: '#10b981' },
            { name: 'Not Informative', value: metrics.nonInformativeCount, color: '#64748b' }
        ];
    }, [metrics]);

    const formatPercent = (val) => {
        if (typeof val !== 'number' || isNaN(val)) return '0.00%';
        return `${(val * 100).toFixed(2)}%`;
    };

    if (loading && incidents.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center ml-64">
                <div className="flex flex-col items-center">
                    <RefreshCw size={36} className="animate-spin text-indigo-600 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Loading AI Intelligence...</h2>
                    <p className="text-sm text-slate-500 mt-1">Evaluating Hugging Face Transformer classifications</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Incident Details Drawer */}
            <IncidentDetailsDrawer
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
            />

            <main className="flex-1 p-6 md:p-8 ml-64 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <Sparkles className="text-indigo-600 fill-indigo-100" size={24} />
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
                                    AI INTELLIGENCE DASHBOARD
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500">
                                Real-time NLP classifications powered by XLM-RoBERTa Transformer Models
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full shadow-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                                </span>
                                <span className="text-xs font-bold tracking-wider uppercase">AI Pipeline Active</span>
                            </div>

                            <button 
                                onClick={fetchData} 
                                className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw size={14} /> Refresh AI Data
                            </button>

                            <div className="text-right pl-2 border-l border-slate-200">
                                <div className="text-xs text-slate-400">Last Telemetry:</div>
                                <div className="text-xs font-semibold text-slate-700">{lastFetchTime}</div>
                            </div>
                        </div>
                    </div>

                    {/* ERROR BANNER */}
                    {error && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl mb-6 flex justify-between items-center text-rose-700 text-sm">
                            <div className="font-semibold flex items-center gap-2">
                                <XCircle size={18} /> {error}
                            </div>
                            <button onClick={fetchData} className="font-bold underline text-xs">Retry Now</button>
                        </div>
                    )}

                    {/* KPI SUMMARY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {/* Card 1 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">AI ANALYZED</span>
                                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalAi}</div>
                                </div>
                                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg">
                                    <BrainCircuit size={22} />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                                <span>Total incidents processed</span>
                                <span className="font-bold text-slate-700">100%</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase">INFORMATIVE</span>
                                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.informativeCount}</div>
                                </div>
                                <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
                                    <CheckCircle2 size={22} />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                                <span>Actionable reports</span>
                                <span className="font-bold text-emerald-600">{metrics.informativePct}%</span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">NON-INFORMATIVE</span>
                                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.nonInformativeCount}</div>
                                </div>
                                <div className="bg-slate-100 text-slate-600 p-2.5 rounded-lg">
                                    <XCircle size={22} />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                                <span>Noise / Non-actionable</span>
                                <span className="font-bold text-slate-600">{metrics.nonInformativePct}%</span>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[11px] font-bold text-indigo-600 tracking-wider uppercase">HUMANITARIAN</span>
                                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.humanitarianCount}</div>
                                </div>
                                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg">
                                    <HeartHandshake size={22} />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-slate-500 mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                                <span>Human impact category</span>
                                <span className="font-bold text-indigo-600">{metrics.humanitarianPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* EMPTY STATE WARNING */}
                    {aiIncidents.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm max-w-2xl mx-auto my-12">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">No AI-analyzed incidents yet</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Emergency reports submitted via User SOS or connected sources will automatically be analyzed by the Hugging Face AI pipeline and displayed here.
                            </p>
                            <button 
                                onClick={fetchData} 
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                            >
                                <RefreshCw size={14} /> Check For New Incidents
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* CONSOLIDATED DISASTER EVENTS SECTION */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                            <Layers size={20} className="text-indigo-600" />
                                            CONSOLIDATED DISASTER EVENTS
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Consolidated clustering of related emergency reports describing the same potential disaster event
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                                            {consolidatedEvents.length} Consolidated Events
                                        </span>
                                    </div>
                                </div>

                                {consolidatedEvents.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 text-sm italic">
                                        No consolidated disaster events clustered yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {consolidatedEvents.map(event => {
                                            const isExpanded = expandedGroupIds.has(event.groupId);
                                            const isMultiReport = event.reportCount > 1;

                                            return (
                                                <div 
                                                    key={event.groupId}
                                                    className={`border rounded-xl transition-all shadow-xs overflow-hidden ${
                                                        isMultiReport 
                                                            ? 'bg-gradient-to-r from-indigo-50/40 to-slate-50 border-indigo-200/90 hover:border-indigo-300' 
                                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                                        
                                                        {/* Event Details */}
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {isMultiReport ? (
                                                                    <span className="bg-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
                                                                        <Layers size={12} /> {event.reportCount} RELATED REPORTS &middot; {event.sourceCount} SOURCES
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase border border-slate-200">
                                                                        1 REPORT &middot; SOURCE: {event.sources[0]}
                                                                    </span>
                                                                )}

                                                                <span className="text-xs text-slate-400 font-mono font-semibold">
                                                                    ID: #{event.groupId}
                                                                </span>
                                                            </div>

                                                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                                                                {event.title}
                                                            </h3>

                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                                                                <div className="flex items-center gap-1 text-slate-800 font-semibold">
                                                                    <MapPin size={14} className="text-rose-500" />
                                                                    {event.location}
                                                                </div>
                                                                <span>&middot;</span>
                                                                <div className="flex items-center gap-1 text-indigo-700 font-bold">
                                                                    <HeartHandshake size={14} className="text-indigo-600" />
                                                                    {event.humanitarianCategory}
                                                                </div>
                                                                <span>&middot;</span>
                                                                <span className="text-slate-500">
                                                                    Humanitarian Classification Confidence: <strong className="text-slate-800 font-mono">{formatPercent(event.humanitarianConfidence)}</strong>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Source Badges & Action Toggle */}
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Sources:</span>
                                                                {event.sources.map((src, i) => (
                                                                    <SourceBadge key={i} source={src} />
                                                                ))}
                                                            </div>

                                                            {isMultiReport && (
                                                                <button
                                                                    onClick={() => toggleGroupExpand(event.groupId)}
                                                                    className="flex items-center gap-1.5 text-xs font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3.5 py-2 rounded-lg transition-colors shrink-0"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            <ChevronUp size={16} /> Hide {event.reportCount} Reports
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown size={16} /> View {event.reportCount} Related Reports
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Related Reports Accordion List */}
                                                    {(isExpanded || !isMultiReport) && (
                                                        <div className="bg-slate-100/60 border-t border-slate-200/80 p-4 space-y-2.5">
                                                            <div className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                                                                <span>Incidents Included in Event ({event.incidents.length})</span>
                                                                <span className="text-slate-400 font-normal">Click any report to view details</span>
                                                            </div>

                                                            {event.incidents.map((inc, i) => {
                                                                const repTime = inc.published_time
                                                                    ? new Date(inc.published_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                                                    : 'Recent';

                                                                return (
                                                                    <div 
                                                                        key={inc.id || i}
                                                                        onClick={() => setSelectedIncident(inc)}
                                                                        className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                                                            <div>
                                                                                <div className="flex items-center gap-2 text-xs mb-1">
                                                                                    <SourceBadge source={inc.source} />
                                                                                    <span className="font-mono text-slate-400 font-semibold">#{inc.id}</span>
                                                                                    <span className="text-slate-400">&middot; {repTime}</span>
                                                                                </div>
                                                                                <p className="text-xs font-medium text-slate-800 leading-snug">
                                                                                    {inc.description || inc.title || "Emergency alert report"}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                                                            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                                                {inc.ai?.humanitarian?.category_display || inc.ai?.humanitarian?.category || 'Category'}
                                                                            </span>
                                                                            <button className="text-xs font-bold text-indigo-600 hover:underline">
                                                                                Inspect &rarr;
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* CHARTS SECTION */}
                            <div className="grid grid-cols-12 gap-8 mb-8">

                                {/* Humanitarian Classification Distribution */}
                                <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                                                Humanitarian Classification Distribution
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Breakdown across 11 Hugging Face Humanitarian Dimension Taxonomy Labels
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                                            Model 2 Output
                                        </span>
                                    </div>

                                    <div className="h-[360px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                layout="vertical"
                                                data={humanitarianChartData}
                                                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                                            >
                                                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                                                <YAxis 
                                                    type="category" 
                                                    dataKey="name" 
                                                    stroke="#475569" 
                                                    fontSize={11}
                                                    tickLine={false}
                                                    width={135}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#0f172a',
                                                        borderColor: '#334155',
                                                        borderRadius: '8px',
                                                        color: '#ffffff',
                                                        fontSize: '12px'
                                                    }}
                                                    formatter={(value) => [`${value} incidents`, 'Count']}
                                                />
                                                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={18} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Informativeness Ratio */}
                                <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                    <div className="pb-4 border-b border-slate-100">
                                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                                            Informativeness Ratio
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            XLM-RoBERTa Actionable vs Non-Actionable Gatekeeper
                                        </p>
                                    </div>

                                    <div className="h-[260px] w-full relative my-auto">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={informativenessPieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={95}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {informativenessPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: '#0f172a',
                                                        borderColor: '#334155',
                                                        borderRadius: '8px',
                                                        color: '#ffffff',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={36} 
                                                    iconType="circle"
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Center ratio indicator */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                            <span className="text-2xl font-black text-slate-900">{metrics.informativePct}%</span>
                                            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Informative</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-xs text-slate-600 flex justify-between items-center mt-2">
                                        <span>Gatekeeper Efficiency:</span>
                                        <span className="font-bold text-slate-800">
                                            {metrics.informativeCount} / {metrics.totalAi} Actionable
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* RECENT AI ANALYSIS RECENT FEED */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                            <ShieldCheck size={18} className="text-indigo-600" />
                                            Recent AI Analyzed Incidents
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Detailed inference output and top alternative category predictions
                                        </p>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500">
                                        Showing {aiIncidents.length} AI analyzed incidents
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {aiIncidents.map(inc => {
                                        const ai = inc.ai || {};
                                        const info = ai.informativeness || {};
                                        const hum = ai.humanitarian || {};
                                        const isInformative = info.is_informative === true || info.label === 'informative';

                                        const formattedTime = inc.published_time 
                                            ? new Date(inc.published_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                            : 'Recent';

                                        return (
                                            <div 
                                                key={inc.id}
                                                className="bg-slate-50/70 border border-slate-200/90 hover:border-indigo-200 rounded-xl p-5 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                                            >
                                                {/* Left column: Incident text & Metadata */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider">
                                                            #{inc.id}
                                                        </span>
                                                        <SourceBadge source={inc.source} />
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={12} /> {formattedTime}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                                                        {inc.description || inc.title || "Emergency alert report."}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <MapPin size={14} className="text-rose-500 shrink-0" />
                                                        <span>{inc.location_name || inc.location || "Location not specified"}</span>
                                                    </div>
                                                </div>

                                                {/* Right column: AI Badges & Top Categories */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:pl-6 lg:border-l lg:border-slate-200/80">
                                                    
                                                    {/* Informativeness Card */}
                                                    <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs min-w-[150px]">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Informativeness</div>
                                                        {isInformative ? (
                                                            <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                                <span>INFORMATIVE</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 font-bold text-slate-600 text-xs">
                                                                <XCircle size={14} className="text-slate-400" />
                                                                <span>NOT INFORMATIVE</span>
                                                            </div>
                                                        )}
                                                        <div className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                                                            Confidence: {formatPercent(info.confidence)}
                                                        </div>
                                                    </div>

                                                    {/* Humanitarian Category Card */}
                                                    <div className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs min-w-[210px]">
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Humanitarian Category</div>
                                                        {hum && hum.category ? (
                                                            <>
                                                                <div className="font-bold text-indigo-700 text-xs truncate max-w-[190px]">
                                                                    {hum.category_display || hum.category.replace(/_/g, ' ')}
                                                                </div>
                                                                <div className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
                                                                    Confidence: {formatPercent(hum.confidence)}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-xs font-medium text-slate-400 italic">
                                                                Not applicable
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Top 3 Alternative Probabilities */}
                                                    {hum && Array.isArray(hum.top_categories) && hum.top_categories.length > 0 && (
                                                        <div className="bg-slate-100/70 p-3 rounded-lg border border-slate-200/60 min-w-[200px] text-[11px]">
                                                            <div className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1.5">
                                                                Top Predictions
                                                            </div>
                                                            <div className="space-y-1">
                                                                {hum.top_categories.slice(0, 3).map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center gap-2">
                                                                        <span className="truncate text-slate-700 capitalize max-w-[120px]">
                                                                            {item.category ? item.category.replace(/_/g, ' ') : 'Category'}
                                                                        </span>
                                                                        <span className="font-mono font-bold text-slate-900">
                                                                            {formatPercent(item.probability)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedIncident(inc)}
                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline self-center px-2"
                                                    >
                                                        Inspect
                                                    </button>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
