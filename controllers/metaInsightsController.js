const { getPagePosts, getPostInsights, getPageInsights } = require('../services/facebookServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');
const { getLastRefreshTime, updateLastRefreshTime } = require('../utils/refreshTime');

const fetchAndSaveMetaPostInsights = async (requestAnimationFrame, res) => {
  try {
      const postMetrics = [
        'post_clicks',
        'post_reactions_like_total',
        'post_reactions_love_total',
        'post_reactions_wow_total',
        'post_reactions_haha_total',
        'post_reactions_sorry_total',
        'post_reactions_anger_total',
      ];

      const videoMetrics = [
        'total_video_views',
        'total_video_views_unique',
        'total_video_30s_views',
        'total_video_30s_views_unique',
        'total_video_avg_time_watched'
      ];

      console.log('Fetching page posts...');
      const posts = await getPagePosts();

      if(posts.error)
      {
        console.error('Error fetching page posts:', posts.error);
        return res.status(500).send(posts.error);
      }

      const processedPostsPath = path.join(__dirname, '../jsons/processedPosts.json');
      const processedPosts = JSON.parse(fs.readFileSync(processedPostsPath, 'utf-8'));

      const fullRefresh = shouldPerformFullRefresh();
      console.log('Full refresh:', fullRefresh);

      const postsToProcess = fullRefresh ? posts : posts.filter(post => !processedPosts.includes(post.id));
      console.log('Posts to process:', postsToProcess);

      if(postsToProcess.length === 0){
        console.log('No new posts to process.');
        return res.status(200).send('No new posts to process.');
      }

      for (const post of postsToProcess) {
        const postId = post.id;
        console.log(`Fetching insights for post ${postId} ...`);

        const metrics = post.type === 'video' ? videoMetrics : postMetrics;

        for (const metric of metrics) {
          const insightsData = await getPostInsights(postId, metric);

          if(insightsData.error){
            console.error(`Error fetching insights for post ${postId} and metric ${metric}:`, insightsData.error);
            continue;
          }

          console.log(`Data fetched for post ${postId} and metric ${metric}:`, JSON.stringify(insightsData, null, 2));

          try {
            const csvData = convertToCSV(insightsData, 'meta');
            console.log(`CSV data for post ${postId} and metric ${metric}:`, csvData);

            const filePath = path.join(__dirname, `../CSVs/${postId}_${metric}.csv`);
            console.log(`Writing data to file: ${filePath}`);

            writeToCSV(filePath, csvData);
          } catch (error) {
            console.error(`Error writing data for post ${postId} and metric ${metric}:`, error.message);
          }
        }
      }
      if (!fullRefresh) {
        const updatedProcessedPosts = [...processedPosts, ...postsToProcess.map(post => post.id)];
        fs.writeFileSync(processedPostsPath, JSON.stringify(updatedProcessedPosts, null, 2));
      }

      updateLastRefreshTime();

      res.status(200).send('Meta insights data fetched and written to CSV.');
    } catch (error) {
      console.error('Error in fetchAndSaveMetaPostInsights:', error);
      res.status(500).send(error.message);
    }
  };
  
  
const fetchAndSaveMetaPageInsights = async (req, res) => {
    try {
      const metrics = [
        'page_fans_country', 
        'page_impressions', 
        'page_posts_impressions',
        'page_total_actions',
        'page_follows',
        'page_fans_city',
        'page_views_total'
      ]; // Add your metrics here
  
      for (const metric of metrics) {
          console.log(`Fetching data for metric: ${metric}`);
          const insightsData = await getPageInsights(metric);
          
          if (insightsData.error) {
            console.error(`Error fetching data for metric ${metric}:`, insightsData.error);
            continue; // Skip to the next metric if there's an error
          }
    
          console.log(`Data fetched for metric ${metric}:`, insightsData);
    
          const csvData = convertToCSV(insightsData, 'meta');
          console.log(`CSV data for metric ${metric}:`, csvData);
    
          const filePath = path.join(__dirname, `../CSVs/${metric}.csv`);
          console.log(`Writing data to file: ${filePath}`);
    
          // Append new data to the existing CSV file
          writeToCSV(filePath, csvData);
        }
    
        res.status(200).send('Insights data fetched and appended to CSV.');
      } catch (error) {
        console.error('Error in fetchAndSaveInsights:', error);
        res.status(500).send(error.message);
      }
};

const shouldPerformFullRefresh = () => {
  const lastRefreshTime = getLastRefreshTime();
  const currentTime = new Date().getTime();
  const refreshInterval =  24 * 60 * 60 * 1000; // 24 hours

  return currentTime - lastRefreshTime > refreshInterval;
};


module.exports = { fetchAndSaveMetaPostInsights, fetchAndSaveMetaPageInsights };