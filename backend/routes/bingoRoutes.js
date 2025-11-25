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
    getBingoStats,
    addTask,
    getTasks,
    deleteTask,
    getRandomTasks
} = require('../controllers/bingoController');
const { getBingoLeaderboard, getUserBingoLeaderboardRanks } = require('../controllers/bingoLeaderboardController');

const router = express.Router();

// Achievement routes (Must be before /:id)
const { getAchievements, getUserAchievements } = require('../controllers/achievementController');
router.get('/achievements', getAchievements);
router.get('/achievements/user/:userId', getUserAchievements);

// Leaderboard routes (Must be before /:id)
router.get('/leaderboard/:type', getBingoLeaderboard);
router.get('/leaderboard/user/:userId', getUserBingoLeaderboardRanks);

// History and stats (Must be before /:id)
router.get('/history/solo/:userId', getSoloHistory);
router.get('/stats/:userId', getBingoStats);

// Bingo Task Management (Must be before /:id)
router.post('/tasks', addTask);
router.get('/tasks', getTasks);
router.get('/tasks/random', getRandomTasks);
router.delete('/tasks/:id', deleteTask);

// General board routes
router.get('/', getBoards);
router.post('/', createNewBoard);
router.post('/cell/:cellId/proof', upload.single('media'), submitProof);
router.post('/cell/:cellId/complete', completeCellDirect);
router.post('/:boardId/reset', resetBoardProgress);
router.post('/finish', finishBingoRun);
router.post('/update-time', updateBingoRunTime);
router.put('/progress/:progressId/approve', approveProof);

// Specific board detail (Must be last GET route)
router.get('/:id', getBoardDetail);

module.exports = router;
