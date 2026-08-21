import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { startSourceManager } from './services/sourceManager.js';

import incidentsRouter from './routes/incidents.js';
import reportsRouter from './routes/reports.js';
import sourcesRouter from './routes/sources.js';
import statsRouter from './routes/stats.js';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: "alive" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`RESQ-AI Backend running on http://localhost:${PORT}`);
    await connectDB();
    startSourceManager();
});

