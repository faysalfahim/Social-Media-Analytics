const fs = require('fs');
const path = require('path');

const refreshTimeFilePath = path.join (__dirname, '../jsons/refreshTime.json');


const getLastRefreshTime = () => {
    try {
        const data = fs.readFileSync(refreshTimeFilePath, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData.lastRefresh;
    } catch (error) {
        console.error('Error reading refresh time:', error);
        return 0;
    }
};


const updateLastRefreshTime = () => {
    try {
        const currentTime = new Date().getTime();
        const jsonData = { lastRefresh: currentTime };
        fs.writeFileSync(refreshTimeFilePath, JSON.stringify(jsonData, null, 2));
        console.log('Refresh time updated successfully.');

    }
    catch (error) {
        console.error('Error updating refresh time:', error.message);

    }
};

module.exports = { getLastRefreshTime, updateLastRefreshTime };