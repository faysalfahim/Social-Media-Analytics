const express = require('express');
const { fetchAndSaveMetaPostInsights, fetchAndSaveMetaPageInsights } = require('../controllers/metaInsightsController');
const { fetchAndSaveYouTubeInsights } = require('../controllers/youtubeInsightsController');


const router = express.Router();

router.get('/metapost', fetchAndSaveMetaPostInsights);
router.get('/metapage', fetchAndSaveMetaPageInsights);
router.get('/youtube', fetchAndSaveYouTubeInsights);

module.exports = router;