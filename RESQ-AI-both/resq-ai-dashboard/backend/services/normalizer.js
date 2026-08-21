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
        location_name: raw.location_name || raw.location || "Unknown",
        latitude: raw.latitude || null,
        longitude: raw.longitude || null,
        severity: raw.severity || "Unknown",
        alert_level: raw.alert_level || "Unknown",
        people_affected: typeof raw.people_affected === 'number' ? raw.people_affected : null,
        people_trapped: typeof raw.people_trapped === 'number' ? raw.people_trapped : null,
        medical_cases: typeof raw.medical_cases === 'number' ? raw.medical_cases : null,
        published_time: normalizeDate(raw.published_time),
        last_updated: normalizeDate(raw.last_updated),
        source_url: raw.source_url || "",
        disaster_relevant: typeof raw.disaster_relevant === 'boolean' ? raw.disaster_relevant : true,
        ai: raw.ai !== undefined ? raw.ai : null,
        retrieved_at: new Date().toISOString()
    };
}
