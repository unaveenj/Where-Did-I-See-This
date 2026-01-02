// Search and ranking algorithm for page history

/**
 * Search pages by keyword query
 * Searches in title and domain, ranks by relevance and recency
 * @param {string} query - Search keywords (case-insensitive)
 * @param {Object} pages - Page history object (keyed by URL)
 * @returns {Array} Sorted array of matching page entries
 */
export function searchPages(query, pages) {
  try {
    // Validate input
    if (!pages || typeof pages !== 'object') {
      console.error('Invalid pages object:', pages);
      return [];
    }

    // Return all pages if query is empty
    if (!query || !query.trim()) {
      return sortByRecency(Object.values(pages));
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Search through all pages
    for (const url in pages) {
      const page = pages[url];

      // Skip invalid page objects
      if (!page || !page.title || !page.domain) {
        console.warn('Skipping invalid page object:', page);
        continue;
      }

      const titleLower = page.title.toLowerCase();
      const domainLower = page.domain.toLowerCase();

      // Check if query matches title or domain
      if (titleLower.includes(normalizedQuery) || domainLower.includes(normalizedQuery)) {
        // Calculate relevance score
        const score = calculateRelevanceScore(normalizedQuery, page);
        results.push({ ...page, score });
      }
    }

    // Sort by score (descending), then by recency (descending)
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.lastVisited - a.lastVisited;
    });

    return results;
  } catch (error) {
    console.error('Error searching pages:', error);
    return [];
  }
}

/**
 * Calculate relevance score for ranking
 * Higher score = more relevant
 * @param {string} query - Normalized search query
 * @param {Object} page - Page object
 * @returns {number} Relevance score
 */
function calculateRelevanceScore(query, page) {
  const titleLower = page.title.toLowerCase();
  const domainLower = page.domain.toLowerCase();
  let score = 0;

  // Exact title match (highest priority)
  if (titleLower === query) {
    score += 1000;
  }

  // Title starts with query
  if (titleLower.startsWith(query)) {
    score += 500;
  }

  // Title contains query
  if (titleLower.includes(query)) {
    score += 100;
  }

  // Domain starts with query
  if (domainLower.startsWith(query)) {
    score += 50;
  }

  // Domain contains query
  if (domainLower.includes(query)) {
    score += 25;
  }

  // Boost by visit count (more visits = more relevant)
  // Cap at 50 points to prevent overly visited pages from dominating
  const visitScore = Math.min(page.visitCount * 5, 50);
  score += visitScore;

  // Boost by recency (normalize to 0-10 range based on last 30 days)
  const daysSinceVisit = (Date.now() - page.lastVisited) / (1000 * 60 * 60 * 24);
  if (daysSinceVisit < 30) {
    score += (30 - daysSinceVisit) / 3;
  }

  return score;
}

/**
 * Sort pages by recency (most recent first)
 * @param {Array} pages - Array of page objects
 * @returns {Array} Sorted array
 */
function sortByRecency(pages) {
  try {
    // Validate input
    if (!Array.isArray(pages)) {
      console.error('sortByRecency expects an array, got:', typeof pages);
      return [];
    }

    // Filter out invalid entries and sort
    return pages
      .filter(page => page && typeof page.lastVisited === 'number')
      .sort((a, b) => b.lastVisited - a.lastVisited);
  } catch (error) {
    console.error('Error sorting by recency:', error);
    return pages || [];
  }
}

// TODO: Future enhancements for search.js
// - Implement multi-word search (AND logic for multiple keywords)
// - Add fuzzy matching for typo tolerance (Levenshtein distance)
// - Support advanced search operators (site:, before:, after:)
// - Add search result caching for performance
// - Implement word stemming (searching "run" matches "running")
// - Add search history/suggestions
