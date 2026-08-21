import { getMongoClient } from '../config/db.js';
import { normalizeRecord } from './normalizer.js';
import { reverseGeocode } from './geocoder.js';

export async function fetchUserData() {
    try {
        const mongoClient = await getMongoClient();
        if (!mongoClient) {
            return [];
        }

        const db = mongoClient.db('resq_ai');
        const query = {
            $or: [
                { source: 'user' },
                { source: 'USER' },
                { source_type: 'user' },
                { 'rawData.source': 'user' }
            ]
        };

        const [incidentsDocs, reportsDocs] = await Promise.all([
            db.collection('incidents').find(query).toArray().catch(() => []),
            db.collection('reports').find(query).toArray().catch(() => [])
        ]);

        const rawDocs = [...incidentsDocs, ...reportsDocs];

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

            const lat = typeof doc.latitude === 'number' ? doc.latitude : parseFloat(doc.latitude) || null;
            const lng = typeof doc.longitude === 'number' ? doc.longitude : parseFloat(doc.longitude) || null;

            let locationName = doc.location_name;
            if (!locationName && lat && lng) {
                locationName = await reverseGeocode(lat, lng);
            }

            const formattedLocation = locationName || (doc.location && !doc.location.startsWith('http') 
                ? doc.location 
                : (lat && lng ? `Lat: ${lat.toFixed(4)}, Long: ${lng.toFixed(4)}` : "Emergency Location"));

            const normalized = normalizeRecord({
                id: doc.id || `RESQ-${doc._id.toString()}`,
                source: "USER",
                source_type: "user",
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
                source_url: doc.location && doc.location.startsWith('http') ? doc.location : "",
                disaster_relevant: true,
                ai: doc.ai || null
            });

            // STAGE 2 PRIVACY SANITIZATION: Ensure phone_number is never present on normalized object
            delete normalized.phone_number;

            userRecords.push(normalized);
        }

        return userRecords;
    } catch (error) {
        console.warn("User service MongoDB fetch warning:", error.message);
        return [];
    }
}
