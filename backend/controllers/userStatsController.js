const { getUserStats, getUserActivity, getUserBuilds } = require('../models/userStatsModel');

const getStats = async (req, res) => {
    const { userId } = req.params;
    try {
        const stats = await getUserStats(userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActivity = async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const activity = await getUserActivity(userId, limit);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBuilds = async (req, res) => {
    const { userId } = req.params;

    try {
        const builds = await getUserBuilds(userId);
        res.json(builds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStats,
    getActivity,
    getBuilds,
};
