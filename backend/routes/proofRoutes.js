const express = require('express');
const { submitProof, getProofs, approveProof, rejectProof, getPendingProofs, upload, getUserChallengeProof, voteProofHandler } = require('../controllers/proofController');

const router = express.Router();

const uploadMiddleware = (req, res, next) => {
    upload.single('media')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

router.post('/', uploadMiddleware, submitProof);
router.get('/pending', getPendingProofs); // Get all pending proofs
router.get('/user/:userId/challenge/:challengeId', getUserChallengeProof);
router.get('/:challengeId', getProofs);
router.put('/:id/approve', approveProof);
router.put('/:id/reject', rejectProof); // Reject proof
router.post('/:id/vote', voteProofHandler); // Vote for proof

module.exports = router;
