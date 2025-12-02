function createFilters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  //once for each county
  const lookupTable = buildLookupTable();
  const counties = Object.keys(lookupTable);

  counties.forEach((county) => {
    sheet = ss.getSheetByName(county);
    const columns = sheet.getLastColumn();
    const filterRange = sheet.getRange(1, 1, 1, columns); // getRange(row, column, numRows, numColumns)

    // Using try/catch in case sheet already has a filter.
    // Will error out and stop walking through sheets without try/catch
    try {
      filterRange.createFilter();;
    } catch (error) {
    }
  })
};
