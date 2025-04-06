const express = require('express');
const { fetchAndSaveMetaPageInsights, fetchAndSavePageInsightsOverTime } = require('../controllers/metaPageInsightsController');
const { fetchAndSaveMetaPostInsights } = require('../controllers/metaPostInsightsController');
const { fetchAndSaveYouTubeInsights } = require('../controllers/youtubeInsightsController');


const router = express.Router();

router.get('/metapost', fetchAndSaveMetaPostInsights);
router.get('/metapage', fetchAndSaveMetaPageInsights);
router.get('/insightsbydate', fetchAndSavePageInsightsOverTime);
router.get('/youtube', fetchAndSaveYouTubeInsights);


module.exports = router;