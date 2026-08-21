import mongoose from 'mongoose';

const SourceStatSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: String,
    status: String,
    records: Number,
    lastUpdated: String
}, { timestamps: true });

export default mongoose.models.SourceStat || mongoose.model('SourceStat', SourceStatSchema);
