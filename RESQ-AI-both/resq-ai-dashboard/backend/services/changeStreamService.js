import { getMongoClient } from '../config/db.js';
import { normalizeRecord } from './normalizer.js';
import { reverseGeocode } from './geocoder.js';
import { broadcastSSE } from './sseManager.js';

let changeStream = null;

export async function initChangeStream() {
    try {
        const client = await getMongoClient();
        const db = client.db('resq_ai');
        const collection = db.collection('incidents');

        console.log("[ChangeStream] Listening to MongoDB Atlas collection 'resq_ai.incidents' via Change Streams...");

        const pipeline = [
            { $match: { operationType: 'insert' } }
        ];

        changeStream = collection.watch(pipeline, { fullDocument: 'updateLookup' });

        changeStream.on('change', async (change) => {
            try {
                const doc = change.fullDocument;
                if (!doc) return;

                console.log(`[ChangeStream] Insert detected for doc ID: ${doc.id || doc._id}`);

                const isUserAlert = doc.source === 'user' || doc.source === 'USER' || doc.source_type === 'user' || (doc.rawData && doc.rawData.source === 'user');
                if (!isUserAlert) return;

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

                // STAGE 2 PRIVACY SANITIZATION: Ensure phone_number is never present
                delete normalized.phone_number;

                console.log(`[ChangeStream] Broadcasting real-time USER emergency event via SSE: ${normalized.id} (${normalized.location_name})`);
                broadcastSSE('user-emergency', normalized);
            } catch (err) {
                console.error("[ChangeStream] Error processing change stream document:", err.message);
            }
        });

        changeStream.on('error', (err) => {
            console.error("[ChangeStream] Stream error:", err.message);
        });

    } catch (err) {
        console.warn("[ChangeStream] Change stream initialization failed:", err.message);
    }
}
