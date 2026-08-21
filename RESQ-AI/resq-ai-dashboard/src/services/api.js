const API_BASE = 'http://localhost:3001/api';

export async function getIncidents() {
    const res = await fetch(`${API_BASE}/incidents`);
    if (!res.ok) throw new Error("Failed to fetch incidents");
    return res.json();
}

export async function getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
}

export async function getSources() {
    const res = await fetch(`${API_BASE}/sources`);
    if (!res.ok) throw new Error("Failed to fetch sources");
    return res.json();
}

export async function getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
}

export async function forceRefresh() {
    const res = await fetch(`${API_BASE}/incidents/refresh`, { method: 'POST' });
    return res.json();
}
