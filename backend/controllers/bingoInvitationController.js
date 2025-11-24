const bingoInvitationModel = require('../models/bingoInvitationModel');
const bingoRoomModel = require('../models/bingoRoomModel');
const notificationModel = require('../models/notificationModel');

const sendInvitation = async (req, res) => {
    const { roomId, toUserId } = req.body;
    const fromUserId = req.user?.id || req.body.from_user_id;

    if (!fromUserId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // Verify room exists and user is participant
        const room = await bingoRoomModel.getRoomById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const invitation = await bingoInvitationModel.sendInvitation(roomId, fromUserId, toUserId);

        // Send notification to recipient
        const notification = await notificationModel.createNotification(
            toUserId,
            'GAME_INVITE',
            'New Bingo Invitation',
            `You have been invited to play Bingo!`
        );

        // Emit real-time notification via socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${toUserId}`).emit('notification-received', notification);
        }

        res.status(201).json(invitation);
    } catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ error: error.message });
    }
};

const getMyInvitations = async (req, res) => {
    const userId = req.user?.id || req.query.user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const invitations = await bingoInvitationModel.getUserInvitations(userId);
        res.json(invitations);
    } catch (error) {
        console.error('Error getting invitations:', error);
        res.status(500).json({ error: error.message });
    }
};

const respondToInvitation = async (req, res) => {
    const { invitationId } = req.params;
    const { status, user_id } = req.body; // status: 'ACCEPTED' or 'DECLINED'
    const userId = req.user?.id || user_id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const invitation = await bingoInvitationModel.respondToInvitation(invitationId, userId, status);

        if (status === 'ACCEPTED') {
            // Join the room
            await bingoRoomModel.joinRoom(invitation.room_id, userId);
        }

        res.json(invitation);
    } catch (error) {
        console.error('Error responding to invitation:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    sendInvitation,
    getMyInvitations,
    respondToInvitation,
};
