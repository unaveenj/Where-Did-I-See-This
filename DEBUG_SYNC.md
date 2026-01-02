# Debugging Supabase Sync Failure

## Step 1: Check Browser Console for Errors

1. **Open extension popup**
2. **Right-click** on popup → **Inspect**
3. **Go to Console tab**
4. **Click the Sync button**
5. **Look for red error messages**

Common errors and solutions below.

---

## Step 2: Check if Signed In

**Important**: You need to sign in with Google OAuth first!

The extension currently doesn't have a sign-in UI yet. Let me check if we need to add that.

---

## Step 3: Verify Supabase Setup

### Check 1: Table Exists
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Look for `page_history` table
4. If missing, run the SQL from QUICKSTART.md

### Check 2: RLS Policies
1. In Table Editor, click `page_history` table
2. Look for shield icon (RLS enabled)
3. Should show policies for INSERT, SELECT, UPDATE, DELETE

### Check 3: Google OAuth Enabled
1. Go to **Authentication** → **Providers**
2. Check if **Google** is enabled
3. Verify redirect URL is correct

---

## Step 4: Test Supabase Connection

Open browser console and run:

```javascript
// Test if Supabase library is loaded
console.log(typeof supabase);  // Should be 'function'

// Test configuration
chrome.storage.local.get(['page_history'], console.log);
```

---

## Common Issues

### Issue 1: "User not authenticated"
**Solution**: Need to add Google sign-in button

### Issue 2: "Row Level Security policy violation"
**Solution**: Check RLS policies allow user to insert

### Issue 3: "supabase is not defined"
**Solution**: Supabase library not loading properly

### Issue 4: "Invalid API key"
**Solution**: Check credentials in config.js

---

## Quick Fix: Test Without Auth

Temporarily disable RLS to test:

```sql
-- In Supabase SQL Editor
ALTER TABLE page_history DISABLE ROW LEVEL SECURITY;
```

**Warning**: Re-enable after testing!

---

Tell me what error you see in the console and I'll help fix it.
