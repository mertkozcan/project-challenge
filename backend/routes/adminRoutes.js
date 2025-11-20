const express = require('express');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
    getGames,
    addGame,
    editGame,
    removeGame,
    createOfficialChallenge,
    createOfficialBuild,
    approveCommunityChallenge,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin middleware
router.use(isAdmin);

// Games
router.get('/games', getGames);
router.post('/games', addGame);
router.put('/games/:id', editGame);
router.delete('/games/:id', removeGame);

// Official Content
router.post('/challenges', createOfficialChallenge);
router.post('/builds', createOfficialBuild);

// Approve Community Content
router.put('/challenges/:id/approve', approveCommunityChallenge);

module.exports = router;
