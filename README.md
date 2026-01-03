# Where Did I See This?

A lightweight Chrome extension that enables **memory-based recall** of previously visited webpages using keyword search.

## The Problem

You remember reading an interesting article, viewing a dashboard, or seeing a GitHub repo, but you can't recall **where** or **when** you saw it. Browser History is time-based and inefficient when you only remember the topic or idea.

## The Solution

**Where Did I See This?** answers: *"Where did I see that thing?"*

Instead of scrolling through chronological history, simply search by keyword and instantly find pages you've visited before.

---

## Features

- **Automatic Page Tracking**: Captures title, URL, domain, and visit metadata for every page you visit
- **Fast Keyword Search**: Search across page titles and domains with instant results
- **Smart Ranking**: Results ranked by relevance (title match > domain match > recency)
- **One-Click Reopen**: Click any result to open the page in a new tab
- **Local-First**: All data stored locally in your browser for privacy and speed
- **Google Sheets Sync**: Optional cloud backup to your personal Google Sheet

---

## Quick Start

### 1. Load Extension in Chrome

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the extension folder
6. **Copy the Extension ID** (you'll need it for Google Sheets setup)

### 2. Start Using Locally

That's it! The extension works immediately:
- Visit some websites
- Click the extension icon
- Search for keywords from pages you visited
- Click results to reopen pages

---

## Google Sheets Setup (Optional)

Enable cloud sync to back up your browsing history to Google Sheets.

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Create new project: **"Where Did I See This"**
3. Wait for project creation

### Step 2: Enable APIs

1. Go to: **☰ Menu** → **APIs & Services** → **Library**
2. Search and enable: **Google Sheets API**
3. Search and enable: **Google Drive API**

### Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Select **"External"** → **Create**
3. Fill in:
   - App name: `Where Did I See This`
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue** through all steps
5. **Important:** Add your email as a **Test User**:
   - In "Test users" section → **+ ADD USERS**
   - Enter your email → **Add** → **Save**

### Step 4: Create OAuth Client

1. Go to: **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select: **Chrome extension**
4. Name: `Where Did I See This Extension`
5. **Item ID:** Paste your Extension ID (from Step 1)
6. Click **Create**
7. **Copy the Client ID** (format: `xxx-xxx.apps.googleusercontent.com`)

### Step 5: Update Extension

1. Open `manifest.json` in your code editor
2. Find line 14: `"client_id": "YOUR_CLIENT_ID..."`
3. Replace with your actual Client ID
4. Save the file
5. Go to `chrome://extensions/` and click the **reload icon** on the extension

### Step 6: Test Sync

1. Click the extension icon
2. Click **"🔐 Sign In"**
3. Authorize with your Google account
4. Visit some websites
5. Click **"🔄 Sync"**
6. Click **"Yes"** to open your Google Sheet
7. See your browsing data synced!

**Sheet name format:** `{your_username}_wheredidisee`

---

## How It Works

### Page Tracking
- Background service worker tracks page visits automatically
- Stores: Title, URL, Domain, Last Visited, Visit Count
- Local storage using `chrome.storage.local` (fast & private)
- Deduplicates URLs (increments visit count on repeat visits)

### Search & Recall
- Type keywords to search across titles and domains
- Results ranked by:
  1. Exact or partial title match
  2. Domain match
  3. Most recently visited
- Click any result to reopen the page in a new tab

### Google Sheets Sync (Optional)
- One-click sync to your personal Google Sheet
- Sheet auto-created with your username
- Columns: Title, URL, Domain, Last Visited, Visit Count
- Clears and refreshes data on each sync (no duplicates)
- Only you can access your sheet (stored in your Google Drive)

---

## Privacy & Security

- **Local-First**: All data stored locally by default
- **Opt-in Sync**: Google Sheets sync is completely optional
- **No Tracking**: We don't track your usage or collect analytics
- **User-Owned Data**: Your data stays in your Google Drive
- **Minimal Permissions**: Only requests necessary Chrome permissions

### What We Don't Track
- Incognito/private browsing sessions
- `chrome://` internal pages
- Non-HTTP/HTTPS URLs

---

## Troubleshooting

### Extension Not Tracking Pages
- Check extension is enabled in `chrome://extensions/`
- Verify you're visiting http/https pages (not chrome:// pages)
- Reload the extension

### Sign In Error: "Access blocked" or "403: access_denied"
**Solution:** Add your email as a Test User in OAuth consent screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Scroll to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Enter your email → **Add** → **Save**
5. Try signing in again

### Failed to Create Sheet
- Check **Google Drive API** is enabled
- Check you allowed all permissions during sign-in
- Try signing out and signing in again

### Extension ID Mismatch
- Update the **Item ID** in OAuth client with your actual Extension ID
- Reload the extension after updating manifest.json

---

## Project Structure

```
where-did-i-see-this/
├── manifest.json              # Chrome extension configuration
├── README.md                  # This file
├── src/
│   ├── background/
│   │   └── service-worker.js  # Tracks page visits
│   ├── popup/
│   │   ├── popup.html         # Search UI
│   │   ├── popup.css          # Styling
│   │   └── popup.js           # Search logic & rendering
│   ├── lib/
│   │   ├── storage.js         # Local storage wrapper
│   │   ├── search.js          # Search algorithm
│   │   ├── google-sheets-client.js # Google Sheets integration
│   │   └── utils.js           # Helper functions
│   └── config/
│       └── config.js          # Configuration constants
└── assets/
    └── icons/                 # Extension icons (16, 48, 128)
```

---

## Tech Stack

- **Extension:** Chrome Manifest V3
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Local Storage:** chrome.storage.local
- **Cloud Sync:** Google Sheets API + Google Drive API
- **Authentication:** Google OAuth (chrome.identity)

---

## Usage Tips

- **Search by topic**, not by date
- Use **domain names** to filter results (e.g., "github", "stackoverflow")
- Leave search **empty** to see all recent pages
- Pages with **more visits** rank higher in results

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Repository

https://github.com/unaveenj/Where-Did-I-See-This

---

Built to solve a real productivity gap left by traditional browser history tools.
