const express = require('express');
const { getBoards, getBoardDetail, submitProof, approveProof, createNewBoard, upload } = require('../controllers/bingoController');

const router = express.Router();

router.get('/', getBoards);
router.get('/:id', getBoardDetail);
router.post('/', createNewBoard);
router.post('/cell/:cellId/proof', upload.single('media'), submitProof);
router.put('/progress/:progressId/approve', approveProof);

module.exports = router;
