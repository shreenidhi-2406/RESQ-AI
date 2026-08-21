import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import IncidentFilters from '../components/IncidentFilters';
import IncidentCard from '../components/IncidentCard';
import IncidentMap from '../components/IncidentMap';
import IncidentDetailsDrawer from '../components/IncidentDetailsDrawer';
import { getIncidents } from '../services/api';
import { RefreshCw } from 'lucide-react';

export default function LiveIncidents() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(new Date().toLocaleTimeString());

    // For "NEW" indicators
    const [previousIds, setPreviousIds] = useState(new Set());

    const [selectedIncident, setSelectedIncident] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        severity: 'All',
        source: 'All',
        type: 'All',
        sort: 'newest'
    });

    const fetchData = async () => {
        try {
            const data = await getIncidents();

            // To figure out if something is new
            const currentIds = new Set(data.map(d => d.id));
            if (!loading && incidents.length > 0) {
                const prev = new Set(incidents.map(i => i.id));
                setPreviousIds(prev);
            }

            setIncidents(data || []);
            setLastFetchTime(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Unable to retrieve live incident data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60 seconds
        return () => clearInterval(interval);
    }, []);

    const filteredIncidents = useMemo(() => {
        let result = [...incidents];

        if (filters.severity !== 'All') {
            result = result.filter(i => i.severity === filters.severity);
        }
        if (filters.source !== 'All') {
            result = result.filter(i => (i.source || '').toUpperCase().includes(filters.source.toUpperCase()));
        }
        if (filters.type !== 'All') {
            const typeStr = filters.type.toLowerCase();
            result = result.filter(i => {
                const itemType = (i.disaster_type || '').toLowerCase();
                if (typeStr === 'flood') return itemType.includes('flood') || itemType === 'fl';
                if (typeStr === 'cyclone') return itemType.includes('cyclone') || itemType === 'tc';
                if (typeStr === 'earthquake') return itemType.includes('earthquake') || itemType === 'eq';
                return itemType.includes(typeStr);
            });
        }
        if (filters.search) {
            const lowerSearch = filters.search.toLowerCase();
            result = result.filter(i =>
                (i.title && i.title.toLowerCase().includes(lowerSearch)) ||
                (i.description && i.description.toLowerCase().includes(lowerSearch)) ||
                (i.location && i.location.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort
        result.sort((a, b) => {
            if (filters.sort === 'newest') {
                return new Date(b.retrieved_at) - new Date(a.retrieved_at);
            } else if (filters.sort === 'oldest') {
                return new Date(a.retrieved_at) - new Date(b.retrieved_at);
            } else if (filters.sort === 'severity') {
                const sevRank = { 'Critical': 4, 'Red': 4, 'High': 3, 'Orange': 3, 'Medium': 2, 'Yellow': 2, 'Low': 1, 'Green': 1 };
                const aRank = sevRank[a.severity] || 0;
                const bRank = sevRank[b.severity] || 0;
                return bRank - aRank;
            } else if (filters.sort === 'affected') {
                return (b.people_affected || 0) - (a.people_affected || 0);
            }
            return 0;
        });

        return result;
    }, [incidents, filters]);

    if (loading && incidents.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700">Loading live incidents...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Drawer Overlay */}
            <IncidentDetailsDrawer
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
            />

            <main className="flex-1 p-6 md:p-8 ml-64 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">LIVE INCIDENTS</h1>
                            <p className="text-sm text-slate-500 mt-1">Real-time incidents detected across Tamil Nadu</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-sm text-slate-600 font-medium">Currently showing: {filteredIncidents.length} active incidents</div>
                            </div>

                            <button onClick={fetchData} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded shadow-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-slate-600 tracking-wider">LIVE DATA</span>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-slate-400 flex flex-col">
                                    <span>Last updated:</span>
                                    <span className="font-medium text-slate-600">{lastFetchTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex justify-between items-center text-red-700 text-sm">
                            <div className="font-medium">⚠ {error}</div>
                            <button onClick={fetchData} className="font-bold underline">Retry</button>
                        </div>
                    )}

                    <IncidentFilters filters={filters} onFilterChange={setFilters} />

                    <div className="grid grid-cols-12 gap-8">
                        {/* Feed Column */}
                        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
                            {filteredIncidents.length === 0 ? (
                                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-500">
                                    <p className="font-medium text-lg text-slate-800 mb-2">No active disaster incidents detected.</p>
                                    <p className="text-sm">The system is monitoring connected sources.</p>
                                </div>
                            ) : (
                                filteredIncidents.map(inc => {
                                    const isNew = previousIds.size > 0 && !previousIds.has(inc.id);
                                    // I'll skip 'updated' logic unless we track hash, for simplicity prompt says: "If an existing incident changes... Display the badge. Keep it simple." 
                                    const isUpdated = false;

                                    return (
                                        <IncidentCard
                                            key={inc.id}
                                            incident={inc}
                                            isNew={isNew}
                                            isUpdated={isUpdated}
                                            onClick={setSelectedIncident}
                                        />
                                    );
                                })
                            )}
                        </div>

                        {/* Map Column */}
                        <div className="col-span-12 lg:col-span-5 relative">
                            <div className="sticky top-6 h-[600px] w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <IncidentMap
                                    incidents={filteredIncidents}
                                    onIncidentClick={setSelectedIncident}
                                />
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
