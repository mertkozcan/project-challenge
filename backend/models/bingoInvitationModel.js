const pool = require('../config/db');

// ==================== INVITATION MANAGEMENT ====================

const sendInvitation = async (roomId, fromUserId, toUserId) => {
    // Check if invitation already exists
    const existing = await pool.query(
        `SELECT * FROM bingo_invitations 
         WHERE room_id = $1 AND to_user_id = $2 AND status = 'PENDING'`,
        [roomId, toUserId]
    );

    if (existing.rows.length > 0) {
        throw new Error('Invitation already sent');
    }

    const result = await pool.query(
        `INSERT INTO bingo_invitations (room_id, from_user_id, to_user_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [roomId, fromUserId, toUserId]
    );
    return result.rows[0];
};

const getUserInvitations = async (userId) => {
    const result = await pool.query(
        `SELECT i.*, 
            u.username as from_username, 
            u.avatar_url as from_avatar,
            bb.title as board_title,
            bb.game_name
         FROM bingo_invitations i
         JOIN users u ON i.from_user_id = u.id
         JOIN bingo_rooms r ON i.room_id = r.id
         JOIN bingo_boards bb ON r.board_id = bb.id
         WHERE i.to_user_id = $1 AND i.status = 'PENDING'
         ORDER BY i.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const respondToInvitation = async (invitationId, userId, status) => {
    const result = await pool.query(
        `UPDATE bingo_invitations
         SET status = $1
         WHERE id = $2 AND to_user_id = $3
         RETURNING *`,
        [status, invitationId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Invitation not found or unauthorized');
    }

    return result.rows[0];
};

module.exports = {
    sendInvitation,
    getUserInvitations,
    respondToInvitation,
};
