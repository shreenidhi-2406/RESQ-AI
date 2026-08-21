import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { processSources } from './services/sourceManager.js';

async function main() {
    console.log("=== RESQ-AI MongoDB Sync Utility ===");
    await connectDB();

    if (mongoose.connection.readyState === 1) {
        console.log("Connected to MongoDB Atlas. Fetching and persisting live backend details...");
        await processSources();
        console.log("Sync complete!");
        await mongoose.disconnect();
    } else {
        console.error("\nCould not establish connection to MongoDB Atlas.");
        console.error("Please add IP address 0.0.0.0/0 (or your IP) to MongoDB Atlas -> Security -> Network Access IP Whitelist.");
    }
}

main();
