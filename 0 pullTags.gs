function pullTags() {

  // Authentication: Action Network
  const url_root = 'https://actionnetwork.org/api/v2/tags';
  const options = getApiOptions();

  // Grab sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tag Lookup');

  // API Pagination
  let lastRestAPIPage = false;
  let nextURL = url_root;

  // Output dict
  let outputDict = {};
  let outputArray = []

  // Make and process API calls
  while (!lastRestAPIPage) {

    // Pagination + First API Call
    let response = UrlFetchApp.fetch(nextURL, options);
    let json = response.getContentText(); // get the response content as text
    let tags = JSON.parse(json); //parse text into json
    let [tag_id, tag_name] = ['', ''];

    // Move url forward if next page exists
    nextURL = tags['_links']?.['next']?.['href'] ?? 'last page';

    //console.log(tags['_embedded']['osdi:tags']);

    
    // Loop through tags
    tags['_embedded']['osdi:tags'].forEach((tag) => {

      // Extract tag details
      tag_id = tag['identifiers'][0].split(':')[1];
      tag_name = tag['name'];
      console.log(tag_id, tag_name);
      outputDict[tag_id] = tag_name;
    })

      // Check for last page
      lastRestAPIPage = nextURL === 'last page';
    }

  // Sort array
  arraySort = Object.keys(outputDict).sort()
  arraySort.forEach((tag_id) => {
    outputArray.push([tag_id, outputDict[tag_id]])
  })

  // Write output array to sheet
  if (outputArray.length > 0) {
    let outputHeight = outputArray.length;
    let outputWidth = outputArray[0].length;
    let targetRange = sheet.getRange(2, 1, outputHeight, outputWidth); //row, column, row column
    targetRange.setValues(outputArray);
  }

}
