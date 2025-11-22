const pool = require('../config/db');

// ==================== ROOM MANAGEMENT ====================

const createRoom = async (boardId, hostUserId, maxPlayers = 4) => {
    const result = await pool.query(
        `INSERT INTO bingo_rooms (board_id, host_user_id, max_players)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [boardId, hostUserId, maxPlayers]
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
        `SELECT r.*, 
            bb.title as board_title, 
            bb.game_name,
            bb.size as board_size,
            u.username as host_username,
            u.avatar_url as host_avatar,
            w.username as winner_username
     FROM bingo_rooms r
     JOIN bingo_boards bb ON r.board_id = bb.id
     JOIN users u ON r.host_user_id = u.id
     LEFT JOIN users w ON r.winner_user_id = w.id
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
     WHERE p.room_id = $1
     ORDER BY p.joined_at ASC`,
        [roomId]
    );
    return result.rows;
};

const getAvailableRooms = async () => {
    const result = await pool.query(
        `SELECT r.*, 
            bb.title as board_title, 
            bb.game_name,
            u.username as host_username,
            COUNT(p.id) as player_count
     FROM bingo_rooms r
     JOIN bingo_boards bb ON r.board_id = bb.id
     JOIN users u ON r.host_user_id = u.id
     LEFT JOIN bingo_room_participants p ON r.id = p.room_id
     WHERE r.status = 'WAITING'
     GROUP BY r.id, bb.title, bb.game_name, u.username
     HAVING COUNT(p.id) < r.max_players
     ORDER BY r.created_at DESC`
    );
    return result.rows;
};

const getUserRooms = async (userId) => {
    const result = await pool.query(
        `SELECT r.*, 
            bb.title as board_title, 
            bb.game_name,
            u.username as host_username,
            COUNT(p.id) as player_count
     FROM bingo_rooms r
     JOIN bingo_boards bb ON r.board_id = bb.id
     JOIN users u ON r.host_user_id = u.id
     LEFT JOIN bingo_room_participants p ON r.id = p.room_id
     WHERE EXISTS (
       SELECT 1 FROM bingo_room_participants 
       WHERE room_id = r.id AND user_id = $1
     )
     AND r.status IN ('WAITING', 'IN_PROGRESS')
     GROUP BY r.id, bb.title, bb.game_name, u.username
     ORDER BY r.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const joinRoom = async (roomId, userId) => {
    // Check if room is full
    const roomCheck = await pool.query(
        `SELECT r.max_players, COUNT(p.id) as current_players
     FROM bingo_rooms r
     LEFT JOIN bingo_room_participants p ON r.id = p.room_id
     WHERE r.id = $1 AND r.status = 'WAITING'
     GROUP BY r.id, r.max_players`,
        [roomId]
    );

    if (!roomCheck.rows[0]) {
        throw new Error('Room not found or already started');
    }

    if (roomCheck.rows[0].current_players >= roomCheck.rows[0].max_players) {
        throw new Error('Room is full');
    }

    // Check if user is already a participant
    const existingParticipant = await pool.query(
        `SELECT * FROM bingo_room_participants WHERE room_id = $1 AND user_id = $2`,
        [roomId, userId]
    );

    if (existingParticipant.rows.length > 0) {
        // User already joined, return existing participant
        return existingParticipant.rows[0];
    }

    // Add new participant
    const result = await pool.query(
        `INSERT INTO bingo_room_participants (room_id, user_id)
     VALUES ($1, $2)
     RETURNING *`,
        [roomId, userId]
    );

    return result.rows[0];
};

const leaveRoom = async (roomId, userId) => {
    const result = await pool.query(
        `DELETE FROM bingo_room_participants
     WHERE room_id = $1 AND user_id = $2
     RETURNING *`,
        [roomId, userId]
    );

    // If host left, delete the room
    const room = await pool.query(
        'SELECT host_user_id FROM bingo_rooms WHERE id = $1',
        [roomId]
    );

    if (room.rows[0]?.host_user_id === userId) {
        await pool.query('DELETE FROM bingo_rooms WHERE id = $1', [roomId]);
    }

    return result.rows[0];
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

const startGame = async (roomId, hostUserId) => {
    // Verify host
    const room = await pool.query(
        'SELECT host_user_id FROM bingo_rooms WHERE id = $1',
        [roomId]
    );

    if (room.rows[0]?.host_user_id !== hostUserId) {
        throw new Error('Only host can start the game');
    }

    // Check all players are ready
    const notReady = await pool.query(
        `SELECT COUNT(*) as count FROM bingo_room_participants
     WHERE room_id = $1 AND is_ready = false`,
        [roomId]
    );

    if (parseInt(notReady.rows[0].count) > 0) {
        throw new Error('Not all players are ready');
    }

    const result = await pool.query(
        `UPDATE bingo_rooms
     SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
        [roomId]
    );

    return result.rows[0];
};

// ==================== GAMEPLAY ====================

const completeCell = async (roomId, cellId, userId) => {
    const result = await pool.query(
        `INSERT INTO bingo_cell_completions (room_id, cell_id, user_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, cell_id, user_id) DO NOTHING
     RETURNING *`,
        [roomId, cellId, userId]
    );
    return result.rows[0];
};

const getBoardState = async (roomId) => {
    const result = await pool.query(
        `SELECT bc.id as cell_id, bc.row_index, bc.col_index, bc.task,
            bcc.user_id as completed_by_user_id,
            u.username as completed_by_username,
            u.avatar_url as completed_by_avatar
     FROM bingo_cells bc
     JOIN bingo_rooms r ON bc.board_id = r.board_id
     LEFT JOIN bingo_cell_completions bcc ON bc.id = bcc.cell_id AND bcc.room_id = r.id
     LEFT JOIN users u ON bcc.user_id = u.id
     WHERE r.id = $1
     ORDER BY bc.row_index, bc.col_index`,
        [roomId]
    );
    return result.rows;
};

const isCellCompleted = async (roomId, cellId) => {
    const result = await pool.query(
        `SELECT 1 FROM bingo_cell_completions WHERE room_id = $1 AND cell_id = $2`,
        [roomId, cellId]
    );
    return result.rows.length > 0;
};

const checkWinConditions = async (roomId) => {
    // Get board size
    const boardInfo = await pool.query(
        `SELECT bb.size FROM bingo_rooms r
     JOIN bingo_boards bb ON r.board_id = bb.id
     WHERE r.id = $1`,
        [roomId]
    );

    const size = boardInfo.rows[0]?.size || 5;

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

    // Get board cells with completion info
    // Join bingo_cells with bingo_rooms via board_id to filter by room_id indirectly
    // Join bingo_cell_completions with room_id to get completion status for this specific room
    const cells = await pool.query(
        `SELECT 
            bc.id as cell_id,
        bc.row_index,
        bc.col_index,
        bc.task,
        bcc.user_id as completed_by_user_id,
        bcc.completed_at,
        u.username as completed_by_username,
        u.avatar_url as completed_by_avatar
         FROM bingo_cells bc
         JOIN bingo_rooms r ON bc.board_id = r.board_id
         LEFT JOIN bingo_cell_completions bcc ON bc.id = bcc.cell_id AND bcc.room_id = r.id
         LEFT JOIN users u ON bcc.user_id = u.id
         WHERE r.id = $1
         ORDER BY bc.row_index, bc.col_index`,
        [roomId]
    );

    const completionStats = await pool.query(
        `SELECT 
            bcc.user_id,
        COUNT(*) as cells_completed,
        MIN(bcc.completed_at) as first_completion,
        MAX(bcc.completed_at) as last_completion
         FROM bingo_cell_completions bcc
         WHERE bcc.room_id = $1
         GROUP BY bcc.user_id`,
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
