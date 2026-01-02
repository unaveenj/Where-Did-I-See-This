// Background service worker for tracking page visits

import { CONFIG } from '../config/config.js';
import { savePageVisit } from '../lib/storage.js';
import { extractDomain, isValidUrl, sanitizeTitle, isExcludedUrl } from '../lib/utils.js';
// Note: Background sync disabled - use manual sync from popup for Supabase
// import { triggerBackgroundSync } from '../lib/supabase-client.js';

/**
 * Process and save page visit
 * @param {number} tabId - Tab ID
 * @param {Object} tab - Tab object with url and title
 */
async function processPageVisit(tabId, tab) {
  try {
    // Skip if no tab or URL
    if (!tab || !tab.url) return;

    // Filter: only http/https
    if (!isValidUrl(tab.url)) {
      return;
    }

    // Filter: exclude chrome://, extensions, etc.
    if (isExcludedUrl(tab.url, CONFIG.EXCLUDED_PATTERNS)) {
      return;
    }

    // Filter: skip incognito tabs
    if (tab.incognito) {
      return;
    }

    // Extract page data
    const pageData = {
      title: sanitizeTitle(tab.title, tab.url),
      url: tab.url,
      domain: extractDomain(tab.url),
      timestamp: Date.now()
    };

    // Validate extracted data before saving
    if (!pageData.domain) {
      console.warn('Failed to extract domain from URL:', tab.url);
      return;
    }

    // Save to storage (deduplication handled in storage.js)
    await savePageVisit(pageData);

    // Note: Automatic background sync disabled due to ES6 module limitations
    // Use the "Sync" button in popup for manual Supabase sync
  } catch (error) {
    // Graceful error handling - log but don't break extension
    console.error('Error processing page visit:', error);
  }
}

/**
 * Listen to tab updates (page loads, title changes)
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when page is fully loaded
  if (changeInfo.status === 'complete') {
    processPageVisit(tabId, tab);
  }
});

/**
 * Listen to tab activation (user switches tabs)
 * This captures visits even if user doesn't reload the page
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    processPageVisit(activeInfo.tabId, tab);
  } catch (error) {
    // Tab might be closed or inaccessible, ignore
  }
});

// Service worker installation
console.log('Where Did I See This? - Service worker installed');

// TODO: Future enhancements for service-worker.js
// - Add chrome.webNavigation listener for more accurate tracking
// - Implement tab group tracking (associate pages with tab groups)
// - Add periodic cleanup of very old entries (configurable retention)
// - Track time spent on each page (using chrome.idle and tab focus)
// - Add domain-specific tracking rules (e.g., exclude certain domains)
// - Implement smart deduplication (same page with different query params)
// - Add bookmark detection and tagging
// - Track page scroll depth or engagement metrics
