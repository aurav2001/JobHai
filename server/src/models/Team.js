const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                email: { type: String },
                role: { type: String, enum: ['admin', 'recruiter', 'viewer'], default: 'recruiter' },
                status: { type: String, enum: ['pending', 'active'], default: 'pending' },
                invitedAt: { type: Date, default: Date.now },
                joinedAt: { type: Date },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
