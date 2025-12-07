# Whole Washington Synced Google Sheets
An attempt at automating volunteer categorization by county in Google Sheets

# How to set up from scratch
## Manual stuff that needs to be manually updated once every few months
1. In a brand new Google Sheets document, name the first sheet 'County Lookup' (Not the entire spreadsheet, just the sheet in the bottom left)
2. Download the free .csv file from here (no email signup needed): https://www.unitedstateszipcodes.org/zip-code-database/
3. Copy/paste just the zip code and county columns from the .csv into County Lookup, naming the columns "zip" and "county"
4. Sort 'County Lookup' by the county column, so the zip codes are grouped by county

## Copy code over from this repo
1. Then navigate to Extensions > Apps Script
2. You'll start with a blank file called "Code.gs" with some example code.  Ignore it or delete it
3. Repeat for each file in this repo (take `0 apiAuth.gs` for example):
  1. Click "+" to create a new ".gs" file and name it `0 apiAuth`
  2. Copy/paste the contents of "0 apiAuth.gs" over the example code

# How to schedule once set up
1. In the left-hand toolbar, click the Stopwatch icon to navigate to the Triggers page
2. The following Stages must not run at the same time and must be run in the following order:

## Stage 1: Sheet clearing / creation
- createSheets()

## Stage 2: Volunteer importing (with placeholder urls for tags), Tag dictionary
- pullTags()
- adams()
- asotin()
- benton()
- chelan()
- clallam()
- clark()
- columbia()
- cowlitz()
- douglas()
- ferry()
- franklin()
- garfield()
- grant()
- grays()
- island()
- jefferson()
- king()
- king()  <-- schedule this one to run at least 4 times, in sequence not in parallel
- kitsap()
- kittitas()
- klickitat()
- lewis()
- lincoln()
- mason()
- okanogan()
- pacific()
- pend()
- pierce()
- pullTags()
- sanJuan()
- skagit()
- skamania()
- snohomish()
- spokane()
- stevens()
- thurston()
- wahkiakum()
- walla()
- whatcom()
- whitman()
- yakima()

## Stage 3: Populating tags (currently timing out on King County, needs adjustments), fixing formatting
- populateTags()
- updateFormats()

## Stage 4: Create Filters
- createFilters()
