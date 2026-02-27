const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        company: { type: String, required: true },
        companyLogo: { type: String, default: '' },
        companyWebsite: { type: String, default: '' },
        location: { type: String, required: true },
        type: {
            type: String,
            enum: ['fulltime', 'parttime', 'wfh', 'contract', 'internship'],
            required: true,
        },
        category: { type: String, required: true },
        salary: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
            period: { type: String, default: 'yearly' },
        },
        requirements: [{ type: String }],
        skills: [{ type: String }],
        experience: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 10 },
        },
        education: { type: String, default: '' },
        openings: { type: Number, default: 1 },
        deadline: { type: Date },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
        isApproved: { type: Boolean, default: true },
        views: { type: Number, default: 0 },
        applicantCount: { type: Number, default: 0 },
        recruiterContact: {
            name: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
        },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ location: 1, type: 1, category: 1 });
jobSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Job', jobSchema);
