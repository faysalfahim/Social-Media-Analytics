
const { getPageInsightsOverTime } = require('../services/facebookServices');
const { convertToCSV, writeToCSV, appendToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');
const moment = require('moment');


const fetchAndSavePageInsightsOverTime = async (req, res) => {
    try {
      const pageId = process.env.FB_PAGE_ID;
      const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
      const metrics = [
        'page_fans_country', 
        'page_impressions', 
        'page_posts_impressions',
        'page_total_actions',
        'page_follows',
        'page_fans_city',
        'page_views_total'
      ];
      const startDate = moment('2024-01-01'); // Start date
      const endDate = moment('2025-01-01'); // End date
      const period = 'day'; // Use 'day' to fetch daily data
  
      for (const metric of metrics) {
        console.log(`Fetching insights for metric: ${metric} from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}...`);
  
        const metricData = [];
  
        // Iterate over the date range in chunks
        let currentStartDate = startDate.clone();
        while (currentStartDate.isBefore(endDate)) {
          const currentEndDate = moment.min(currentStartDate.clone().add(92, 'days'), endDate);
  
          console.log(`Fetching data from ${currentStartDate.format('YYYY-MM-DD')} to ${currentEndDate.format('YYYY-MM-DD')}`);
          const insightsData = await getPageInsightsOverTime(metric, currentStartDate.format('YYYY-MM-DD'), currentEndDate.format('YYYY-MM-DD'), period);
  
          if (insightsData.error) {
            console.error(`Error fetching insights for metric ${metric}:`, insightsData.error);
            continue; // Skip to the next metric
          }
  
          console.log('Insights data:', insightsData);
  
          if (Array.isArray(insightsData.data) && insightsData.data.length > 0) {
            insightsData.data.forEach(item => {
              item.values.forEach(valueEntry => {
                const dataEntry = {
                  name: item.name,
                  period: item.period,
                  end_time: valueEntry.end_time || null,
                  value: valueEntry.value
                };
                metricData.push(dataEntry);
              });
            });
          } else {
            console.warn(`No valid data for metric ${metric}`);
          }
  
          // Move to the next chunk
          currentStartDate = currentEndDate.clone().add(1, 'day');
        }
  
        // Filter to get the first day of each week (e.g., Sunday)
        const filteredData = metricData.filter(entry => {
          const endTime = moment(entry.end_time);
          return endTime.day() === 0; // 0 represents Sunday
        });
  
        if (filteredData.length > 0) {
          const csvData = convertToCSV(filteredData, 'meta');
          const filePath = path.join(__dirname, `../CSVs/${metric}_weekly.csv`);
          console.log(`Writing data to file: ${filePath}`);
  
          writeToCSV(filePath, csvData);
        } else {
          console.log(`No data to write to CSV for metric ${metric}.`);
        }
      }
  
      res.status(200).send('Page insights data fetched and written to CSV for all metrics.');
    } catch (error) {
      console.error('Error in fetchAndSavePageInsightsOverTime:', error);
      res.status(500).send(error.message);
    }
};

module.exports = {
    fetchAndSavePageInsightsOverTime
};