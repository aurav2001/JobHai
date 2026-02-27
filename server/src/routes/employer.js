const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paginate, paginationMeta } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../services/email');

// POST /api/employer/jobs
router.post(
    '/jobs',
    authenticateJWT,
    requireRole('employer', 'admin'),
    [
        body('title').trim().notEmpty(),
        body('description').trim().notEmpty(),
        body('company').trim().notEmpty(),
        body('location').trim().notEmpty(),
        body('type').isIn(['fulltime', 'parttime', 'wfh', 'contract', 'internship']),
        body('category').trim().notEmpty(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const job = await Job.create({ ...req.body, postedBy: req.user._id });

            // Notify Admin
            await sendEmail({
                to: process.env.SMTP_EMAIL,
                subject: `Review Required: New Job Posting — ${job.title}`,
                html: emailTemplates.jobPostedAdmin(req.user.name, job.title),
            });

            res.status(201).json({ success: true, job });
        } catch (err) { next(err); }
    }
);

// PUT /api/employer/jobs/:id
router.put('/jobs/:id', authenticateJWT, requireRole('employer', 'admin'), async (req, res, next) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        const allowed = ['title', 'description', 'company', 'location', 'type', 'category', 'salary', 'requirements',
            'skills', 'experience', 'education', 'openings', 'deadline', 'isActive', 'recruiterContact', 'tags'];
        allowed.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
        await job.save();
        res.json({ success: true, job });
    } catch (err) { next(err); }
});

// DELETE /api/employer/jobs/:id
router.delete('/jobs/:id', authenticateJWT, requireRole('employer', 'admin'), async (req, res, next) => {
    try {
        const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, postedBy: req.user._id };
        const job = await Job.findOneAndDelete(filter);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) { next(err); }
});

// GET /api/employer/jobs
router.get('/jobs', authenticateJWT, requireRole('employer', 'admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const filter = req.user.role === 'admin' ? {} : { postedBy: req.user._id };
        const { skip, limit: lim } = paginate(null, page, limit);
        const [jobs, total] = await Promise.all([
            Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
            Job.countDocuments(filter),
        ]);
        res.json({ success: true, jobs, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// GET /api/employer/applications/:jobId
router.get('/applications/:jobId', authenticateJWT, requireRole('employer', 'admin'), async (req, res, next) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
        if (!job && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });
        const { page = 1, limit = 20, status } = req.query;
        const filter = { job: req.params.jobId };
        if (status) filter.status = status;
        const { skip, limit: lim } = paginate(null, page, limit);
        const [applications, total] = await Promise.all([
            Application.find(filter).skip(skip).limit(lim).populate('candidate', 'name email phone avatar skills location resumeUrl'),
            Application.countDocuments(filter),
        ]);
        res.json({ success: true, applications, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// GET /api/employer/my-applications (candidate view)
router.get('/my-applications', authenticateJWT, requireRole('jobseeker'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const { skip, limit: lim } = paginate(null, page, limit);
        const [applications, total] = await Promise.all([
            Application.find({ candidate: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(lim).populate('job', 'title company location type salary isActive'),
            Application.countDocuments({ candidate: req.user._id }),
        ]);
        res.json({ success: true, applications, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// PUT /api/employer/applications/:id/status
router.put('/applications/:id/status', authenticateJWT, requireRole('employer', 'admin'), async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const application = await Application.findById(req.params.id).populate('candidate', 'name email').populate('job', 'title company');
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        application.status = status;
        if (notes) application.notes = notes;
        if (status === 'reviewed' && !application.viewedAt) application.viewedAt = new Date();
        await application.save();

        // Notify candidate
        await Notification.create({
            recipient: application.candidate._id,
            type: 'application_status_changed',
            title: `Application ${status} — ${application.job.title}`,
            message: `Your application at ${application.job.company} has been ${status}.`,
            actionUrl: `/profile/applications`,
        });

        await sendEmail({
            to: application.candidate.email,
            subject: `Application update — ${application.job.title}`,
            html: emailTemplates.applicationStatusChanged(application.candidate.name, application.job.title, status),
        });

        res.json({ success: true, application });
    } catch (err) { next(err); }
});

// GET /api/employer/team
router.get('/team', authenticateJWT, requireRole('employer'), async (req, res, next) => {
    try {
        let team = await Team.findOne({ employer: req.user._id }).populate('members.user', 'name email avatar');
        if (!team) team = await Team.create({ employer: req.user._id, members: [] });
        res.json({ success: true, team });
    } catch (err) { next(err); }
});

// POST /api/employer/team/invite
router.post(
    '/team/invite',
    authenticateJWT,
    requireRole('employer'),
    [body('email').isEmail().normalizeEmail(), body('role').isIn(['admin', 'recruiter', 'viewer'])],
    validate,
    async (req, res, next) => {
        try {
            const { email, role } = req.body;
            let team = await Team.findOne({ employer: req.user._id });
            if (!team) team = await Team.create({ employer: req.user._id, members: [] });

            const alreadyInvited = team.members.find(m => m.email === email);
            if (alreadyInvited) return res.status(409).json({ success: false, message: 'Already invited' });

            const existingUser = await User.findOne({ email });
            team.members.push({ email, role, user: existingUser?._id, status: 'pending' });
            await team.save();

            const link = `${process.env.FRONTEND_URL}/team/accept?employer=${req.user._id}&email=${email}`;
            await sendEmail({
                to: email,
                subject: `You're invited to join ${req.user.companyName || 'the team'} on JobHai`,
                html: emailTemplates.teamInvite(req.user.name, req.user.companyName || 'the company', link),
            });

            res.json({ success: true, message: 'Invitation sent', team });
        } catch (err) { next(err); }
    }
);

// DELETE /api/employer/team/member/:memberId
router.delete('/team/member/:memberId', authenticateJWT, requireRole('employer'), async (req, res, next) => {
    try {
        const team = await Team.findOne({ employer: req.user._id });
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        team.members = team.members.filter(m => m._id.toString() !== req.params.memberId);
        await team.save();
        res.json({ success: true, message: 'Member removed', team });
    } catch (err) { next(err); }
});

module.exports = router;
