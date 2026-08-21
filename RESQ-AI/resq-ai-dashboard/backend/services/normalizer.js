import { normalizeDate } from '../utils/dateUtils.js';

export function normalizeRecord(raw) {
    return {
        id: raw.id || `${raw.source}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        source: raw.source || "Unknown",
        source_type: raw.source_type || "unknown",
        title: raw.title || "No Title",
        description: raw.description || "",
        content: raw.content || "",
        disaster_type: raw.disaster_type || "Unknown",
        location: raw.location || "Unknown",
        latitude: raw.latitude || null,
        longitude: raw.longitude || null,
        severity: raw.severity || "Unknown",
        alert_level: raw.alert_level || "Unknown",
        people_affected: raw.people_affected || null,
        published_time: normalizeDate(raw.published_time),
        last_updated: normalizeDate(raw.last_updated),
        source_url: raw.source_url || "",
        disaster_relevant: typeof raw.disaster_relevant === 'boolean' ? raw.disaster_relevant : true,
        retrieved_at: new Date().toISOString()
    };
}
