function populateTags(){
  
  // Grab Google Sheet file
  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)  // Grab Counties
  const countyLookupTable = buildLookupTable();
  const counties = Object.keys(countyLookupTable);  // Grab Consolidated Tags
  const tagLookupTable = buildConsolidatedTagTable();  // Populate tags, one county sheet at a time
  
  counties.forEach((county) => {    // Output list of tags
    let outputArray = [];
    
    // Grab sheet
    const sheet = ss.getSheetByName(county); //The name of the sheet tab where you are sending the info

    // Skip sheet if empty
    if (sheet.getLastRow() <= 2) {
      console.log(county + 'is empty');
      return;
    }

    // Grab sheet contents
    const range = sheet.getDataRange();
    const values = range.getValues();
    const volunteer_id_column = values[0].indexOf('volunteer_id');
    const tagColumnID = values[0].indexOf('tags');
    let tagColumnRange = sheet.getRange(2, tagColumnID+1, values.length - 2); // getRange(row, column, numRows, numColumns)
    let tagColumnValues = tagColumnRange.getValues();
    let newTagValues = [];

    // Check if whole sheet can be skipped
    if (tagColumnValues[tagColumnValues.length-1][0].length > 0) {
      console.warn(county + ' has already been tagged');
      return;
    }

    // Skipping header row, hence i=1 instead of i=0    
    for (let i = 1; i < values.length; i++) {
      let volunteer_id = values[i][volunteer_id_column];
      let tags = tagLookupTable[volunteer_id];
      outputArray.push([tags]);
    }
    
    // Dump outputArray in tags column
    // Need to add 1 to tagColumnID because row and column numbers start at 1, not 0
    const outputRange = sheet.getRange(2, tagColumnID+1, values.length - 1); // getRange(row, column, numRows, numColumns)
    outputRange.setValues(outputArray);
  });
}