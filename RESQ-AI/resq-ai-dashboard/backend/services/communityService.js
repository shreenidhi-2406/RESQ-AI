import fs from 'fs';
import path from 'path';
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

export async function fetchCommunityData() {
    // 1. Try reading Python Universal Scraper output first
    const pythonOutputPath = findFile('resq-scraper/output/scraped_data.json');
    if (pythonOutputPath) {
        try {
            console.log(`[Community] Reading python scraper output from: ${pythonOutputPath}`);
            const rawData = fs.readFileSync(pythonOutputPath, 'utf-8');
            const items = JSON.parse(rawData);

            const communityItems = items.filter(item => 
                item.source_type === 'community' || 
                (item.source_name && item.source_name.toLowerCase().includes('community')) ||
                (item.url && item.url.includes('5174'))
            );

            if (communityItems.length > 0) {
                return communityItems.map(report => normalizeRecord({
                    id: `COMM-${report.url ? report.url.split('/').pop() : Date.now()}`,
                    source: "COMMUNITY",
                    source_type: "citizen",
                    title: report.title,
                    description: report.content || report.title,
                    disaster_type: report.disaster_type || "General Alert",
                    location: report.location || "Tamil Nadu",
                    severity: report.severity || "High",
                    people_affected: report.people_affected || null,
                    published_time: report.published_time || report.scraped_at,
                    source_url: report.url || "http://localhost:5174/",
                    disaster_relevant: report.disaster_relevant !== false
                }));
            }
        } catch (err) {
            console.warn("[Community] Failed to parse local Python output, falling back:", err.message);
        }
    }

    // 2. Fallback to reading App.jsx
    try {
        const communityAppPath = findFile('disaster-community/src/App.jsx');
        if (!communityAppPath) {
            return [];
        }

        const dataContent = fs.readFileSync(communityAppPath, 'utf-8');
        const match = dataContent.match(/const mockReports = (\[[\s\S]*?\]);/);
        if (!match) return [];

        const rawReports = eval(match[1]);

        return rawReports.map(report => normalizeRecord({
            id: `COMM-${report.id}`,
            source: "COMMUNITY",
            source_type: "citizen",
            title: report.title,
            description: report.content,
            disaster_type: report.disasterType,
            location: report.location,
            severity: report.severity,
            people_affected: report.peopleAffected,
            published_time: report.time,
            source_url: `http://localhost:5174/post/${report.id}`
        }));
    } catch (error) {
        console.error("Community Scraper Error:", error.message);
        return [];
    }
}
