const pool = require('../config/db');

const createUserProfile = async (id, email, username) => {
    const result = await pool.query(
        'INSERT INTO users (id, email, username, points) VALUES ($1, $2, $3, 0) RETURNING *',
        [id, email, username]
    );
    return result.rows[0];
};

const getUserProfileByAuthId = async (authId) => {
    const result = await pool.query(
        'SELECT id, username, email, avatar_url, points, is_admin, created_at FROM users WHERE id = $1',
        [authId]
    );
    return result.rows[0];
};

module.exports = { createUserProfile, getUserProfileByAuthId };
