import mongoose from 'mongoose';
import Incident from '../models/Incident.js';
import Report from '../models/Report.js';
import SourceStat from '../models/SourceStat.js';

export async function saveToMongoDB({ incidents = [], reports = [], sources = [] }) {
    if (mongoose.connection.readyState !== 1) {
        return;
    }

    try {
        console.log("Persisting data to MongoDB Atlas...");
        
        for (const item of incidents) {
            const itemId = item.id || `${item.source || 'INC'}-${item.title || 'untitled'}-${item.timestamp || Date.now()}`;
            await Incident.findOneAndUpdate(
                { id: itemId },
                {
                    id: itemId,
                    title: item.title,
                    description: item.description,
                    source: item.source,
                    source_type: item.source_type,
                    location: item.location,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    disaster_type: item.disaster_type,
                    severity: item.severity,
                    people_affected: item.people_affected,
                    timestamp: item.timestamp,
                    url: item.url,
                    disaster_relevant: item.disaster_relevant,
                    rawData: item
                },
                { upsert: true, returnDocument: 'after' }
            );
        }

        for (const item of reports) {
            const itemId = item.id || `${item.source || 'REP'}-${item.title || 'untitled'}-${item.timestamp || Date.now()}`;
            await Report.findOneAndUpdate(
                { id: itemId },
                {
                    id: itemId,
                    title: item.title,
                    description: item.description,
                    source: item.source,
                    location: item.location,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    disaster_type: item.disaster_type,
                    severity: item.severity,
                    timestamp: item.timestamp,
                    url: item.url,
                    disaster_relevant: item.disaster_relevant,
                    rawData: item
                },
                { upsert: true, returnDocument: 'after' }
            );
        }

        for (const stat of sources) {
            await SourceStat.findOneAndUpdate(
                { name: stat.name },
                {
                    name: stat.name,
                    type: stat.type,
                    status: stat.status,
                    records: stat.records,
                    lastUpdated: new Date().toISOString()
                },
                { upsert: true, returnDocument: 'after' }
            );
        }

        console.log(`✓ Saved ${incidents.length} incidents and ${reports.length} reports to MongoDB Atlas!`);
    } catch (err) {
        console.error("Error saving to MongoDB Atlas:", err.message);
    }
}

export async function loadFromMongoDB() {
    if (mongoose.connection.readyState !== 1) {
        return null;
    }
    try {
        const incidents = await Incident.find().lean();
        const reports = await Report.find().lean();
        const sources = await SourceStat.find().lean();
        return {
            incidents,
            reports,
            sources,
            lastUpdated: new Date().toISOString()
        };
    } catch (err) {
        console.error("Error loading from MongoDB Atlas:", err.message);
        return null;
    }
}
