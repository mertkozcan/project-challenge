const express = require('express');
const { submitProof, getProofs, approveProof, upload } = require('../controllers/proofController');

const router = express.Router();

router.post('/', upload.single('media'), submitProof);
router.get('/:challengeId', getProofs);
router.put('/:id/approve', approveProof);

module.exports = router;
