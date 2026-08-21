import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    description: String,
    source: String,
    source_type: String,
    location: String,
    latitude: Number,
    longitude: Number,
    disaster_type: String,
    severity: String,
    people_affected: Number,
    timestamp: String,
    url: String,
    disaster_relevant: Boolean,
    rawData: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);
