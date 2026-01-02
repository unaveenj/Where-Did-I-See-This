# Project Structure Overview

## Folder Hierarchy

```
where-did-i-see-this/
├── manifest.json                    # Chrome Extension Manifest V3
├── README.md                        # Main documentation
├── IMPLEMENTATION_STEPS.md          # Development roadmap
├── PROJECT_STRUCTURE.md             # This file
│
├── src/                             # Source code
│   ├── background/                  # Background service worker
│   │   └── service-worker.js        # Tracks page visits via chrome.tabs API
│   │
│   ├── popup/                       # Extension popup UI
│   │   ├── popup.html               # Search interface
│   │   ├── popup.css                # Styling
│   │   └── popup.js                 # Search logic & result rendering
│   │
│   ├── lib/                         # Shared libraries
│   │   ├── storage.js               # chrome.storage.local wrapper
│   │   ├── search.js                # Search algorithm implementation
│   │   ├── supabase-client.js       # Supabase integration (optional)
│   │   └── utils.js                 # Helper functions
│   │
│   └── config/                      # Configuration
│       └── config.js                # Constants, Supabase keys, settings
│
├── assets/                          # Static assets
│   └── icons/                       # Extension icons
│       ├── icon16.png               # Toolbar icon (16x16)
│       ├── icon48.png               # Extension management (48x48)
│       └── icon128.png              # Chrome Web Store (128x128)
│
└── docs/                            # Additional documentation
    └── SUPABASE_SETUP.md            # (Future) Detailed Supabase guide
```

---

## Component Responsibilities

### 1. **manifest.json**
- Defines extension metadata (name, version, description)
- Specifies permissions: `tabs`, `storage`, `history`
- Registers background service worker
- Configures popup UI
- Links to icon assets

### 2. **src/background/service-worker.js**
**Purpose**: Track page visits in the background

