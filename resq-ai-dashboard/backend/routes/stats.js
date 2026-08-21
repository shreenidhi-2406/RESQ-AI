import express from 'express';
import { getLiveData } from '../services/sourceManager.js';

const router = express.Router();

router.get('/', (req, res) => {
    const data = getLiveData();

    // Calculate simple stats based on reports and incidents
    const critical = data.incidents.filter(i => i.severity === 'Critical');

    // Basic aggregation
    const stats = {
        criticalCount: critical.length,
        activeLocations: new Set(data.incidents.map(i => i.location)).size,
        totalAffected: data.incidents.reduce((sum, item) => sum + (item.people_affected || 0), 0),
        lastUpdated: data.lastUpdated
    };

    res.json(stats);
});

export default router;
