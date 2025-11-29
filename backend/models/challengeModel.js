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

const createChallenge = async (gameName, challengeName, description, type = 'permanent', endDate = null, rewardXp = null, difficulty = 'Medium', basePoints = 250) => {
  // Auto-calculate XP if not provided
  if (!rewardXp) {
    rewardXp = type === 'daily' ? 200 : type === 'weekly' ? 500 : 100;
  }

  const result = await pool.query(
    'INSERT INTO challenges (game_name, challenge_name, description, type, end_date, reward_xp, difficulty, base_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [gameName, challengeName, description, type, endDate, rewardXp, difficulty, basePoints]
  );
  return result.rows[0];
};

const getLatestChallenges = async () => {
  const result = await pool.query('SELECT * FROM challenges ORDER BY created_at DESC LIMIT 5');
  return result.rows;
};

const getChallengeById = async (id, userId = null) => {
  const result = await pool.query(
    `SELECT c.*, g.banner_url, g.icon_url as game_icon,
     (SELECT COUNT(*) FROM run_sessions WHERE challenge_id = c.id) as participation_count
     FROM challenges c
     LEFT JOIN games g ON c.game_name = g.name
     WHERE c.id = $1`,
    [id]
  );
  const challenge = result.rows[0];

  if (challenge && userId) {
    const participation = await pool.query(
      'SELECT * FROM run_sessions WHERE user_id = $1 AND challenge_id = $2',
      [userId, id]
    );
    challenge.user_participated = participation.rows.length > 0;

    // Check proof status
    const proof = await pool.query(
      'SELECT status FROM proofs WHERE user_id = $1 AND challenge_id = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, id]
    );
    challenge.user_proof_status = proof.rows[0]?.status;
  }

  return challenge;
};

const getPopularChallenges = async (limit = 5) => {
  const result = await pool.query(
    `SELECT c.*, g.icon_url as game_icon, COUNT(ubr.id) as participation_count
     FROM challenges c
     LEFT JOIN games g ON c.game_name = g.name
     LEFT JOIN run_sessions ubr ON c.id = ubr.challenge_id
     GROUP BY c.id, g.icon_url
     ORDER BY participation_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

const completeChallengeWithXP = async (challengeId, userId, proofId) => {
  try {
    // 1. Get Challenge XP
    const challengeResult = await pool.query('SELECT reward_xp FROM challenges WHERE id = $1', [challengeId]);
    const xpReward = challengeResult.rows[0]?.reward_xp || 0;

    // 2. Update User XP
    await pool.query('UPDATE users SET total_xp = total_xp + $1 WHERE id = $2', [xpReward, userId]);

    // 3. Mark run as completed (if applicable)
    // Update run_sessions for the active session
    await pool.query(
      'UPDATE run_sessions SET status = $1, completed_at = NOW() WHERE user_id = $2 AND challenge_id = $3 AND status = $4',
      ['COMPLETED', userId, challengeId, 'ACTIVE']
    );

    return { success: true, xpAwarded: xpReward };
  } catch (error) {
    console.error('Error completing challenge with XP:', error);
    throw error;
  }
};

const updateChallenge = async (id, data) => {
  const { game_name, challenge_name, description, type, end_date, reward_xp, difficulty, base_points } = data;

  const result = await pool.query(
    `UPDATE challenges 
     SET game_name = COALESCE($1, game_name),
         challenge_name = COALESCE($2, challenge_name),
         description = COALESCE($3, description),
         type = COALESCE($4, type),
         end_date = COALESCE($5, end_date),
         reward_xp = COALESCE($6, reward_xp),
         difficulty = COALESCE($7, difficulty),
         base_points = COALESCE($8, base_points),
         updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [game_name, challenge_name, description, type, end_date, reward_xp, difficulty, base_points, id]
  );
  return result.rows[0];
};

const deleteChallenge = async (id) => {
  const result = await pool.query('DELETE FROM challenges WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = { getAllChallenges, createChallenge, updateChallenge, deleteChallenge, getLatestChallenges, getChallengeById, getPopularChallenges, completeChallengeWithXP };
