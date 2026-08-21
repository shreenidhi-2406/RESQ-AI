import Parser from 'rss-parser';
import { normalizeRecord } from './normalizer.js';

export async function fetchSachetData() {
    const parser = new Parser();
    try {
        const sachetUrl = "https://sachet.ndma.gov.in/cap_public_website/RSS";
        const feed = await parser.parseURL(sachetUrl);

        return feed.items.map(item => normalizeRecord({
            id: `SACHET-${item.guid || item.id || Date.now()}`,
            source: "SACHET",
            source_type: "official",
            title: item.title,
            description: item.contentSnippet || item.description,
            disaster_type: "General Alert",
            location: "India/Tamil Nadu",
            published_time: item.pubDate,
            source_url: item.link
        }));
    } catch (error) {
        console.error("SACHET Fetch Error:", error.message);
        return [];
    }
}
