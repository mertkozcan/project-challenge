const {
    getUserProfile,
    getUserStats,
    getUserRecentActivity,
    getUserLeaderboardRank,
    incrementUserPoints
} = require('../models/userModel');

const getProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await getUserProfile(id);
        if (!profile) {
            return res.status(404).json({ error: 'User not found' });
        }

        const stats = await getUserStats(id);
        const rank = await getUserLeaderboardRank(id);
        const recentActivity = await getUserRecentActivity(id);

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
