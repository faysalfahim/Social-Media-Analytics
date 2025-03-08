const express = require('express');
const { fetchAndSaveMetaInsights } = require('../controllers/metaInsightsController');
const { fetchAndSaveYouTubeInsights } = require('../controllers/youtubeInsightsController');


const router = express.Router();

router.get('/', fetchAndSaveMetaInsights);
//router.get('/', fetchAndSaveYouTubeInsights);

module.exports = router;