// Enviroment variables
require('dotenv').config();
const appSecret = process.env.secret;

//Express server
var express = require('express');
var app = express();
const port = 3001;
app.use(express.urlencoded());

// Axios require
var axios = require('axios');

//Automation Cloud client
const { Client } = require('@automationcloud/client');

//Automation Client Functions
// Create client instance
const client = new Client({
    serviceId: "20ea0e52-1c0d-41ba-9ed2-4b50ca847f31",
    category: "test",
    auth: appSecret
});

// Create new job
async function createJob() {
    //Create job
    const job = await client.createJob();
    //console.log(job);
    job.onStateChanged(newState => console.log(`job: ${newState}`));
    return Promise.resolve(job);
}

// Submit input
async function submitInput(data, job) {
    //Log jobId
    jobId = job._jobId;
    var searchInput = data;
    console.log(searchInput);
    await job.submitInput('search_term', searchInput);
    return Promise.resolve(job, jobId);
}

// Submit selected result
async function submitSelected(data, job, jobId) {
    var selectedTitle = data;
    var selectedItem = {'title': selectedTitle};
    console.log(selectedItem);
    job = await client.getJob(jobId);
    //Wait for output
    await job.waitForOutputs('SearchResults');
    //Submit input
    job.submitInput('selected_site', selectedItem);
    //Wait for completion
    await job.waitForCompletion();
}

// Create job with input
async function createSubmit(term) {
    job = await createJob();
    await submitInput(term, job);
    //Output
    await job.waitForOutputs('SearchResults');
    var output = await job.getOutput('SearchResults');
    //console.log(output);
    return job, output;
}

// Input selected item to job
async function selectItem(item, jobId) {
    await submitSelected(item, job, jobId);
    return job;
}

// Get Screenshot
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
    console.log(imageBase64);
    return imageBase64;
}

// API Endpoints
// Search endpoint
app.post('/search', async function (req, res) {
    var queryInput = req.body.search;
    console.log("/search endpoint");
    var submit = await createSubmit(queryInput);
    res.send(
        {
            "jobId": jobId,
            "output": submit
          }
    );
})

// Selected endpoint
app.put('/selected', async function (req, res) {
    var selectedResult = req.body.selected;
    var jobId = req.query.jobId;
    console.log("/selected endpoint");
    await selectItem(selectedResult, jobId);
    res.send("Job complete for " + selectedResult + " (JobId: " + jobId + ")");
})

app.get('/screenshot', async function (req, res) {
    var jobId = req.query.jobId;
    var screenshotBase64 = await getScreenshot(jobId, appSecret);
    res.send(screenshotBase64);
})

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})