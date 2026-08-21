import fs from 'fs';
import path from 'path';
import { normalizeRecord } from './normalizer.js';

export async function fetchCommunityData() {
    try {
        const communityAppPath = path.resolve(process.cwd(), '../../disaster-community/src/App.jsx');
        if (!fs.existsSync(communityAppPath)) {
            console.warn("Community dummy file not found:", communityAppPath);
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
