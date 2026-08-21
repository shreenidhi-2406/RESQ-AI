import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Parser from 'rss-parser';
import { normalizeRecord } from './normalizer.js';

function findFile(relativePath) {
    const cwd = process.cwd();
    const candidates = [
        path.resolve(cwd, relativePath),
        path.resolve(cwd, '..', relativePath),
        path.resolve(cwd, '../..', relativePath),
        path.resolve('D:/project', relativePath),
        path.resolve('D:/project/RESQ-AI', relativePath)
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

export async function fetchGDACSData() {
    // 1. Try reading Python GDACS Scraper JSON output file first
    const pythonOutputPath = findFile('gdacs-module/output/gdacs_tamilnadu_events.json');
    if (pythonOutputPath) {
        try {
            console.log(`[GDACS] Reading python scraper output from: ${pythonOutputPath}`);
            const rawData = fs.readFileSync(pythonOutputPath, 'utf-8');
            const events = JSON.parse(rawData);

            return events.map(event => normalizeRecord({
                id: `GDACS-${event.event_id || Date.now()}`,
                source: "GDACS",
                source_type: "official",
                title: event.event_name || `${event.event_type_name || 'Disaster'} event`,
                description: `${event.event_type_name || event.event_type} in ${event.location || event.state}`,
                disaster_type: event.event_type_name || event.event_type,
                location: event.location || event.state || "Tamil Nadu",
                latitude: event.latitude || null,
                longitude: event.longitude || null,
                severity: event.alert_level || "Orange",
                alert_level: event.alert_level || "Orange",
                published_time: event.start_time || event.retrieved_at,
                last_updated: event.last_update || event.retrieved_at,
                source_url: event.gdacs_url || "https://www.gdacs.org/",
                disaster_relevant: true,
                people_affected: event.population_affected || null
            }));
        } catch (err) {
            console.warn("[GDACS] Failed to parse local Python output, falling back to API:", err.message);
        }
    }

    // 2. Fetch directly from https://www.gdacs.org/ Live APIs & RSS
    console.log("[GDACS] Fetching realtime live data from https://www.gdacs.org/...");
    const results = [];

    // 2a. GeoJSON API
    try {
        const response = await axios.get('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH', { timeout: 15000 });
        const events = response.data?.features || [];

        const indiaEvents = events.filter(e => {
            const country = e.properties?.country || '';
            return country.toLowerCase().includes('india');
        });

        indiaEvents.forEach(event => {
            const props = event.properties;
            results.push(normalizeRecord({
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
            }));
        });
    } catch (error) {
        console.error("[GDACS] GeoJSON API Fetch Error:", error.message);
    }

    // 2b. Realtime RSS Feed
    try {
        const parser = new Parser();
        const feed = await parser.parseURL("https://www.gdacs.org/xml/rss.xml");
        const indiaRss = feed.items.filter(item => (item.title || '').toLowerCase().includes('india'));
        
        indiaRss.forEach(item => {
            results.push(normalizeRecord({
                id: `GDACS-RSS-${item.guid || item.id || Date.now()}`,
                source: "GDACS",
                source_type: "official",
                title: item.title,
                description: item.contentSnippet || item.description,
                disaster_type: "Official Alert",
                location: "India",
                severity: item.title.toLowerCase().includes('red') ? 'Critical' : 'High',
                published_time: item.pubDate,
                source_url: item.link || "https://www.gdacs.org/",
                disaster_relevant: true
            }));
        });
    } catch (error) {
        console.error("[GDACS] RSS Feed Fetch Error:", error.message);
    }

    return results;
}
