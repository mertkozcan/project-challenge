const { getAllChallenges, createChallenge ,getLatestChallenges} = require('../models/challengeModel');

const getChallenges = async (req, res) => {
  try {
    const challenges = await getAllChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addChallenge = async (req, res) => {
  const { game_name, challenge_name, description, reward } = req.body;
  try {
    const newChallenge = await createChallenge(game_name, challenge_name, description, reward);
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

module.exports = { getChallenges, addChallenge, latestChallenges };
