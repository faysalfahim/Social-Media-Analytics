const { getPageInsights } = require('../services/facebookServices');
const { convertToCSV, writeToCSV, appendToCSV } = require('../utils/csvConverter');
const fs = require('fs');
const path = require('path');


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
    ];

    for (const metric of metrics) {
      console.log(`Fetching data for metric: ${metric}`);
      const insightsData = await getPageInsights(metric);

      if (insightsData.error) {
        console.error(`Error fetching data for metric ${metric}:`, insightsData.error);
        continue;
      }

      console.log(`Data fetched for metric ${metric}:`, JSON.stringify(insightsData, null, 2));

      const metricData = [];

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

      if (metricData.length > 0) {
        const csvData = convertToCSV(metricData, 'meta');
        const filePath = path.join(__dirname, `../CSVs/${metric}.csv`);
        console.log(`Writing data to file: ${filePath}`);

        writeToCSV(filePath, csvData);
      } else {
        console.log(`No data to write to CSV for metric ${metric}.`);
      }
    }

    res.status(200).send('Page insights data fetched and written to CSV.');
  } catch (error) {
    console.error('Error in fetchAndSaveMetaPageInsights:', error);
    res.status(500).send(error.message);
  }
};

module.exports = { fetchAndSaveMetaPageInsights };