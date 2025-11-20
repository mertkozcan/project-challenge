const pool = require('../config/db');

const getAllChallenges = async (type, contentType) => {
  let query = 'SELECT * FROM challenges WHERE 1=1';
  let params = [];
  let paramIndex = 1;

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (contentType === 'official') {
    query += ` AND is_official = true`;
  } else if (contentType === 'community') {
    query += ` AND is_official = false`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

const createChallenge = async (gameName, challengeName, description, reward, type = 'permanent', endDate = null) => {
  const result = await pool.query(
    'INSERT INTO challenges (game_name, challenge_name, description, reward, type, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [gameName, challengeName, description, reward, type, endDate]
  );
  return result.rows[0];
};

const getLatestChallenges = async (limit = 10) => {
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

const getChallengeById = async (id) => {
  const result = await pool.query('SELECT * FROM challenges WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { getAllChallenges, createChallenge, getLatestChallenges, getChallengeById };
