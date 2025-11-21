const {
    getUserProfile,
    getUserStats,
    getUserRecentActivity,
    getUserLeaderboardRank,
    incrementUserPoints,
    getUserIdByUsername
} = require('../models/userModel');

const resolveUserId = async (identifier) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) return identifier;

    const userId = await getUserIdByUsername(identifier);
    if (!userId) throw new Error('User not found');
    return userId;
};

const getProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const resolvedId = await resolveUserId(id);
        const profile = await getUserProfile(resolvedId);
        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        const stats = await getUserStats(resolvedId);
        const rank = await getUserLeaderboardRank(resolvedId);
        const recentActivity = await getUserRecentActivity(resolvedId);

        res.json({
            profile,
            stats,
            rank: rank?.rank || null,
            recentActivity,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProfile };
