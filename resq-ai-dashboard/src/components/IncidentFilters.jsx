import React from 'react';
import { Search } from 'lucide-react';

export default function IncidentFilters({ onFilterChange, filters }) {
    const handleFilterChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search incidents..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
            </div>

            <div className="flex gap-3 flex-wrap">
                {/* Severity */}
                <select
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                {/* Source */}
                <select
                    value={filters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Sources</option>
                    <option value="GDACS">GDACS</option>
                    <option value="SACHET">SACHET</option>
                    <option value="News">News</option>
                    <option value="Community">Community</option>
                </select>

                {/* Type */}
                <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Disaster Types</option>
                    <option value="Flood">Flood</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Fire">Fire</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                </select>

                {/* Sort */}
                <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
                >
                    <option value="newest">Sort: Newest</option>
                    <option value="oldest">Sort: Oldest</option>
                    <option value="severity">Sort: Highest severity</option>
                    <option value="affected">Sort: Most people affected</option>
                </select>
            </div>
        </div>
    );
}
