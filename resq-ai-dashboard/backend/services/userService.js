import { getMongoClient } from '../config/db.js';
import { normalizeRecord } from './normalizer.js';

export async function fetchUserData() {
    try {
        const mongoClient = await getMongoClient();
        if (!mongoClient) {
            console.log("[UserService] No MongoDB client available.");
            return [];
        }

        const db = mongoClient.db('resq_ai');

        // Retrieve all user emergency alerts and ground reports from MongoDB Atlas
        const [incidentsDocs, reportsDocs] = await Promise.all([
            db.collection('incidents').find({}).toArray().catch(() => []),
            db.collection('reports').find({}).toArray().catch(() => [])
        ]);

        const rawDocs = [...incidentsDocs, ...reportsDocs];
        console.log(`[UserService] Retrieved ${rawDocs.length} documents from MongoDB Atlas (incidents: ${incidentsDocs.length}, reports: ${reportsDocs.length})`);

        // Deduplicate docs by id or _id string
        const seen = new Set();
        const userRecords = [];

        for (const doc of rawDocs) {
            const docId = doc.id || doc._id?.toString();
            if (!docId || seen.has(docId)) continue;
            seen.add(docId);

            // STAGE 1 PRIVACY SANITIZATION: Delete phone_number immediately
            delete doc.phone_number;
            if (doc.rawData) {
                delete doc.rawData.phone_number;
            }

            const lat = typeof doc.latitude === 'number' ? doc.latitude : (parseFloat(doc.latitude) || 13.0827);
            const lng = typeof doc.longitude === 'number' ? doc.longitude : (parseFloat(doc.longitude) || 80.2707);

            const formattedLocation = doc.location_name || (doc.location && !doc.location.startsWith('http') 
                ? doc.location 
                : (lat && lng ? `Lat: ${lat.toFixed(4)}, Long: ${lng.toFixed(4)}` : "Emergency Location"));

            // Filter out non-India records if ACTIVE_GEOGRAPHIC_SCOPE is set to India ONLY
            const fullText = `${doc.title || ''} ${doc.description || ''} ${doc.location || ''} ${doc.location_name || ''}`.toLowerCase();
            const isNonIndiaOnly = ['nepal', 'sri lanka', 'bangladesh', 'pakistan', 'china', 'vietnam', 'philippines', 'afghanistan', 'cuba'].some(
                c => fullText.includes(c) && !fullText.includes('india')
            );
            if (isNonIndiaOnly) continue;

            let reportUrl = doc.source_url || (doc.location && doc.location.startsWith('http') ? doc.location : "");
            if (!reportUrl && doc.id && doc.id.startsWith('GDACS-')) {
                const numericId = doc.id.replace('GDACS-', '');
                const typeCode = (doc.disaster_type || '').toLowerCase().includes('flood') ? 'FL' : 
                                 (doc.disaster_type || '').toLowerCase().includes('earthquake') ? 'EQ' : 'TC';
                reportUrl = `https://www.gdacs.org/report.aspx?eventid=${numericId}&episodeid=1&eventtype=${typeCode}`;
            }

            const normalized = normalizeRecord({
                id: doc.id || `RESQ-${doc._id.toString()}`,
                source: (doc.source || "USER").toUpperCase(),
                source_type: doc.source === 'GDACS' ? 'official' : 'user',
                title: doc.title || "RESQ User Emergency Alert",
                description: doc.description || doc.message || "Emergency alert received from user.",
                disaster_type: doc.disaster_type || "Emergency",
                location: formattedLocation,
                location_name: formattedLocation,
                latitude: lat,
                longitude: lng,
                severity: doc.severity || "Critical",
                alert_level: doc.alert_level || "Red",
                people_affected: typeof doc.people_affected === 'number' ? doc.people_affected : (doc.peopleAffected || null),
                people_trapped: typeof doc.people_trapped === 'number' ? doc.people_trapped : (doc.peopleTrapped || null),
                published_time: doc.timestamp || doc.createdAt || new Date().toISOString(),
                source_url: reportUrl,
                disaster_relevant: true,
                ai: doc.ai || null
            });

            // STAGE 2 PRIVACY SANITIZATION: Ensure phone_number is never present on normalized object
            delete normalized.phone_number;

            userRecords.push(normalized);
        }

        return userRecords;
    } catch (error) {
        console.warn("[UserService] MongoDB fetch warning:", error.message);
        return [];
    }
}
