const express = require('express');
const { fetchAndSaveMetaPostInsights, fetchAndSaveMetaPageInsights, fetchAndSavePageInsightsOverTime } = require('../controllers/metaInsightsController');
const { fetchAndSaveYouTubeInsights } = require('../controllers/youtubeInsightsController');


const router = express.Router();

router.get('/metapost', fetchAndSaveMetaPostInsights);
router.get('/metapage', fetchAndSaveMetaPageInsights);
router.get('/insightsbydate', fetchAndSavePageInsightsOverTime);
router.get('/youtube', fetchAndSaveYouTubeInsights);


module.exports = router;