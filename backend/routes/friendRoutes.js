const express = require('express');
const {
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    listFriends,
    listPendingRequests
} = require('../controllers/friendController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken); // All routes require auth

router.get('/', listFriends);
router.get('/requests', listPendingRequests);
router.post('/request', sendFriendRequest);
router.put('/accept/:requestId', acceptFriendRequest);
router.delete('/:friendId', removeFriend);

module.exports = router;
