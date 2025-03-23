//Video by video insights

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set the refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

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
        return response.data.items.map(item => ({
          id: item.id,
          ...item.statistics
        }));

      case 'mostWatchedVideo':
        // First, find the most-watched video
        response = await youtube.search.list({
          part: 'snippet',
          channelId: channelId,
          order: 'viewCount',
          maxResults: 1
        });
        //console.log(response)
        if (response.data.items.length === 0) {
          return { error: 'No videos found' };
        }

        const mostWatchedVideoId = response.data.items[0].id.videoId;
        console.log("ID:",mostWatchedVideoId);
        // Fetch additional details for the most-watched video
        const mostWatchedVideoDetails = await youtube.videos.list({
          part: 'snippet,statistics',
          id: mostWatchedVideoId
        });

        const videoDetails = mostWatchedVideoDetails.data.items[0];
        console.log("Details:", videoDetails);
        return {
          id: videoDetails.id,
          title: videoDetails.snippet.title,
          views: videoDetails.statistics.viewCount,
          likes: videoDetails.statistics.likeCount,
          comments: videoDetails.statistics.commentCount
        };

      case 'videoDetails':
        const videoListResponse = await youtube.search.list({
          part: 'id',
          channelId: channelId,
          maxResults: 10,
          type: 'video'
        });

        const videoIds = videoListResponse.data.items.map(item => item.id.videoId).join(',');

        const videoDetailsResponse = await youtube.videos.list({
          part: 'snippet,statistics',
          id: videoIds
        });

        return videoDetailsResponse.data.items.map(video => ({
          id: video.id,
          title: video.snippet.title,
          likes: video.statistics.likeCount,
          dislikes: video.statistics.dislikeCount,
          comments: video.statistics.commentCount
        }));

      case 'audienceDemographics':
        return await getAudienceDemographics(channelId);

      default:
        throw new Error('Unsupported metric');
    }
  } catch (error) {
    console.error('Error fetching YouTube insights:', error.message);
    return { error: error.message || "Server error" };
  }
};

// Function to get audience demographics
const getAudienceDemographics = async (channelId) => {
  try {
    const youtubeAnalytics = google.youtubeAnalytics({
      version: 'v2',
      auth: oauth2Client
    });

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate: '2022-01-01', // Adjust the date range as needed
      endDate: '2025-02-20',
      metrics: 'views',
      dimensions: 'country',
      sort: 'views'
    });

    return response.data.rows.map(row => ({
      country: row[0],
      views: row[1]
    }));
  } catch (error) {
    console.error('Error fetching audience demographics:', error.message);
    return { error: error.message || "Server error" };
  }
};


module.exports = { getYouTubeInsights, getAudienceDemographics };

