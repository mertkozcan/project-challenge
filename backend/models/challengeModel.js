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

const getChallengeById = async (id, userId = null) => {
  // Get challenge with game banner
  const challengeQuery = `
    SELECT c.*, g.banner_url, g.icon_url as game_icon
    FROM challenges c
    LEFT JOIN games g ON c.game_name = g.name
    WHERE c.id = $1
  `;
  const challengeResult = await pool.query(challengeQuery, [id]);

  if (challengeResult.rows.length === 0) {
    return null;
  }

  const challenge = challengeResult.rows[0];

  // Get participant count (from proofs table)
  const participantQuery = `
    SELECT COUNT(DISTINCT user_id) as participant_count
    FROM proofs
    WHERE challenge_id = $1 AND status = 'APPROVED'
  `;
  const participantResult = await pool.query(participantQuery, [id]);
  challenge.participant_count = parseInt(participantResult.rows[0].participant_count) || 0;

  // If userId provided, check if user has participated
  if (userId) {
    const userProofQuery = `
      SELECT id, status FROM proofs
      WHERE challenge_id = $1 AND user_id = $2
      ORDER BY created_at DESC LIMIT 1
    `;
    const userProofResult = await pool.query(userProofQuery, [id, userId]);
    challenge.user_participated = userProofResult.rows.length > 0;
    challenge.user_proof_status = userProofResult.rows[0]?.status || null;
  }

  return challenge;
}

module.exports = { getAllChallenges, createChallenge, getLatestChallenges, getChallengeById };
