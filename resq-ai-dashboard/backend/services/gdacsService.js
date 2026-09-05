import Parser from 'rss-parser';
import { normalizeRecord } from './normalizer.js';

const GDACS_EVENT_TYPES = {
    'FL': 'Flood',
    'TC': 'Cyclone',
    'EQ': 'Earthquake',
    'VO': 'Volcanic Eruption',
    'DR': 'Drought',
    'WF': 'Wildfire'
};

// Active geographic scope for MVP (easily scalable to 'Global' or additional country ISO codes later)
export const ACTIVE_GEOGRAPHIC_SCOPE = {
    country: "India",
    iso3: ["IND", "IN"],
    enabled: true
};

export async function fetchGDACSData() {
    try {
        console.log(`[GDACS] Fetching live disaster data from GDACS REST API (Scope: ${ACTIVE_GEOGRAPHIC_SCOPE.country} ONLY)...`);
        const response = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH', {
            signal: AbortSignal.timeout(25000)
        });
        
        if (!response.ok) {
            throw new Error(`GDACS API responded with status ${response.status}`);
        }

        const data = await response.json();
        const events = data?.features || [];

        // Structured India-Only Filter
        const relevantEvents = events.filter(e => {
            const props = e.properties || {};
            const country = (props.country || '').trim().toLowerCase();
            
            // Check structured affected countries list
            const isAffected = (props.affectedcountries || []).some(ac => {
                const cname = (ac.countryname || '').trim().toLowerCase();
                const iso3 = (ac.iso3 || '').trim().toUpperCase();
                return cname === 'india' || ACTIVE_GEOGRAPHIC_SCOPE.iso3.includes(iso3);
            });

            // Structured country property check
            const isIndiaCountry = country.includes('india') || isAffected;

            if (!isIndiaCountry) {
                return false;
            }

            // Geographic boundary validation (India region bounding box check: Lat 5.0 to 38.0, Lon 65.0 to 98.0)
            const coords = e.geometry?.coordinates;
            if (coords && coords.length === 2) {
                const lon = coords[0];
                const lat = coords[1];
                if (lat < 5.0 || lat > 38.0 || lon < 65.0 || lon > 98.0) {
                    console.warn(`[GDACS] Event ${props.eventid} (${props.name}) flagged: coordinates [${lat}, ${lon}] outside India bounding box.`);
                    return false;
                }
            }

            return true;
        });

        const normalized = relevantEvents.map(event => {
            const props = event.properties || {};
            const disasterType = GDACS_EVENT_TYPES[props.eventtype] || props.eventtype || "Disaster";
            const eventName = props.name || props.eventname || `${disasterType} in ${props.country || 'India'}`;
            const eventDesc = props.description || props.htmldescription || `${disasterType} alert level ${props.alertlevel || 'Green'} in ${props.country || 'India'}`;

            // Official GDACS event report link
            const reportUrl = props.url?.report || 
                (props.eventid ? `https://www.gdacs.org/report.aspx?eventid=${props.eventid}&episodeid=${props.episodeid || 1}&eventtype=${props.eventtype || 'FL'}` : "https://www.gdacs.org/");

            return normalizeRecord({
                id: `GDACS-${props.eventid || Math.random().toString(36).substr(2, 9)}`,
                source: "GDACS",
                source_type: "official",
                title: eventName,
                description: eventDesc,
                disaster_type: disasterType.toLowerCase(),
                location: props.country || "India",
                latitude: event.geometry?.coordinates ? event.geometry.coordinates[1] : null,
                longitude: event.geometry?.coordinates ? event.geometry.coordinates[0] : null,
                severity: props.alertlevel || "Green",
                alert_level: props.alertlevel || "Green",
                published_time: props.fromdate || props.datemodified,
                last_updated: props.todate || props.datemodified,
                source_url: reportUrl,
                disaster_relevant: true
            });
        });

        console.log(`[GDACS] Successfully retrieved ${normalized.length} India disaster events.`);
        return normalized;
    } catch (error) {
        console.error("[GDACS] Fetch Error (trying RSS fallback):", error.message);
        return await fetchGDACSRSSFallback();
    }
}

async function fetchGDACSRSSFallback() {
    try {
        const parser = new Parser();
        const feed = await parser.parseURL('https://www.gdacs.org/xml/rss.xml');
        const items = feed.items || [];
        
        return items
            .filter(item => {
                const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
                return text.includes('india');
            })
            .map(item => {
                return normalizeRecord({
                    id: `GDACS-${item.guid || item.link}`,
                    source: "GDACS",
                    source_type: "official",
                    title: item.title || "GDACS India Disaster Alert",
                    description: item.contentSnippet || item.content || item.title,
                    disaster_type: "disaster",
                    location: item.title || "India",
                    severity: "Orange",
                    alert_level: "Orange",
                    published_time: item.pubDate,
                    source_url: item.link || "https://www.gdacs.org/",
                    disaster_relevant: true
                });
            });
    } catch (rssErr) {
        console.error("[GDACS] RSS Fallback also failed:", rssErr.message);
        return [];
    }
}

