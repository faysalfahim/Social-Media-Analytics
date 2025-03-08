/* const {google} = require('googleapis');


const getYoutubeInsights = async (apikeys, channelId) => {
    try {
        const youtube = google.youtube({
            version: 'v3',
            auth: apikeys
        });

        const response = await youtube.channels.list({
            part: 'statistics',
            id: channelId
        });

        return response.data.items[0].statistics;
    }
    catch (error) {
        console.error("Error fetching insights:", error.response?.data || error.message);
        throw new Error('Failed to fetch YouTube insights');
    }
};

module.exports = { getYoutubeInsights }; */

const { google } = require('googleapis');

const getYouTubeInsights = async (metric, channelId) => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });

    let response;
    switch (metric) {
      case 'statistics':
        response = await youtube.channels.list({
          part: 'statistics',
          id: channelId
        });
        break;
      // Add more cases for different metrics if needed
      default:
        throw new Error('Unsupported metric');
    }

    return response.data.items[0].statistics;
  } catch (error) {
    console.error('Error fetching YouTube insights:', error.message);
    return { error: error.message || "Server error" };
  }
};

module.exports = { getYouTubeInsights };