const pool = require('../config/db');

const getChallengeLeaderboard = async (challengeId, userId = null, limit = 50) => {
    // Rank by score (DESC) then by created_at (ASC) for tie-breaking
    const result = await pool.query(
        `SELECT 
            p.user_id,
            u.username,
            u.avatar_url,
            p.score,
            p.created_at,
            ROW_NUMBER() OVER (ORDER BY p.score DESC, p.created_at ASC) as rank
         FROM proofs p
         JOIN users u ON p.user_id = u.id 
         WHERE p.challenge_id = $1 AND p.status = 'APPROVED'
         ORDER BY p.score DESC, p.created_at ASC
         LIMIT $2`,
        [challengeId, limit]
    );

    const rankings = result.rows;

    // If userId provided, get their rank
    let userRank = null;
    if (userId) {
        const userRankQuery = `
            SELECT rank FROM (
                SELECT user_id, ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank
                FROM proofs
                WHERE challenge_id = $1 AND status = 'APPROVED'
            ) ranked
            WHERE user_id = $2
        `;
        const userRankResult = await pool.query(userRankQuery, [challengeId, userId]);
        userRank = userRankResult.rows[0]?.rank || null;
    }

    return { rankings, userRank };
};

const getGlobalLeaderboardByCompletions = async () => {
    const result = await pool.query(
        `SELECT users.id as user_id, users.username, users.avatar_url, COUNT(proofs.id) as completed_count
     FROM users
     JOIN proofs ON users.id = proofs.user_id
     WHERE proofs.status = 'APPROVED'
     GROUP BY users.id
     ORDER BY completed_count DESC
     LIMIT 100`
    );
    return result.rows;
};

const getGlobalLeaderboardByPoints = async () => {
    // Assuming users table has a points column that is updated elsewhere, 
    // OR we sum up rewards from challenges.
    // Let's use the 'points' column in users table for now.
    const result = await pool.query(
        `SELECT id as user_id, username, avatar_url, points FROM users ORDER BY points DESC LIMIT 100`
    );
    return result.rows;
}

module.exports = { getChallengeLeaderboard, getGlobalLeaderboardByCompletions, getGlobalLeaderboardByPoints };
