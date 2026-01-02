# Supabase Cloud Sync Setup Guide

This guide explains how to enable optional cloud sync using Supabase for cross-device access and backup.

---

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. Google Cloud Console account (for OAuth credentials)
3. Basic knowledge of SQL

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Enter project details:
   - **Name**: `where-did-i-see-this` (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click **Create new project**
5. Wait for project to finish setting up (~2 minutes)

---

## Step 2: Create Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the following SQL:

```sql
-- Create page_history table
CREATE TABLE page_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  last_visited TIMESTAMP WITH TIME ZONE NOT NULL,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one URL per user
  UNIQUE(user_id, url)
);

-- Create index for fast queries
CREATE INDEX idx_user_visits ON page_history(user_id, last_visited DESC);
CREATE INDEX idx_user_domain ON page_history(user_id, domain);
CREATE INDEX idx_user_url ON page_history(user_id, url);

-- Enable Row Level Security
ALTER TABLE page_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own history"
  ON page_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own history"
  ON page_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own history"
  ON page_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own history"
  ON page_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_page_history_updated_at
  BEFORE UPDATE ON page_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** or press `Ctrl+Enter`
5. Verify success message appears

---

## Step 3: Configure Google OAuth

### 3.1 Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Choose **Application type**: Web application
7. Add **Authorized redirect URIs**:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project reference
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 3.2 Enable Google Provider in Supabase

1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **Google** in the list
3. Toggle **Enable Google Provider** to ON
4. Paste your **Client ID** and **Client Secret** from Google
5. Click **Save**

---

## Step 4: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Project API keys > anon public** (long string starting with `eyJ...`)

---

## Step 5: Configure Extension

1. Open `src/config/config.js` in your extension
2. Update the following values:

```javascript
export const CONFIG = {
  STORAGE_KEY: 'page_history',
  SYNC_ENABLED_KEY: 'sync_enabled',

  // Add your Supabase credentials here
  SUPABASE_URL: 'https://YOUR_PROJECT_REF.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',

  EXCLUDED_PATTERNS: [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^edge:/,
    /^brave:/
  ]
};
```

3. Save the file

---

## Step 6: Install Supabase JavaScript Client

You need to include the Supabase JS library in your extension.

### Option A: CDN (Recommended for quick setup)

Add to `src/popup/popup.html` before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script type="module" src="popup.js"></script>
```

Add to `src/background/service-worker.js` (top of file):

```javascript
importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
```

### Option B: NPM (For production builds)

```bash
npm install @supabase/supabase-js
```

Then bundle your extension using a tool like Vite or Webpack.

---

## Step 7: Update Manifest Permissions

1. Open `manifest.json`
2. Uncomment the `identity` permission:

```json
"permissions": [
  "tabs",
  "storage",
  "identity"
],
```

3. Add host permissions for Supabase:

```json
"host_permissions": [
  "http://*/*",
  "https://*/*",
  "https://*.supabase.co/*"
],
```

---

## Step 8: Reload Extension

1. Go to `chrome://extensions/`
2. Click the **Reload** button on your extension
3. Open the extension popup
4. You should now see sync options (if implemented in UI)

---

## Testing the Sync

1. **Sign In**: Click "Sign in with Google" in extension settings
2. **Visit some pages**: Browse a few websites
3. **Check Supabase**: Go to Supabase dashboard > Table Editor > `page_history`
4. **Verify data**: You should see your browsing history synced
5. **Test cross-device**: Install extension on another device, sign in, and verify data appears

---

## Troubleshooting

### Sync not working

1. Check browser console for errors
2. Verify Supabase credentials in `config.js`
3. Check Supabase dashboard > Logs for errors
4. Ensure RLS policies are correctly set
5. Verify Google OAuth is properly configured

### Authentication errors

1. Check that `identity` permission is enabled in manifest
2. Verify redirect URLs match in Google Console and Supabase
3. Try signing out and back in
4. Clear extension data and retry

### Data not appearing

1. Check that user is authenticated (`getCurrentUser()`)
2. Verify sync is enabled in extension settings
3. Check network tab for failed API calls
4. Look at Supabase logs for INSERT/UPSERT errors

---

## Security Notes

- **Row Level Security (RLS)** ensures users can only access their own data
- **Anon key** is safe to expose in client-side code
- **Never commit** your Supabase credentials to public repositories
- Use **environment variables** for production deployments

---

## Data Privacy

- Sync is **opt-in** and disabled by default
- Local storage remains the source of truth
- Sync failures never block local functionality
- Users can disable sync and delete cloud data anytime

---

## Costs

- **Supabase Free Tier** includes:
  - 500MB database space
  - 2GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth

This is more than sufficient for personal use and small user bases.

---

## Future Enhancements

- [ ] Add sync status indicator in popup
- [ ] Manual sync button
- [ ] Conflict resolution (when same URL edited on multiple devices)
- [ ] Selective sync (choose which domains to sync)
- [ ] Export/import functionality
