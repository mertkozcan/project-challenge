const {
    getBingoWinsLeaderboard,
    getFastestCompletionsLeaderboard,
    getMostGamesPlayedLeaderboard,
    getWinStreaksLeaderboard,
    getUserBingoRanks
} = require('../models/bingoLeaderboardModel');

/**
 * Get bingo leaderboard by type
 */
const getBingoLeaderboard = async (req, res) => {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    try {
        let leaderboard;

        switch (type) {
            case 'wins':
                leaderboard = await getBingoWinsLeaderboard(limit);
                break;
            case 'fastest':
                leaderboard = await getFastestCompletionsLeaderboard(limit);
                break;
            case 'games':
                leaderboard = await getMostGamesPlayedLeaderboard(limit);
                break;
            case 'streaks':
                leaderboard = await getWinStreaksLeaderboard(limit);
                break;
            default:
                return res.status(400).json({ error: 'Invalid leaderboard type. Use: wins, fastest, games, or streaks' });
        }

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching bingo leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get user's ranks across all bingo leaderboards
 */
const getUserBingoLeaderboardRanks = async (req, res) => {
    const { userId } = req.params;

    try {
        const ranks = await getUserBingoRanks(userId);
        res.json(ranks);
    } catch (error) {
        console.error('Error fetching user bingo ranks:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBingoLeaderboard,
    getUserBingoLeaderboardRanks
};
