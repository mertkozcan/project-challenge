const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:userId', notificationController.getNotifications);
router.get('/:userId/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markRead);
router.put('/:userId/read-all', notificationController.markAllRead);

module.exports = router;
