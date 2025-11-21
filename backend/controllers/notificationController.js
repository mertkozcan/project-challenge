const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
    const { userId } = req.params;
    // Security check: ensure user is requesting their own notifications
    // (Assuming auth middleware adds user info to req, but for now relying on params)

    try {
        const notifications = await notificationModel.getUserNotifications(userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    const { userId } = req.params;
    try {
        const count = await notificationModel.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markRead = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Should come from auth middleware ideally

    try {
        const notification = await notificationModel.markAsRead(id, userId);
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAllRead = async (req, res) => {
    const { userId } = req.params;

    try {
        await notificationModel.markAllAsRead(userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markRead,
    markAllRead
};
