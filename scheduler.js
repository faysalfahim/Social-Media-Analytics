const cron = require('node-cron');
const { fetchAndSaveInsights } = require('./controllers/metaInsightsController');

// Schedule the task to run every 24 hours
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task to fetch insights...');
  fetchAndSaveInsights();
});