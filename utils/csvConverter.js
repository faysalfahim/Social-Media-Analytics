
//works perfectly for MetaInsights
/* const { Parser } = require('json2csv');
const fs = require('fs');

const convertToCSV = (responseData) => {
  if (!responseData || !Array.isArray(responseData.data)) {
    throw new Error('Invalid data format');
  }

  // Extract and format the data
  const formattedData = responseData.data.flatMap(item => {
    return item.values.map(valueEntry => {
      // Create a base object with common fields
      const baseObject = {
        name: item.name,
        period: item.period,
        end_time: valueEntry.end_time
      };

      // Check if value is an object or a single value
      if (typeof valueEntry.value === 'object') {
        return { ...baseObject, ...valueEntry.value };
      } else {
        return { ...baseObject, value: valueEntry.value };
      }
    });
  });

  // Determine the fields dynamically
  const fields = Object.keys(formattedData[0]);

  // Convert to CSV
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(formattedData);
};

const writeToCSV = (filePath, csvData) => {
  // Write the CSV data to the file, overwriting any existing content
  fs.writeFileSync(filePath, csvData + '\n');
  console.log(`Data written to file: ${filePath}`);
};

module.exports = { convertToCSV, writeToCSV }; */

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

module.exports = { convertToCSV, writeToCSV };