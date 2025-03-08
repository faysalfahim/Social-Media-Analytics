const axios = require("axios");

const getMetaInsights = async (metric) => {
  const accessToken = process.env.PAGE_ACCESS_TOKEN;
  const pageId = process.env.PAGE_ID;
  const insightsEndpoint = `https://graph.facebook.com/v22.0/${pageId}/insights?metric=${metric}&access_token=${accessToken}`;

  try {
    const response = await axios.get(insightsEndpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching insights:", error.response?.data || error.message);
    return { error: error.response?.data || "Server error" };
  }
};

module.exports = { getMetaInsights };