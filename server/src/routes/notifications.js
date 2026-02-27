const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateJWT } = require('../middleware/auth');
const { paginate, paginationMeta } = require('../utils/helpers');

// GET /api/notifications
router.get('/', authenticateJWT, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query;
        const filter = { recipient: req.user._id };
        if (unreadOnly === 'true') filter.isRead = false;
        const { skip, limit: lim } = paginate(null, page, limit);
        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipient: req.user._id, isRead: false }),
        ]);
        res.json({ success: true, notifications, unreadCount, pagination: paginationMeta(total, page, lim) });
    } catch (err) { next(err); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateJWT, async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
        res.json({ success: true });
    } catch (err) { next(err); }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateJWT, async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) { next(err); }
});

module.exports = router;
