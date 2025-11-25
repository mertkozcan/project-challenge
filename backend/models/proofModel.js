const pool = require('../config/db');
const crypto = require('crypto');

const createProof = async ({ user_id, challenge_id, media_url, media_type, run_code, ocr_result, ocr_extracted_text, video_url }) => {
    const id = crypto.randomUUID();
    const result = await pool.query(
        `INSERT INTO proofs 
         (id, user_id, challenge_id, media_url, media_type, run_code, ocr_result, ocr_extracted_text, video_url, verification_status, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', 'PENDING') 
         RETURNING *`,
        [id, user_id, challenge_id, media_url, media_type, run_code, ocr_result, ocr_extracted_text, video_url]
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

    const proof = result.rows[0];

    // Award XP if proof is approved
    if (status === 'APPROVED' && proof) {
        const { awardXP, XP_REWARDS } = require('../utils/xpSystem');
        const { completeChallengeWithXP } = require('./challengeModel');

        try {
            // Award proof approval XP
            await awardXP(proof.user_id, XP_REWARDS.PROOF_APPROVED, 'PROOF_APPROVED');

            // Award challenge completion XP if challenge_id exists
            if (proof.challenge_id) {
                await completeChallengeWithXP(proof.challenge_id, proof.user_id, proofId);
            }
        } catch (error) {
            console.error('Error awarding XP for proof approval:', error);
            // Don't fail the proof approval if XP award fails
        }
    }

    return proof;
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
