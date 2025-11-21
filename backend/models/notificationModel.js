const pool = require('../config/db');

const createNotification = async (userId, type, title, message, relatedId = null) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, type, title, message, relatedId]
    );
    return result.rows[0];
};

const getUserNotifications = async (userId, limit = 20) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

const getUnreadCount = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count FROM notifications
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
    return parseInt(result.rows[0].count);
};

const markAsRead = async (notificationId, userId) => {
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return result.rows[0];
};

const markAllAsRead = async (userId) => {
    await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1`,
        [userId]
    );
    return true;
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
