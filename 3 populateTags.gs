function populateTags(){
  
  // Grab tag id lookup table
  const tagLookup = buildTagLookupTable();
  // console.log(tagLookup)

  if (Object.keys(tagLookup).length === 0) {
     throw new Error("Tag lookup sheet not built. Please run pullTags.gs");
  }

  // Grab Google Sheet file
  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)

  // Grab Counties
  const countyLookupTable = buildLookupTable();
  const counties = Object.keys(countyLookupTable);

  // Populate tags, one county sheet at a time
  counties.forEach((county) => {
   
    // Skip sheet if empty
    const sheet = ss.getSheetByName(county); //The name of the sheet tab where you are sending the info
    if (sheet.getLastRow() <= 1) {
      console.log(county + 'is empty');
      return;
      }

    // Grab sheet contents
    const range = sheet.getDataRange();
    const values = range.getValues();
    const tagColumnID = values[0].indexOf('tags');
    let tagColumnRange = sheet.getRange(2, tagColumnID+1, values.length - 2); // getRange(row, column, numRows, numColumns)
    let tagColumnValues = tagColumnRange.getValues();
    let newTagValues = [];

    // Check if whole sheet can be skipped
    if (!tagColumnValues[tagColumnValues.length-1][0].startsWith('https')) {
      console.warn(county + 'as already been tagged or does not have correct starting tag column format');
      return;
    }

    // Create chunks in case list too long
    const chunkSize = 10;
    let chunksList = [];
    let indexArray = Array.from(Array(tagColumnValues.length).keys()); // [0, 1, 2...]
    for (let i = 0; i < indexArray.length; i += chunkSize) {
      let chunk = indexArray.slice(i, i + chunkSize); // [0, ..., 99]
      chunksList.push(chunk); // [[0, ..., 99],[100, ..., 199]]
    }

    // Translate urls into tag list, each url representing one volunteer
    // Use chunks to make piecemeal updates

    for (x=0; x<chunksList.length; x++){
      let chunk = chunksList[x];
      let chunkStart = chunk[0];
      let chunkEnd = chunk[chunk.length - 1];

      for (i=chunkStart; i <= chunkEnd; i++){
        // Check if this url has been overwritten with tags yet
        let urlMaybe = tagColumnValues[i][0];
        // console.log(urlMaybe);
        if (urlMaybe.startsWith('https')){

          // Start empty volunteer tags list
          let volunteerTags = [];

          // API Pagination
          let options = getApiOptions();
          let lastRestAPIPage = false;
          let nextURL = urlMaybe;
         
          // console.log('fetching data for row:' + (i+2));
          while (!lastRestAPIPage) {

            // Pagination + First API Call
            let response = UrlFetchApp.fetch(nextURL, options);
            let json = response.getContentText(); // get the response content as text
            let taggings = JSON.parse(json); //parse text into json
            // console.log('fetched data:' + JSON.stringify(taggings))

            // Move url forward if next page exists
            nextURL = taggings['_links']?.['next']?.['href'] ?? 'last page';

            // Create array of tags for volunteer and append to county tags list
            if (taggings['total_records'] > 0) {
              taggings = taggings['_embedded']['osdi:taggings'];    
              //changed variable to j as to not interfere with the i variable in the for lop above       
              for (j=0; j<taggings.length; j++) { 
                let tagID = taggings[j]['_links']['osdi:tag']['href'].split('/tags/')[1];
                volunteerTags.push(tagLookup[tagID]);
                //check to make sure tagID is not empty in lookup table
                if(!tagLookup[tagID]){
                  console.warn("Tag found without match in lookup table. County: " + county +"Volunteer in row: "+ (i+2) +" Tag:"+ (j+1) )
                }
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
    }

    //This console log showcases the rows in the sheet that were just iterated over.
    // the end value has is one less than the start value to as to actually count the first row we put data in
    // console.log((chunkStart + 2)+" - " + (chunkStart + 1 + newTagValues.length));
    // console.log(newTagValues);

    // Finally, overwrite urls with tag lists
    let outputRange = sheet.getRange(chunkStart+2, tagColumnID+1, newTagValues.length);
    outputRange.setValues(newTagValues);
    // Clears array for next chunk
    newTagValues = [];
    }
  })
}
