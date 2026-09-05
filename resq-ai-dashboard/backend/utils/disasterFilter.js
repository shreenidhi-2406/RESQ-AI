/**
 * RESQ-AI Rule-Based Disaster Relevance Filter (Level 1)
 * Evaluates news articles and raw reports to filter out general news (commodity prices, politics, sports, entertainment, business).
 */

const REJECTION_CATEGORIES = [
    {
        reason: 'commodity_price',
        keywords: [
            'onion', 'tomato', 'vegetable', 'price hike', 'prices surge', 'price increase',
            'costlier', 'mandi', 'market rate', 'wholesale price', 'retail price', 'crop price',
            'fuel price', 'petrol price', 'diesel price', 'gold price', 'silver price', 'lpg price'
        ]
    },
    {
        reason: 'politics_or_policy',
        keywords: [
            'election', 'poll', 'vote', 'voter', 'political party', 'campaign', 'dmk', 'aiadmk',
            'bjp', 'congress', 'minister says', 'mla', 'mp', 'parliament', 'assembly', 'manifesto',
            'governance', 'policy decision'
        ]
    },
    {
        reason: 'sports',
        keywords: [
            'cricket', 'ipl', 'match', 'tournament', 'trophy', 'champion', 'football', 'badminton',
            'tennis', 'olympics', 'medal', 'wickets', 'runs'
        ]
    },
    {
        reason: 'entertainment',
        keywords: [
            'actor', 'actress', 'cinema', 'movie', 'film', 'box office', 'trailer', 'hero', 'heroine',
            'director', 'celebrity', 'song', 'album', 'ott', 'release date', 'starrer'
        ]
    },
    {
        reason: 'general_business',
        keywords: [
            'sensex', 'nifty', 'stock market', 'shares', 'quarterly profit', 'revenue', 'startup',
            'investment', 'bank interest', 'gst', 'tax rate', 'rbi', 'inflation rate'
        ]
    },
    {
        reason: 'lifestyle_and_culture',
        keywords: [
            'festival', 'temple fair', 'celebration', 'puja', 'recipe', 'fashion', 'lifestyle',
            'tourism', 'resort', 'hotel booking'
        ]
    }
];

const DISASTER_POSITIVE_SIGNALS = [
    {
        type: 'flood',
        keywords: [
            'flood', 'flooding', 'flash flood', 'deluge', 'inundation', 'submerged',
            'waterlogging', 'cloudburst', 'dam breach', 'overflowing dam', 'river breaches',
            'danger mark', 'heavy rainfall causes', 'torrential rain causes'
        ]
    },
    {
        type: 'cyclone',
        keywords: [
            'cyclone', 'cyclonic storm', 'typhoon', 'hurricane', 'gale winds', 'landfall',
            'storm surge', 'tornado', 'severe hailstorm', 'lightning strike'
        ]
    },
    {
        type: 'landslide',
        keywords: [
            'landslide', 'mudslide', 'earthquake', 'tremor', 'tsunami', 'sinkhole', 'rockfall'
        ]
    },
    {
        type: 'fire_and_hazard',
        keywords: [
            'wildfire', 'forest fire', 'building fire', 'factory fire', 'blaze', 'chemical leak',
            'gas leak', 'toxic gas', 'boiler explosion', 'industrial accident', 'radiation leak'
        ]
    },
    {
        type: 'structural_accidents',
        keywords: [
            'building collapse', 'roof collapse', 'bridge collapse', 'train derailed',
            'train collision', 'plane crash', 'boat capsize', 'vessel sunk'
        ]
    },
    {
        type: 'emergency_impact',
        keywords: [
            'casualty', 'fatalities', 'people killed', 'death toll', 'trapped under', 'people stranded',
            'evacuated', 'relief camp', 'displaced families', 'rescued by ndrf', 'sdrf team',
            'red alert issued', 'orange alert issued', 'rescue operation', 'houses destroyed',
            'roads washed away', 'power blackout', 'cyclone warning', 'flood warning'
        ]
    }
];

// Special phrase combinations that indicate price/economic news rather than emergency events
const ECONOMIC_CONTEXT_PHRASES = [
    'price hike due to',
    'prices rise after',
    'prices surge',
    'production affected by rain',
    'crops damaged price increases',
    'market rate increases',
    'costly in markets'
];

/**
 * Evaluates whether a news article title and content describe a genuine disaster or emergency event.
 * @param {string} title 
 * @param {string} text 
 * @param {string} sourceName 
 * @returns {{ isRelevant: boolean, disasterType: string, reason: string, logMetadata: object }}
 */
export function evaluateDisasterRelevance(title = '', text = '', sourceName = 'News') {
    const combined = `${title} ${text}`.toLowerCase();
    const titleLower = title.toLowerCase();

    // 1. Check for Explicit Economic Context / Commodity Price Overrides
    for (const phrase of ECONOMIC_CONTEXT_PHRASES) {
        if (combined.includes(phrase)) {
            const meta = {
                title,
                source: sourceName,
                decision: 'rejected',
                reason: 'commodity_price_context'
            };
            return { isRelevant: false, disasterType: 'None', reason: 'commodity_price_context', logMetadata: meta };
        }
    }

    // 2. Check Rejection Categories (Commodity, Politics, Sports, Movies, Business, Lifestyle)
    for (const category of REJECTION_CATEGORIES) {
        for (const kw of category.keywords) {
            if (combined.includes(kw)) {
                // If rejection keyword found in title or combined text, verify if there is an urgent disaster override (e.g. "NDRF deployment")
                const hasUrgentRescueOverride = combined.includes('ndrf') || combined.includes('death toll') || combined.includes('evacuated');
                if (!hasUrgentRescueOverride) {
                    const meta = {
                        title,
                        source: sourceName,
                        decision: 'rejected',
                        reason: category.reason,
                        matchedKeyword: kw
                    };
                    return { isRelevant: false, disasterType: 'None', reason: category.reason, logMetadata: meta };
                }
            }
        }
    }

    // 3. Match Positive Disaster Signals
    let detectedType = null;
    for (const signal of DISASTER_POSITIVE_SIGNALS) {
        for (const kw of signal.keywords) {
            if (combined.includes(kw)) {
                detectedType = signal.type;
                break;
            }
        }
        if (detectedType) break;
    }

    if (!detectedType) {
        // Routine weather forecast without hazard/impact
        const meta = {
            title,
            source: sourceName,
            decision: 'rejected',
            reason: 'insufficient_disaster_context'
        };
        return { isRelevant: false, disasterType: 'None', reason: 'insufficient_disaster_context', logMetadata: meta };
    }

    // 4. Accept Genuine Disaster Article
    const meta = {
        title,
        source: sourceName,
        decision: 'accepted',
        reason: 'disaster_signal_matched',
        disasterType: detectedType
    };

    return { isRelevant: true, disasterType: detectedType, reason: 'disaster_signal_matched', logMetadata: meta };
}
