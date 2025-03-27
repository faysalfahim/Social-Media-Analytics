const { getPagePosts, getPostInsights, getPageInsights, getPageInsightsOverTime } = require('../services/facebookServices');
const { convertToCSV, writeToCSV, appendToCSV } = require('../utils/csvConverter');
const { getLastRefreshTime, updateLastRefreshTime } = require('../utils/refreshTime');
const fs = require('fs');
const path = require('path');
const moment = require('moment');


const fetchAndSaveMetaPostInsights = async (req, res) => {
  try {
    const postMetrics = [
      'post_clicks',
      'post_reactions_like_total',
      'post_reactions_love_total',
      'post_reactions_wow_total',
      'post_reactions_haha_total',
      'post_reactions_sorry_total',
      'post_reactions_anger_total',
      ''
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

    if (posts.error) {
      console.error('Error fetching page posts:', posts.error);
      return res.status(500).send(posts.error);
    }

    const processedPostsPath = path.join(__dirname, '../jsons/processedPosts.json');
    const processedPosts = JSON.parse(fs.readFileSync(processedPostsPath, 'utf-8'));

    const fullRefresh = shouldPerformFullRefresh();
    console.log('Full refresh:', fullRefresh);

    const postsToProcess = fullRefresh ? posts : posts.filter(post => !processedPosts.includes(post.id));
    console.log('Posts to process:', postsToProcess);

    if (postsToProcess.length === 0) {
      console.log('No new posts to process.');
      return res.status(200).send('No new posts to process.');
    }

    const consolidatedPostData = [];
    const consolidatedVideoData = [];

    for (const post of postsToProcess) {
      const postId = post.id;
      const postTitle = post.message || post.story || 'No Title'; // Use message or story as the title
      const postCreationDate = post.created_time || 'No Date';
      console.log(`Fetching insights for post ${postId} ...`);

       // Determine if the post is a video by checking the attachments
      const isVideo = post.attachments?.data?.some(attachment => attachment.type === 'video_inline');
      const postMetricsData = { postId, postTitle, postCreationDate };

      for (const metric of postMetrics) {
        if(!metric) {
          console.warn(`Skipping empty metric for post ${postId}`);
          continue;
        }
        const insightsData = await getPostInsights(postId, metric);

        if (insightsData.error) {
          console.error(`Error fetching insights for post ${postId} and metric ${metric}:`, insightsData.error);
          continue;
        }

        console.log(`Data fetched for post ${postId} and metric ${metric}:`, JSON.stringify(insightsData, null, 2));
  
        if(Array.isArray(insightsData) && insightsData.length > 0) {
          const metricValue = insightsData[0]?.values[0]?.value || 0;
          postMetricsData[metric] = metricValue;
        } else {
          console.warn(`No data found for post ${postId} and metric ${metric}`);
          postMetricsData[metric] = 0;
        }
      }
      consolidatedPostData.push(postMetricsData);

      //console.log("Type :",isVideo);
      if (isVideo) {
        const videoMetricsData = { postId, postCreationDate };

        for (const metric of videoMetrics) {
          const insightsData = await getPostInsights(postId, metric);

          if (insightsData.error) {
            console.error(`Error fetching insights for post ${postId} and metric ${metric}:`, insightsData.error);
            continue;
          }

          console.log(`Data fetched for post ${postId} and metric ${metric}:`, JSON.stringify(insightsData, null, 2));

          if (Array.isArray(insightsData) && insightsData.length > 0) {
            const metricValue = insightsData[0]?.values[0]?.value || 0;
            videoMetricsData[metric] = metricValue;
          } else {
            console.warn(`No data found for post ${postId} and metric ${metric}`);
            videoMetricsData[metric] = 0;
          }
        }
        consolidatedVideoData.push(videoMetricsData);
    }
  }

    const postFilePath = path.join(__dirname, '../CSVs/consolidated_post_metrics.csv');
    const videoFilePath = path.join(__dirname, '../CSVs/consolidated_video_metrics.csv');

    // Just if and else statement is extra remaining logics are same even the code in the condotions
    if (consolidatedPostData.length > 0) {
      const csvData = convertToCSV(consolidatedPostData, 'meta');
      if (fullRefresh) {
        console.log(`Writing consolidated data to file: ${postFilePath}`);

        writeToCSV(postFilePath, csvData);
      }
      else {
        console.log(`Appending consolidated data to file: ${postFilePath}`);

        appendToCSV(postFilePath, csvData);
      }
      
    } else {
      console.log('No data to write to CSV.');
    }

    if (consolidatedVideoData.length > 0) {
      const csvData = convertToCSV(consolidatedVideoData, 'meta');
      if (fullRefresh) {
        console.log(`Writing consolidated data to file: ${videoFilePath}`);

        writeToCSV(videoFilePath, csvData);
      }
      else {
        console.log(`Appending consolidated data to file: ${videoFilePath}`);

        appendToCSV(videoFilePath, csvData);
      }
      
    } else {
      console.log('No data to write to CSV.');
    }


    

    if (!fullRefresh) {
      const updatedProcessedPosts = [...processedPosts, ...postsToProcess.map(post => post.id)];
      fs.writeFileSync(processedPostsPath, JSON.stringify(updatedProcessedPosts, null, 2));
    }

    updateLastRefreshTime();

    res.status(200).send('Meta insights data fetched and written to CSV.');
  }
  catch (error) {
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
//single metric
/* const fetchAndSavePageInsightsOverTime = async (req, res) => {
  try {
    const pageId = process.env.FB_PAGE_ID;
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    const metric = 'page_follows'; // Replace with the desired metric
    const startDate = moment('2024-01-01'); // Start date
    const endDate = moment('2025-01-01'); // End date
    const period = 'day'; // Use 'day' to fetch daily data

    console.log(`Fetching insights for metric: ${metric} from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}...`);

    const metricData = [];

    // Iterate over the date range in chunks
    let currentStartDate = startDate.clone();
    while (currentStartDate.isBefore(endDate)) {
      const currentEndDate = moment.min(currentStartDate.clone().add(92, 'days'), endDate);

      console.log(`Fetching data from ${currentStartDate.format('YYYY-MM-DD')} to ${currentEndDate.format('YYYY-MM-DD')}`);
      const insightsData = await getPageInsightsOverTime(metric, currentStartDate.format('YYYY-MM-DD'), currentEndDate.format('YYYY-MM-DD'), period);

      if (insightsData.error) {
        console.error('Error fetching insights:', insightsData.error);
        return res.status(500).send(insightsData.error);
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

    res.status(200).send('Page insights data fetched and written to CSV.');
  } catch (error) {
    console.error('Error in fetchAndSavePageInsightsOverTime:', error);
    res.status(500).send(error.message);
  }
} */

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


const shouldPerformFullRefresh = () => {
  const lastRefreshTime = getLastRefreshTime();
  const currentTime = new Date().getTime();
  const refreshInterval =  24* 60 * 60 * 1000; // 24 hours

  return currentTime - lastRefreshTime > refreshInterval;
};


module.exports = { fetchAndSaveMetaPostInsights, fetchAndSaveMetaPageInsights, fetchAndSavePageInsightsOverTime };