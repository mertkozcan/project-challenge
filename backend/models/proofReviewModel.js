const pool = require('../config/db');

const ProofReviewModel = {
    /**
     * Get pending proofs for review (excluding user's own)
     * @param {string} userId - Reviewer ID
     * @param {number} limit - Max results
     */
    getPendingProofs: async (userId, limit = 10) => {
        // Get proofs that:
        // 1. Are PENDING
        // 2. Are NOT uploaded by the reviewer
        // 3. Have NOT been reviewed by this reviewer yet
        const result = await pool.query(
            `SELECT p.*, u.username as uploader_name, u.trust_level,
              rs.display_username, rs.game_name, rs.challenge_type,
              c.title as challenge_title,
              (SELECT COUNT(*) FROM proof_reviews pr WHERE pr.proof_id = p.id AND pr.decision = 'APPROVE') as current_approvals,
              (SELECT COUNT(*) FROM proof_reviews pr WHERE pr.proof_id = p.id AND pr.decision = 'REJECT') as current_rejections
       FROM proofs p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN run_sessions rs ON p.run_code = rs.run_code
       LEFT JOIN challenges c ON rs.challenge_id = c.id
       WHERE p.verification_status = 'PENDING'
       AND p.user_id != $1
       AND NOT EXISTS (
         SELECT 1 FROM proof_reviews pr 
         WHERE pr.proof_id = p.id AND pr.reviewer_id = $1
       )
       ORDER BY p.created_at ASC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    },

    /**
     * Submit a review for a proof
     */
    submitReview: async (proofId, reviewerId, decision, comment) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert review
            await client.query(
                `INSERT INTO proof_reviews (proof_id, reviewer_id, decision, comment)
         VALUES ($1, $2, $3, $4)`,
                [proofId, reviewerId, decision, comment]
            );

            // 2. Update proof counts
            if (decision === 'APPROVE') {
                await client.query(
                    `UPDATE proofs SET approval_count = approval_count + 1 WHERE id = $1`,
                    [proofId]
                );
            } else {
                await client.query(
                    `UPDATE proofs SET rejection_count = rejection_count + 1 WHERE id = $1`,
                    [proofId]
                );
            }

            // 3. Check for auto-approval/rejection
            const proofRes = await client.query(
                `SELECT p.*, u.trust_level 
         FROM proofs p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1`,
                [proofId]
            );
            const proof = proofRes.rows[0];

            let newStatus = 'PENDING';

            // Auto-rejection logic (2 rejections = reject)
            if (proof.rejection_count >= 2) {
                newStatus = 'REJECTED';
            }
            // Auto-approval logic based on trust level
            else {
                const approvalsNeeded = proof.trust_level >= 2 ? 1 : 2;
                if (proof.approval_count >= approvalsNeeded) {
                    newStatus = 'VERIFIED';
                }
            }

            // If status changed, update proof and user stats
            if (newStatus !== 'PENDING') {
                await client.query(
                    `UPDATE proofs SET verification_status = $1, verified_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [newStatus, proofId]
                );

                // Update user stats
                if (newStatus === 'VERIFIED') {
                    await ProofReviewModel.handleApproval(client, proof.user_id);

                    // If run session exists, complete it
                    if (proof.run_code) {
                        await client.query(
                            `UPDATE run_sessions SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE run_code = $1`,
                            [proof.run_code]
                        );
                    }
                } else {
                    await ProofReviewModel.handleRejection(client, proof.user_id);
                }
            }

            await client.query('COMMIT');
            return { status: newStatus };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Handle user approval stats (Promotion logic)
     */
    handleApproval: async (client, userId) => {
        // Increment approved count, reset consecutive rejections
        await client.query(
            `UPDATE users 
       SET approved_proofs_count = approved_proofs_count + 1,
           consecutive_rejections = 0
       WHERE id = $1`,
            [userId]
        );

        // Check for promotion (Level 1 -> 2 after 5 approvals)
        const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        if (user.trust_level === 1 && user.approved_proofs_count >= 5) {
            await client.query(
                `UPDATE users SET trust_level = 2, trust_earned_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [userId]
            );
        }
    },

    /**
     * Handle user rejection stats (Demotion logic)
     */
    handleRejection: async (client, userId) => {
        // Increment rejected count and consecutive rejections
        await client.query(
            `UPDATE users 
       SET rejected_proofs_count = rejected_proofs_count + 1,
           consecutive_rejections = consecutive_rejections + 1
       WHERE id = $1`,
            [userId]
        );

        const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        // Demotion logic (3 consecutive rejections -> drop level)
        if (user.consecutive_rejections >= 3 && user.trust_level > 1) {
            await client.query(
                `UPDATE users 
         SET trust_level = trust_level - 1, 
             last_demotion_at = CURRENT_TIMESTAMP,
             consecutive_rejections = 0 
         WHERE id = $1`,
                [userId]
            );
        }

        // Untrusted flag logic (>50% rejection rate after 10 proofs)
        const totalProofs = user.approved_proofs_count + user.rejected_proofs_count;
        if (totalProofs >= 10) {
            const rejectionRate = user.rejected_proofs_count / totalProofs;
            if (rejectionRate > 0.5) {
                await client.query(
                    `UPDATE users SET is_untrusted = true WHERE id = $1`,
                    [userId]
                );
            }
        }
    },

    /**
     * Submit a dispute report
     */
    submitDispute: async (proofId, reporterId, reason, description) => {
        const result = await pool.query(
            `INSERT INTO proof_disputes (proof_id, reporter_id, reason, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [proofId, reporterId, reason, description]
        );
        return result.rows[0];
    }
};

module.exports = ProofReviewModel;
