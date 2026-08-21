import Parser from 'rss-parser';
import { normalizeRecord } from './normalizer.js';
import axios from 'axios';

export async function fetchGDACSData() {
    try {
        const response = await axios.get('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH');
        const events = response.data?.features || [];

        const indiaEvents = events.filter(e => {
            const country = e.properties?.country || '';
            return country.toLowerCase().includes('india');
        });

        const normalized = indiaEvents.map(event => {
            const props = event.properties;
            return normalizeRecord({
                id: `GDACS-${props.eventid}`,
                source: "GDACS",
                source_type: "official",
                title: props.name || props.eventname,
                description: props.episodesource || `${props.eventtype} in ${props.country}`,
                disaster_type: props.eventtype,
                location: props.country,
                latitude: event.geometry?.coordinates[1] || null,
                longitude: event.geometry?.coordinates[0] || null,
                severity: props.alertlevel || "Green",
                alert_level: props.alertlevel || "Green",
                published_time: props.fromdate,
                last_updated: props.todate,
                source_url: props.url?.report || "https://www.gdacs.org/",
                disaster_relevant: true
            });
        });

        return normalized;
    } catch (error) {
        console.error("GDACS Fetch Error:", error.message);
        throw error;
    }
}
