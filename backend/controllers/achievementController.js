const AchievementModel = require('../models/achievementModel');

const getAchievements = async (req, res) => {
    try {
        const achievements = await AchievementModel.getAllAchievements();
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
};

const getUserAchievements = async (req, res) => {
    try {
        const { userId } = req.params;
        const achievements = await AchievementModel.getUserAchievements(userId);
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({ error: 'Failed to fetch user achievements' });
    }
};

module.exports = {
    getAchievements,
    getUserAchievements
};
