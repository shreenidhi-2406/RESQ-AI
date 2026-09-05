import express from 'express';
import { getLiveData, processSources } from '../services/sourceManager.js';
import { getMongoClient } from '../config/db.js';
import { analyzeIncident } from '../services/aiService.js';

const router = express.Router();

router.get('/', (req, res) => {
    const data = getLiveData();
    res.json(data.incidents || []);
});

// Force refresh endpoint
router.post('/refresh', async (req, res) => {
    await processSources();
    res.json({ success: true });
});

// Submit user emergency alert endpoint (stores in MongoDB Atlas resq_ai.incidents collection)
router.post('/user-alert', async (req, res) => {
    try {
        const { latitude, longitude, message, phone_number, people_affected, severity } = req.body;
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "Invalid latitude or longitude" });
        }

        const client = await getMongoClient();
        const alertId = `RESQ-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const alertMessage = message || `Emergency alert from ResQ.\nLocation:\nhttps://maps.google.com/?q=${lat},${lng}`;
        const now = new Date();

        // Perform AI Analysis (Informativeness + Humanitarian classification)
        const aiResult = await analyzeIncident(alertMessage, alertId);

        const doc = {
            id: alertId,
            source: "user",
            source_type: "user",
            title: "RESQ User Emergency Alert",
            description: alertMessage,
            message: alertMessage,
            latitude: lat,
            longitude: lng,
            location: `https://maps.google.com/?q=${lat},${lng}`,
            severity: severity || "Critical",
            alert_level: "Red",
            people_affected: typeof people_affected === 'number' ? people_affected : null,
            ai: aiResult.available ? aiResult.result : null,
            timestamp: now.toISOString(),
            createdAt: now,
            updatedAt: now
        };

        if (client) {
            const db = client.db('resq_ai');
            const result = await db.collection('incidents').insertOne(doc);
            console.log(`[UserAlert] Inserted new user emergency alert into MongoDB: ${alertId} (${lat}, ${lng})`);
            // Trigger background source refresh
            processSources().catch(e => console.warn("[UserAlert] Refresh background error:", e.message));
            return res.json({ success: true, id: alertId, mongoId: result.insertedId, ai: doc.ai });
        }

        console.log(`[UserAlert] Processed user emergency alert: ${alertId} (${lat}, ${lng})`);
        processSources().catch(e => console.warn("[UserAlert] Refresh background error:", e.message));
        res.json({ success: true, id: alertId, ai: doc.ai });
    } catch (err) {
        console.error("[UserAlert] Error storing user alert:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
