import mongoose from 'mongoose';

export async function connectDB() {
    const uri = process.env.MONGO_URI || "mongodb+srv://codecatalystzzz_db_user:elmEl53RGzGcupX7@resq-cluster.cccpioi.mongodb.net/resq_ai?retryWrites=true&w=majority";
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log("✓ MongoDB Atlas Connected Successfully!");
    } catch (err) {
        console.error("MongoDB Atlas Connection Error:", err.message);
    }
}
