# Where Did I See This?

A lightweight Chrome extension that enables **memory-based recall** of previously visited webpages using keyword search.

## The Problem

You remember reading an interesting article, viewing a dashboard, or seeing a GitHub repo, but you can't recall **where** or **when** you saw it. Browser History is time-based and inefficient when you only remember the topic or idea.

## The Solution

**Where Did I See This?** answers: *"Where did I see that thing?"*

Instead of scrolling through chronological history, simply search by keyword and instantly find pages you've visited before.

---

## Key Features

### Core Functionality (MVP)
- **Automatic Page Tracking**: Captures title, URL, domain, and visit metadata for every page you visit
- **Fast Keyword Search**: Search across page titles and domains with instant results
- **Smart Ranking**: Results ranked by relevance (title match > domain match > recency)
- **One-Click Reopen**: Click any result to open the page in a new tab
- **Local-First**: All data stored locally in your browser for privacy and speed

### Optional Cloud Sync (Supabase)
- **Cross-Device Access**: Sync your browsing history across multiple computers
- **Cloud Backup**: Never lose your history data
- **Google OAuth**: Secure authentication
- **Opt-in**: Cloud sync is completely optional; works perfectly offline

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | Chrome Manifest V3 |
| Frontend | Vanilla JavaScript, HTML, CSS |
| Local Storage | chrome.storage.local |
| Cloud Sync | Supabase (Postgres + Auth) |
| Authentication | Google OAuth via Supabase |

---

## Project Structure

```
where-did-i-see-this/
├── manifest.json              # Chrome extension manifest (V3)
├── README.md                  # This file
├── IMPLEMENTATION_STEPS.md    # Detailed development roadmap
├── src/
│   ├── background/
│   │   └── service-worker.js  # Tracks page visits
│   ├── popup/
│   │   ├── popup.html         # Search UI
│   │   ├── popup.css          # Styling
│   │   └── popup.js           # Search logic & rendering
│   ├── lib/
│   │   ├── storage.js         # chrome.storage.local wrapper
│   │   ├── search.js          # Search algorithm
│   │   ├── supabase-client.js # Supabase integration (optional)
│   │   └── utils.js           # Helper functions
│   └── config/
│       └── config.js          # Configuration constants
├── assets/
│   └── icons/                 # Extension icons (16, 48, 128)
└── docs/
    └── IMPLEMENTATION_STEPS.md
```

---

## How It Works

### 1. **Page Tracking**
- The background service worker listens to tab events (`chrome.tabs.onUpdated`)
- When you visit a page, it extracts:
  - **Title**: Page title (fallback to URL if missing)
  - **URL**: Full page URL
  - **Domain**: Extracted domain (e.g., `github.com`)
  - **Last Visited**: Timestamp
  - **Visit Count**: Increments on repeat visits
- Data is stored locally using `chrome.storage.local`

### 2. **Search & Recall**
- Click the extension icon to open the popup
- Type keywords to search across titles and domains
- Results are ranked by:
  1. Exact or partial title match
  2. Domain match
  3. Most recently visited
- Click any result to reopen the page

### 3. **Cloud Sync (Optional)**
- Enable sync to backup data to Supabase
- Sign in with Google OAuth
- Data syncs in the background without blocking local operations
- Access your history from any device

---

## Getting Started

### Prerequisites
- Google Chrome (or Chromium-based browser)
- Node.js (for development tools, optional)
- Supabase account (only if enabling cloud sync)

### Installation for Development

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/where-did-i-see-this.git
cd where-did-i-see-this
```

#### 2. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `where-did-i-see-this` folder
5. The extension should now appear in your toolbar

#### 3. Test the Extension
1. Visit some websites
2. Click the extension icon
3. Search for keywords from pages you visited
4. Click results to reopen pages

---

## Configuration

### Local-Only Mode (Default)
No configuration needed! The extension works out of the box using local storage.

### Enable Cloud Sync (Optional)

#### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Note your **Project URL** and **Anon Public Key**

#### Step 2: Set Up Database
Run this SQL in the Supabase SQL Editor:

```sql
-- Create page_history table
CREATE TABLE page_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  domain TEXT,
  last_visited TIMESTAMP,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- Create index for performance
CREATE INDEX idx_user_visits ON page_history(user_id, last_visited DESC);

-- Enable Row Level Security
ALTER TABLE page_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can manage their own history"
  ON page_history
  FOR ALL
  USING (auth.uid() = user_id);
```

#### Step 3: Enable Google OAuth
1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your extension ID to **Authorized Redirect URLs**:
   ```
   https://<your-extension-id>.chromiumapp.org/
   ```

#### Step 4: Update Extension Config
Edit `src/config/config.js`:

```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

#### Step 5: Reload Extension
1. Go to `chrome://extensions/`
2. Click the **Reload** button on your extension
3. Open the popup and enable sync

---

## Privacy & Security

- **Local-First**: All data is stored locally by default
- **Opt-in Sync**: Cloud sync is completely optional
- **No Tracking**: We don't track your usage or collect analytics
- **User-Owned Data**: You control your data; delete anytime
- **Minimal Permissions**: Only requests necessary Chrome permissions
- **Secure Auth**: OAuth handled by Supabase (no passwords stored)

### What We Don't Track
- Incognito/private browsing sessions
- `chrome://` internal pages
- Non-HTTP/HTTPS URLs

---

## Development Roadmap

See [IMPLEMENTATION_STEPS.md](./IMPLEMENTATION_STEPS.md) for detailed development phases.

### Current Status
- [x] PRD finalized
- [x] Project structure created
- [ ] Core tracking implementation
- [ ] Search & popup UI
- [ ] Supabase integration
- [ ] Testing & deployment

---

## Usage Guide

### Searching for Pages
- **Keyword Search**: Type any word from the page title or domain
- **Multiple Words**: Searches for pages containing all words
- **Case-Insensitive**: Search is not case-sensitive

### Managing History
- **View All**: Leave search empty to see recent pages
- **Clear History**: (Future feature) Clear all tracked pages

### Tips
- Search by topic, not by date
- Use domain names to filter results (e.g., "github", "stackoverflow")
- More visits = higher ranking in results

---

## Troubleshooting

### Extension Not Tracking Pages
- Check that the extension is enabled in `chrome://extensions/`
- Verify you're visiting http/https pages (not chrome:// pages)
- Reload the extension and try again

### Search Not Working
- Open Developer Console in popup (`Inspect` on popup)
- Check for JavaScript errors
- Verify data exists in storage (use `chrome.storage.local.get()` in console)

### Sync Not Working
- Verify Supabase credentials in `config.js`
- Check internet connection
- Ensure you're signed in with Google OAuth
- Check Supabase logs for errors

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/where-did-i-see-this/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/yourusername/where-did-i-see-this/discussions)

---

## Acknowledgments

Built to solve a real productivity gap left by traditional browser history tools.

**Keywords**: Chrome extension, browser history, search, recall, memory-based navigation, productivity, Supabase, local-first
