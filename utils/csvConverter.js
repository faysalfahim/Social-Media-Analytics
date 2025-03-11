/* 
//works perfectly for YoutubeInsights and MetaInsights
const { Parser } = require('json2csv');
const fs = require('fs');

const convertToCSV = (responseData, source) => {
  if (!responseData) {
    throw new Error('Invalid data format');
  }

  let formattedData;

  if (source === 'meta') {
    if (!Array.isArray(responseData.data)) {
      throw new Error('Invalid Meta data format');
    }

    // Extract and format the Meta data
    formattedData = responseData.data.flatMap(item => {
      return item.values.map(valueEntry => {
        const baseObject = {
          name: item.name,
          period: item.period,
          end_time: valueEntry.end_time
        };

        if (typeof valueEntry.value === 'object') {
          return { ...baseObject, ...valueEntry.value };
        } else {
          return { ...baseObject, value: valueEntry.value };
        }
      });
    });
  } else if (source === 'youtube') {
    // Assuming responseData is an object with statistics or other relevant fields
    formattedData = [responseData]; // Wrap in an array for consistency
  } else {
    throw new Error('Unsupported data source');
  }

  // Determine the fields dynamically
  const fields = Object.keys(formattedData[0]);

  // Convert to CSV
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(formattedData);
};

const writeToCSV = (filePath, csvData) => {
  fs.writeFileSync(filePath, csvData + '\n');
  console.log(`Data written to file: ${filePath}`);
};

module.exports = { convertToCSV, writeToCSV }; */

//checking for both data types in meta

const { Parser } = require('json2csv');
const fs = require('fs');

const convertToCSV = (responseData, source) => {
  if (!responseData) {
    throw new Error('Invalid data format');
  }

  let formattedData = [];

  if (source === 'meta') {
    const insightsArray = Array.isArray(responseData.data) ? responseData.data : responseData;

    if (!Array.isArray(insightsArray)) {
      throw new Error('Invalid Meta data format');
    }

    formattedData = insightsArray.flatMap(item => {
      return item.values.map(valueEntry => {
        const baseObject = {
          name: item.name,
          period: item.period,
          end_time: valueEntry.end_time || null // Handle cases where end_time might not exist
        };

        if (typeof valueEntry.value === 'object') {
          // If value is an object, spread its properties
          return { ...baseObject, ...valueEntry.value };
        } else {
          // If value is a single value, add it directly
          return { ...baseObject, value: valueEntry.value };
        }
      });
    });
  } else if (source === 'youtube') {
    formattedData = [responseData];
  } else {
    throw new Error('Unsupported data source');
  }

  if (formattedData.length === 0) {
    throw new Error('No data available to convert to CSV');
  }

  const fields = Object.keys(formattedData[0]);
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(formattedData);
};

const writeToCSV = (filePath, csvData) => {
  fs.writeFileSync(filePath, csvData + '\n');
  console.log(`Data written to file: ${filePath}`);
};

module.exports = { convertToCSV, writeToCSV };