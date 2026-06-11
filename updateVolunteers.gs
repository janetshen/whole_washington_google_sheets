// Previous code has been set aside in favor of a simpler solution, at least for now.

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateVolunteers() {

  // Grab sheet + data + relevant column indexes
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Update AN');
  const dataRange = sheet.getDataRange();
  const dataValues = dataRange.getValues();
  const emailCol = dataValues[0].indexOf('Email') || dataValues[0].indexOf('email');;
  const statusCol = dataValues[0].indexOf('onboarding_status')
  const notesCol = dataValues[0].indexOf('onboarding_notes');
  const lastScanCol = dataValues[0].indexOf('Last Scanned for AN Updates');

  // Pull data
  let emailArray = dataValues.map(function(record,index) { return record[emailCol]; }).slice(1); // remove header;
  let notesArray = dataValues.map(function(record,index) { return record[notesCol]; }).slice(1); // remove header;
  let statusArray = dataValues.map(function(record,index) { return record[statusCol]; }).slice(1); // remove header;
  let lastScanArray = dataValues.map(function(record,index) { return record[lastScanCol]; }).slice(1); // remove header;

  // Prep date values
  let rightNow = new Date;
  rightNow = Date.parse(rightNow);

  // Feed into REST API
  for (let i=0; i < emailArray.length; i++) {

    // Check last scanned date/time
    let cellToCheck = sheet.getRange(i+2, lastScanCol+1);
    let cellTimeStamp = Date.parse(cellToCheck.getValue());
    let cellMillisecondsAgo = (rightNow - cellTimeStamp);
    let cellMinutesAgo = Math.round(((cellMillisecondsAgo % 86400000) % 3600000) / 60000);
    
    // If no timestamp or last checked more than 15 minutes ago, send update to AN
    if ((!(cellTimeStamp > 0) || cellMinutesAgo > 15) && emailArray[i] > '') {
      updateVolunteer(
        emailArray[i],
        notesArray[i],
        statusArray[i],
        lastScanArray[i]
      );
      sleep(2000);
    }

    // Update to current timestamp
    cellToCheck.setValue(new Date);

  }

}

function updateVolunteer(email, notes, status) {

  //https://actionnetwork.org/docs/v2/post-people/
  //https://actionnetwork.org/docs/v2/taggings --deleting tags is more complicated, requires deleting the specific tagging

  // Authentication: Action Network
  const url_root = 'https://actionnetwork.org/api/v2/people/';
  let payloadDict =
    {
    "person" : {
      "email_addresses" : [ { "address" : email }],
      "custom_fields" : {
        "onboarding_notes" : notes,
        "onboarding_status" : status
        }
    }
} 
  let postOptions = getPostApiOptions(payloadDict);

  response = UrlFetchApp.fetch(url_root, postOptions);
  json = response.getContentText(); // get the response content as text
  console.log(JSON.parse(json));
    
} 
