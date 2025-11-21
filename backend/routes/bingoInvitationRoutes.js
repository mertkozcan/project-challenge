const express = require('express');
const router = express.Router();
const bingoInvitationController = require('../controllers/bingoInvitationController');

// Send invitation
router.post('/invitations/send', bingoInvitationController.sendInvitation);

// Get my pending invitations
router.get('/invitations/my-invitations', bingoInvitationController.getMyInvitations);

// Respond to invitation (accept/decline)
router.post('/invitations/:invitationId/respond', bingoInvitationController.respondToInvitation);

module.exports = router;
