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

const appendToCSV = (filePath, csvData) => {
  const fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    // Write the header only if the file does not exist
    const header = csvData.split('\n')[0];
    fs.writeFileSync(filePath, header + '\n');
  }

  // Append the CSV data
  fs.appendFileSync(filePath, csvData + '\n');
  console.log(`Data appended to file: ${filePath}`);
};

module.exports = { convertToCSV, appendToCSV }; */

const { Parser } = require('json2csv');
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

module.exports = { convertToCSV, writeToCSV };