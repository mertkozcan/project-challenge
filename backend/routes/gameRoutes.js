const express = require('express');
const { getAllGames } = require('../models/gameModel');

const router = express.Router();

// Public endpoint to get all games
router.get('/', async (req, res) => {
    try {
        const games = await getAllGames();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