**Key Functions**:
- Listen to `chrome.tabs.onUpdated` (page loads)
- Listen to `chrome.tabs.onActivated` (tab switches)
- Extract page metadata (title, URL, domain)
- Filter out invalid pages (chrome://, incognito, non-HTTP)
- Save to local storage via `storage.js`
- Trigger background sync (if enabled)

**Dependencies**:
- `lib/storage.js`
- `lib/utils.js`
- `lib/supabase-client.js` (optional)

---

### 3. **src/popup/**

#### **popup.html**
- Search input field
- Results container (dynamic)
- Empty state message
- Loading indicator
- Settings/sync toggle (future)

#### **popup.css**
- Clean, minimal design
- Result card layout
- Hover effects
- Responsive sizing
- Dark mode support (optional)

#### **popup.js**
**Purpose**: Handle user interactions and display results

**Key Functions**:
- Load page history on popup open
- Listen to search input (with debounce)
- Call `search.js` to filter results
- Render results dynamically
- Handle click → open page in new tab
- Display result count and empty states

**Dependencies**:
- `lib/storage.js`
- `lib/search.js`
- `lib/utils.js`

---

### 4. **src/lib/**

#### **storage.js**
**Purpose**: Abstraction layer for chrome.storage.local

**API**:
```javascript
savePageVisit(pageData)      // Add or update page entry
getPageHistory()             // Retrieve all entries
getPageByUrl(url)            // Get specific page
clearHistory()               // Remove all entries
```

**Data Structure**:
```javascript
{
  "https://example.com": {
    title: "Example Page",
    url: "https://example.com",
    domain: "example.com",
    lastVisited: 1234567890,
    visitCount: 3
  }
}
```

#### **search.js**
**Purpose**: Implement search and ranking algorithm

**API**:
```javascript
searchPages(query, pages)    // Returns sorted results
```

**Ranking Logic**:
1. Exact title match (highest priority)
2. Partial title match
3. Domain match
4. Most recent visit (tiebreaker)

#### **supabase-client.js** (Optional)
**Purpose**: Handle cloud sync with Supabase

**API**:
```javascript
initSupabase()               // Initialize client
signInWithGoogle()           // OAuth flow
signOut()                    // Clear session
getCurrentUser()             // Get auth state
syncToCloud(pages)           // Push local data to Supabase
syncFromCloud()              // Pull cloud data
```

**Error Handling**:
- Graceful degradation on network errors
- Silent failures (don't block local functionality)
- Retry logic with exponential backoff

#### **utils.js**
**Purpose**: Shared utility functions

**Functions**:
```javascript
extractDomain(url)           // Parse domain from URL
formatRelativeTime(ts)       // "2 hours ago"
isValidUrl(url)              // Validate http/https
sanitizeTitle(title)         // Fallback to URL if empty
debounce(fn, delay)          // Debounce function calls
```

---

### 5. **src/config/config.js**
**Purpose**: Centralized configuration

**Contents**:
```javascript
export const SUPABASE_URL = 'your-supabase-url';
export const SUPABASE_ANON_KEY = 'your-anon-key';
export const STORAGE_KEY = 'page_history';
export const SYNC_ENABLED_KEY = 'sync_enabled';
export const SYNC_DEBOUNCE_MS = 5000;
export const SEARCH_DEBOUNCE_MS = 300;
export const EXCLUDED_URL_PATTERNS = [
  /^chrome:\/\//,
  /^chrome-extension:\/\//,
  /^about:/
];
```

---

### 6. **assets/icons/**
**Purpose**: Extension branding

**Requirements**:
- `icon16.png`: 16x16 (toolbar icon)
- `icon48.png`: 48x48 (extension management page)
- `icon128.png`: 128x128 (Chrome Web Store listing)

**Design**:
- Simple, recognizable icon
- Represents "search" or "memory" concept
- Good contrast for toolbar visibility

---

## Data Flow

### Page Visit Flow
```
User visits page
    ↓
chrome.tabs.onUpdated event
    ↓
service-worker.js extracts metadata
    ↓
Validates URL (filter chrome://, etc.)
    ↓
storage.js saves to chrome.storage.local
    ↓
(Optional) supabase-client.js syncs to cloud
```

### Search Flow
```
User opens popup
    ↓
popup.js loads history from storage.js
    ↓
User types in search input
    ↓
Debounced input triggers search.js
    ↓
search.js ranks results
    ↓
popup.js renders results
    ↓
User clicks result
    ↓
chrome.tabs.create opens page
```

### Sync Flow (Optional)
```
Background sync trigger
    ↓
Check if user is authenticated
    ↓
supabase-client.js gets local pages
    ↓
Upsert to Supabase (ON CONFLICT UPDATE)
    ↓
Handle errors gracefully
    ↓
Update sync status
```

---

## Chrome APIs Used

| API | Purpose | Permission Required |
|-----|---------|-------------------|
| `chrome.tabs` | Track page visits | `tabs` |
| `chrome.storage.local` | Store page history | `storage` |
| `chrome.runtime` | Background messaging | None |
| `chrome.identity` | Google OAuth (optional) | `identity` |

---

## External Dependencies

### Required
- None (pure Vanilla JS)

### Optional (Cloud Sync)
- **@supabase/supabase-js**: Supabase client library
  - Can be loaded via CDN in `popup.html` and `service-worker.js`
  - Or bundled if using a build tool

---

## Development Workflow

### Phase 1: Local-Only MVP
1. Implement `manifest.json`
2. Build `service-worker.js` + `storage.js`
3. Create `popup.html/css/js` + `search.js`
4. Test end-to-end without cloud sync

### Phase 2: Cloud Sync (Optional)
1. Set up Supabase project
2. Implement `supabase-client.js`
3. Add auth UI to popup
4. Test sync functionality

### Phase 3: Polish
1. Error handling
2. Edge cases
3. Performance optimization
4. Chrome Web Store preparation

---

## File Size Estimates

| File | Estimated Lines | Complexity |
|------|-----------------|------------|
| manifest.json | ~50 | Low |
| service-worker.js | ~150 | Medium |
| storage.js | ~100 | Low |
| search.js | ~80 | Medium |
| supabase-client.js | ~200 | High |
| utils.js | ~60 | Low |
| popup.html | ~100 | Low |
| popup.css | ~200 | Low |
| popup.js | ~250 | Medium-High |
| config.js | ~20 | Low |
| **Total** | **~1,210** | **Medium** |

---

## Key Design Decisions

### Why This Structure?

1. **Separation of Concerns**: Background logic, UI, and libraries are isolated
2. **Testability**: Each module has clear inputs/outputs
3. **Maintainability**: Easy to locate and update specific features
4. **Scalability**: Can add features (tags, favorites) without refactoring

### Why Vanilla JS?

- No build step required
- Lightweight (fast load times)
- Direct Chrome API access
- Easy for new developers to contribute

### Why chrome.storage.local?

- No retention limits (unlike chrome.storage.sync)
- Faster than IndexedDB for this use case
- Native Chrome API (no external dependencies)

---

## Future Enhancements

### Potential New Files
- `src/options/options.html` - Settings page
- `src/lib/export.js` - Data export functionality
- `src/lib/tags.js` - Tagging system
- `tests/` - Unit and integration tests

### Architectural Changes
- Consider build tool (Vite/Rollup) for bundling
- Add TypeScript for type safety
- Implement state management for complex UI

---

This structure balances simplicity (for MVP) with extensibility (for future features).
