const pool = require('../config/db');

const getAllChallenges = async (type, contentType) => {
  let query = `
    SELECT c.*, g.banner_url, g.icon_url as game_icon 
    FROM challenges c
    LEFT JOIN games g ON c.game_name = g.name
    WHERE 1=1
  `;
  let params = [];
  let paramIndex = 1;

  if (type) {
    query += ` AND c.type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (contentType === 'official') {
    query += ` AND c.is_official = true`;
  } else if (contentType === 'community') {
    query += ` AND c.is_official = false`;
  }

  query += ' ORDER BY c.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

const createChallenge = async (gameName, challengeName, description, reward, type = 'permanent', endDate = null, rewardXp = null) => {
  // Auto-calculate XP if not provided
  if (!rewardXp) {
    rewardXp = type === 'daily' ? 200 : type === 'weekly' ? 500 : 100;
  }

  const result = await pool.query(
    'INSERT INTO challenges (game_name, challenge_name, description, reward, type, end_date, reward_xp) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [gameName, challengeName, description, reward, type, endDate, rewardXp]
  );
  return result.rows[0];
};

const getLatestChallenges = async (limit = 10) => {
  try {
    const result = await pool.query(
      `SELECT c.*, g.banner_url, g.icon_url as game_icon
       FROM challenges c
       LEFT JOIN games g ON c.game_name = g.name
       ORDER BY c.created_at DESC LIMIT $1`,
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

const getPopularChallenges = async (limit = 5) => {
  try {
    const result = await pool.query(
      `SELECT c.*, g.banner_url, g.icon_url as game_icon, COUNT(p.id) as recent_participation_count
       FROM challenges c
       LEFT JOIN games g ON c.game_name = g.name
       LEFT JOIN proofs p ON c.id = p.challenge_id 
           AND p.created_at >= NOW() - INTERVAL '7 days'
       WHERE c.is_official = true
       GROUP BY c.id, g.banner_url, g.icon_url
       ORDER BY recent_participation_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching popular challenges:', error.message);
    throw error;
  }
};

/**
 * Complete a challenge and award XP
 */
const completeChallengeWithXP = async (challengeId, userId, proofId) => {
  const { awardXP } = require('../utils/xpSystem');

  // Get challenge details
  const challenge = await getChallengeById(challengeId);
  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Award XP
  const xpResult = await awardXP(userId, challenge.reward_xp || 100, `CHALLENGE_${challenge.type.toUpperCase()}`);

  // Update streak if it's a daily challenge
  if (challenge.type === 'daily') {
    const { updateUserStreak } = require('../utils/xpSystem');
    await updateUserStreak(userId);
  }

  return {
    challenge,
    xpResult
  };
};

module.exports = { getAllChallenges, createChallenge, getLatestChallenges, getChallengeById, getPopularChallenges, completeChallengeWithXP };
