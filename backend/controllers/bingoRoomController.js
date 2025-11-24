const bingoRoomModel = require('../models/bingoRoomModel');
const pool = require('../config/db');

const createRoom = async (req, res) => {
    const { board_id, host_user_id, max_players, is_private, password, game_mode, theme } = req.body;

    try {
        console.log('[CREATE ROOM] Request body:', req.body);
        const room = await bingoRoomModel.createRoom(
            board_id,
            host_user_id,
            max_players,
            is_private,
            password,
            game_mode,
            theme
        );
        console.log('[CREATE ROOM] Room created successfully:', room);
        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: error.message });
    }
};

const getRoomDetails = async (req, res) => {
    const { roomId } = req.params;

    try {
        const room = await bingoRoomModel.getRoomById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const participants = await bingoRoomModel.getRoomParticipants(roomId);

        res.json({
            ...room,
            participants,
        });
    } catch (error) {
        console.error('Error getting room details:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAvailableRooms = async (req, res) => {
    try {
        const rooms = await bingoRoomModel.getAvailableRooms();
        res.json(rooms);
    } catch (error) {
        console.error('Error getting available rooms:', error);
        res.status(500).json({ error: error.message });
    }
};

const getUserRooms = async (req, res) => {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const rooms = await bingoRoomModel.getUserRooms(userId);
        res.json(rooms);
    } catch (error) {
        console.error('Error getting user rooms:', error);
        res.status(500).json({ error: error.message });
    }
};

const joinRoom = async (req, res) => {
    const { roomId } = req.params;
    const { user_id, password } = req.body;
    const userId = req.user?.id || user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const participant = await bingoRoomModel.joinRoom(roomId, userId, password);
        res.json(participant);
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(400).json({ error: error.message });
    }
};

const leaveRoom = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        await bingoRoomModel.leaveRoom(roomId, userId);
        res.json({ message: 'Left room successfully' });
    } catch (error) {
        console.error('Error leaving room:', error);
        res.status(500).json({ error: error.message });
    }
};

const toggleReady = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const participant = await bingoRoomModel.toggleReady(roomId, userId);
        res.json(participant);
    } catch (error) {
        console.error('Error toggling ready:', error);
        res.status(500).json({ error: error.message });
    }
};

const startGame = async (req, res) => {
    const { roomId } = req.params;
    const hostUserId = req.user?.id || req.body.user_id;

    if (!hostUserId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const room = await bingoRoomModel.startGame(roomId, hostUserId);
        res.json(room);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(400).json({ error: error.message });
    }
};

// ==================== GAMEPLAY ====================

const completeCell = async (req, res) => {
    const { roomId, cellId } = req.params;
    const userId = req.user?.id || req.body.user_id;
    const io = req.app.get('io');

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // Model handles game mode logic (Lockout vs Standard) and concurrency
        const completion = await bingoRoomModel.completeCell(roomId, cellId, userId);

        if (!completion) {
            // Standard mode: already completed by user
            return res.status(200).json({ alreadyCompleted: true });
        }

        // Get user info for the completion
        const userResult = await pool.query(
            'SELECT username, avatar_url FROM users WHERE id = $1',
            [userId]
        );
        const user = userResult.rows[0];

        // Broadcast cell completion to all players with user info
        if (io) {
            io.to(roomId).emit('cell-completed', {
                cellId: parseInt(cellId),
                userId,
                username: user?.username,
                avatarUrl: user?.avatar_url,
                completedAt: new Date().toISOString()
            });
        }

        // Check win conditions (Shared Board - anyone's completion counts)
        const winCheck = await bingoRoomModel.checkWinConditions(roomId);

        if (winCheck.won) {
            const winnerId = winCheck.winnerId || userId;
            await bingoRoomModel.endGame(roomId, winnerId, winCheck.type, winCheck.index);

            // Get game statistics
            const statistics = await bingoRoomModel.getGameStatistics(roomId);

            // Check for achievements for the winner
            try {
                const { checkAndUnlockAchievements } = require('../models/achievementModel');
                const unlocked = await checkAndUnlockAchievements(winnerId);

                // If achievements unlocked, notify the winner via socket
                if (unlocked.length > 0 && io) {
                    io.to(roomId).emit('achievements-unlocked', {
                        userId: winnerId,
                        achievements: unlocked
                    });
                }
            } catch (achError) {
                console.error('Error checking achievements:', achError);
            }

            // Broadcast game end
            if (io) {
                io.to(roomId).emit('game-ended', {
                    winnerId: winnerId,
                    winType: winCheck.type,
                    winIndex: winCheck.index,
                    statistics
                });
            }

            return res.json({
                completion,
                gameWon: true,
                winType: winCheck.type,
                winIndex: winCheck.index,
            });
        }

        res.json({ completion, gameWon: false });
    } catch (error) {
        console.error('Error completing cell:', error);

        // Handle "already locked" error gracefully
        if (error.message && error.message.includes('locked')) {
            return res.status(200).json({
                error: error.message,
                alreadyCompleted: true
            });
        }

        res.status(500).json({ error: error.message });
    }
};

// ==================== GAME HISTORY ====================

const getUserGameHistory = async (req, res) => {
    const userId = req.user?.id || req.query.user_id;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const games = await bingoRoomModel.getUserGameHistory(userId, limit);
        res.json(games);
    } catch (error) {
        console.error('Error getting game history:', error);
        res.status(500).json({ error: error.message });
    }
};

const getGameDetails = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const details = await bingoRoomModel.getGameDetails(roomId, userId);
        res.json(details);
    } catch (error) {
        console.error('Error getting game details:', error);
        res.status(500).json({ error: error.message });
    }
};

const getGameStatistics = async (req, res) => {
    const { roomId } = req.params;

    try {
        const statistics = await bingoRoomModel.getGameStatistics(roomId);
        res.json(statistics);
    } catch (error) {
        console.error('Error getting game statistics:', error);
        res.status(500).json({ error: error.message });
    }
};

const getBoardState = async (req, res) => {
    const { roomId } = req.params;

    try {
        const boardState = await bingoRoomModel.getBoardState(roomId);
        res.json(boardState);
    } catch (error) {
        console.error('Error getting board state:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRoom,
    getRoomDetails,
    getAvailableRooms,
    getUserRooms,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    completeCell,
    getBoardState,
    getUserGameHistory,
    getGameDetails,
    getGameStatistics,
};
