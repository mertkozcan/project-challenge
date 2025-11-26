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

// ... (getLatestChallenges, getChallengeById, getPopularChallenges, completeChallengeWithXP remain unchanged)

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

module.exports = { getAllChallenges, createChallenge, updateChallenge, getLatestChallenges, getChallengeById, getPopularChallenges, completeChallengeWithXP };
