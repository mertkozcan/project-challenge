const bingoRoomModel = require('../models/bingoRoomModel');

// ==================== ROOM MANAGEMENT ====================

const createRoom = async (req, res) => {
    const { boardId, maxPlayers, user_id } = req.body;
    const hostUserId = req.user?.id || user_id;

    if (!hostUserId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const room = await bingoRoomModel.createRoom(boardId, hostUserId, maxPlayers);
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
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const participant = await bingoRoomModel.joinRoom(roomId, userId);
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

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const completion = await bingoRoomModel.completeCell(roomId, cellId, userId);

        // Check win conditions
        const winCheck = await bingoRoomModel.checkWinConditions(roomId, userId);

        if (winCheck.won) {
            await bingoRoomModel.endGame(roomId, userId);
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
        res.status(500).json({ error: error.message });
    }
};

const getBoardState = async (req, res) => {
    const { roomId } = req.params;

    try {
        const cells = await bingoRoomModel.getBoardState(roomId);
        res.json(cells);
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
};
