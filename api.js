// Enviroment variables
require('dotenv').config();
const app_secret = process.env.secret;

//Express server
var express = require('express');
var app = express();
const port = 3001;
app.use(express.urlencoded());

//Automation Cloud client
const { Client } = require('@automationcloud/client');

// Create client instance
const client = new Client({
    serviceId: "20ea0e52-1c0d-41ba-9ed2-4b50ca847f31",
    category: "test",
    auth: app_secret
});

//Create new job
async function createJob() {
    //Create job
    const job = await client.createJob();
    //console.log(job);
    job.onStateChanged(newState => console.log(`job: ${newState}`));
    return Promise.resolve(job);
}

//Submit input
async function submitInput(data, job) {
    //Log jobId
    jobId = job._jobId;
    var searchInput = data;
    console.log(searchInput);
    await job.submitInput('search_term', searchInput);
    return Promise.resolve(job, jobId);
}

//Submit selected result
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
    return Promise.resolve(job);
}

//Create job with input
async function createSubmit(term) {
    job = await createJob();
    await submitInput(term, job);
    //Output
    await job.waitForOutputs('SearchResults');
    var output = await job.getOutput('SearchResults');
    //console.log(output);
    return job, output;
}

//Input selected item to job
async function selectItem(item, jobId) {
    await submitSelected(item, job, jobId);
    return job;
}


//Search endpoint
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

//Return the job object which gets passed to the next endpoint (PUT) (URL parameters) (RESTful)
//Add async to initial function
//Learn TypeScript

//Selected endpoint
app.put('/selected', async function (req, res) {
    var selectedResult = req.body.selected;
    var jobId = req.query.jobId;
    console.log("/selected endpoint");
    await selectItem(selectedResult, jobId);
    res.send("Job complete for " + selectedResult + " (JobId: " + jobId + ")");
})

//Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})