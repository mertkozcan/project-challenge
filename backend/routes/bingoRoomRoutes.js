const express = require('express');
const bingoRoomController = require('../controllers/bingoRoomController');

const router = express.Router();

// Room Management
router.post('/rooms/create', bingoRoomController.createRoom);
router.get('/rooms/available', bingoRoomController.getAvailableRooms);
router.get('/rooms/my-rooms', bingoRoomController.getUserRooms);
router.get('/rooms/:roomId', bingoRoomController.getRoomDetails);
router.post('/rooms/:roomId/join', bingoRoomController.joinRoom);
router.post('/rooms/:roomId/leave', bingoRoomController.leaveRoom);
router.post('/rooms/:roomId/ready', bingoRoomController.toggleReady);
router.post('/rooms/:roomId/start', bingoRoomController.startGame);

// Gameplay
router.post('/rooms/:roomId/cells/:cellId/complete', bingoRoomController.completeCell);
router.get('/rooms/:roomId/board-state', bingoRoomController.getBoardState);

module.exports = router;
