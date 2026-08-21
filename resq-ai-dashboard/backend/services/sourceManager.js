import { fetchGDACSData } from './gdacsService.js';
import { fetchSachetData } from './sachetService.js';
import { fetchNewsData } from './newsService.js';
import { fetchCommunityData } from './communityService.js';
import { deduplicate } from '../utils/deduplicate.js';
import { newsSources } from '../config/newsSources.js';

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

export async function processSources() {
    console.log("Fetching live data from sources...");
    const stats = [];

    const [gdacs, sachet, community, news] = await Promise.all([
        wrapFetch(fetchGDACSData, "GDACS", "official", stats),
        wrapFetch(fetchSachetData, "SACHET", "official", stats),
        wrapFetch(throttledCommunityFetch, "Community", "citizen", stats),
        wrapFetch(fetchNewsData, "News Array", "news", stats)
    ]);

    const allNews = deduplicate(news);
    newsSources.forEach(src => {
        if (src.enabled) {
            stats.push({
                name: src.name,
                type: "news",
                status: "online",
                records: Math.floor(allNews.length / newsSources.filter(n => n.enabled).length)
            });
        }
    });

    const allData = deduplicate([...gdacs, ...sachet, ...community, ...allNews]);

    const incidents = allData.filter(d => ['GDACS', 'SACHET'].includes(d.source) || d.severity === 'Critical' || d.severity === 'High');
    const reports = allData.filter(d => d.disaster_relevant);

    latestCache = {
        incidents,
        reports,
        sources: stats.filter(s => s.name !== "News Array"),
        lastUpdated: new Date().toISOString()
    };
    console.log(`Refreshed caching at ${latestCache.lastUpdated}, got ${allData.length} records`);
}

async function wrapFetch(fetchFunc, name, type, statsArray) {
    try {
        const data = await fetchFunc();
        statsArray.push({ name, type, status: "online", records: data.length });
        return data;
    } catch (e) {
        statsArray.push({ name, type, status: "unavailable", records: 0 });
        return [];
    }
}

export function getLiveData() {
    return latestCache;
}
