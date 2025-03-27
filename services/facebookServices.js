const axios = require('axios');

const getPagePosts = async () => {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  const postsEndpoint = `https://graph.facebook.com/v22.0/${pageId}/posts?fields=id,message,story,attachments,created_time&access_token=${accessToken}`;

  try {
    const response = await axios.get(postsEndpoint);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching page posts:', error.response?.data || error.message);
    return { error: error.response?.data || "Server error" };
  }
};

const getPostInsights = async (postId, metric) => {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const postInsightsEndpoint = `https://graph.facebook.com/v22.0/${postId}/insights/${metric}?access_token=${accessToken}`;

  try {
    const response = await axios.get(postInsightsEndpoint);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching insights for post ${postId} and metric ${metric}:`, error.response?.data || error.message);
    return { error: error.response?.data || "Server error" };
  }
};

const getPageInsights = async (metric) => {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  const insightsEndpoint = `https://graph.facebook.com/v22.0/${pageId}/insights?metric=${metric}&access_token=${accessToken}`;

  try {
    const response = await axios.get(insightsEndpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching insights:", error.response?.data || error.message);
    return { error: error.response?.data || "Server error" };
  }
};

// New function to fetch page insights over a specific time range
const getPageInsightsOverTime = async (metric, since, until, period) => {
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  const insightsEndpoint = `https://graph.facebook.com/v22.0/${pageId}/insights`;

  try {
    const response = await axios.get(insightsEndpoint, {
      params: {
        metric: metric,
        period: period,
        since: since,
        until: until,
        access_token: accessToken
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching insights over time:', error.response?.data || error.message);
    return { error: error.response?.data || "Server error" };
  }
};


module.exports = { getPagePosts, getPostInsights, getPageInsights, getPageInsightsOverTime };