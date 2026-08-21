import express from 'express';
import { getLiveData, processSources } from '../services/sourceManager.js';

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

export default router;
