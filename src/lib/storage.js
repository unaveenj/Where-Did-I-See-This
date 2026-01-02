// Chrome storage wrapper for page history persistence

import { CONFIG } from '../config/config.js';

/**
 * Save or update a page visit entry
 * Deduplicates by URL and increments visit count
 * @param {Object} pageData - { title, url, domain, timestamp }
 * @returns {boolean} Success status
 */
export async function savePageVisit(pageData) {
  try {
    // Validate input
    if (!pageData || !pageData.url || !pageData.title || !pageData.domain) {
      console.error('Invalid page data:', pageData);
      return false;
    }

    // Get existing history
    const history = await getPageHistory();

    // Check if URL already exists
    if (history[pageData.url]) {
      // Update existing entry
      history[pageData.url] = {
        ...history[pageData.url],
        title: pageData.title, // Update title in case it changed
        lastVisited: pageData.timestamp,
        visitCount: history[pageData.url].visitCount + 1
      };
    } else {
      // Create new entry
      history[pageData.url] = {
        title: pageData.title,
        url: pageData.url,
        domain: pageData.domain,
        lastVisited: pageData.timestamp,
        visitCount: 1
      };
    }

    // Save back to storage
    await chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: history });
    return true;
  } catch (error) {
    console.error('Error saving page visit:', error);
    // TODO: Implement retry logic for transient failures
    // TODO: Add storage quota monitoring
    return false;
  }
}

/**
 * Retrieve all page history entries
 * @returns {Object} History object keyed by URL
 */
export async function getPageHistory() {
  try {
    const result = await chrome.storage.local.get(CONFIG.STORAGE_KEY);
    const history = result[CONFIG.STORAGE_KEY] || {};

    // Validate history structure
    if (typeof history !== 'object' || Array.isArray(history)) {
      console.warn('Invalid history data structure, resetting to empty object');
      return {};
    }

    return history;
  } catch (error) {
    console.error('Error getting page history:', error);
    // Graceful degradation: return empty object
    return {};
  }
}

/**
 * Get a specific page entry by URL
 * @param {string} url - Page URL
 * @returns {Object|null} Page entry or null if not found
 */
export async function getPageByUrl(url) {
  try {
    const history = await getPageHistory();
    return history[url] || null;
  } catch (error) {
    console.error('Error getting page by URL:', error);
    return null;
  }
}

/**
 * Clear all history (for settings/debugging)
 * WARNING: This is destructive and cannot be undone
 * @returns {boolean} Success status
 */
export async function clearHistory() {
  try {
    await chrome.storage.local.remove(CONFIG.STORAGE_KEY);
    console.log('History cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
}

// TODO: Future enhancements for storage.js
// - Implement automatic cleanup of very old entries (>1 year)
// - Add export/import functionality (JSON format)
// - Add storage quota monitoring and warnings
// - Implement data compression for large histories
// - Add selective delete (by domain, date range, etc.)
