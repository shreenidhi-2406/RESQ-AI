// Consolidated Event Grouping Utility
// Perform deterministic spatial, temporal, and text-similarity clustering on the frontend analytics layer.
// Does NOT mutate backend or database state.

export const MAX_DISTANCE_KM = 10;
export const MAX_TIME_DIFFERENCE_HOURS = 6;
export const TEXT_SIMILARITY_THRESHOLD = 0.35;
export const MIN_GROUP_SCORE = 3;

/**
 * Calculates Haversine distance in kilometers between two GPS coordinate pairs.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
    if (typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
        typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
        isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        return null;
    }

    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
    'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
    'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
]);

/**
 * Tokenizes text into lowercase normalized word set, removing stop words and punctuation.
 */
export function getTokens(text) {
    if (!text || typeof text !== 'string') return new Set();
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    return new Set(words);
}

/**
 * Calculates Jaccard token similarity (0.0 to 1.0) between two text strings.
 */
export function jaccardSimilarity(text1, text2) {
    const tokens1 = getTokens(text1);
    const tokens2 = getTokens(text2);

    if (tokens1.size === 0 || tokens2.size === 0) return 0;

    let intersection = 0;
    tokens1.forEach(t => {
        if (tokens2.has(t)) intersection++;
    });

    const union = new Set([...tokens1, ...tokens2]).size;
    return union === 0 ? 0 : intersection / union;
}

/**
 * Evaluates 4 similarity signals between 2 incidents.
 */
export function evaluatePairSimilarity(inc1, inc2) {
    let score = 0;

    // 1. Geographic distance
    const dist = haversineDistance(inc1.latitude, inc1.longitude, inc2.latitude, inc2.longitude);
    if (dist !== null && dist <= MAX_DISTANCE_KM) {
        score += 1;
    }

    // 2. Time proximity
    const t1 = new Date(inc1.published_time || inc1.timestamp || inc1.createdAt || Date.now()).getTime();
    const t2 = new Date(inc2.published_time || inc2.timestamp || inc2.createdAt || Date.now()).getTime();
    const diffHours = Math.abs(t1 - t2) / (1000 * 60 * 60);
    if (diffHours <= MAX_TIME_DIFFERENCE_HOURS) {
        score += 1;
    }

    // 3. Text similarity
    const text1 = inc1.ai?.text || inc1.description || inc1.title || '';
    const text2 = inc2.ai?.text || inc2.description || inc2.title || '';
    const textSim = jaccardSimilarity(text1, text2);
    if (textSim >= TEXT_SIMILARITY_THRESHOLD) {
        score += 1;
    }

    // 4. Disaster type match
    const type1 = (inc1.disaster_type || inc1.title || '').toLowerCase();
    const type2 = (inc2.disaster_type || inc2.title || '').toLowerCase();
    if (type1 && type2 && (type1.includes(type2) || type2.includes(type1) || type1 === type2)) {
        score += 1;
    }

    // Special fallback: if no coords, but strong text similarity + disaster type match
    if (dist === null && textSim >= 0.45) {
        score += 1;
    }

    return { score, textSim, dist, diffHours };
}

/**
 * Groups informative incidents into Consolidated Disaster Events.
 */
export function groupIncidents(incidents) {
    // Filter only informative incidents
    const informativeIncidents = (incidents || []).filter(inc => {
        if (!inc || !inc.ai || typeof inc.ai !== 'object') return false;
        const infoLabel = inc.ai?.informativeness?.label;
        return infoLabel === 'informative' || inc.ai?.informativeness?.is_informative === true;
    });

    if (informativeIncidents.length === 0) return [];

    // Sort by timestamp descending (newest first)
    const sorted = [...informativeIncidents].sort((a, b) => {
        const tA = new Date(a.published_time || a.timestamp || a.createdAt || 0).getTime();
        const tB = new Date(b.published_time || b.timestamp || b.createdAt || 0).getTime();
        return tB - tA;
    });

    const groups = [];

    sorted.forEach(inc => {
        let bestGroup = null;
        let bestScore = -1;

        for (const grp of groups) {
            const { score } = evaluatePairSimilarity(inc, grp.representative);
            if (score >= MIN_GROUP_SCORE && score > bestScore) {
                bestScore = score;
                bestGroup = grp;
            }
        }

        if (bestGroup) {
            bestGroup.incidents.push(inc);
        } else {
            groups.push({
                groupId: `GROUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                representative: inc,
                incidents: [inc]
            });
        }
    });

    // Build consolidated summary metadata
    return groups.map((grp, index) => {
        // Representative: highest humanitarian confidence or newest
        const bestRep = [...grp.incidents].sort((a, b) => {
            const confA = a.ai?.humanitarian?.confidence || 0;
            const confB = b.ai?.humanitarian?.confidence || 0;
            if (confA !== confB) return confB - confA;
            const tA = new Date(a.published_time || a.timestamp || 0).getTime();
            const tB = new Date(b.published_time || b.timestamp || 0).getTime();
            return tB - tA;
        })[0];

        const sourcesSet = new Set(grp.incidents.map(i => (i.source || 'USER').toUpperCase()));
        const sources = Array.from(sourcesSet);

        const humDisplay = bestRep.ai?.humanitarian?.category_display || 
            (bestRep.ai?.humanitarian?.category ? bestRep.ai.humanitarian.category.replace(/_/g, ' ') : 'General Emergency');

        const locName = bestRep.location_name || bestRep.location || 'Location Not Specified';

        const title = bestRep.title && bestRep.title !== 'RESQ User Emergency Alert' && bestRep.title !== 'No Title'
            ? bestRep.title
            : `${humDisplay} — ${locName}`;

        return {
            groupId: `EVENT-${index + 1}`,
            representative: bestRep,
            incidents: grp.incidents,
            reportCount: grp.incidents.length,
            sources,
            sourceCount: sources.length,
            title,
            location: locName,
            humanitarianCategory: humDisplay,
            humanitarianConfidence: bestRep.ai?.humanitarian?.confidence || 0,
            latestTimestamp: bestRep.published_time || bestRep.timestamp || bestRep.createdAt || new Date().toISOString()
        };
    });
}
