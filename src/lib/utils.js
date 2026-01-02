// Utility helper functions

/**
 * Extract domain from a URL
 * @param {string} url - Full URL
 * @returns {string} Domain (e.g., "github.com")
 */
export function extractDomain(url) {
  try {
    if (!url || typeof url !== 'string') {
      return '';
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.warn('Invalid URL for domain extraction:', url);
    return '';
  }
}

/**
 * Format timestamp as relative time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp) {
  try {
    // Validate timestamp
    if (!timestamp || typeof timestamp !== 'number' || timestamp < 0) {
      return 'unknown';
    }

    const now = Date.now();
    const diff = now - timestamp;

    // Handle future timestamps
    if (diff < 0) {
      return 'just now';
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'unknown';
  }
}

/**
 * Validate if URL is http or https
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid http/https URL
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Sanitize page title (fallback to URL if empty)
 * Truncates very long titles for display purposes
 * @param {string} title - Page title
 * @param {string} url - Page URL (fallback)
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title, url) {
  if (title && title.trim()) {
    const cleanTitle = title.trim();
    // Truncate extremely long titles (>200 chars)
    if (cleanTitle.length > 200) {
      return cleanTitle.substring(0, 197) + '...';
    }
    return cleanTitle;
  }
  // Fallback to URL, also truncate if too long
  if (url && url.length > 100) {
    return url.substring(0, 97) + '...';
  }
  return url || 'Untitled Page';
}

/**
 * Check if URL matches excluded patterns
 * @param {string} url - URL to check
 * @param {Array} patterns - Array of RegExp patterns
 * @returns {boolean} True if URL should be excluded
 */
export function isExcludedUrl(url, patterns) {
  try {
    if (!url || !Array.isArray(patterns)) {
      return false;
    }
    return patterns.some(pattern => {
      try {
        return pattern.test(url);
      } catch (e) {
        console.warn('Invalid regex pattern:', pattern);
        return false;
      }
    });
  } catch (error) {
    console.error('Error checking excluded URL:', error);
    return false;
  }
}

// TODO: Future utility functions
// - debounce(fn, delay) - debounce function calls
// - throttle(fn, limit) - throttle function calls
// - escapeHtml(str) - escape HTML for safe rendering
// - truncateUrl(url, maxLength) - intelligently truncate URLs
// - parseQueryParams(url) - extract query parameters
// - normalizeUrl(url) - normalize URLs for deduplication
