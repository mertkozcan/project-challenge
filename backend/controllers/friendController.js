const FriendModel = require('../models/friendModel');
const { getUserIdByUsername } = require('../models/userModel');

const sendFriendRequest = async (req, res) => {
    const { userId } = req.user; // From auth middleware
    const { username } = req.body;

    try {
        const friendId = await getUserIdByUsername(username);
        if (!friendId) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (userId === friendId) {
            return res.status(400).json({ error: 'Cannot add yourself as a friend' });
        }

        const existing = await FriendModel.checkFriendship(userId, friendId);
        if (existing) {
            return res.status(400).json({ error: 'Friendship or request already exists' });
        }

        await FriendModel.sendRequest(userId, friendId);
        res.status(201).json({ message: 'Friend request sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send request' });
    }
};

const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        await FriendModel.acceptRequest(requestId);
        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept request' });
    }
};

const removeFriend = async (req, res) => {
    const { userId } = req.user;
    const { friendId } = req.params;
    try {
        await FriendModel.removeFriend(userId, friendId);
        res.json({ message: 'Friend removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove friend' });
    }
};

const listFriends = async (req, res) => {
    const { userId } = req.user;
    try {
        const friends = await FriendModel.getFriends(userId);
        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
};

const listPendingRequests = async (req, res) => {
    const { userId } = req.user;
    try {
        const requests = await FriendModel.getPendingRequests(userId);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    listFriends,
    listPendingRequests
};
