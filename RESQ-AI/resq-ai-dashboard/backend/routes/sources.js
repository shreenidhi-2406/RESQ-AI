import express from 'express';
import { getLiveData } from '../services/sourceManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const data = await getLiveData();
    res.json(data.sources || []);
});

export default router;
