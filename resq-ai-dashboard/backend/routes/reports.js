import express from 'express';
import { getLiveData } from '../services/sourceManager.js';

const router = express.Router();

router.get('/', (req, res) => {
    const data = getLiveData();
    res.json(data.reports || []);
});

export default router;
