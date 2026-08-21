import Parser from 'rss-parser';
import { newsSources } from '../config/newsSources.js';
import { tamilNaduLocations, disasterKeywords } from '../config/tamilNaduLocations.js';
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
                const combinedText = `${item.title || ''} ${item.contentSnippet || item.content || ''}`.toLowerCase();
                processArticle(item, combinedText, source, newsData);
            }
        } catch (error) {
            console.error(`Failed to fetch RSS from ${source.name}: ${error.message}`);
        }
    });

    await Promise.all(promises);
    return newsData;
}

function processArticle(item, combinedText, source, newsData) {
    const isDisasterRelevant = disasterKeywords.some(keyword => combinedText.includes(keyword));
    const isTamilNaduRelevant = tamilNaduLocations.some(loc => combinedText.includes(loc.toLowerCase()));

    if (!isTamilNaduRelevant) return;

    let foundLocation = "Tamil Nadu";
    for (const loc of tamilNaduLocations) {
        if (loc !== "Tamil Nadu" && combinedText.includes(loc.toLowerCase())) {
            foundLocation = loc;
            break;
        }
    }

    newsData.push(normalizeRecord({
        id: `NEWS-${item.guid || item.id || Date.now() + Math.random()}`,
        source: source.name,
        source_type: "news",
        title: item.title,
        description: item.contentSnippet || item.content,
        disaster_type: "Unknown",
        location: foundLocation,
        published_time: item.pubDate || new Date().toISOString(),
        source_url: item.link,
        disaster_relevant: isDisasterRelevant
    }));
}
