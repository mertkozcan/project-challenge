const pool = require('../config/db');

// ==================== ROOM MANAGEMENT ====================

const createRoom = async (boardId, hostUserId, maxPlayers = 4, isPrivate = false, password = null, gameMode = 'STANDARD', theme = 'DEFAULT') => {
    const result = await pool.query(
        `INSERT INTO bingo_rooms (board_id, host_user_id, max_players, is_private, password, game_mode, theme)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
        [boardId, hostUserId, maxPlayers, isPrivate, password, gameMode, theme]
    );

    // Automatically add host as participant
    await pool.query(
        `INSERT INTO bingo_room_participants (room_id, user_id, is_ready)
     VALUES ($1, $2, true)`,
        [result.rows[0].id, hostUserId]
    );

    return result.rows[0];
};

const getRoomById = async (roomId) => {
    const result = await pool.query(
        `SELECT r.*, bb.title as board_title, bb.game_name, u.username as host_username, u.avatar_url as host_avatar
         FROM bingo_rooms r
         JOIN bingo_boards bb ON r.board_id = bb.id
         JOIN users u ON r.host_user_id = u.id
         WHERE r.id = $1`,
        [roomId]
    );
    return result.rows[0];
};

const getRoomParticipants = async (roomId) => {
    const result = await pool.query(
        `SELECT p.*, u.username, u.avatar_url
         FROM bingo_room_participants p
         JOIN users u ON p.user_id = u.id
         WHERE p.room_id = $1`,
        [roomId]
    );
    return result.rows;
};

const getAvailableRooms = async (userId) => {
    const result = await pool.query(
        `SELECT r.*, bb.title as board_title, bb.game_name, u.username as host_username,
         (SELECT COUNT(*) FROM bingo_room_participants WHERE room_id = r.id) as participant_count
         FROM bingo_rooms r
         JOIN bingo_boards bb ON r.board_id = bb.id
         JOIN users u ON r.host_user_id = u.id
         WHERE r.status = 'WAITING' AND r.is_private = false
         AND NOT EXISTS (SELECT 1 FROM bingo_room_participants WHERE room_id = r.id AND user_id = $1)
         ORDER BY r.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const getUserRooms = async (userId) => {
    const result = await pool.query(
        `SELECT r.*, bb.title as board_title, bb.game_name, u.username as host_username,
         (SELECT COUNT(*) FROM bingo_room_participants WHERE room_id = r.id) as participant_count
         FROM bingo_rooms r
         JOIN bingo_boards bb ON r.board_id = bb.id
         JOIN users u ON r.host_user_id = u.id
         JOIN bingo_room_participants p ON r.id = p.room_id
         WHERE p.user_id = $1 AND r.status != 'COMPLETED'
         ORDER BY r.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const joinRoom = async (roomId, userId, password = null) => {
    const room = await getRoomById(roomId);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'WAITING') throw new Error('Game already started or completed');

    if (room.is_private && room.password !== password) {
        throw new Error('Invalid password');
    }

    const participants = await getRoomParticipants(roomId);
    if (participants.length >= room.max_players) throw new Error('Room is full');

    const result = await pool.query(
        `INSERT INTO bingo_room_participants (room_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (room_id, user_id) DO NOTHING
         RETURNING *`,
        [roomId, userId]
    );
    return result.rows[0];
};

const leaveRoom = async (roomId, userId) => {
    await pool.query(
        'DELETE FROM bingo_room_participants WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
    );
    const participants = await getRoomParticipants(roomId);
    if (participants.length === 0) {
        await pool.query('DELETE FROM bingo_rooms WHERE id = $1', [roomId]);
    }
    return { success: true };
};

const toggleReady = async (roomId, userId) => {
    const result = await pool.query(
        `UPDATE bingo_room_participants
         SET is_ready = NOT is_ready
         WHERE room_id = $1 AND user_id = $2
         RETURNING *`,
        [roomId, userId]
    );
    return result.rows[0];
};

const startGame = async (roomId, userId) => {
    const room = await getRoomById(roomId);
    if (room.host_user_id !== userId) throw new Error('Only host can start game');

    const result = await pool.query(
        `UPDATE bingo_rooms
         SET status = 'PLAYING', started_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [roomId]
    );
    return result.rows[0];
};

// ==================== GAMEPLAY ====================

const completeCell = async (roomId, cellId, userId) => {
    // Check Game Mode
    const room = await pool.query('SELECT game_mode FROM bingo_rooms WHERE id = $1', [roomId]);
    const gameMode = room.rows[0]?.game_mode || 'STANDARD';

    if (gameMode === 'LOCKOUT') {
        // Atomic check and insert for Lockout
        // Only insert if NO ONE has completed it yet
        const result = await pool.query(
            `INSERT INTO bingo_cell_completions (room_id, cell_id, user_id)
             SELECT $1, $2, $3
             WHERE NOT EXISTS (
                 SELECT 1 FROM bingo_cell_completions 
                 WHERE room_id = $1 AND cell_id = $2
             )
             ON CONFLICT (room_id, cell_id, user_id) DO NOTHING
             RETURNING *`,
            [roomId, cellId, userId]
        );

        if (result.rows.length === 0) {
            // Check why it failed
            const existing = await pool.query(
                'SELECT user_id FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = $2',
                [roomId, cellId]
            );

            if (existing.rows.length > 0) {
                if (existing.rows[0].user_id !== userId) {
                    throw new Error('This cell is already locked by another player!');
                }
                // If I already have it, just return existing (idempotent)
                return existing.rows[0];
            }
        }
        return result.rows[0];
    }

    // Standard Mode
    const result = await pool.query(
        `INSERT INTO bingo_cell_completions (room_id, cell_id, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, cell_id, user_id) DO NOTHING
     RETURNING *`,
        [roomId, cellId, userId]
    );
    return result.rows[0];
};

const getBoardState = async (roomId, userId) => {
    const room = await getRoomById(roomId);
    if (!room) throw new Error('Room not found');

    const query = `
        SELECT bc.*,
        EXISTS(SELECT 1 FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = bc.id AND user_id = $2) as is_completed_by_me,
        (SELECT user_id FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = bc.id LIMIT 1) as completed_by_user_id,
        (SELECT u.username FROM bingo_cell_completions bcc JOIN users u ON bcc.user_id = u.id WHERE bcc.room_id = $1 AND bcc.cell_id = bc.id LIMIT 1) as completed_by_username
        FROM bingo_cells bc
        WHERE bc.board_id = $3
        ORDER BY bc.row_index, bc.col_index
    `;

    const cells = await pool.query(query, [roomId, userId, room.board_id]);

    return {
        ...room,
        cells: cells.rows
    };
};

const isCellCompleted = async (roomId, cellId, userId) => {
    const result = await pool.query(
        'SELECT 1 FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = $2 AND user_id = $3',
        [roomId, cellId, userId]
    );
    return result.rows.length > 0;
};

const checkWinConditions = async (roomId) => {
    // Get room details
    const roomInfo = await pool.query(
        `SELECT r.game_mode, bb.size FROM bingo_rooms r
     JOIN bingo_boards bb ON r.board_id = bb.id
     WHERE r.id = $1`,
        [roomId]
    );

    const { game_mode, size } = roomInfo.rows[0] || { game_mode: 'STANDARD', size: 5 };

    // Get ALL completed cells with user_id
    const completions = await pool.query(
        `SELECT bc.row_index, bc.col_index, bcc.user_id
     FROM bingo_cell_completions bcc
     JOIN bingo_cells bc ON bcc.cell_id = bc.id
     WHERE bcc.room_id = $1`,
        [roomId]
    );

    const cells = completions.rows;

    // Helper to check if all cells in a group belong to the same user
    const checkGroup = (groupCells) => {
        if (groupCells.length !== size) return null;
        const firstUser = groupCells[0].user_id;
        const allSameUser = groupCells.every(c => c.user_id === firstUser);
        return allSameUser ? firstUser : null;
    };

    if (game_mode === 'BLACKOUT') {
        // Check if any user has completed ALL cells (size * size)
        const userCounts = {};
        cells.forEach(c => {
            userCounts[c.user_id] = (userCounts[c.user_id] || 0) + 1;
        });

        const totalCells = size * size;
        for (const [userId, count] of Object.entries(userCounts)) {
            if (count === totalCells) {
                return { won: true, type: 'blackout', index: 0, winnerId: userId };
            }
        }
        return { won: false };
    }

    // STANDARD, LOCKOUT, etc. (Row/Col/Diag)

    // Check rows
    for (let row = 0; row < size; row++) {
        const rowCells = cells.filter(c => c.row_index === row);
        const winnerId = checkGroup(rowCells);
        if (winnerId) {
            return { won: true, type: 'row', index: row, winnerId };
        }
    }

    // Check columns
    for (let col = 0; col < size; col++) {
        const colCells = cells.filter(c => c.col_index === col);
        const winnerId = checkGroup(colCells);
        if (winnerId) {
            return { won: true, type: 'column', index: col, winnerId };
        }
    }

    // Check Diagonals (Standard/Lockout usually include diagonals)
    // Main Diagonal (0,0 to size-1, size-1)
    const mainDiag = cells.filter(c => c.row_index === c.col_index);
    const mainWinner = checkGroup(mainDiag);
    if (mainWinner) return { won: true, type: 'diagonal', index: 0, winnerId: mainWinner };

    // Anti Diagonal (0, size-1 to size-1, 0)
    const antiDiag = cells.filter(c => c.row_index + c.col_index === size - 1);
    const antiWinner = checkGroup(antiDiag);
    if (antiWinner) return { won: true, type: 'diagonal', index: 1, winnerId: antiWinner };

    return { won: false };
};

const endGame = async (roomId, winnerUserId, winType, winIndex) => {
    const result = await pool.query(
        `UPDATE bingo_rooms
     SET status = 'COMPLETED', 
         winner_user_id = $2, 
         win_type = $3,
         win_index = $4,
         completed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
        [roomId, winnerUserId, winType, winIndex]
    );
    return result.rows[0];
};

module.exports = {
    createRoom,
    getRoomById,
    getRoomParticipants,
    getAvailableRooms,
    getUserRooms,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    completeCell,
    getBoardState,
    checkWinConditions,
    endGame,
};

// ==================== GAME STATISTICS ====================

const getGameStatistics = async (roomId) => {
    const room = await getRoomById(roomId);

    if (!room) {
        throw new Error('Room not found');
    }

    const participants = await getRoomParticipants(roomId);

    const completionStats = await pool.query(
        `SELECT 
            bcc.user_id,
        u.username,
        u.avatar_url,
        COUNT(*) as cells_completed,
        MIN(bcc.completed_at) as first_completion,
        MAX(bcc.completed_at) as last_completion,
        EXTRACT(EPOCH FROM(MAX(bcc.completed_at) - MIN(bcc.completed_at))) as completion_duration
         FROM bingo_cell_completions bcc
         JOIN users u ON bcc.user_id = u.id
         WHERE bcc.room_id = $1
         GROUP BY bcc.user_id, u.username, u.avatar_url
         ORDER BY cells_completed DESC, first_completion ASC`,
        [roomId]
    );

    const gameDuration = room.completed_at && room.started_at
        ? (new Date(room.completed_at) - new Date(room.started_at)) / 1000
        : null;

    return {
        room: {
            id: room.id,
            board_title: room.board_title,
            game_name: room.game_name,
            status: room.status,
            started_at: room.started_at,
            completed_at: room.completed_at,
            winner_user_id: room.winner_user_id,
            winner_username: room.winner_username,
            winner_avatar: room.host_avatar,
            duration_seconds: gameDuration,
        },
        participants: participants.map(p => ({
            user_id: p.user_id,
            username: p.username,
            avatar_url: p.avatar_url,
            joined_at: p.joined_at,
        })),
        completionStats: completionStats.rows.map(stat => ({
            user_id: stat.user_id,
            username: stat.username,
            avatar_url: stat.avatar_url,
            cells_completed: parseInt(stat.cells_completed),
            first_completion: stat.first_completion,
            last_completion: stat.last_completion,
            completion_duration: parseFloat(stat.completion_duration) || 0,
            avg_time_per_cell: stat.cells_completed > 0
                ? parseFloat(stat.completion_duration) / parseInt(stat.cells_completed)
                : 0,
        })),
    };
};

// ==================== GAME HISTORY ====================

const getUserGameHistory = async (userId, limit = 20) => {
    const result = await pool.query(
        `SELECT r.id, r.board_id, r.status, r.started_at, r.completed_at,
        r.winner_user_id,
        bb.title as board_title,
        bb.game_name,
        u.username as winner_username,
        u.avatar_url as winner_avatar,
        COUNT(DISTINCT p.id) as participant_count,
        EXTRACT(EPOCH FROM(r.completed_at - r.started_at)) as duration_seconds
         FROM bingo_rooms r
         JOIN bingo_boards bb ON r.board_id = bb.id
         LEFT JOIN users u ON r.winner_user_id = u.id
         LEFT JOIN bingo_room_participants p ON r.id = p.room_id
         WHERE r.status = 'COMPLETED'
         AND EXISTS(
            SELECT 1 FROM bingo_room_participants 
           WHERE room_id = r.id AND user_id = $1
        )
         GROUP BY r.id, bb.title, bb.game_name, u.username, u.avatar_url
         ORDER BY r.completed_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    return result.rows;
};

const getGameDetails = async (roomId, userId) => {
    const participantCheck = await pool.query(
        `SELECT 1 FROM bingo_room_participants WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
    );

    if (participantCheck.rows.length === 0) {
        throw new Error('Unauthorized: You were not a participant in this game');
    }

    const room = await getRoomById(roomId);
    const participants = await getRoomParticipants(roomId);

    // Get all cells with completion info
    const cells = await pool.query(
        `SELECT bc.*, 
         (SELECT user_id FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = bc.id LIMIT 1) as completed_by_user_id,
         (SELECT u.username FROM bingo_cell_completions bcc JOIN users u ON bcc.user_id = u.id WHERE bcc.room_id = $1 AND bcc.cell_id = bc.id LIMIT 1) as completed_by_username
         FROM bingo_cells bc
         WHERE bc.board_id = $2
         ORDER BY bc.row_index, bc.col_index`,
        [roomId, room.board_id]
    );

    const completionStats = await pool.query(
        `SELECT 
            bcc.user_id,
        u.username,
        u.avatar_url,
        COUNT(*) as cells_completed
         FROM bingo_cell_completions bcc
         JOIN users u ON bcc.user_id = u.id
         WHERE bcc.room_id = $1
         GROUP BY bcc.user_id, u.username, u.avatar_url`,
        [roomId]
    );

    // Get win details
    const winDetails = await pool.query(
        `SELECT win_type, win_index FROM bingo_rooms WHERE id = $1`,
        [roomId]
    );

    return {
        ...room,
        participants,
        cells: cells.rows,
        completionStats: completionStats.rows,
        win_type: winDetails.rows[0]?.win_type,
        win_index: winDetails.rows[0]?.win_index,
    };
};

module.exports = {
    createRoom,
    getRoomById,
    getRoomParticipants,
    getAvailableRooms,
    getUserRooms,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    completeCell,
    getBoardState,
    checkWinConditions,
    endGame,
    isCellCompleted,
    getGameStatistics,
    getUserGameHistory,
    getGameDetails,
};
