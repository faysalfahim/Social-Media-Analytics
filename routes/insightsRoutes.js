const express = require('express');
const { fetchAndSaveMetaInsights } = require('../controllers/metaInsightsController');
const { fetchAndSaveYouTubeInsights } = require('../controllers/youtubeInsightsController');


const router = express.Router();

router.get('/meta', fetchAndSaveMetaInsights);
router.get('/youtube', fetchAndSaveYouTubeInsights);

module.exports = router;