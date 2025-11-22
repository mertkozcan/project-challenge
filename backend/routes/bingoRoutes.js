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
    updateBingoRunTime,
    getSoloHistory,
    getBingoStats
} = require('../controllers/bingoController');
const { getBingoLeaderboard, getUserBingoLeaderboardRanks } = require('../controllers/bingoLeaderboardController');

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

// History and stats
router.get('/history/solo/:userId', getSoloHistory);
router.get('/stats/:userId', getBingoStats);

// Leaderboard routes
router.get('/leaderboard/:type', getBingoLeaderboard);
router.get('/leaderboard/user/:userId', getUserBingoLeaderboardRanks);

module.exports = router;
