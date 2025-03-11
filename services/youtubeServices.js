/* const { google } = require('googleapis');

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

module.exports = { getYouTubeInsights }; */

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
        return response.data.items[0].statistics;

      case 'mostWatchedVideo':
        response = await youtube.search.list({
          part: 'snippet',
          channelId: channelId,
          order: 'viewCount',
          maxResults: 1
        });
        return response.data.items[0];

      case 'audienceDemographics':
        // This requires OAuth2 authentication and the YouTube Analytics API
        // Placeholder for audience demographics logic
        return await getAudienceDemographics(channelId);

      default:
        throw new Error('Unsupported metric');
    }
  } catch (error) {
    console.error('Error fetching YouTube insights:', error.message);
    return { error: error.message || "Server error" };
  }
};

// Placeholder function for audience demographics
const getAudienceDemographics = async (channelId) => {
  // Implement OAuth2 authentication and YouTube Analytics API call here
  return {}; // Return mock data or implement actual logic
};

module.exports = { getYouTubeInsights };