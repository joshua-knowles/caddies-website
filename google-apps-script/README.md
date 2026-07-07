# Contact form → Google Sheets

Deploys the Caddies contact form to write submissions into a Google Sheet via a
Google Apps Script web app.

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like **Caddies Enquiries**.
3. Leave it empty — the script creates an `Enquiries` tab and header row automatically on first submission.

## 2. Add the Apps Script

1. In the spreadsheet, go to **Extensions → Apps Script**.
2. Delete any starter code in `Code.gs`.
3. Copy the contents of [`Code.gs`](Code.gs) from this folder and paste it in.
4. Click the disk icon (or `Ctrl+S` / `Cmd+S`) to save. Give the project a name, e.g. "Caddies Contact Form", if prompted.

## 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `Contact form endpoint` (or anything you like)
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`

   > "Anyone" is required so the public contact form can reach the endpoint. It does **not** expose your Sheet — only this specific script, which only accepts new rows.
4. Click **Deploy**.
5. Authorize the script when prompted:
   - Click **Authorize access**.
   - Choose your Google account.
   - You'll likely see an "unverified app" warning — click **Advanced → Go to [project name] (unsafe)**. This is expected for personal Apps Script projects that haven't gone through Google's verification review; it's still your own script running under your own account.
   - Click **Allow**.
6. Copy the **Web app URL** shown after deployment. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Connect it to the site

1. Open [`js/main.js`](../js/main.js) in this repo.
2. Find this line near the top:
   ```js
   var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
   ```
3. Replace the placeholder URL with the Web app URL you copied in step 3.6.
4. Save, commit, and deploy/push the site.

## 5. Test it

1. Open `contact.html` on the live site (or locally).
2. Fill out the form and submit.
3. Check the Google Sheet — a new `Enquiries` tab should appear with a header row and your test submission.

## Updating the script later

If you edit `Code.gs` after the initial deployment, the live URL won't pick up
changes automatically. Go to **Deploy → Manage deployments**, click the pencil/edit
icon on the active deployment, and under **Version** choose **New version**, then
click **Deploy**. The existing web app URL stays the same — no need to update
`main.js` again.
