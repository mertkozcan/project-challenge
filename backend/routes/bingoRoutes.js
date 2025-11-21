const express = require('express');
const { getBoards, getBoardDetail, submitProof, approveProof, createNewBoard, upload, completeCellDirect, resetBoardProgress } = require('../controllers/bingoController');

const router = express.Router();

router.get('/', getBoards);
router.get('/:id', getBoardDetail);
router.post('/', createNewBoard);
router.post('/cell/:cellId/proof', upload.single('media'), submitProof);
router.post('/cell/:cellId/complete', completeCellDirect);
router.post('/:boardId/reset', resetBoardProgress);
router.put('/progress/:progressId/approve', approveProof);

module.exports = router;
