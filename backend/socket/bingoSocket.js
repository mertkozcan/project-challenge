const bingoRoomModel = require('../models/bingoRoomModel');
const pool = require('../config/db');

const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join user-specific room for notifications
        socket.on('join-user-room', ({ userId }) => {
            const userRoom = `user_${userId}`;
            socket.join(userRoom);
            socket.userId = userId;

            // Track online status
            onlineUsers.set(userId, socket.id);
            io.emit('user-online', { userId }); // Broadcast to everyone (can be optimized to friends only later)

            console.log(`User ${userId} joined personal room: ${userRoom}`);
        });

        // Join a bingo room
        socket.on('join-room', async ({ roomId, userId }) => {
            try {
                socket.join(roomId);
                socket.roomId = roomId;
                socket.userId = userId;

                // Notify others in the room
                socket.to(roomId).emit('player-joined', { userId, socketId: socket.id });

                // Broadcast activity update
                io.emit('user-activity', { userId, activity: 'Playing Bingo' });

                console.log(`User ${userId} joined room ${roomId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Complete a cell
        socket.on('complete-cell', async ({ roomId, cellId, userId }) => {
            try {
                // Complete the cell
                await bingoRoomModel.completeCell(roomId, cellId, userId);

                // Check win conditions
                const winResult = await bingoRoomModel.checkWinConditions(roomId);

                // Broadcast cell completion to all players
                io.to(roomId).emit('cell-completed', {
                    cellId,
                    userId,
                    completedAt: new Date().toISOString()
                });

                // If someone won, end the game
                if (winResult.won) {
                    await bingoRoomModel.endGame(roomId, winResult.winnerId, winResult.type, winResult.index);

                    // Get game statistics
                    const statistics = await bingoRoomModel.getGameStatistics(roomId);

                    // Broadcast game end to all players
                    io.to(roomId).emit('game-ended', {
                        winnerId: winResult.winnerId,
                        winType: winResult.type,
                        winIndex: winResult.index,
                        statistics
                    });

                    console.log(`Game ended in room ${roomId}, winner: ${winResult.winnerId}`);
                }
            } catch (error) {
                console.error('Error completing cell:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Start game
        socket.on('start-game', async ({ roomId, userId }) => {
            console.log('🎮 Received start-game event:', { roomId, userId });
            try {
                await bingoRoomModel.startGame(roomId, userId);

                // Broadcast game start to all players
                io.to(roomId).emit('game-started', { startedAt: new Date().toISOString() });

                console.log(`✅ Game started in room ${roomId} by ${userId}`);
            } catch (error) {
                console.error('❌ Error starting game:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Player ready toggle
        socket.on('toggle-ready', async ({ roomId, userId }) => {
            try {
                const participant = await bingoRoomModel.toggleReady(roomId, userId);

                // Broadcast ready status change
                io.to(roomId).emit('player-ready-changed', {
                    userId,
                    isReady: participant.is_ready
                });
            } catch (error) {
                console.error('Error toggling ready:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                io.emit('user-offline', { userId: socket.userId });
            }

            if (socket.roomId && socket.userId) {
                try {
                    // Check if disconnecting user is the host
                    const roomResult = await pool.query(
                        'SELECT host_user_id, status FROM bingo_rooms WHERE id = $1',
                        [socket.roomId]
                    );

                    const room = roomResult.rows[0];

                    if (room && room.host_user_id === socket.userId && room.status === 'WAITING') {
                        // Host disconnected from waiting room - close the room
                        await pool.query('DELETE FROM bingo_rooms WHERE id = $1', [socket.roomId]);

                        // Notify all players that room was closed
                        io.to(socket.roomId).emit('room-closed', {
                            reason: 'Host disconnected'
                        });

                        console.log(`🚪 Room ${socket.roomId} closed - host disconnected`);
                    } else {
                        // Regular player disconnected
                        socket.to(socket.roomId).emit('player-left', { userId: socket.userId });
                    }
                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = initializeSocket;
