import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import IncidentMap from '../components/IncidentMap';
import PriorityPanel from '../components/PriorityPanel';
import IncomingReports from '../components/IncomingReports';
import { SourceSummary, ResourceStatus } from '../components/ResourceStatus';
import IncidentTable from '../components/IncidentTable';
import Charts from '../components/Charts';
import AIResponsePanel from '../components/AIResponsePanel';
import IncidentDrawer from '../components/IncidentDrawer';

import { getIncidents, getReports, getSources, getStats } from '../services/api';
import { AlertCircle, Activity, Users, Box, RefreshCw } from 'lucide-react';
import { mockResources } from '../data/mockData'; // Keeping this for resource capacity as requested

export default function CommandCenter() {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [reports, setReports] = useState([]);
    const [sources, setSources] = useState([]);
    const [stats, setStats] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(new Date().toLocaleTimeString());

    const fetchData = async () => {
        try {
            const [incs, reps, srcs, stts] = await Promise.all([
                getIncidents(),
                getReports(),
                getSources(),
                getStats()
            ]);

            setIncidents(incs || []);
            setReports(reps || []);
            setSources(srcs || []);
            setStats(stts || {});
            setLastFetchTime(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Connection temporarily unavailable. Showing last successful data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60 seconds
        return () => clearInterval(interval);
    }, []);

    const handleIncidentClick = (incident) => {
        setSelectedIncident(incident);
    };

    const closeDrawer = () => {
        setSelectedIncident(null);
    };

    if (loading && incidents.length === 0) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-700">Loading live disaster data...</h2>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Drawer Overlay lives here */}
            <IncidentDrawer incident={selectedIncident} onClose={closeDrawer} />

            <main className="flex-1 p-6 md:p-8 ml-64 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">
                    <Header onRefresh={fetchData} lastFetchTime={lastFetchTime} error={error} />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <KPICard
                            label="CRITICAL INCIDENTS"
                            value={stats.criticalCount || 0}
                            subtext="Live priority events"
                            icon={AlertCircle}
                            colorClass="text-red-500"
                            highlight={true}
                        />
                        <KPICard
                            label="ACTIVE LOCATIONS"
                            value={stats.activeLocations || 0}
                            subtext="Across Tamil Nadu mapping"
                            icon={Activity}
                            colorClass="text-orange-500"
                        />
                        <KPICard
                            label="PEOPLE AFFECTED"
                            value={(stats.totalAffected || 0).toLocaleString()}
                            subtext="Across active incidents"
                            icon={Users}
                            colorClass="text-blue-500"
                        />
                        <KPICard
                            label="RESOURCES NEEDED"
                            value={mockResources.medicalkits.required}
                            subtext="Across active incidents (Mock)"
                            icon={Box}
                            colorClass="text-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-12 gap-6 mb-6">
                        <div className="col-span-12 lg:col-span-8 flex flex-col h-[400px]">
                            <IncidentMap incidents={incidents} onIncidentClick={handleIncidentClick} />
                        </div>
                        <div className="col-span-12 lg:col-span-4 h-[400px]">
                            <PriorityPanel incidents={incidents} onIncidentClick={handleIncidentClick} />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6 mb-6">
                        <div className="col-span-12 lg:col-span-8 h-[400px]">
                            <IncidentTable incidents={incidents} />
                        </div>
                        <div className="col-span-12 lg:col-span-4 h-[400px]">
                            <IncomingReports reports={reports} />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6 pb-12">
                        <div className="col-span-12 lg:col-span-3">
                            <SourceSummary sources={sources} />
                        </div>
                        <div className="col-span-12 lg:col-span-3">
                            <ResourceStatus resources={mockResources} />
                        </div>
                        <div className="col-span-12 lg:col-span-3">
                            <Charts incidents={incidents} />
                        </div>
                        <div className="col-span-12 lg:col-span-3">
                            <AIResponsePanel reportsCount={reports.length} sourcesCount={sources.length} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
