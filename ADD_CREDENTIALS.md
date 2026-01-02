# Add Your Supabase Credentials

## Last Step: Update Config File

Open `src/config/config.js` and replace the empty strings with your Supabase credentials:

### Before:
```javascript
SUPABASE_URL: '',
SUPABASE_ANON_KEY: '',
```

### After:
```javascript
SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
```

---

## Where to Find Your Credentials

### 1. Get Supabase URL and Key

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon in sidebar)
3. Click **API** section
4. Copy these two values:
   - **Project URL** → paste into `SUPABASE_URL`
   - **anon public** key → paste into `SUPABASE_ANON_KEY`

### 2. Example

If your Project URL is: `https://abcxyz123.supabase.co`
And your anon key is: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY3h5ejEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.1234567890abcdefghijklmnopqrstuvwxyz`

Then your config should look like:

```javascript
export const CONFIG = {
  STORAGE_KEY: 'page_history',
  SYNC_ENABLED_KEY: 'sync_enabled',

  SUPABASE_URL: 'https://abcxyz123.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY3h5ejEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjIwMTU1NzU5OTl9.1234567890abcdefghijklmnopqrstuvwxyz',

  EXCLUDED_PATTERNS: [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^edge:/,
    /^brave:/
  ]
};
```

---

## Quick Commands

### Open config file:
```powershell
notepad src\config\config.js
```

### After updating, reload extension:
1. Go to `chrome://extensions/`
2. Find "Where Did I See This?"
3. Click reload icon (circular arrow)

---

**Once updated, your extension will be fully ready with cloud sync!**
