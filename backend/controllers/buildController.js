const { createBuild, getBuildsByGame, getBuildById, getAllBuilds, deleteBuildById } = require('../models/buildModel');

const addBuild = async (req, res) => {
    const { user_id, game_name, build_name, description, items_json, video_url } = req.body;

    // Basic validation
    if (!user_id || !game_name || !build_name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const newBuild = await createBuild(user_id, game_name, build_name, description, items_json, video_url);
        res.status(201).json(newBuild);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBuilds = async (req, res) => {
    const { game, contentType } = req.query;
    try {
        let builds;
        if (game) {
            builds = await getBuildsByGame(game);
        } else {
            builds = await getAllBuilds(contentType);
        }
        res.json(builds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBuildDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const build = await getBuildById(id);
        if (!build) {
            return res.status(404).json({ error: 'Build not found' });
        }
        res.json(build);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteBuild = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBuild = await deleteBuildById(id);
        if (!deletedBuild) {
            return res.status(404).json({ error: 'Build not found' });
        }
        res.json({ message: 'Build deleted successfully', build: deletedBuild });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addBuild, getBuilds, getBuildDetail, deleteBuild };
