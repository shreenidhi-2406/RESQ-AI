import { MongoClient } from 'mongodb';

let client = null;

export async function getMongoClient() {
    if (!process.env.MONGO_URI) {
        return null;
    }
    if (!client) {
        try {
            client = new MongoClient(process.env.MONGO_URI);
            await client.connect();
            console.log("[DB] Connected to MongoDB Atlas successfully.");
        } catch (err) {
            console.warn("[DB] Failed to connect to MongoDB Atlas:", err.message);
            client = null;
            return null;
        }
    }
    return client;
}
