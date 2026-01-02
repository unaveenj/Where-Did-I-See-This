// Popup UI logic and search handling

import { getPageHistory } from '../lib/storage.js';
import { searchPages } from '../lib/search.js';
import { formatRelativeTime } from '../lib/utils.js';
import { syncToCloud, isSupabaseConfigured } from '../lib/supabase-client.js';

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultCount = document.getElementById('resultCount');
const syncButton = document.getElementById('syncButton');

// Store full history in memory for fast searching
let pageHistory = {};

/**
 * Initialize popup - load history and set up event listeners
 */
async function init() {
  try {
    // Load page history
    pageHistory = await getPageHistory();

    // Hide loading, show initial results
    loadingState.classList.add('hidden');

    // Set up search input listener with debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleSearch(e.target.value);
      }, 300); // 300ms debounce
    });

    // Keyboard support: Enter to open first result
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const firstCard = resultsContainer.querySelector('.result-card');
        if (firstCard) {
          firstCard.click();
        }
      }
    });

    // Initial render - show all recent pages
    handleSearch('');

    // Set up sync button
    if (isSupabaseConfigured()) {
      syncButton.addEventListener('click', handleSync);
    } else {
      syncButton.style.display = 'none';
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
    loadingState.classList.add('hidden');
    emptyState.textContent = 'Error loading history. Please try again.';
    emptyState.classList.remove('hidden');
  }
}

/**
 * Handle manual sync to Supabase
 */
async function handleSync() {
  try {
    syncButton.disabled = true;
    syncButton.classList.add('syncing');
    syncButton.textContent = '🔄 Syncing...';

    const result = await syncToCloud();

    if (result.success) {
      syncButton.textContent = '✓ Synced!';
      setTimeout(() => {
        syncButton.textContent = '🔄 Sync';
        syncButton.classList.remove('syncing');
        syncButton.disabled = false;
      }, 2000);
    } else {
      syncButton.textContent = '✗ Failed';
      setTimeout(() => {
        syncButton.textContent = '🔄 Sync';
        syncButton.classList.remove('syncing');
        syncButton.disabled = false;
      }, 2000);
    }
  } catch (error) {
    console.error('Sync error:', error);
    syncButton.textContent = '✗ Error';
    setTimeout(() => {
      syncButton.textContent = '🔄 Sync';
      syncButton.classList.remove('syncing');
      syncButton.disabled = false;
    }, 2000);
  }
}

/**
 * Handle search query
 * @param {string} query - Search query
 */
function handleSearch(query) {
  try {
    // Perform search
    const results = searchPages(query, pageHistory);

    // Limit results to prevent performance issues
    const limitedResults = results.slice(0, 100); // Max 100 results

    // Render results
    renderResults(limitedResults);

    // Update result count (show total, not just displayed)
    updateResultCount(results.length, query);

    // Show/hide empty state
    if (results.length === 0) {
      // Different message for no history vs no search results
      if (Object.keys(pageHistory).length === 0) {
        emptyState.textContent = 'No browsing history yet. Visit some pages to get started!';
      } else {
        emptyState.textContent = 'No pages found matching your search.';
      }
      emptyState.classList.remove('hidden');
      resultsContainer.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      resultsContainer.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error handling search:', error);
    emptyState.textContent = 'Error performing search. Please try again.';
    emptyState.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
  }
}

/**
 * Render search results
 * @param {Array} results - Array of page objects
 */
function renderResults(results) {
  try {
    // Clear existing results
    resultsContainer.innerHTML = '';

    // Validate results array
    if (!Array.isArray(results)) {
      console.error('Invalid results format:', results);
      return;
    }

    // Render each result
    results.forEach(page => {
      // Validate page object
      if (!page || !page.url || !page.title) {
        console.warn('Invalid page object:', page);
        return;
      }

      const card = createResultCard(page);
      resultsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error rendering results:', error);
  }
}

/**
 * Create a result card element
 * @param {Object} page - Page object
 * @returns {HTMLElement} Result card
 */
function createResultCard(page) {
  const card = document.createElement('div');
  card.className = 'result-card';

  // Title (with safety for missing data)
  const title = document.createElement('div');
  title.className = 'result-title';
  title.textContent = page.title || 'Untitled Page';
  title.title = page.title || page.url; // Tooltip for full title

  // Meta (domain + time)
  const meta = document.createElement('div');
  meta.className = 'result-meta';

  const domain = document.createElement('span');
  domain.className = 'result-domain';
  domain.textContent = page.domain || 'Unknown Domain';
  domain.title = page.url; // Tooltip shows full URL

  const time = document.createElement('span');
  time.className = 'result-time';
  time.textContent = formatRelativeTime(page.lastVisited);

  meta.appendChild(domain);
  meta.appendChild(time);

  // Assemble card
  card.appendChild(title);
  card.appendChild(meta);

  // Click handler - open page in new tab
  card.addEventListener('click', () => {
    try {
      chrome.tabs.create({ url: page.url });
      // TODO: Add option to close popup after opening link
    } catch (error) {
      console.error('Error opening tab:', error);
    }
  });

  // Accessibility: Make card keyboard navigable
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });

  return card;
}

/**
 * Update result count text
 * @param {number} count - Number of results
 * @param {string} query - Search query
 */
function updateResultCount(count, query) {
  if (query.trim()) {
    resultCount.textContent = `${count} result${count !== 1 ? 's' : ''} for "${query}"`;
  } else {
    resultCount.textContent = `${count} page${count !== 1 ? 's' : ''} tracked`;
  }
}

// Initialize on load
init();

// TODO: Future enhancements for popup.js
// - Add keyboard navigation (arrow keys to navigate results)
// - Implement infinite scroll or pagination for large result sets
// - Add "Clear History" button with confirmation dialog
// - Show visit count badge on result cards
// - Add "Open in background tab" option (Ctrl+Click)
// - Implement fuzzy search for typo tolerance
// - Add recent searches dropdown
// - Show sync status indicator when Supabase is enabled
// - Add filter by domain or date range
// - Implement result highlighting for matched keywords
