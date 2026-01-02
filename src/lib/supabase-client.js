// Supabase cloud sync client (optional, opt-in feature)

import { CONFIG } from '../config/config.js';
import { getPageHistory } from './storage.js';

/**
 * Supabase client instance
 * Will be initialized when user enables sync
 */
let supabaseClient = null;

/**
 * Check if Supabase is configured
 * @returns {boolean} True if Supabase URL and key are set
 */
export function isSupabaseConfigured() {
  return CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
}

/**
 * Initialize Supabase client
 * Requires @supabase/supabase-js library loaded via CDN or bundled
 * @returns {Object|null} Supabase client or null if not configured
 */
export function initSupabase() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in config.js');
    return null;
  }

  try {
    // Check if Supabase library is available
    if (typeof supabase === 'undefined') {
      console.error('Supabase library not loaded. Include @supabase/supabase-js in your project.');
      return null;
    }

    // Initialize client
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return null;
  }
}

/**
 * Sign in with Google OAuth
 * Opens OAuth flow in new window
 * @returns {Object|null} Session object or null on error
 */
export async function signInWithGoogle() {
  try {
    if (!supabaseClient) {
      supabaseClient = initSupabase();
    }

    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    // Trigger Google OAuth
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: chrome.identity.getRedirectURL()
      }
    });

    if (error) throw error;

    // Save sync enabled state
    await chrome.storage.local.set({ [CONFIG.SYNC_ENABLED_KEY]: true });

    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

/**
 * Sign out current user
 * @returns {boolean} Success status
 */
export async function signOut() {
  try {
    if (!supabaseClient) {
      supabaseClient = initSupabase();
    }

    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    // Disable sync
    await chrome.storage.local.set({ [CONFIG.SYNC_ENABLED_KEY]: false });

    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} User object or null if not signed in
 */
export async function getCurrentUser() {
  try {
    if (!supabaseClient) {
      supabaseClient = initSupabase();
    }

    if (!supabaseClient) {
      return null;
    }

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if sync is enabled
 * @returns {boolean} True if sync is enabled
 */
export async function isSyncEnabled() {
  try {
    const result = await chrome.storage.local.get(CONFIG.SYNC_ENABLED_KEY);
    return result[CONFIG.SYNC_ENABLED_KEY] === true;
  } catch (error) {
    console.error('Error checking sync status:', error);
    return false;
  }
}

/**
 * Sync local page history to Supabase
 * Uses upsert to handle duplicates (ON CONFLICT UPDATE)
 * @returns {Object} Sync result { success, synced, errors }
 */
export async function syncToCloud() {
  try {
    // Check if sync is enabled
    const syncEnabled = await isSyncEnabled();
    if (!syncEnabled) {
      return { success: false, message: 'Sync not enabled' };
    }

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    if (!supabaseClient) {
      supabaseClient = initSupabase();
    }

    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    // Get local page history
    const localHistory = await getPageHistory();
    const pages = Object.values(localHistory);

    if (pages.length === 0) {
      return { success: true, synced: 0, message: 'No pages to sync' };
    }

    // Prepare data for Supabase (add user_id)
    const pagesToSync = pages.map(page => ({
      user_id: user.id,
      title: page.title,
      url: page.url,
      domain: page.domain,
      last_visited: new Date(page.lastVisited).toISOString(),
      visit_count: page.visitCount
    }));

    // Upsert to Supabase (batch insert with ON CONFLICT UPDATE)
    const { data, error } = await supabaseClient
      .from('page_history')
      .upsert(pagesToSync, {
        onConflict: 'user_id,url',
        ignoreDuplicates: false
      });

    if (error) throw error;

    return {
      success: true,
      synced: pagesToSync.length,
      message: `Synced ${pagesToSync.length} pages to cloud`
    };
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    // Don't throw - return error but don't break local functionality
    return {
      success: false,
      message: error.message || 'Sync failed',
      error
    };
  }
}

/**
 * Fetch page history from Supabase
 * Merges with local data (local takes precedence for conflicts)
 * @returns {Object} Sync result { success, fetched, message }
 */
export async function syncFromCloud() {
  try {
    // Check if sync is enabled
    const syncEnabled = await isSyncEnabled();
    if (!syncEnabled) {
      return { success: false, message: 'Sync not enabled' };
    }

    // Check if user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    if (!supabaseClient) {
      supabaseClient = initSupabase();
    }

    if (!supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    // Fetch user's page history from Supabase
    const { data, error } = await supabaseClient
      .from('page_history')
      .select('*')
      .eq('user_id', user.id)
      .order('last_visited', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, fetched: 0, message: 'No cloud data found' };
    }

    // Get local history
    const localHistory = await getPageHistory();

    // Merge cloud data with local (local takes precedence)
    let mergedCount = 0;
    for (const cloudPage of data) {
      // Convert cloud data to local format
      const localPage = {
        title: cloudPage.title,
        url: cloudPage.url,
        domain: cloudPage.domain,
        lastVisited: new Date(cloudPage.last_visited).getTime(),
        visitCount: cloudPage.visit_count
      };

      // Only add if URL doesn't exist locally
      if (!localHistory[cloudPage.url]) {
        localHistory[cloudPage.url] = localPage;
        mergedCount++;
      }
    }

    // Save merged history back to local storage
    if (mergedCount > 0) {
      await chrome.storage.local.set({ [CONFIG.STORAGE_KEY]: localHistory });
    }

    return {
      success: true,
      fetched: data.length,
      merged: mergedCount,
      message: `Fetched ${data.length} pages, merged ${mergedCount} new pages`
    };
  } catch (error) {
    console.error('Error syncing from cloud:', error);
    // Don't throw - return error but don't break local functionality
    return {
      success: false,
      message: error.message || 'Sync failed',
      error
    };
  }
}

/**
 * Trigger background sync (debounced)
 * Called after page visits to sync in background
 * @returns {Promise<void>}
 */
let syncDebounceTimer = null;
export async function triggerBackgroundSync() {
  // Clear existing timer
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  // Debounce sync by 5 seconds
  syncDebounceTimer = setTimeout(async () => {
    const result = await syncToCloud();
    if (result.success) {
      console.log('Background sync completed:', result.message);
    } else {
      // Silent failure - don't block local functionality
      console.warn('Background sync failed:', result.message);
    }
  }, 5000); // 5 second debounce
}
