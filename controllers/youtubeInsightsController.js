//video by video insights

const { getYouTubeInsights } = require('../services/youtubeServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const path = require('path');

const fetchAndSaveYouTubeInsights = async (req, res) => {
  try {
    const metrics = ['statistics', 'mostWatchedVideo', 'videoDetails', 'audienceDemographics'];
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    for (const metric of metrics) {
      console.log(`Fetching data for metric: ${metric}`);
      const insightsData = await getYouTubeInsights(metric, channelId);

      if (insightsData.error) {
        console.error(`Error fetching data for metric ${metric}:`, insightsData.error);
        continue;
      }

      console.log(`Data fetched for metric ${metric}:`, insightsData);

      // Ensure insightsData is an array
      const dataToConvert = Array.isArray(insightsData) ? insightsData : [insightsData];

      if (dataToConvert.length > 0) {
        const csvData = convertToCSV(dataToConvert, 'youtube');
        console.log(`CSV data for metric ${metric}:`, csvData);

        const filePath = path.join(__dirname, `../CSVs/youtube_${metric}.csv`);
        console.log(`Writing data to file: ${filePath}`);

        writeToCSV(filePath, csvData);
      } else {
        console.warn(`No valid data for metric ${metric}`);
      }
    }

    res.status(200).send('YouTube insights data fetched and written to CSV.');
  } catch (error) {
    console.error('Error in fetchAndSaveYouTubeInsights:', error);
    res.status(500).send(error.message);
  }
};

module.exports = { fetchAndSaveYouTubeInsights };