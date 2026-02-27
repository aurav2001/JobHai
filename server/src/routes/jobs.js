const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { authenticateJWT, requireRole, optionalAuth } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { paginate, paginationMeta } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../services/email');
const { recommendJobs } = require('../services/aiRecommend');

// GET /api/jobs/search
router.get('/search', optionalAuth, async (req, res, next) => {
    try {
        const {
            q, location, type, category, minSalary, maxSalary,
            minExp, maxExp, page = 1, limit = 20, sort = 'latest',
        } = req.query;

        const filter = { isActive: true, isApproved: true };
        if (q) filter.$text = { $search: q };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (type) filter.type = type;
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };
        if (maxSalary) filter['salary.max'] = { $lte: Number(maxSalary) };
        if (minExp) filter['experience.min'] = { $gte: Number(minExp) };
        if (maxExp) filter['experience.max'] = { $lte: Number(maxExp) };

        const sortOptions = { latest: { createdAt: -1 }, oldest: { createdAt: 1 }, salary_high: { 'salary.max': -1 }, salary_low: { 'salary.min': 1 } };
        const { skip, limit: lim } = paginate(null, page, limit);

        const [jobs, total] = await Promise.all([
            Job.find(filter).sort(sortOptions[sort] || sortOptions.latest).skip(skip).limit(lim).populate('postedBy', 'name companyName companyLogo'),
            Job.countDocuments(filter),
        ]);

        res.json({ success: true, jobs, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// GET /api/jobs/recommended
router.get('/recommended', authenticateJWT, requireRole('jobseeker'), async (req, res, next) => {
    try {
        const { skills } = req.user;
        const jobs = await Job.find({ isActive: true, isApproved: true }).populate('postedBy', 'name companyName companyLogo');
        const recommended = recommendJobs(skills, jobs, 20);
        res.json({ success: true, jobs: recommended.map(r => ({ ...r.job.toObject(), matchScore: Math.round(r.score * 100) })) });
    } catch (err) { next(err); }
});

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('postedBy', 'name companyName companyLogo companyWebsite industry companySize');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        let hasApplied = false;
        if (req.user) {
            const app = await Application.findOne({ job: job._id, candidate: req.user._id });
            hasApplied = !!app;
        }
        res.json({ success: true, job, hasApplied });
    } catch (err) { next(err); }
});

// POST /api/jobs/apply
router.post(
    '/apply',
    authenticateJWT,
    requireRole('jobseeker'),
    uploadResume.single('resume'),
    [
        body('jobId').notEmpty().withMessage('Job ID required'),
        body('coverLetter').optional().trim(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { jobId, coverLetter } = req.body;
            const job = await Job.findById(jobId).populate('postedBy', 'name email companyName');
            if (!job || !job.isActive) return res.status(404).json({ success: false, message: 'Job not found or closed' });

            const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
            if (existing) return res.status(409).json({ success: false, message: 'You have already applied to this job' });

            const resumeUrl = req.file?.path || req.user.resumeUrl;
            if (!resumeUrl) return res.status(400).json({ success: false, message: 'Please upload a resume' });

            const application = await Application.create({
                job: jobId,
                candidate: req.user._id,
                resumeUrl,
                coverLetter,
            });

            await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

            // Notify candidate
            await Notification.create({
                recipient: req.user._id,
                type: 'application_received',
                title: `Application submitted for ${job.title}`,
                message: `Your application to ${job.company} has been received.`,
                actionUrl: `/jobs/${jobId}`,
            });

            // Send email to candidate
            await sendEmail({
                to: req.user.email,
                subject: `Application received — ${job.title}`,
                html: emailTemplates.applicationReceived(req.user.name, job.title, job.company),
            });

            // Notify Employer
            if (job.postedBy?.email) {
                await sendEmail({
                    to: job.postedBy.email,
                    subject: `New Application for ${job.title}`,
                    html: emailTemplates.applicationAlertForEmployer(job.postedBy.name, req.user.name, job.title),
                });
            }

            res.status(201).json({ success: true, message: 'Application submitted successfully', application });
        } catch (err) { next(err); }
    }
);

module.exports = router;
