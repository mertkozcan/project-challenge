const pool = require('../config/db');

const getAllChallenges = async () => {
  const result = await pool.query('SELECT * FROM challenges');
  return result.rows;
};

const createChallenge = async (gameName, challengeName, description, reward) => {
  const result = await pool.query(
    'INSERT INTO challenges (game_name, challenge_name, description, reward) VALUES ($1, $2, $3, $4) RETURNING *',
    [gameName, challengeName, description, reward]
  );
  return result.rows[0];
};

const getLatestChallenges = async (limit = 5) => {
  try {
    const result = await pool.query(
      'SELECT * FROM challenges ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching latest challenges:', error.message);
    throw error;
  }
};

module.exports = { getAllChallenges, createChallenge,getLatestChallenges  };
