// Enviroment variables
require('dotenv').config();
const app_secret = process.env.secret;
//Log app secret key
console.log(app_secret);
//Automation Cloud client
const { Client } = require('@automationcloud/client');

// Create client instance
const client = new Client({
    serviceId: "20ea0e52-1c0d-41ba-9ed2-4b50ca847f31",
    category: "test",
    auth: app_secret
});

// Create and follow job

(async function(){
    //Create job
    const job = await client.createJob();
    
    //Input search term
    var searchInput = "apples";
    await job.submitInput('search_term', searchInput);
    var selectedTitle = "Apple - Wikipedia"
    var selectedItem = {'title': selectedTitle};
    console.log(selectedItem);
    
    var selected = await job.waitForOutputs('SearchResults');
    var selected = job.submitInput('selected_site', selectedItem)
    
    //Log job state
    job.onStateChanged(newState => console.log(`job: ${newState}`));
    
    //Wait for completion
    await job.waitForCompletion();
    
    //Log output
    var output = await job.getOutput('SearchResults');
    console.log(output);

})();
