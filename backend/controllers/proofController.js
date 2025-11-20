const { createProof, getProofsByChallenge, updateProofStatus, getProofById } = require('../models/proofModel');
const { incrementUserPoints } = require('../models/userModel');
const { getChallengeById } = require('../models/challengeModel');
const multer = require('multer');
const path = require('path');

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

const submitProof = async (req, res) => {
    const { user_id, challenge_id, media_type } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaUrl = `/uploads/${file.filename}`;

    try {
        const newProof = await createProof(user_id, challenge_id, mediaUrl, media_type || 'image');
        res.status(201).json(newProof);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProofs = async (req, res) => {
    const { challengeId } = req.params;
    try {
        const proofs = await getProofsByChallenge(challengeId);
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const approveProof = async (req, res) => {
    const { id } = req.params;
    const { score } = req.body; // Optional score for the leaderboard

    try {
        const proof = await getProofById(id);
        if (!proof) return res.status(404).json({ error: 'Proof not found' });
        if (proof.status === 'APPROVED') return res.status(400).json({ error: 'Already approved' });

        // 1. Update Proof Status
        const updatedProof = await updateProofStatus(id, 'APPROVED', score || 0);

        // 2. Get Challenge Reward (Points)
        const challenge = await getChallengeById(proof.challenge_id);

        // 3. Increment User Points
        // Assuming reward is a string like "100 Points", we parse it. 
        // Or better, we should store reward as integer in DB. 
        // For now, let's assume the 'reward' field contains the point value or we default to 10.
        let pointsToAdd = 10;
        if (challenge && challenge.reward) {
            const match = challenge.reward.match(/(\d+)/);
            if (match) pointsToAdd = parseInt(match[0], 10);
        }

        await incrementUserPoints(proof.user_id, pointsToAdd);

        res.json({ message: 'Proof approved', proof: updatedProof, pointsAdded: pointsToAdd });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitProof, getProofs, approveProof, upload };
