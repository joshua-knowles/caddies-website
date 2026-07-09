/**
 * Caddies contact form -> Google Sheets
 *
 * Deployment instructions: see google-apps-script/README.md in this repo.
 */

var SHEET_NAME = 'Enquiries';

var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Event Date',
  'Package Interest',
  'Venue / Location',
  'Message',
  'Preferred Contact Method',
  'Source'
];

var HOT_LEAD_COLOR = '#ffff00';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();
    var params = (e && e.parameter) || {};
    var source = params.source || 'Contact Form';

    sheet.appendRow([
      new Date(),
      params.name || '',
      params.email || '',
      params.phone || '',
      params.company || '',
      params['event-date'] || '',
      params.package || '',
      params.venue || '',
      params.details || '',
      params['contact-method'] || '',
      source
    ]);

    // Full contact form submissions are hot leads — highlight the row.
    // Calculator-gate-only submissions stay unhighlighted.
    if (source !== 'Calculator Gate') {
      var rowIndex = sheet.getLastRow();
      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setBackground(HOT_LEAD_COLOR);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Caddies contact form endpoint is live.');
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}
