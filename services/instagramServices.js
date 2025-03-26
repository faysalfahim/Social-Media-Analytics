const axios = require('axios');


const getInstagramInsights = async (userId, accessToken) => {
    const endpoint = `https://graph.facebook.com/v22.0/${userId}/insights`;
    const metrics = 'impressions, reach, profile_views';

    try {
        const response = await axios.get(endpoint, {
            params: {
                metrics: metrics,
                access_token: accessToken
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Instagram Insights', error.response?.data || error.message);
        return { error: error.response?.data || 'Server error'};
    }
};

module.exports = { getInstagramInsights };
