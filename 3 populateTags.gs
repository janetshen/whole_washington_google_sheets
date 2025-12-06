function populateTags(){
  
  // Grab tag id lookup table
  const tagLookup = buildTagLookupTable();

  // Grab Google Sheet file
  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)

  // Grab Counties
  const countyLookupTable = buildLookupTable();
  const counties = Object.keys(countyLookupTable);

  // Populate tags, one county sheet at a time
  counties.forEach((county) => {

    console.log(county);
   
    // Skip sheet if empty
    const sheet = ss.getSheetByName(county); //The name of the sheet tab where you are sending the info
    if (sheet.getLastRow() <= 1) {return;}

    // Grab sheet contents
    const range = sheet.getDataRange();
    const values = range.getValues();
    const tagColumnID = values[0].indexOf('tags');
    let tagColumnRange = sheet.getRange(2, tagColumnID+1, values.length - 2); // getRange(row, column, numRows, numColumns)
    let tagColumnValues = tagColumnRange.getValues();
    let newTagValues = [];

    // Translate urls into tag list, each url representing one volunteer
    tagColumnValues.forEach((urlsMaybe) => {

      // Check if this url has been overwritten with tags yet
      let urlMaybe = urlsMaybe[0];
      if (urlMaybe.startsWith('https')){

        // Start empty volunteer tags list
        let volunteerTags = [];

        // API Pagination
        let options = getApiOptions();
        let lastRestAPIPage = false;
        let nextURL = urlMaybe;

        while (!lastRestAPIPage) {

          // Pagination + First API Call
          let response = UrlFetchApp.fetch(nextURL, options);
          let json = response.getContentText(); // get the response content as text
          let taggings = JSON.parse(json); //parse text into json

          // Move url forward if next page exists
          nextURL = taggings['_links']?.['next']?.['href'] ?? 'last page';

          // Create array of tags for volunteer and append to county tags list
          if (taggings['total_records'] > 0) {
            taggings = taggings['_embedded']['osdi:taggings'];           
            for (i=0; i<taggings.length; i++) {
              let tagID = taggings[i]['_links']['osdi:tag']['href'].split('/tags/')[1];
              volunteerTags.push(tagLookup[tagID]);
            }
          }

          // Check for last page
          lastRestAPIPage = nextURL === 'last page';
        }

      // Add comma-separated volunteer tags to county tags
      newTagValues.push([volunteerTags.join()]);

      } else {
        newTagValues.push([urlMaybe]);
      }
    })

    // Finally, overwrite urls with tag lists
    tagColumnRange.setValues(newTagValues);

  });
}
