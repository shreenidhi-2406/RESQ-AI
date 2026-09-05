import { fetchGDACSData } from './gdacsService.js';
import { fetchSachetData } from './sachetService.js';
import { fetchCommunityData } from './communityService.js';
import { fetchUserData } from './userService.js';
import { analyzeIncident } from './aiService.js';
import { deduplicate } from '../utils/deduplicate.js';

let latestCache = {
    incidents: [],
    reports: [],
    sources: [],
    lastUpdated: null
};

// 2-Minute cache specifically for the dummy website (Community)
let communityCache = [];
let communityLastFetch = 0;

async function throttledCommunityFetch() {
    const now = Date.now();
    if (now - communityLastFetch >= 120000 || communityCache.length === 0) {
        communityCache = await fetchCommunityData();
        communityLastFetch = Date.now();
    }
    return communityCache;
}

export function startSourceManager() {
    processSources();
    setInterval(processSources, 60000);
}

function isDisasterIncident(item) {
    // Official emergency feeds & User SOS alerts are inherently trusted
    if (['GDACS', 'SACHET', 'USER'].includes((item.source || '').toUpperCase()) || item.source_type === 'user') {
        return true;
    }
    // Level 1 Rule-Based filter validation
    if (item.disaster_relevant === false) {
        return false;
    }
    // Level 2 AI Informativeness Gatekeeper validation
    if (item.ai && item.ai.informativeness) {
        const info = item.ai.informativeness;
        if (info.label === 'not_informative' || info.is_informative === false) {
            console.log(`[Level2-AIFilter] Excluded non-informative item: "${(item.title || '').substring(0, 60)}"`);
            return false;
        }
    }
    return true;
}

export async function processSources() {
    console.log("Fetching live GDACS & emergency data...");
    const stats = [];

    const [gdacs, sachet, community, userSos] = await Promise.all([
        wrapFetch(fetchGDACSData, "GDACS", "official", stats),
        wrapFetch(fetchSachetData, "SACHET", "official", stats),
        wrapFetch(throttledCommunityFetch, "Community", "citizen", stats),
        wrapFetch(fetchUserData, "User SOS", "citizen", stats)
    ]);

    const allData = deduplicate([...userSos, ...gdacs, ...sachet, ...community]);

    // Apply Level 1 & Level 2 Disaster Relevance Filtering
    const incidents = allData.filter(isDisasterIncident);
    const reports = allData.filter(isDisasterIncident);

    // Make clean disaster data instantly available in API cache
    latestCache = {
        incidents,
        reports,
        sources: stats,
        lastUpdated: new Date().toISOString()
    };

    console.log(`Instantly cached ${incidents.length} clean disaster records (${userSos.length} user SOS alerts) at ${latestCache.lastUpdated}`);

    // Controlled AI Enrichment Pipeline (batches of 5 to avoid overloading Python single-process worker)
    const BATCH_SIZE = 5;
    for (let i = 0; i < allData.length; i += BATCH_SIZE) {
        const batch = allData.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item) => {
            const textToAnalyze = item.description || item.title || "";
            if (textToAnalyze && !item.ai) {
                const aiRes = await analyzeIncident(textToAnalyze, item.id);
                if (aiRes.available && aiRes.result) {
                    item.ai = aiRes.result;
                }
            }
        }));
    }

    // Re-filter cache after AI enrichment to prune non-informative articles
    latestCache.incidents = allData.filter(isDisasterIncident);
    latestCache.reports = allData.filter(isDisasterIncident);
}

async function wrapFetch(fetchFunc, name, type, statsArray) {
    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Fetch timeout")), 30000)
        );
        const data = await Promise.race([fetchFunc(), timeoutPromise]);
        statsArray.push({ name, type, status: "online", records: data.length });
        return data;
    } catch (e) {
        console.error(`[SourceManager] Error fetching ${name}: ${e.message}`);
        statsArray.push({ name, type, status: "unavailable", records: 0 });
        return [];
    }
}

export function getLiveData() {
    return latestCache;
}
