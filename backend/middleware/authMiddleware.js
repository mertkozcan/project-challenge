// Simple authentication middleware
// For now, this is a placeholder - you should implement proper JWT authentication

const authenticateToken = (req, res, next) => {
    // Get user ID from query, body, or headers
    const userId = req.query.userId || req.body.userId || req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Attach userId to request
    req.userId = userId;
    next();
};

module.exports = { authenticateToken };
