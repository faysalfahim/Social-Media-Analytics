const express = require('express');
const { fetchAndSaveMetaInsights } = require('../controllers/metaInsightsController');

const router = express.Router();

router.get('/', fetchAndSaveMetaInsights);

module.exports = router;