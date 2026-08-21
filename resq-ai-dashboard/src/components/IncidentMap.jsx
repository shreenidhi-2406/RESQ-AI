import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

const getIcon = (severity) => {
    let color = '#22c55e';
    if (severity === 'Critical') color = '#ef4444';
    if (severity === 'High') color = '#f97316';
    if (severity === 'Medium') color = '#eab308';

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
};

export default function IncidentMap({ incidents = [], onIncidentClick }) {
    const center = [11.1271, 78.6569];

    // Only map valid lat/lng records
    const validIncidents = incidents.filter(i => i.latitude != null && i.longitude != null);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex flex-col relative w-full z-0">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-white z-10 absolute top-0 left-0 right-0">
                <h3 className="font-semibold text-slate-800 tracking-tight">LIVE INCIDENT MAP</h3>
                <span className="text-xs font-medium text-slate-500">Tamil Nadu Region</span>
            </div>

            <div className="flex-1 w-full mt-[49px]">
                <MapContainer center={center} zoom={7} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    />
                    <ZoomControl position="bottomright" />

                    {validIncidents.map(inc => (
                        <Marker
                            key={inc.id}
                            position={[inc.latitude, inc.longitude]}
                            icon={getIcon(inc.severity)}
                            eventHandlers={{ click: () => onIncidentClick(inc) }}
                        >
                            <Popup className="incident-popup" closeButton={false}>
                                <div className="p-1 min-w-[200px]">
                                    <div className="text-[10px] font-mono text-slate-400 mb-1">{inc.id}</div>
                                    <div className="font-bold text-slate-800 text-sm whitespace-normal">{inc.title}</div>
                                    <div className="text-xs text-slate-600 mb-2">{inc.location}</div>

                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Severity:</span>
                                        <span className="font-bold">{inc.severity}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-slate-500">Source:</span>
                                        <span className="font-medium text-slate-800">{inc.source}</span>
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
