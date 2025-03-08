
const { getInsights } = require('../services/facebookServices');
const { convertToCSV, writeToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');

const fetchAndSaveMetaInsights = async (req, res) => {
  try {
    const metrics = ['page_fans_country', 'page_impressions', 'page_posts_impressions','page_total_actions','page_follows','page_fans_city','page_video_views','page_views_total']; // Add your metrics here

    for (const metric of metrics) {
        console.log(`Fetching data for metric: ${metric}`);
        const insightsData = await getInsights(metric);
        
        if (insightsData.error) {
          console.error(`Error fetching data for metric ${metric}:`, insightsData.error);
          continue; // Skip to the next metric if there's an error
        }
  
        console.log(`Data fetched for metric ${metric}:`, insightsData);
  
        const csvData = convertToCSV(insightsData);
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
  
  module.exports = { fetchAndSaveMetaInsights };