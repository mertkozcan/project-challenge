const express = require('express');
const {
    getBoards,
    getBoardDetail,
    submitProof,
    approveProof,
    createNewBoard,
    upload,
    completeCellDirect,
    resetBoardProgress,
    finishBingoRun,
    updateBingoRunTime
} = require('../controllers/bingoController');

const router = express.Router();

router.get('/', getBoards);
router.get('/:id', getBoardDetail);
router.post('/', createNewBoard);
router.post('/cell/:cellId/proof', upload.single('media'), submitProof);
router.post('/cell/:cellId/complete', completeCellDirect);
router.post('/:boardId/reset', resetBoardProgress);
router.post('/finish', finishBingoRun);
router.post('/update-time', updateBingoRunTime);
router.put('/progress/:progressId/approve', approveProof);

module.exports = router;
