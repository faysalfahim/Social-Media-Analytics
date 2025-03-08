const cron = require('node-cron');
const { fetchAndSaveMetaInsights } = require('./controllers/metaInsightsController');
const { fetchAndSaveYoutubeInsights } = require('./controllers/youtubeInsightsController');

// Schedule the task to run every 24 hours
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to fetch insights...');
  fetchAndSaveMetaInsights();
  fetchAndSaveYoutubeInsights();
});