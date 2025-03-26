const { getInstagramInsights } = require('./services');
const {covnertToCSV, writeToCSV}= require("../csvConverter");
const path=require('path');
const { log } = require('console');
const { convertToCSV } = require('../utils/csvConverter');

const fetchAndSaveInstagramInsights=async(req,res)=>{
    try{
        const userId=''
        const accessToken=''

        console.log('Fetching Instagram insights....');
        const insightsData=await getInstagramInsights(userId, accessToken);

        if(insightsData.error){
            console.error('Error fetching Instagram insights:', insightsData.error);
            return res.status(500).send(insightsData.error)
            
        }

    console.log('Instagram insights data:', insightsData);

    const csvData= convertToCSV(insightsData.data,'instagram')
    const filepath=path.join(__dirname,'../CSVs/instagram_insights.csv');
    console.log(`writing data to file: ${filepath}`);
    
    writeToCSV(filepath, csvData)

    res.status(200).send('Instagram insights data fetched and written to CSV.');
        
    }catch(error){
        console.error('Error in fetchAndSaveInstagramInsight:',error);
        res.status(500).send(error.message)
        
    }
};

module.export = {fetchAndSaveInstagramInsights};