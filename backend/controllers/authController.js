const { createUserProfile, getUserProfileByAuthId } = require('../models/authModel');

const signUp = async (req, res) => {
    const { id, email, username } = req.body;

    try {
        const profile = await createUserProfile(id, email, username);
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await getUserProfileByAuthId(id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { signUp, getProfile };
