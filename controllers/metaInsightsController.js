
/* const { getMetaInsights } = require('../services/facebookServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');

const fetchAndSaveMetaInsights = async (req, res) => {
  try {
    const metrics = ['page_fans_country', 'page_impressions', 'page_posts_impressions','page_total_actions','page_follows','page_fans_city','page_video_views','page_views_total','post_clicks']; // Add your metrics here

    for (const metric of metrics) {
        console.log(`Fetching data for metric: ${metric}`);
        const insightsData = await getMetaInsights(metric);
        
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
  
  module.exports = { fetchAndSaveMetaInsights }; */

  const { getPagePosts, getPostInsights, getPageInsights } = require('../services/facebookServices');
  const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
  const path = require('path');

  const fetchAndSaveMetaPostInsights = async (req, res) => {
    try {
      const metrics = [
        'post_clicks',
        'post_reactions_like_total',
        'post_reactions_love_total',
        'post_reactions_wow_total',
        'post_reactions_haha_total',
        'post_reactions_sorry_total',
        'post_reactions_anger_total',
        'total_video_views',
        'total_video_views_unique',
        'total_video_30s_views',
        'total_video_30s_views_unique',
        'total_video_avg_time_watched',

      ];
      console.log('Fetching page posts...');
      const posts = await getPagePosts();

      if (posts.error) {
        console.error('Error fetching page posts:', posts.error);
        return res.status(500).send(posts.error);
      }

      for (const post of posts)
      {
        const postId = post.id;
        console.log(`Fetching insights for post ${postId}...`);
        
        for (const metric of metrics) {
          const insightsData = await getPostInsights(postId, metric);
  
          if (insightsData.error) {
            console.error(`Error fetching insights for post ${postId} and metric ${metric}:`, insightsData.error);
            continue; // Skip to the next metric if there's an error
          }
  
          console.log(`Data fetched for post ${postId} and metric ${metric}:`, insightsData);
  
          /* const csvData = convertToCSV(insightsData, 'meta'); 
          console.log(`CSV data for post ${postId} and metric ${metric}:`, csvData);
  
          const filePath = path.join(__dirname, `../CSVs/${postId}_${metric}.csv`);
          console.log(`Writing data to file: ${filePath}`);
  
          // Write new data to the CSV file, overwriting any existing data 
          writeToCSV(filePath, csvData);*/
          try {
            const csvData = convertToCSV(insightsData, 'meta');
            console.log(`CSV data for post ${postId} and metric ${metric}:`, csvData);

            const filePath = path.join(__dirname, `../CSVs/${postId}_${metric}.csv`);
            console.log(`Writing data to file: ${filePath}`);

            writeToCSV(filePath, csvData);
          }
          catch (error) {
            console.error(`Error writing data for post ${postId} and metric ${metric}:`, error);

        }
      }
    }

      res.status(200).send('Meta insights data fetched and written to CSV.');
    } catch (error) {
      console.error('Error in fetchAndSaveMetaInsights:', error);
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

  module.exports = { fetchAndSaveMetaPostInsights, fetchAndSaveMetaPageInsights };