const pool = require('../config/db');

const createNotification = async (userId, type, title, message) => {
    const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, type, title, message]
    );
    return result.rows[0];
};

const getUserNotifications = async (userId, limit = 20, offset = 0) => {
    const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
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
    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1 AND is_read = FALSE
         RETURNING count(*) as updated_count`,
        [userId]
    );
    return result.rows[0];
};

const deleteNotification = async (notificationId, userId) => {
    const result = await pool.query(
        `DELETE FROM notifications
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );
    return result.rows[0];
};

const getUnreadCount = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count FROM notifications
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
    return parseInt(result.rows[0].count);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
};
