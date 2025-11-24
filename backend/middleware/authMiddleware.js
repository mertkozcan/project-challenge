// Simple authentication middleware
// For now, this is a placeholder - you should implement proper JWT authentication

const authenticateToken = (req, res, next) => {
    // Get user ID from multiple sources
    let userId = req.query.userId || req.body.userId || req.headers['x-user-id'];

    // Try to extract from Authorization header (Bearer token)
    if (!userId && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        console.log('[AUTH] Authorization header:', authHeader);
        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

        // For now, treat the token as userId if it's not "null" or empty
        if (token && token !== 'null' && token !== 'undefined') {
            userId = token;
            console.log('[AUTH] Extracted userId from token:', userId);
        }
    }

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required', message: 'No userId provided' });
    }

    // Attach userId to request in multiple formats for compatibility
    req.userId = userId;
    req.user = { id: userId }; // For controllers expecting req.user.id
    next();
};

module.exports = { authenticateToken };
