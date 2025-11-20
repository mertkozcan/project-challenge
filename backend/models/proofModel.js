const pool = require('../config/db');

const createProof = async (userId, challengeId, mediaUrl, mediaType) => {
    const result = await pool.query(
        'INSERT INTO proofs (user_id, challenge_id, media_url, media_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, challengeId, mediaUrl, mediaType]
    );
    return result.rows[0];
};

const getProofsByChallenge = async (challengeId) => {
    const result = await pool.query(
        'SELECT proofs.*, users.username FROM proofs JOIN users ON proofs.user_id = users.id WHERE challenge_id = $1 ORDER BY created_at DESC',
        [challengeId]
    );
    return result.rows;
};

const updateProofStatus = async (proofId, status, score = 0) => {
    const result = await pool.query(
        'UPDATE proofs SET status = $1, score = $2 WHERE id = $3 RETURNING *',
        [status, score, proofId]
    );
    return result.rows[0];
};

const getProofById = async (proofId) => {
    const result = await pool.query('SELECT * FROM proofs WHERE id = $1', [proofId]);
    return result.rows[0];
};

const getAllPendingProofs = async () => {
    const result = await pool.query(
        `SELECT proofs.*, users.username, challenges.challenge_name, challenges.game_name
         FROM proofs 
         JOIN users ON proofs.user_id = users.id
         JOIN challenges ON proofs.challenge_id = challenges.id
         WHERE proofs.status = 'PENDING'
         ORDER BY proofs.created_at DESC`
    );
    return result.rows;
};

module.exports = { createProof, getProofsByChallenge, updateProofStatus, getProofById, getAllPendingProofs };
