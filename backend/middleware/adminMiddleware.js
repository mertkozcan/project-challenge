const pool = require('../config/db');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    const userId = req.body.user_id || req.query.user_id || 1; // Hardcoded for now

    try {
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);

        if (!result.rows[0] || !result.rows[0].is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { isAdmin };
