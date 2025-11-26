const { getAllChallenges, createChallenge, getLatestChallenges, getChallengeById, getPopularChallenges: getPopularChallengesModel } = require('../models/challengeModel');

const getChallenges = async (req, res) => {
  const { type, contentType } = req.query;
  try {
    const challenges = await getAllChallenges(type, contentType);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addChallenge = async (req, res) => {
  const { game_name, challenge_name, description, reward, type, end_date, created_by } = req.body;
  try {
    const newChallenge = await createChallenge(game_name, challenge_name, description, reward, type, end_date === '' ? null : end_date);

    // If created_by is provided, update the challenge
    if (created_by) {
      const pool = require('../config/db');
      await pool.query(
        'UPDATE challenges SET created_by = $1 WHERE id = $2',
        [created_by, newChallenge.id]
      );
    }

    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const latestChallenges = async (req, res) => {
  try {
    const challenges = await getLatestChallenges();
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching latest challenges:', error.message);
    res.status(500).json({ error: 'Database error' });
  }
};

const getChallengeDetail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null; // Get from auth middleware if available
  try {
    const challenge = await getChallengeById(id, userId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPopularChallenges = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const challenges = await getPopularChallengesModel(limit);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateChallenge = async (req, res) => {
  const { id } = req.params;
  const { game_name, challenge_name, description, reward, type, end_date, reward_xp, difficulty, base_points } = req.body;

  try {
    const { updateChallenge: updateChallengeModel } = require('../models/challengeModel');
    const updatedChallenge = await updateChallengeModel(id, {
      game_name, challenge_name, description, reward, type, end_date: end_date === '' ? null : end_date, reward_xp, difficulty, base_points
    });

    if (!updatedChallenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChallenges, addChallenge, updateChallenge, latestChallenges, getChallengeDetail, getPopularChallenges };
