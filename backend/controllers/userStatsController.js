const { getUserStats, getUserActivity, getUserBuilds } = require('../models/userStatsModel');
const { getUserIdByUsername } = require('../models/userModel');

const resolveUserId = async (identifier) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) return identifier;

    const userId = await getUserIdByUsername(identifier);
    if (!userId) throw new Error('User not found');
    return userId;
};

const getStats = async (req, res) => {
    const { userId } = req.params;
    try {
        const resolvedId = await resolveUserId(userId);
        const stats = await getUserStats(resolvedId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActivity = async (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const resolvedId = await resolveUserId(userId);
        const activity = await getUserActivity(resolvedId, limit);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBuilds = async (req, res) => {
    const { userId } = req.params;

    try {
        const resolvedId = await resolveUserId(userId);
        const builds = await getUserBuilds(resolvedId);
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
