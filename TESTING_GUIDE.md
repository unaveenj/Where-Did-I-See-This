# Testing Guide for "Where Did I See This?"

This guide covers manual testing procedures to verify the extension works correctly before deployment.

---

## Prerequisites

- Google Chrome (or Chromium-based browser)
- Extension loaded in developer mode
- Basic knowledge of Chrome DevTools

---

## Installation for Testing

### 1. Load Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the project root folder
5. Verify extension appears with no errors
6. Note the extension ID (you'll need this for debugging)

### 2. Verify Manifest

- Check that extension icon appears in toolbar
- Click icon to verify popup opens
- Check for any console errors in popup (right-click popup > Inspect)

---

## Phase 1: Core Functionality Tests

### Test 1.1: Page Tracking

**Goal**: Verify pages are tracked correctly

**Steps**:
1. Visit 3-5 different websites (e.g., github.com, stackoverflow.com, reddit.com)
2. Wait for each page to fully load
3. Click extension icon
4. Verify all visited pages appear in the list

**Expected**:
- All pages show correct titles
- Domains are extracted properly
- "Last seen" shows "just now" or "X minutes ago"

**Debug**:
- Open `chrome://extensions/` > Extension details > Inspect service worker
- Check console for tracking logs
- Verify storage: Run `chrome.storage.local.get('page_history', console.log)` in console

### Test 1.2: Deduplication

**Goal**: Verify duplicate visits increment count

**Steps**:
1. Visit the same page twice (e.g., google.com)
2. Open popup
3. Check if page appears only once

**Expected**:
- Only one entry for the URL
- Visit count incremented (check storage)
- "Last seen" updated to most recent visit

### Test 1.3: Excluded URLs

**Goal**: Verify chrome:// and other excluded pages are NOT tracked

**Steps**:
1. Visit `chrome://extensions/`
2. Visit `chrome://settings/`
3. Open popup
4. Verify these pages don't appear

**Expected**:
- No chrome:// pages in history
- Extension-only pages filtered out

### Test 1.4: Incognito Mode

**Goal**: Verify incognito tabs are NOT tracked

**Steps**:
1. Open incognito window (Ctrl+Shift+N)
2. Visit several websites
3. Close incognito window
4. Open popup in normal window
5. Verify incognito pages are NOT in history

**Expected**:
- Incognito visits completely ignored
- Privacy preserved

---

## Phase 2: Search Functionality Tests

### Test 2.1: Keyword Search

**Goal**: Verify search finds pages by title

**Steps**:
1. Visit pages with distinct titles:
   - GitHub homepage
   - Stack Overflow question
   - Reddit post
2. Open popup
3. Search for "github"
4. Verify GitHub page appears

**Expected**:
- Search is case-insensitive
- Partial matches work ("git" finds "GitHub")
- Results update as you type

### Test 2.2: Domain Search

**Goal**: Verify search works for domains

**Steps**:
1. Visit multiple Stack Overflow pages
2. Search for "stackoverflow"
3. Verify all SO pages appear

**Expected**:
- All pages from that domain listed
- Ranked by relevance and recency

### Test 2.3: Empty Search

**Goal**: Verify empty search shows all pages

**Steps**:
1. Visit 10+ pages
2. Open popup
3. Clear search box (if anything typed)
4. Verify all pages listed by recency

**Expected**:
- Most recent pages at top
- All tracked pages visible
- Correct count displayed

### Test 2.4: No Results

**Goal**: Verify empty state for no matches

**Steps**:
1. Search for gibberish: "xyzabc123"
2. Verify empty state message appears

**Expected**:
- "No pages found matching your search" message
- No error in console

---

## Phase 3: UI/UX Tests

### Test 3.1: Click to Open

**Goal**: Verify clicking result opens page

**Steps**:
1. Open popup with some history
2. Click on a result card
3. Verify new tab opens with correct URL

**Expected**:
- New tab opens
- Correct page loads
- Popup stays open (or closes, depending on preference)

### Test 3.2: Keyboard Navigation

**Goal**: Verify Enter key opens first result

**Steps**:
1. Open popup
2. Type search query
3. Press Enter (without clicking)
4. Verify first result opens

**Expected**:
- First matching page opens in new tab
- Works without mouse

### Test 3.3: Long Titles

**Goal**: Verify long titles are truncated properly

**Steps**:
1. Visit a page with very long title (200+ characters)
2. Open popup
3. Verify title is truncated with "..."

**Expected**:
- Title doesn't break layout
- Ellipsis (...) indicates truncation
- Hover shows full title in tooltip

### Test 3.4: Result Count

**Goal**: Verify result count updates correctly

**Steps**:
1. Visit 15 pages
2. Open popup
3. Search for term matching 5 pages
4. Verify count shows "5 results for 'term'"

**Expected**:
- Count accurate
- Singular/plural grammar correct
- Updates in real-time

---

## Phase 4: Performance Tests

### Test 4.1: Large History

**Goal**: Verify extension works with 100+ pages

**Steps**:
1. Browse normally for a day (or import test data)
2. Accumulate 100+ page visits
3. Open popup
4. Search for various terms

**Expected**:
- Popup opens instantly
- Search responds within 300ms
- No lag or freezing
- Results limited to 100 (performance safeguard)

### Test 4.2: Rapid Page Changes

**Goal**: Verify no crashes with rapid tab switching

**Steps**:
1. Open 10 tabs with different pages
2. Rapidly switch between tabs (Ctrl+Tab)
3. Open popup
4. Verify all pages tracked

**Expected**:
- No crashes
- All pages logged
- No duplicate entries

---

## Phase 5: Edge Cases

### Test 5.1: Missing Page Title

**Goal**: Verify fallback when title is empty

**Steps**:
1. Visit a page with no `<title>` tag
2. Open popup
3. Verify URL is used as title

**Expected**:
- URL displayed instead of blank
- No error in console

### Test 5.2: Very Long URL

**Goal**: Verify long URLs don't break UI

**Steps**:
1. Visit a page with very long URL (500+ chars)
2. Open popup
3. Verify URL is truncated properly

**Expected**:
- Layout not broken
- URL truncated with ellipsis
- Full URL in tooltip

### Test 5.3: Special Characters

**Goal**: Verify special chars in title/URL handled

**Steps**:
1. Visit pages with titles containing: &, <, >, ", '
2. Open popup
3. Verify titles display correctly

**Expected**:
- No HTML injection
- Characters displayed as-is or encoded
- No XSS vulnerabilities

### Test 5.4: Extension Reload

**Goal**: Verify data persists after reload

**Steps**:
1. Visit 10 pages
2. Open popup, verify pages tracked
3. Go to `chrome://extensions/`
4. Click **Reload** on extension
5. Open popup again

**Expected**:
- All data still present
- No data loss
- Extension functional

### Test 5.5: Browser Restart

**Goal**: Verify persistence across browser sessions

**Steps**:
1. Visit pages and verify tracking
2. Close Chrome completely
3. Reopen Chrome
4. Open extension popup

**Expected**:
- All history preserved
- chrome.storage.local persists correctly

---

## Phase 6: Error Handling

### Test 6.1: Network Errors (Supabase)

**Goal**: Verify extension works offline if sync fails

**Steps**:
1. Enable Supabase sync (if implemented)
2. Disconnect internet
3. Visit pages
4. Open popup

**Expected**:
- Pages still tracked locally
- Sync fails silently
- No UI disruption
- Sync resumes when online

### Test 6.2: Corrupted Storage

**Goal**: Verify recovery from bad data

**Steps**:
1. Open DevTools console
2. Run: `chrome.storage.local.set({page_history: "invalid"})`
3. Open popup

**Expected**:
- Extension handles gracefully
- Resets to empty object
- No crash

### Test 6.3: Empty History

**Goal**: Verify empty state on first use

**Steps**:
1. Fresh install (or clear storage)
2. Open popup immediately

**Expected**:
- "No browsing history yet" message
- No errors
- Instructions to visit pages

---

## Phase 7: Supabase Sync Tests (Optional)

**Prerequisites**: Supabase project configured

### Test 7.1: Authentication

**Goal**: Verify Google OAuth works

**Steps**:
1. Click "Sign in with Google"
2. Complete OAuth flow
3. Verify signed-in state

**Expected**:
- OAuth popup opens
- User can select Google account
- Redirects back to extension
- Sync enabled

### Test 7.2: Data Upload

**Goal**: Verify local data syncs to cloud

**Steps**:
1. Sign in to Supabase
2. Visit 10 pages
3. Wait 5-10 seconds
4. Check Supabase dashboard > Table Editor > page_history

**Expected**:
- All pages appear in Supabase
- Correct user_id association
- Timestamps converted to ISO format

### Test 7.3: Data Download

**Goal**: Verify cloud data merges to local

**Steps**:
1. Clear local storage
2. Sign in to Supabase (with existing cloud data)
3. Trigger sync (or wait)
4. Open popup

**Expected**:
- Cloud data appears in popup
- Merged with any local data
- No duplicates

### Test 7.4: Cross-Device Sync

**Goal**: Verify sync across devices

**Steps**:
1. Device A: Visit pages, sync to cloud
2. Device B: Install extension, sign in with same account
3. Verify Device B shows pages from Device A

**Expected**:
- Data syncs between devices
- Both devices can read/write
- No conflicts

---

## Debugging Tools

### Chrome DevTools

**Service Worker Console**:
- `chrome://extensions/` > Extension details > Inspect service worker
- View tracking logs
- Debug storage operations

**Popup Console**:
- Right-click popup > Inspect
- Debug search and rendering
- Check for UI errors

### Storage Inspection

**View all data**:
```javascript
chrome.storage.local.get(console.log)
```

**View page history**:
```javascript
chrome.storage.local.get('page_history', console.log)
```

**Clear history**:
```javascript
chrome.storage.local.remove('page_history')
```

**Check sync status**:
```javascript
chrome.storage.local.get('sync_enabled', console.log)
```

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Pages not tracking | Service worker not running | Reload extension |
| Search not working | JavaScript error in popup | Check popup console |
| Popup blank | Missing files or permissions | Check manifest.json |
| Sync failing | Supabase credentials wrong | Verify config.js |
| Slow performance | Too many pages (>1000) | Implement pagination |

---

## Performance Benchmarks

**Acceptable Performance**:
- Popup open time: <100ms
- Search response: <300ms
- Page tracking: <50ms overhead
- Memory usage: <10MB for 1000 pages

**Red Flags**:
- Popup takes >1 second to open
- Search lags noticeably while typing
- Extension causes page load slowdown
- Memory usage >50MB

---

## Pre-Launch Checklist

Before submitting to Chrome Web Store:

- [ ] All core features working
- [ ] No console errors in normal use
- [ ] Tested with 100+ pages
- [ ] Incognito privacy verified
- [ ] Supabase sync tested (if enabled)
- [ ] Error handling graceful
- [ ] Icons all present and correct size
- [ ] Manifest permissions minimal
- [ ] Privacy policy written (if using OAuth)
- [ ] Screenshots for store listing
- [ ] README updated with setup instructions

---

## Automated Testing (Future)

Consider adding:
- Unit tests for search algorithm
- Integration tests for storage
- E2E tests with Puppeteer
- Performance regression tests

---

## Reporting Bugs

When reporting issues, include:
1. Chrome version
2. Extension version
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
6. Screenshot or video (if UI issue)
