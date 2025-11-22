const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const notifications = await notificationModel.getUserNotifications(userId, limit, offset);
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

const markRead = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const notification = await notificationModel.markAsRead(id, userId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
};

const markAllRead = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await notificationModel.markAllAsRead(userId);
        res.json(result);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const notification = await notificationModel.deleteNotification(id, userId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
};

const getUnreadCount = async (req, res) => {
    const userId = req.user.id;

    try {
        const count = await notificationModel.getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    getUnreadCount,
};
