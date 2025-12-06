// Deleted as of 12.6.2025

function consolidateTaggings(){

  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)
  const sheet = ss.getSheetByName('Tagging Lookup'); //The name of the sheet tab where you are sending the info
  const range = sheet.getDataRange();
  const values = range.getValues();
  let lookupTable = {}
  let outputArray = []
  const outputSheet = ss.getSheetByName('Consolidated Tags');  


  // Create dictionary {volunteer_id: tag_name1, tag_name2, volunteer_id2: tag_name1, tag_name2}
  for (let i = 1; i < values.length; i++) {
    
    let tag_name = values[i][1];
    let volunteer_id = values[i][2];
    
    if (!Object.keys(lookupTable).includes(volunteer_id)) {
      lookupTable[volunteer_id] = [];
    }

    let tags = lookupTable[volunteer_id];
    tags.push(tag_name);
    lookupTable[volunteer_id] = tags;

  }

  // Flatten dictionary
  for (const [volunteer_id, tags] of Object.entries(lookupTable)) {
    outputArray.push([volunteer_id, tags.join(', ')]);
  }

  // Write to spreadsheet
  if (outputArray.length > 0) {
    let outputHeight = outputArray.length;
    let outputWidth = outputArray[0].length;
    let targetRange = outputSheet.getRange(2, 1, outputHeight, outputWidth); //row, column, row column
    targetRange.setValues(outputArray);
  }
}
