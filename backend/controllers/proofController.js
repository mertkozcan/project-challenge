const { createProof, getProofsByChallenge, updateProofStatus, getProofById, getAllPendingProofs } = require('../models/proofModel');
const { incrementUserPoints } = require('../models/userModel');
const { getChallengeById } = require('../models/challengeModel');
const { createNotification } = require('../models/notificationModel');
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

const getProofs = async (req, res) => {
    const { challengeId } = req.params;
    try {
        const proofs = await getProofsByChallenge(challengeId);
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... (existing imports)

const approveProof = async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;

    try {
        const proof = await getProofById(id);
        if (!proof) return res.status(404).json({ error: 'Proof not found' });
        if (proof.status === 'APPROVED') return res.status(400).json({ error: 'Already approved' });

        // 1. Update Proof Status
        const updatedProof = await updateProofStatus(id, 'APPROVED', score || 0);

        // 2. Get Challenge Reward (Points)
        const challenge = await getChallengeById(proof.challenge_id);

        // 3. Increment User Points
        let pointsToAdd = 10;
        if (challenge && challenge.reward) {
            const match = challenge.reward.match(/(\d+)/);
            if (match) pointsToAdd = parseInt(match[0], 10);
        }

        await incrementUserPoints(proof.user_id, pointsToAdd);

        // 4. Create Notification
        await createNotification(
            proof.user_id,
            'PROOF_APPROVED',
            'Proof Approved! 🎉',
            `Your proof for "${challenge.challenge_name}" has been approved! You earned ${pointsToAdd} points.`,
            proof.id
        );

        res.json({ message: 'Proof approved', proof: updatedProof, pointsAdded: pointsToAdd });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const rejectProof = async (req, res) => {
    const { id } = req.params;

    try {
        const proof = await getProofById(id);
        if (!proof) return res.status(404).json({ error: 'Proof not found' });
        if (proof.status === 'REJECTED') return res.status(400).json({ error: 'Already rejected' });

        const challenge = await getChallengeById(proof.challenge_id);
        const updatedProof = await updateProofStatus(id, 'REJECTED', 0);

        // Create Notification
        await createNotification(
            proof.user_id,
            'PROOF_REJECTED',
            'Proof Rejected ❌',
            `Your proof for "${challenge.challenge_name}" was rejected. Please check the requirements and try again.`,
            proof.id
        );

        res.json({ message: 'Proof rejected', proof: updatedProof });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPendingProofs = async (req, res) => {
    try {
        const proofs = await getAllPendingProofs();
        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitProof, getProofs, approveProof, rejectProof, getPendingProofs, upload };
