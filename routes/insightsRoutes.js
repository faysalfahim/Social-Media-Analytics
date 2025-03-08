const express = require('express');
const { fetchAndSaveInsights } = require('../controllers/insightsController');

const router = express.Router();

router.get('/', fetchAndSaveInsights);

module.exports = router;