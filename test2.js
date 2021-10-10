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
    var searchInput = data;
    console.log(searchInput);
    await job.submitInput('search_term', searchInput);
    return Promise.resolve(job);
}

//Submit input
async function submitSelected(data, job) {
    var selectedTitle = data;
    var selectedItem = {'title': selectedTitle};
    console.log(selectedItem);
    
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

//Input select item to job
async function selectItem(item) {
    await submitSelected(item, job);
    return job;
}


//Search endpoint
app.post('/search', function (req, res) {
    var queryInput = req.body.search;
    console.log("/search endpoint");
    (async function(){
        var submit = await createSubmit(queryInput);
        //console.log(submit);
        res.send(submit);
    })();
})

//Selected endpoint
app.post('/selected', function (req, res) {
    var selectedResult = req.body.selected;
    console.log("/selected endpoint");
    (async function(){
        await selectItem(selectedResult);
        res.send("Job complete for " + selectedResult);
    })();
})

//Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})