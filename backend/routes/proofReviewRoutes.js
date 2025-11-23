const express = require('express');
const router = express.Router();
const ProofReviewModel = require('../models/proofReviewModel');

// Get pending proofs for review
router.get('/pending', async (req, res) => {
    try {
        const userId = req.user.id; // Assuming auth middleware adds user to req
        const proofs = await ProofReviewModel.getPendingProofs(userId);
        res.json({ proofs });
    } catch (error) {
        console.error('Error fetching pending proofs:', error);
        res.status(500).json({ error: 'Failed to fetch proofs' });
    }
});

// Submit a review
router.post('/review', async (req, res) => {
    try {
        const { proofId, decision, comment } = req.body;
        const reviewerId = req.user.id;

        if (!proofId || !decision) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await ProofReviewModel.submitReview(proofId, reviewerId, decision, comment);
        res.json(result);
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

module.exports = router;
