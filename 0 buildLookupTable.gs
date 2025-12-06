function buildLookupTable(){

  // Grab Sheet
  // Credits: https://www.unitedstateszipcodes.org/zip-code-database/
  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)
  const sheet = ss.getSheetByName('County Lookup'); //The name of the sheet tab where you are sending the info
  const range = sheet.getDataRange();
  const values = range.getValues();
  let lookupTable = {}

  // Create dictionary {county1: [zip1, zip2], county2: [zip3, zip4]}
  for (let i = 1; i < values.length; i++) {
    
    let zip = values[i][0];
    let county = values[i][1];
    
    if (!Object.keys(lookupTable).includes(county)) {
      lookupTable[county] = [];
    }

    let zips = lookupTable[county];
    zips.push(zip);
    //if (i==values.length-1) {zips.push(999999)} // if is last zip in county, cap off sheet with ridiculously high zip code
    lookupTable[county] = zips;
  }

  return lookupTable;
}

function buildTagLookupTable(){

  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)
  const sheet = ss.getSheetByName('Tag Lookup'); //The name of the sheet tab where you are sending the info
  const range = sheet.getDataRange();
  const values = range.getValues();
  let lookupTable = {}

  // Create dictionary {tag_id: tag_name, tag_id2: tag_name}
  for (let i = 1; i < values.length; i++) {
    
    let tag_id = values[i][0];
    let tag_name = values[i][1];
    lookupTable[tag_id] = tag_name;

  }

  return lookupTable;
}

function buildConsolidatedTagTable(){
  const ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)
  const sheet = ss.getSheetByName('Consolidated Tags'); //The name of the sheet tab where you are sending the info
  const range = sheet.getDataRange();
  const values = range.getValues();
  let outputDict = {}

  // Skipping header row, hence i=1 instead of i=0
  for (let i = 1; i < values.length; i++) {
    let volunteer_id = values[i][0];
    let tags = values[i][1];
    outputDict[volunteer_id] = tags;
  }

  return outputDict;
}
