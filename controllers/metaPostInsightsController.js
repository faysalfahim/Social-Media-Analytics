const { getPagePosts, getPostInsights } = require('../services/facebookServices');
const { convertToCSV, writeToCSV, appendToCSV } = require('../utils/csvConverter');
const { getLastRefreshTime, updateLastRefreshTime } = require('../utils/refreshTime');
const fs = require('fs');
const path = require('path');

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
   
const shouldPerformFullRefresh = () => {
    const lastRefreshTime = getLastRefreshTime();
    const currentTime = new Date().getTime();
    const refreshInterval =  24* 60 * 60 * 1000; // 24 hours
  
    return currentTime - lastRefreshTime > refreshInterval;
  };

module.exports = {fetchAndSaveMetaPostInsights};
  
