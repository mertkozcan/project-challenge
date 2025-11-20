const express = require('express');
const { addBuild, getBuilds, getBuildDetail } = require('../controllers/buildController');

const router = express.Router();

router.post('/', addBuild);
router.get('/', getBuilds);
router.get('/:id', getBuildDetail);

module.exports = router;
