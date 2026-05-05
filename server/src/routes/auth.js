const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const { generateToken, generateRandomToken } = require('../utils/helpers');
const { sendEmail, emailTemplates } = require('../services/email');
const { validate } = require('../middleware/validate');
const { authenticateJWT } = require('../middleware/auth');

// POST /api/auth/signup
router.post(
    '/signup',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(['jobseeker', 'employer']).withMessage('Invalid role'),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { name, email, password, role = 'jobseeker', companyName, jobPreferences } = req.body;
            const existing = await User.findOne({ email });
            if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

            const verifyToken = generateRandomToken();
            const userData = {
                name,
                email,
                passwordHash: password,
                role,
                companyName: role === 'employer' ? companyName : undefined,
                emailVerifyToken: verifyToken,
                emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
            };
            // Save job preferences for jobseekers
            if (role === 'jobseeker' && jobPreferences) {
                userData.jobPreferences = jobPreferences;
            }
            const user = new User(userData);
            await user.save();

            const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verifyToken}&email=${email}`;
            await sendEmail({ to: email, subject: 'Verify your JobHai account', html: emailTemplates.verifyEmail(name, verifyLink) });

            const token = generateToken({ id: user._id, role: user.role });
            res.status(201).json({ success: true, message: 'Account created. Please verify your email.', token, user });
        } catch (err) { next(err); }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            
            const match = await user.comparePassword(password);
            if (!match) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
            
            if (!user.isActive) {
                return res.status(403).json({ success: false, message: 'Account suspended' });
            }

            const token = generateToken({ id: user._id, role: user.role });
            res.json({ success: true, token, user });
        } catch (err) { next(err); }
    }
);

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token, email } = req.query;
        const user = await User.findOne({
            email,
            emailVerifyToken: token,
            emailVerifyExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });

        user.isVerified = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyExpires = undefined;
        await user.save();
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (err) { next(err); }
});

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    [body('email').isEmail().normalizeEmail()],
    validate,
    async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

            const token = generateRandomToken();
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
            await user.save();

            const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${email}`;
            await sendEmail({ to: email, subject: 'Reset your JobHai password', html: emailTemplates.resetPassword(user.name, link) });
            res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        } catch (err) { next(err); }
    }
);

// POST /api/auth/reset-password
router.post(
    '/reset-password',
    [
        body('token').notEmpty(),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
    ],
    validate,
    async (req, res, next) => {
        try {
            const { token, email, password } = req.body;
            const user = await User.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            });
            if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

            user.passwordHash = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.json({ success: true, message: 'Password reset successfully' });
        } catch (err) { next(err); }
    }
);

// GET /api/auth/me
router.get('/me', authenticateJWT, (req, res) => {
    res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
router.put(
    '/profile',
    authenticateJWT,
    [body('name').optional().trim().notEmpty()],
    validate,
    async (req, res, next) => {
        try {
            const allowedFields = ['name', 'phone', 'location', 'bio', 'skills', 'experience', 'education',
                'currentSalary', 'expectedSalary', 'noticePeriod', 'socialLinks',
                'companyName', 'companyLogo', 'companyWebsite', 'companyDescription', 'companySize', 'industry',
                'jobPreferences'];
            const updates = {};
            allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
            const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
            res.json({ success: true, user });
        } catch (err) { next(err); }
    }
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/sign-in' }), (req, res) => {
    const token = generateToken({ id: req.user._id, role: req.user.role });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

module.exports = router;
