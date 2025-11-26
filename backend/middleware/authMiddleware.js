// Simple authentication middleware
// For now, this is a placeholder - you should implement proper JWT authentication

const jwt = require('jsonwebtoken');

const supabase = require('../config/supabase');
const pool = require('../config/db');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
    }

    try {
        // 1. Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[AUTH] Supabase token verification failed:', error?.message);
            return res.status(403).json({ error: 'Invalid token' });
        }

        // 2. Get local user profile (for role/admin check)
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
        const localUser = result.rows[0];

        if (!localUser) {
            // Optional: Auto-sync if user exists in Supabase but not locally?
            // For now, fail if not found locally, as signup should handle this.
            console.warn('[AUTH] User found in Supabase but not in local DB:', user.id);
            // We can allow them to proceed as "user" or block. 
            // Let's allow but with limited info, or better, block to force proper signup.
            // But wait, if I just signed up in Supabase, I might be calling an API before local DB is synced?
            // No, signup flow syncs immediately.
            return res.status(401).json({ error: 'User profile not found' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: localUser.is_admin ? 'admin' : 'user',
            username: localUser.username
        };
        req.userId = user.id;
        next();

    } catch (err) {
        console.error('[AUTH] Internal error:', err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { authenticateToken };
