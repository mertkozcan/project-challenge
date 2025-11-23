const pool = require('../config/db');

const FriendModel = {
    // Send a friend request
    sendRequest: async (userId, friendId) => {
        const result = await pool.query(
            `INSERT INTO friendships (user_id, friend_id, status)
             VALUES ($1, $2, 'PENDING')
             RETURNING *`,
            [userId, friendId]
        );
        return result.rows[0];
    },

    // Accept a friend request
    acceptRequest: async (requestId) => {
        const result = await pool.query(
            `UPDATE friendships 
             SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [requestId]
        );
        return result.rows[0];
    },

    // Remove a friend or reject a request
    removeFriend: async (userId, friendId) => {
        await pool.query(
            `DELETE FROM friendships 
             WHERE (user_id = $1 AND friend_id = $2) 
                OR (user_id = $2 AND friend_id = $1)`,
            [userId, friendId]
        );
    },

    // Get all friends for a user
    getFriends: async (userId) => {
        const result = await pool.query(
            `SELECT u.id, u.username, u.avatar_url, u.trust_level, f.status
             FROM friendships f
             JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
             WHERE (f.user_id = $1 OR f.friend_id = $1)
               AND f.status = 'ACCEPTED'
               AND u.id != $1`,
            [userId]
        );
        return result.rows;
    },

    // Get pending friend requests (incoming)
    getPendingRequests: async (userId) => {
        const result = await pool.query(
            `SELECT f.id as request_id, u.id as sender_id, u.username, u.avatar_url, f.created_at
             FROM friendships f
             JOIN users u ON f.user_id = u.id
             WHERE f.friend_id = $1
               AND f.status = 'PENDING'`,
            [userId]
        );
        return result.rows;
    },

    // Check if friendship exists
    checkFriendship: async (userId, friendId) => {
        const result = await pool.query(
            `SELECT * FROM friendships 
             WHERE (user_id = $1 AND friend_id = $2) 
                OR (user_id = $2 AND friend_id = $1)`,
            [userId, friendId]
        );
        return result.rows[0];
    }
};

module.exports = FriendModel;
