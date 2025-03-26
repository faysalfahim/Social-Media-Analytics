const { Parser } = require('json2csv');
const fs = require('fs');

const convertToCSV = (data, source) => {
  if (!data || data.length === 0) {
    throw new Error('No data available to convert to CSV');
  }

  const fields = Object.keys(data[0]);
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(data);
};

const writeToCSV = (filePath, csvData) => {
  fs.writeFileSync(filePath, csvData + '\n');
  console.log(`Data written to file: ${filePath}`);
};

const appendToCSV = (filePath, csvData) => {
  fs.appendFileSync(filePath, csvData + '\n');
  console.log(`Data appended to file: ${filePath}`);
}

module.exports = { convertToCSV, writeToCSV, appendToCSV };