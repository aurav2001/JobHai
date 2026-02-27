const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: [
                'application_received',
                'application_status_changed',
                'job_recommendation',
                'team_invite',
                'new_job_alert',
                'general',
            ],
            default: 'general',
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
        actionUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
