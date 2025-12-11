// Reinstated as of 12.10.2025

// As of 12.01.2025 - Typically takes four runs to finish populating the entire sheet
function pullTaggings() {

  // Authentication: Action Network
  const url_prefix = 'https://actionnetwork.org/api/v2/tags/';
  const url_suffix = '/taggings';
  const options = getApiOptions();

  // Grab tag and tagging sheets
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tagging Lookup');

  // Grab tags
  const tags = buildTagLookupTable();

  // Populate output table
  for (const [tag_id, tag_name] of Object.entries(tags)) {

    // Find latest row of data, figure out last tag_id
    let lastRow = sheet.getLastRow(); //INT
    let lastTag = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : '';
  
    if (tag_id > lastTag){

      // Output array
      let taggingsArray = [];

      // API Pagination
      let lastRestAPIPage = false;
      let nextURL = url_prefix + tag_id + url_suffix;

      while (!lastRestAPIPage) {

        // Pagination + First API Call
        let response = UrlFetchApp.fetch(nextURL, options);
        let json = response.getContentText(); // get the response content as text
        let taggings = JSON.parse(json); //parse text into json

        // Move url forward if next page exists
        nextURL = taggings['_links']?.['next']?.['href'] ?? 'last page';

        taggings['_embedded']['osdi:taggings'].forEach((tagging) => {
          volunteer_id = tagging['_links']['osdi:person']['href'].split('people/')[1];
          taggingsArray.push([tag_id, tag_name, volunteer_id]);
        });

        // Check for last page
        lastRestAPIPage = nextURL === 'last page';
      }

      if (taggingsArray.length > 0) {
        let outputHeight = taggingsArray.length;
        let outputWidth = taggingsArray[0].length;
        let targetRange = sheet.getRange(lastRow + 1, 1, outputHeight, outputWidth); //row, column, row column
        targetRange.setValues(taggingsArray);
      }
      
    }
  }
}
