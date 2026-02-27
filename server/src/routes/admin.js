const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticateJWT, requireRole } = require('../middleware/auth');
const { paginate, paginationMeta } = require('../utils/helpers');

// GET /api/admin/stats
router.get('/stats', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const [totalUsers, totalJobs, totalApplications, jobseekers, employers] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            User.countDocuments({ role: 'jobseeker' }),
            User.countDocuments({ role: 'employer' }),
        ]);

        // Jobs by type
        const jobsByType = await Job.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
        // Registrations last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentJobs = await Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        res.json({
            success: true,
            stats: { totalUsers, totalJobs, totalApplications, jobseekers, employers, jobsByType, recentUsers, recentJobs },
        });
    } catch (err) { next(err); }
});

// GET /api/admin/users
router.get('/users', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, search, isActive } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        const { skip, limit: lim } = paginate(null, page, limit);
        const [users, total] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
            User.countDocuments(filter),
        ]);
        res.json({ success: true, users, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// PUT /api/admin/users/:id
router.put('/users/:id', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const { isActive, role, isVerified } = req.body;
        const updates = {};
        if (isActive !== undefined) updates.isActive = isActive;
        if (role && ['jobseeker', 'employer', 'admin'].includes(role)) updates.role = role;
        if (isVerified !== undefined) updates.isVerified = isVerified;
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) { next(err); }
});

// GET /api/admin/jobs
router.get('/jobs', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, isApproved, search } = req.query;
        const filter = {};
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
        if (search) filter.$text = { $search: search };
        const { skip, limit: lim } = paginate(null, page, limit);
        const [jobs, total] = await Promise.all([
            Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).populate('postedBy', 'name email companyName'),
            Job.countDocuments(filter),
        ]);
        res.json({ success: true, jobs, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

const { sendEmail, emailTemplates } = require('../services/email');

// PUT /api/admin/jobs/:id/approve
router.put('/jobs/:id/approve', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const { isApproved, isActive } = req.body;
        const job = await Job.findByIdAndUpdate(req.params.id, { isApproved, isActive }, { new: true }).populate('postedBy', 'name email');
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Notify employer if approved
        if (isApproved && job.postedBy?.email) {
            await sendEmail({
                to: job.postedBy.email,
                subject: `Job Posting Approved — ${job.title}`,
                html: emailTemplates.jobApproved(job.postedBy.name, job.title),
            });
        }

        res.json({ success: true, job });
    } catch (err) { next(err); }
});

// GET /api/admin/activity
router.get('/activity', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        const [recentUsers, recentJobs, recentApps] = await Promise.all([
            User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt'),
            Job.find().sort({ createdAt: -1 }).limit(10).select('title company createdAt'),
            Application.find().sort({ createdAt: -1 }).limit(10).populate('candidate', 'name').populate('job', 'title'),
        ]);

        const activities = [
            ...recentUsers.map(u => ({ type: 'user', title: `New ${u.role} joined: ${u.name}`, time: u.createdAt })),
            ...recentJobs.map(j => ({ type: 'job', title: `New job posted: ${j.title} at ${j.company}`, time: j.createdAt })),
            ...recentApps.map(a => ({ type: 'app', title: `${a.candidate?.name || 'User'} applied for ${a.job?.title || 'a job'}`, time: a.createdAt })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

        res.json({ success: true, activities });
    } catch (err) { next(err); }
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', authenticateJWT, requireRole('admin'), async (req, res, next) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) { next(err); }
});

module.exports = router;
