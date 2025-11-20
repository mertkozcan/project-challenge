const { getChallengeLeaderboard, getGlobalLeaderboardByCompletions, getGlobalLeaderboardByPoints } = require('../models/leaderboardModel');

const getChallengeRankings = async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.query.userId || req.user?.id || null;
    const limit = parseInt(req.query.limit) || 50;

    try {
        const result = await getChallengeLeaderboard(challengeId, userId, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGlobalRankings = async (req, res) => {
    const { type } = req.query; // 'completions' or 'points'
    try {
        let rankings;
        if (type === 'points') {
            rankings = await getGlobalLeaderboardByPoints();
        } else {
            rankings = await getGlobalLeaderboardByCompletions();
        }
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getChallengeRankings, getGlobalRankings };
