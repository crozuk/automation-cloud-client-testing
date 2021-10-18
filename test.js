// Enviroment variables
require('dotenv').config();
const appSecret = process.env.secret;
// Testing variables
const jobId = 'ccf7d6a9-1bb5-4b50-be27-97a6bae09a61';
// Asios
const axios = require('axios');

// Get screenshot function
async function getScreenshot (jobId, appSecret) {
    const username = appSecret;
    const password = null;
    //const data = null;
    const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
    var url = "https://api.automationcloud.net/jobs/" + jobId + "/screenshots";
    //console.log(token);
    //console.log(url);
    var response = await axios.get(url, {
        headers: {
            'Authorization': `Basic ${token}`
        },
    })
    const body = await response.data;
    //console.log(body);
    const latestScreenshot = body.data.reverse()[0];
    //console.log(latestScreenshot);
    var url = "https://api.automationcloud.net" + latestScreenshot.url
    var response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
            'Authorization': `Basic ${token}`
        },
    });
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    return imageBase64;
}
getScreenshot(jobId, appSecret);