const pool = require('../config/db');

const getUserProfile = async (userId) => {
  const result = await pool.query(
    'SELECT id, username, email, avatar_url, points, total_xp, level, is_admin, trust_level, created_at FROM users WHERE id = $1',
    [userId]
  );

  const user = result.rows[0];
  if (!user) return null;

  // Map is_admin to role for frontend
  return {
    ...user,
    role: user.is_admin ? 'admin' : 'user'
  };
};

const getUserStats = async (userId) => {
  // Get various stats
  const stats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM proofs WHERE user_id = $1 AND status = 'APPROVED') as completed_challenges,
      (SELECT COUNT(*) FROM proofs WHERE user_id = $1 AND status = 'PENDING') as pending_proofs,
      (SELECT COUNT(*) FROM builds WHERE user_id = $1) as created_builds,
      (SELECT COUNT(*) FROM challenges WHERE created_by = $1) as created_challenges,
      (SELECT points FROM users WHERE id = $1) as total_points
  `, [userId]);

  return stats.rows[0];
};

const getUserRecentActivity = async (userId, limit = 10) => {
  const result = await pool.query(`
    SELECT 
      'proof' as type,
      proofs.id::text,
      proofs.created_at,
      proofs.status,
      challenges.challenge_name as title,
      challenges.game_name
    FROM proofs
    JOIN challenges ON proofs.challenge_id = challenges.id
    WHERE proofs.user_id = $1
    
    UNION ALL
    
    SELECT 
      'build' as type,
      builds.id::text,
      builds.created_at,
      'published' as status,
      builds.build_name as title,
      builds.game_name
    FROM builds
    WHERE builds.user_id = $1
    
    UNION ALL
    
    SELECT 
      'challenge' as type,
      challenges.id::text,
      challenges.created_at,
      'published' as status,
      challenges.challenge_name as title,
      challenges.game_name
    FROM challenges
    WHERE challenges.created_by = $1
    
    ORDER BY created_at DESC
    LIMIT $2
  `, [userId, limit]);

  return result.rows;
};

const getUserLeaderboardRank = async (userId) => {
  const result = await pool.query(`
    WITH ranked_users AS (
      SELECT id, username, points, 
             ROW_NUMBER() OVER (ORDER BY points DESC) as rank
      FROM users
    )
    SELECT rank, points FROM ranked_users WHERE id = $1
  `, [userId]);

  return result.rows[0];
};

const incrementUserPoints = async (userId, points) => {
  const result = await pool.query(
    'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points',
    [points, userId]
  );
  return result.rows[0];
};

const getUserIdByUsername = async (username) => {
  const result = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0]?.id;
};

module.exports = {
  getUserProfile,
  getUserStats,
  getUserRecentActivity,
  getUserLeaderboardRank,
  incrementUserPoints,
  getUserIdByUsername,
};
