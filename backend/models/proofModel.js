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

const updateProofStatus = async (proofId, status, manualScore = null) => {
    let score = manualScore || 0;
    let placement = null;

    if (status === 'APPROVED' && !manualScore) {
        // 1. Get Challenge Details
        const proofRes = await pool.query('SELECT challenge_id FROM proofs WHERE id = $1', [proofId]);
        const challengeId = proofRes.rows[0].challenge_id;

        const challengeRes = await pool.query('SELECT base_points FROM challenges WHERE id = $1', [challengeId]);
        const basePoints = challengeRes.rows[0]?.base_points || 250;

        // 2. Determine Placement
        const countRes = await pool.query(
            "SELECT COUNT(*) FROM proofs WHERE challenge_id = $1 AND status = 'APPROVED'",
            [challengeId]
        );
        const approvedCount = parseInt(countRes.rows[0].count);

        // If this proof is being approved, it will be the (approvedCount + 1)th proof
        placement = approvedCount + 1;

        // 3. Calculate Score
        if (placement === 1) {
            score = Math.round(basePoints * 1.5); // +50%
        } else if (placement === 2) {
            score = Math.round(basePoints * 1.25); // +25%
        } else if (placement === 3) {
            score = Math.round(basePoints * 1.10); // +10%
        } else {
            score = basePoints;
        }
    }

    const result = await pool.query(
        'UPDATE proofs SET status = $1, score = $2, placement = $3 WHERE id = $4 RETURNING *',
        [status, score, placement, proofId]
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

const voteProof = async (proofId, userId) => {
    // Check if vote exists
    const existingVote = await pool.query(
        'SELECT id FROM proof_votes WHERE proof_id = $1 AND user_id = $2',
        [proofId, userId]
    );

    let likesCountChange = 0;

    if (existingVote.rows.length > 0) {
        // Remove vote (Toggle OFF)
        await pool.query('DELETE FROM proof_votes WHERE proof_id = $1 AND user_id = $2', [proofId, userId]);
        likesCountChange = -1;
    } else {
        // Add vote (Toggle ON)
        await pool.query('INSERT INTO proof_votes (proof_id, user_id) VALUES ($1, $2)', [proofId, userId]);
        likesCountChange = 1;
    }

    // Update likes_count in proofs table
    const result = await pool.query(
        'UPDATE proofs SET likes_count = likes_count + $1 WHERE id = $2 RETURNING likes_count',
        [likesCountChange, proofId]
    );

    return {
        liked: likesCountChange === 1,
        likesCount: result.rows[0].likes_count
    };
};

module.exports = { createProof, getProofsByChallenge, updateProofStatus, getProofById, getAllPendingProofs, voteProof };
