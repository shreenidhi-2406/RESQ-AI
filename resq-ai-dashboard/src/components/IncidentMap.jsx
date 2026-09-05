import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';

const getIcon = (severity) => {
    let color = '#22c55e';
    if (severity === 'Critical' || severity === 'Red') color = '#ef4444';
    if (severity === 'High' || severity === 'Orange') color = '#f97316';
    if (severity === 'Medium' || severity === 'Yellow') color = '#eab308';

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
};

function AutoFitBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
        }
    }, [bounds, map]);
    return null;
}

export default function IncidentMap({ incidents = [], onIncidentClick }) {
    const defaultCenter = [20.5937, 78.9629]; // India Center default

    // Filter valid lat/lng records
    const validIncidents = incidents.filter(
        i => typeof i.latitude === 'number' && !isNaN(i.latitude) &&
             typeof i.longitude === 'number' && !isNaN(i.longitude)
    );

    const bounds = validIncidents.map(i => [i.latitude, i.longitude]);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col relative w-full z-0">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white z-10 absolute top-0 left-0 right-0">
                <h3 className="font-semibold text-slate-800 tracking-tight text-xs uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    LIVE GDACS DISASTER MAP
                </h3>
                <span className="text-xs font-medium text-slate-500">{validIncidents.length} Markers Plotted</span>
            </div>

            <div className="flex-1 w-full mt-[49px] h-full">
                <MapContainer center={defaultCenter} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <ZoomControl position="bottomright" />

                    {bounds.length > 0 && <AutoFitBounds bounds={bounds} />}

                    {validIncidents.map(inc => (
                        <Marker
                            key={inc.id}
                            position={[inc.latitude, inc.longitude]}
                            icon={getIcon(inc.severity)}
                            eventHandlers={{ click: () => onIncidentClick && onIncidentClick(inc) }}
                        >
                            <Popup className="incident-popup">
                                <div className="p-2 min-w-[220px] space-y-1.5 font-sans">
                                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{inc.id}</div>
                                    <div className="font-bold text-slate-900 text-sm whitespace-normal leading-snug">{inc.title}</div>
                                    
                                    <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Disaster:</span>
                                            <span className="font-bold text-slate-800 capitalize">{inc.disaster_type || 'Disaster'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Location:</span>
                                            <span className="font-semibold text-slate-700">{inc.location || 'Global'}</span>
                                        </div>
                                        <div className="flex justify-between font-mono bg-amber-50/80 px-1.5 py-0.5 rounded text-[11px] text-amber-900">
                                            <span>Lat: <strong>{inc.latitude.toFixed(6)}</strong></span>
                                            <span>Long: <strong>{inc.longitude.toFixed(6)}</strong></span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Severity:</span>
                                            <span className="font-bold text-rose-600">{inc.severity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-medium">Source:</span>
                                            <span className="font-bold text-slate-800">{inc.source}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

