const { getAllGames, getGameById, createGame, updateGame, deleteGame } = require('../models/gameModel');
const { createChallenge, getAllChallenges } = require('../models/challengeModel');
const { createBuild } = require('../models/buildModel');

// Games Management
const getGames = async (req, res) => {
    try {
        const games = await getAllGames();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addGame = async (req, res) => {
    const { name, description, icon_url } = req.body;
    try {
        const game = await createGame(name, description, icon_url);
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editGame = async (req, res) => {
    const { id } = req.params;
    const { name, description, icon_url } = req.body;
    try {
        const game = await updateGame(id, name, description, icon_url);
        res.json(game);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeGame = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteGame(id);
        res.json({ message: 'Game deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Official Challenge Creation
const createOfficialChallenge = async (req, res) => {
    const { game_name, challenge_name, description, reward, type, end_date } = req.body;
    const userId = req.userId; // From middleware

    try {
        const challenge = await createChallenge(game_name, challenge_name, description, reward, type, end_date);

        // Mark as official
        const pool = require('../config/db');
        await pool.query(
            'UPDATE challenges SET is_official = true, created_by = $1 WHERE id = $2',
            [userId, challenge.id]
        );

        res.status(201).json({ ...challenge, is_official: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Official Build Creation
const createOfficialBuild = async (req, res) => {
    const { game_name, build_name, description, items_json } = req.body;
    const userId = req.userId;

    try {
        const build = await createBuild(userId, game_name, build_name, description, items_json);

        // Mark as official
        const pool = require('../config/db');
        await pool.query('UPDATE builds SET is_official = true WHERE id = $1', [build.id]);

        res.status(201).json({ ...build, is_official: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Approve Community Challenge
const approveCommunityChallenge = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = require('../config/db');
        const result = await pool.query(
            'UPDATE challenges SET is_official = false WHERE id = $1 RETURNING *',
            [id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getGames,
    addGame,
    editGame,
    removeGame,
    createOfficialChallenge,
    createOfficialBuild,
    approveCommunityChallenge,
};
