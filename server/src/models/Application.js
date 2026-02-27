const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        resumeUrl: { type: String, required: true },
        coverLetter: { type: String, default: '' },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
            default: 'pending',
        },
        notes: { type: String, default: '' },
        viewedAt: { type: Date },
    },
    { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ job: 1 });

module.exports = mongoose.model('Application', applicationSchema);
