# Implementation Steps for "Where Did I See This?"

## Phase 1: Project Setup & Foundation
**Estimated Complexity: Low**

### 1.1 Basic Extension Structure
- [ ] Create `manifest.json` (Manifest V3)
  - Define required permissions: `tabs`, `storage`, `history`
  - Set up background service worker
  - Configure popup
  - Add icons references
- [ ] Create placeholder icons (16x16, 48x48, 128x128)
- [ ] Set up basic folder structure

### 1.2 Configuration Management
- [ ] Create `src/config/config.js`
  - Supabase URL and anon key (placeholder for now)
  - Sync settings
  - Storage keys constants
  - Exclusion rules (chrome://, incognito detection)

---

## Phase 2: Core Page Tracking System
**Estimated Complexity: Medium**

### 2.1 Background Service Worker
- [ ] Create `src/background/service-worker.js`
  - Listen to `chrome.tabs.onUpdated`
  - Listen to `chrome.tabs.onActivated`
  - Filter out non-http/https URLs
  - Filter out chrome:// pages
  - Extract page metadata (title, URL, domain)

### 2.2 Local Storage Module
- [ ] Create `src/lib/storage.js`
  - `savePageVisit(pageData)` - add or update entry
  - `getPageHistory()` - retrieve all entries
  - `getPageByUrl(url)` - get specific entry
  - `clearHistory()` - remove all entries (for settings)
  - Handle deduplication by URL
  - Increment visit count on duplicate visits
  - Update last visited timestamp

### 2.3 Data Structure
```javascript
{
  "https://example.com/page": {
    title: "Example Page",
    url: "https://example.com/page",
    domain: "example.com",
    lastVisited: 1234567890,
    visitCount: 5
  }
}
```

### 2.4 Utility Functions
- [ ] Create `src/lib/utils.js`
  - `extractDomain(url)` - parse domain from URL
  - `formatRelativeTime(timestamp)` - e.g., "2 hours ago"
  - `isValidUrl(url)` - validate http/https
  - `sanitizeTitle(title)` - fallback to URL if empty

---

## Phase 3: Search & Popup UI
**Estimated Complexity: Medium-High**

### 3.1 Popup HTML Structure
- [ ] Create `src/popup/popup.html`
  - Search input field
  - Results container
  - Empty state message
  - Settings link (for future Supabase toggle)
  - Loading indicator

### 3.2 Popup Styling
- [ ] Create `src/popup/popup.css`
  - Clean, minimal design
  - Search bar styling
  - Result card layout (title, domain, timestamp)
  - Hover states
  - Responsive to content
  - Dark mode friendly (optional)

### 3.3 Search Algorithm
- [ ] Create `src/lib/search.js`
  - `searchPages(query, pages)` - main search function
  - Case-insensitive matching
  - Search in title and domain
  - Ranking logic:
    1. Exact title match
    2. Title contains query
    3. Domain contains query
    4. Most recent visit (tiebreaker)
  - Return sorted results

### 3.4 Popup Logic
- [ ] Create `src/popup/popup.js`
  - Load page history on popup open
  - Bind search input event
  - Debounce search (300ms)
  - Render results dynamically
  - Handle result click → open in new tab
  - Handle empty results state
  - Display result count

---

## Phase 4: Supabase Cloud Sync (Optional Feature)
**Estimated Complexity: High**

### 4.1 Supabase Project Setup
- [ ] Create Supabase project
- [ ] Enable Google OAuth in Supabase Auth
- [ ] Create `page_history` table:
```sql
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

CREATE INDEX idx_user_visits ON page_history(user_id, last_visited DESC);
```

### 4.2 Row Level Security (RLS)
- [ ] Enable RLS on `page_history`
- [ ] Policy: Users can only read/write their own data

### 4.3 Supabase Client Integration
- [ ] Create `src/lib/supabase-client.js`
  - Initialize Supabase client
  - `signInWithGoogle()` - OAuth flow
  - `signOut()` - clear session
  - `getCurrentUser()` - get auth state
  - `syncToCloud(pages)` - upsert local data to Supabase
  - `syncFromCloud()` - fetch user's cloud data
  - Error handling and retry logic

### 4.4 Sync Strategy
- [ ] Implement background sync
  - Trigger sync on new page visit (debounced)
  - Sync only if user is authenticated
  - Local storage remains source of truth
  - Cloud sync failures should be silent
- [ ] Add sync indicator in popup
- [ ] Add "Enable Sync" settings UI

### 4.5 Settings Page (Optional)
- [ ] Create `src/popup/settings.html`
  - Login/Logout button
  - Sync status indicator
  - Manual sync trigger
  - Clear local data option

---

## Phase 5: Edge Cases & Error Handling
**Estimated Complexity: Medium**

### 5.1 Edge Cases
- [ ] Missing page titles → fallback to URL
- [ ] Very long URLs → truncate display
- [ ] Extension reload → verify data persists
- [ ] Multiple rapid visits → handle race conditions
- [ ] Supabase offline → graceful degradation

### 5.2 Error Handling
- [ ] Network errors during sync
- [ ] Invalid page data
- [ ] Storage quota exceeded (unlikely but possible)
- [ ] Auth token expiration
- [ ] CORS issues with Supabase

### 5.3 Performance
- [ ] Limit search results display (e.g., top 50)
- [ ] Optimize storage reads (cache in memory)
- [ ] Debounce sync operations
- [ ] Lazy load old entries if needed

---

## Phase 6: Testing & Validation
**Estimated Complexity: Medium**

### 6.1 Manual Testing
- [ ] Test on various websites (news, GitHub, dashboards)
- [ ] Test search with different queries
- [ ] Test with large history (1000+ entries)
- [ ] Test Supabase sync (if implemented)
- [ ] Test offline behavior
- [ ] Test multiple Chrome profiles

### 6.2 Chrome Web Store Compliance
- [ ] Review manifest permissions
- [ ] Add privacy policy (required for OAuth)
- [ ] Create store listing assets
- [ ] Test on clean Chrome install

---

## Phase 7: Documentation & Deployment
**Estimated Complexity: Low**

### 7.1 Documentation
- [ ] Update README.md with setup instructions
- [ ] Document Supabase setup steps
- [ ] Add developer guide for local testing
- [ ] Create user guide (how to use)

### 7.2 Deployment
- [ ] Package extension as .zip
- [ ] Submit to Chrome Web Store
- [ ] Set up developer account
- [ ] Prepare store listing (description, screenshots)

---

## Development Order Recommendation

**Week 1: Foundation**
1. Project setup (Phase 1)
2. Core tracking (Phase 2)
3. Test tracking works

**Week 2: UI & Search**
1. Popup UI (Phase 3.1-3.2)
2. Search implementation (Phase 3.3-3.4)
3. Test end-to-end local functionality

**Week 3: Cloud Sync (Optional)**
1. Supabase setup (Phase 4.1-4.2)
2. Client integration (Phase 4.3-4.4)
3. Test sync functionality

**Week 4: Polish & Launch**
1. Edge cases (Phase 5)
2. Testing (Phase 6)
3. Documentation & deployment (Phase 7)

---

## Key Technical Decisions

### Why Manifest V3?
- Required for new Chrome extensions (V2 deprecated)
- Service workers instead of background pages

### Why chrome.storage.local?
- No retention limits (unlike sync storage)
- Faster than IndexedDB for this use case
- Native Chrome API

### Why Supabase?
- No backend code needed
- Built-in auth
- PostgreSQL reliability
- Free tier generous enough for MVP

### Why Local-First?
- Instant search performance
- Works offline
- User privacy
- Supabase optional, not required

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Storage quota exceeded | Monitor size, add cleanup for old entries |
| Supabase costs | Keep it optional, use free tier limits |
| Slow search with large data | Implement pagination, limit results |
| Auth token expiration | Implement silent refresh |
| Chrome API changes | Follow Manifest V3 best practices |

---

## Success Metrics (Post-Launch)

- Extension installs
- Daily active users
- Search queries per user
- Sync adoption rate (% of users enabling cloud sync)
- Average pages tracked per user
