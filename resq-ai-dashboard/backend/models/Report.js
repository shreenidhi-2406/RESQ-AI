import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    description: String,
    source: String,
    location: String,
    latitude: Number,
    longitude: Number,
    disaster_type: String,
    severity: String,
    timestamp: String,
    url: String,
    disaster_relevant: Boolean,
    rawData: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
