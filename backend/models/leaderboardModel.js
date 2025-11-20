const pool = require('../config/db');

const getChallengeLeaderboard = async (challengeId) => {
    // Rank by score (DESC) then by created_at (ASC) for tie-breaking
    // Assuming higher score is better. If time-based (lower is better), we might need a flag in challenge.
    // For now, let's assume Score = Points (Higher is better).
    const result = await pool.query(
        `SELECT proofs.*, users.username, users.avatar_url 
     FROM proofs 
     JOIN users ON proofs.user_id = users.id 
     WHERE challenge_id = $1 AND status = 'APPROVED'
     ORDER BY score DESC, created_at ASC`,
        [challengeId]
    );
    return result.rows;
};

const getGlobalLeaderboardByCompletions = async () => {
    const result = await pool.query(
        `SELECT users.username, users.avatar_url, COUNT(proofs.id) as completed_count
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
        `SELECT username, avatar_url, points FROM users ORDER BY points DESC LIMIT 100`
    );
    return result.rows;
}

module.exports = { getChallengeLeaderboard, getGlobalLeaderboardByCompletions, getGlobalLeaderboardByPoints };
