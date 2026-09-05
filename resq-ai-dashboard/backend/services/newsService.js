import Parser from 'rss-parser';
import { newsSources } from '../config/newsSources.js';
import { tamilNaduLocations } from '../config/tamilNaduLocations.js';
import { evaluateDisasterRelevance } from '../utils/disasterFilter.js';
import { normalizeRecord } from './normalizer.js';

export async function fetchNewsData() {
    const parser = new Parser({
        headers: {
            'User-Agent': 'RESQ-AI-NewsNormalizer/1.0'
        }
    });

    const newsData = [];
    const activeSources = newsSources.filter(s => s.enabled && s.method === 'rss');

    const promises = activeSources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.feedUrl);

            for (const item of feed.items) {
                processArticle(item, source, newsData);
            }
        } catch (error) {
            console.error(`[NewsParser] Failed to fetch RSS from ${source.name}: ${error.message}`);
        }
    });

    await Promise.all(promises);
    return newsData;
}

function processArticle(item, source, newsData) {
    const title = item.title || '';
    const text = item.contentSnippet || item.content || '';
    const combinedText = `${title} ${text}`.toLowerCase();

    // Level 1: Strict Rule-Based Disaster Relevance Filter
    const relevanceResult = evaluateDisasterRelevance(title, text, source.name);
    if (!relevanceResult.isRelevant) {
        console.log(`[NewsFilter] REJECTED: "${title.substring(0, 75)}..." | Reason: ${relevanceResult.reason}`);
        return;
    }

    // Check Tamil Nadu location relevance
    const isTamilNaduRelevant = tamilNaduLocations.some(loc => combinedText.includes(loc.toLowerCase()));
    if (!isTamilNaduRelevant) {
        return;
    }

    let foundLocation = "Tamil Nadu";
    for (const loc of tamilNaduLocations) {
        if (loc !== "Tamil Nadu" && combinedText.includes(loc.toLowerCase())) {
            foundLocation = loc;
            break;
        }
    }

    console.log(`[NewsFilter] ACCEPTED: "${title.substring(0, 75)}..." | Type: ${relevanceResult.disasterType} | Loc: ${foundLocation}`);

    newsData.push(normalizeRecord({
        id: `NEWS-${item.guid || item.id || Date.now() + Math.random()}`,
        source: source.name,
        source_type: "news",
        title: item.title,
        description: text,
        disaster_type: relevanceResult.disasterType !== 'None' ? relevanceResult.disasterType : "Emergency",
        location: foundLocation,
        published_time: item.pubDate || new Date().toISOString(),
        source_url: item.link,
        disaster_relevant: true
    }));
}
