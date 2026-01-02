# Google Sheets Setup Guide

**Much simpler than Supabase!** No database setup needed - just Google OAuth.

---

## Step 1: Get Extension ID First (1 min)

### 1.1 Temporarily Add Placeholder to manifest.json
1. Open `manifest.json`
2. Find line 14: `"client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com"`
3. Keep it as is (we'll update later)

### 1.2 Load Extension to Get ID
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select your extension folder: `Where_did_I_see_this`
5. **Copy the Extension ID** (long string under extension name)
   - Example: `abcdefghijklmnopqrstuvwxyz123456`
6. **Save this ID** - you need it in next step!

---

## Step 2: Create Google Cloud Project (5 mins)

### 2.1 Go to Google Cloud Console
https://console.cloud.google.com

### 2.2 Create Project
- Click project dropdown (top bar)
- Click **New Project**
- Name: `Where Did I See This`
- Click **Create**
- Wait for project creation (~30 seconds)

### 2.3 Enable APIs
1. Click **☰ Menu** > **APIs & Services** > **Library**
2. Search for **Google Sheets API**
   - Click on it
   - Click **Enable**
   - Wait for "API enabled" message
3. Click **Library** again
4. Search for **Google Drive API**
   - Click on it
   - Click **Enable**

---

## Step 3: Configure OAuth Consent Screen (3 mins)

### 3.1 Set Up Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External**
3. Click **Create**

### 3.2 Fill App Information
- **App name**: `Where Did I See This`
- **User support email**: Select your email
- **Developer contact email**: Your email
- Click **Save and Continue**

### 3.3 Scopes
- Click **Save and Continue** (no need to add scopes manually)

### 3.4 Test Users
- Click **+ Add Users**
- Add your email address
- Click **Add**
- Click **Save and Continue**

---

## Step 4: Create OAuth Client ID (2 mins)

### 4.1 Create Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials**
3. Select **OAuth client ID**

### 4.2 Configure OAuth Client
- **Application type**: Select **Chrome extension**
- **Name**: `Where Did I See This Extension`
- **Item ID**: **Paste your Extension ID** (from Step 1.2)
- Click **Create**

### 4.3 Copy Client ID
- A popup shows your Client ID
- **Copy the entire Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
- Click **OK**

---

## Step 5: Update Extension with Client ID (1 min)

### 5.1 Add Client ID to manifest.json
1. Open `manifest.json` in your code editor
2. Find line 14:
   ```json
   "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com"
   ```
3. Replace with your actual Client ID:
   ```json
   "client_id": "123456789-abc.apps.googleusercontent.com"
   ```
4. **Save the file**

### 5.2 Reload Extension
1. Go back to `chrome://extensions/`
2. Find your extension
3. Click the **reload icon** (circular arrow)
4. No errors should appear

---

## Step 6: Test Sync

### 6.1 Open Extension
```
chrome://extensions/ → Click reload
```

### 6.2 Sign In
```
1. Click extension icon
2. Click "🔐 Sign In" button
3. Google popup appears
4. Select your account
5. Allow permissions
6. Button changes to "✓ Signed In"
```

### 6.3 Sync to Google Sheets
```
1. Visit some websites
2. Click "🔄 Sync" button
3. Popup asks "Open Google Sheet?"
4. Click OK
5. See your data in Google Sheets!
```

---

## How It Works

### Automatic Sheet Creation
- First sync creates a sheet named: `{your_username}_wheredidisee`
- Example: `john_wheredidisee`
- Sheet has columns: Title, URL, Domain, Last Visited, Visit Count

### Subsequent Syncs
- Finds existing sheet by name
- Clears old data
- Writes fresh snapshot of all pages
- No duplicates

### Data Format
```
Title           | URL                    | Domain         | Last Visited          | Visit Count
GitHub Homepage | https://github.com     | github.com     | 2024-01-03T10:30:00Z | 5
Stack Overflow  | https://stackoverflow  | stackoverflow  | 2024-01-03T09:15:00Z | 3
```

---

## Advantages Over Supabase

✓ **No database setup** - just OAuth
✓ **No SQL required** - automated sheet creation
✓ **Easy to view** - open in Google Sheets anytime
✓ **Export friendly** - download as CSV/Excel instantly
✓ **Share easily** - share sheet with others if needed
✓ **No costs** - completely free
✓ **Familiar** - everyone knows Google Sheets

---

## Troubleshooting

### "Auth error" when signing in
**Fix**: Make sure you added your email as a test user in OAuth consent screen

### "Failed to create sheet"
**Fix**: Check that Google Drive API is enabled

### Extension ID mismatch
**Fix**: Update the Item ID in Google Cloud Console with your actual extension ID

---

## Privacy

- Each user gets their own private sheet
- Sheet is in their Google Drive
- Only they can access it
- Can delete anytime

---

**Much simpler than Supabase!** 🎉
