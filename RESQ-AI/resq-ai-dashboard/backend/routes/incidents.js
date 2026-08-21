import express from 'express';
import { getLiveData, processSources } from '../services/sourceManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const data = await getLiveData();
    res.json(data.incidents || []);
});

// Force refresh endpoint
router.post('/refresh', async (req, res) => {
    await processSources();
    res.json({ success: true });
});

export default router;
