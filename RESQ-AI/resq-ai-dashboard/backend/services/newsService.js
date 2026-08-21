import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { newsSources } from '../config/newsSources.js';
import { tamilNaduLocations, disasterKeywords } from '../config/tamilNaduLocations.js';
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

export async function fetchNewsData() {
    const newsData = [];

    // 1. Try reading Python Universal Scraper output news items first
    const pythonOutputPath = findFile('resq-scraper/output/scraped_data.json');
    if (pythonOutputPath) {
        try {
            console.log(`[News] Reading python scraper output from: ${pythonOutputPath}`);
            const rawData = fs.readFileSync(pythonOutputPath, 'utf-8');
            const items = JSON.parse(rawData);

            const newsItems = items.filter(item => item.source_type === 'news' || item.source_type === 'generic');
            for (const item of newsItems) {
                newsData.push(normalizeRecord({
                    id: `NEWS-${item.url ? item.url.replace(/[^a-zA-Z0-9]/g, '_') : Date.now()}`,
                    source: item.source_name || "Universal News Scraper",
                    source_type: "news",
                    title: item.title,
                    description: item.content || item.title,
                    disaster_type: item.disaster_type || "General",
                    location: item.location || "Tamil Nadu",
                    published_time: item.published_time || item.scraped_at,
                    source_url: item.url,
                    disaster_relevant: item.disaster_relevant !== false
                }));
            }
        } catch (err) {
            console.warn("[News] Failed to parse local Python news output:", err.message);
        }
    }

    // 2. Fetch from live RSS feeds
    const parser = new Parser({
        headers: {
            'User-Agent': 'RESQ-AI-NewsNormalizer/1.0'
        }
    });

    const activeSources = newsSources.filter(s => s.enabled && s.method === 'rss');

    const promises = activeSources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.feedUrl);

            for (const item of feed.items) {
                const combinedText = `${item.title || ''} ${item.contentSnippet || item.content || ''}`.toLowerCase();
                processArticle(item, combinedText, source, newsData);
            }
        } catch (error) {
            // Silence noisy 404s
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
