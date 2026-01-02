# Quick Start Guide - "Where Did I See This?"

**Complete setup in 10 minutes (5 mins without Supabase)**

---

## Part 1: Run Extension Locally (Required)

### Step 1: Install Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Toggle **Developer mode** ON (top-right corner)
4. Click **Load unpacked**
5. Select the `Where_did_I_see_this` folder
6. Extension icon should appear in toolbar ✓

### Step 2: Test Basic Functionality

1. **Visit some websites** (GitHub, Stack Overflow, Reddit, etc.)
2. **Click the extension icon** in toolbar
3. **Verify**: All visited pages appear in the popup
4. **Test search**: Type keywords (e.g., "github") and see results filter
5. **Click a result** to reopen that page

**Done!** Extension is working locally without cloud sync.

---

## Part 2: Setup Supabase Cloud Sync (Optional)

**Skip this section if you don't need cross-device sync or cloud backup.**

### Step 1: Create Supabase Project (2 mins)

1. Go to https://supabase.com
2. Sign up or log in
3. Click **New Project**
4. Fill in:
   - **Name**: `where-did-i-see-this`
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
5. Click **Create new project**
6. Wait ~2 minutes for setup to complete

### Step 2: Create Database Table (1 min)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy-paste this SQL:

```sql
-- Create table
CREATE TABLE page_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  last_visited TIMESTAMP WITH TIME ZONE NOT NULL,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- Create indexes
CREATE INDEX idx_user_visits ON page_history(user_id, last_visited DESC);

-- Enable Row Level Security
ALTER TABLE page_history ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can manage own history" ON page_history
  FOR ALL USING (auth.uid() = user_id);
```

4. Click **Run** (or press Ctrl+Enter)
5. Verify success message appears

### Step 3: Enable Google OAuth (2 mins)

**Get Google Credentials:**

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URI**:
   - Go to your Supabase project > Settings > API
   - Copy your **Project URL** (e.g., `https://abcxyz.supabase.co`)
   - Add this redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Replace `YOUR_PROJECT_ID` with your actual ID
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

**Configure Supabase:**

1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **Google** in the list
3. Toggle **Enable Google Provider** to ON
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

### Step 4: Get Supabase Credentials (1 min)

1. In Supabase dashboard, go to **Settings > API**
2. Copy these two values:
   - **Project URL** (e.g., `https://abcxyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Configure Extension (2 mins)

1. Open `src/config/config.js` in your code editor
2. Update these lines:

```javascript
SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
```

3. Paste your actual values (from Step 4)
4. Save the file

### Step 6: Enable Identity Permission (1 min)

1. Open `manifest.json`
2. Find the `permissions` array
3. Uncomment the `identity` line:

```json
"permissions": [
  "tabs",
  "storage",
  "identity"
],
```

4. Save the file

### Step 7: Reload Extension (30 sec)

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **Reload** icon (circular arrow)
4. Verify no errors appear

### Step 8: Add Supabase Library (1 min)

**Option A: Using CDN (Easiest)**

1. Open `src/popup/popup.html`
2. Add this line BEFORE `<script type="module" src="popup.js"></script>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

3. For the service worker, open `src/background/service-worker.js`
4. Add this line at the VERY TOP:

```javascript
importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
```

5. Save both files
6. Reload extension again

**Option B: Using NPM (Advanced)**

```bash
npm install @supabase/supabase-js
```

Then bundle with Vite/Webpack (requires build setup).

### Step 9: Test Supabase Sync (1 min)

1. **Visit some websites**
2. **Wait 5-10 seconds** (auto-sync is debounced)
3. **Check Supabase**:
   - Go to Supabase dashboard
   - Click **Table Editor** > `page_history`
   - Verify your pages appear ✓

4. **Test cross-device** (optional):
   - Install extension on another computer
   - Sign in with same Google account
   - Verify pages sync across devices

---

## Troubleshooting

### Extension not tracking pages

**Solution**:
- Check `chrome://extensions/` - extension enabled?
- Click **Inspect service worker** - any errors?
- Try reloading extension

### Search not working

**Solution**:
- Right-click popup > **Inspect**
- Check Console tab for errors
- Verify you visited some pages first

### Supabase sync not working

**Solution**:
- Verify `config.js` has correct credentials
- Check Supabase dashboard > **Logs** for errors
- Ensure Google OAuth is configured correctly
- Try signing out and back in
- Check browser console for sync errors

### "Invalid redirect URI" error

**Solution**:
- Ensure redirect URI in Google Console matches exactly:
  `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- No trailing slash, use HTTPS, match case exactly

### Extension icon missing

**Solution**:
- Create placeholder icons in `assets/icons/` folder
- Or download icons from a source like https://www.flaticon.com
- Name them: `icon16.png`, `icon48.png`, `icon128.png`

---

## Quick Reference

### View Storage Data (Debug)

Open popup, right-click > Inspect, then in Console:

```javascript
// View all data
chrome.storage.local.get(console.log)

// View page history
chrome.storage.local.get('page_history', console.log)

// Clear history
chrome.storage.local.remove('page_history')
```

### Disable Supabase Sync

1. Open `src/config/config.js`
2. Set credentials to empty strings:

```javascript
SUPABASE_URL: '',
SUPABASE_ANON_KEY: '',
```

3. Reload extension

### Keyboard Shortcuts

- **Enter** in search box → Open first result
- **Tab** → Navigate between results
- **Space/Enter** on focused result → Open page

---

## File Structure Overview

```
where-did-i-see-this/
├── manifest.json              # Extension config
├── src/
│   ├── background/
│   │   └── service-worker.js  # Tracks page visits
│   ├── popup/
│   │   ├── popup.html         # Search UI
│   │   ├── popup.css          # Styling
│   │   └── popup.js           # Search logic
│   ├── lib/
│   │   ├── storage.js         # Data persistence
│   │   ├── search.js          # Search algorithm
│   │   ├── utils.js           # Helper functions
│   │   └── supabase-client.js # Cloud sync (optional)
│   └── config/
│       └── config.js          # ⚙️ Configure Supabase here
└── assets/icons/              # Extension icons
```

---

## Next Steps

1. **Use the extension** - Browse normally for a day
2. **Test search** - Try finding pages by keywords
3. **Add icons** - Create or download proper icons for the toolbar
4. **Customize** - Modify search ranking, UI colors, etc.
5. **Deploy** - Submit to Chrome Web Store when ready

---

## Important Notes

- **Privacy**: Incognito tabs are NOT tracked
- **Local-first**: Extension works perfectly without Supabase
- **No retention limits**: Pages stored indefinitely (no automatic cleanup)
- **Sync is optional**: Enable only if you need cross-device access
- **Free tier**: Supabase free tier is sufficient for personal use

---

## Need Help?

- Check `TESTING_GUIDE.md` for comprehensive testing procedures
- Check `SUPABASE_SETUP.md` for detailed Supabase instructions
- Check `README.md` for full documentation
- Check browser console for error messages
- Verify all files are in correct locations

---

**That's it! You're ready to use "Where Did I See This?" 🎉**
