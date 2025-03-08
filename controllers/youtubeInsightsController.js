/* const { getYoutubeInsights } = require('../services/youtubeServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');


const fetchAndSaveYoutubeInsights = async (req, res) => {
    try {
        const apikeys = process.env.YOUTUBE_API_KEY;
        const channelId = process.env.YOUTUBE_CHANNEL_ID;

        console.log(`Fetching data for YouTube insights...`);
        const insightsData = await getYoutubeInsights(apikeys, channelId);

        console.log(`Data fetched for YouTube insights:`, insightsData);

        const csvData = convertToCSV(insightsData);
        const filePath = path.join(__dirname, `../CSVs/youtubeInsights.csv`);

        writeToCSV(filePath, csvData);
        res.status(200).send('YouTube insights data fetched and saved to CSV.');
    }
    catch (error) {
        console.error('Error in fetchAndSaveYoutubeInsights:', error);
        res.status(500).send(error.message);
    }
};

module.exports = { fetchAndSaveYoutubeInsights }; */


const { getYouTubeInsights } = require('../services/youtubeServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');

const fetchAndSaveYouTubeInsights = async (req, res) => {
  try {
    const metrics = ['statistics']; // Add more metrics if needed
    const channelId = process.env.YOUTUBE_CHANNEL_ID; // Replace with your YouTube channel ID

    for (const metric of metrics) {
      console.log(`Fetching data for metric: ${metric}`);
      const insightsData = await getYouTubeInsights(metric, channelId);

      if (insightsData.error) {
        console.error(`Error fetching data for metric ${metric}:`, insightsData.error);
        continue; // Skip to the next metric if there's an error
      }

      console.log(`Data fetched for metric ${metric}:`, insightsData);

      const csvData = convertToCSV([insightsData], 'youtube'); // Wrap in array for CSV conversion
      console.log(`CSV data for metric ${metric}:`, csvData);

      const filePath = path.join(__dirname, `../CSVs/youtube_${metric}.csv`);
      console.log(`Writing data to file: ${filePath}`);

      // Write new data to the CSV file, overwriting any existing data
      writeToCSV(filePath, csvData);
    }

    res.status(200).send('YouTube insights data fetched and written to CSV.');
  } catch (error) {
    console.error('Error in fetchAndSaveYouTubeInsights:', error);
    res.status(500).send(error.message);
  }
};

module.exports = { fetchAndSaveYouTubeInsights };