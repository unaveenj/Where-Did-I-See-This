// Google Sheets sync client - much simpler than Supabase!

import { CONFIG } from '../config/config.js';
import { getPageHistory } from './storage.js';

// Google Sheets API endpoints
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

/**
 * Get OAuth token for Google APIs
 * @returns {string|null} Access token
 */
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error('Auth error:', chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Get current user's email
 * @param {string} token - OAuth token
 * @returns {string|null} User email
 */
async function getUserEmail(token) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Find or create Google Sheet for user
 * @param {string} token - OAuth token
 * @param {string} email - User email
 * @returns {string|null} Spreadsheet ID
 */
async function findOrCreateSheet(token, email) {
  try {
    const username = email.split('@')[0];
    const sheetName = `${username}_wheredidisee`;

    // Search for existing sheet
    const searchResponse = await fetch(
      `${DRIVE_API}?q=name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      // Sheet exists
      return searchData.files[0].id;
    }

    // Create new sheet
    const createResponse = await fetch(SHEETS_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: sheetName
        },
        sheets: [{
          properties: {
            title: 'Page History',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }]
      })
    });

    const createData = await createResponse.json();

    // Add header row
    await fetch(`${SHEETS_API}/${createData.spreadsheetId}/values/Page History!A1:E1?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [['Title', 'URL', 'Domain', 'Last Visited', 'Visit Count']]
      })
    });

    return createData.spreadsheetId;
  } catch (error) {
    console.error('Error finding/creating sheet:', error);
    return null;
  }
}

/**
 * Sync page history to Google Sheets
 * @returns {Object} Sync result
 */
export async function syncToGoogleSheets() {
  try {
    // Get auth token
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: 'Failed to authenticate' };
    }

    // Get user email
    const email = await getUserEmail(token);
    if (!email) {
      return { success: false, message: 'Failed to get user email' };
    }

    // Find or create spreadsheet
    const spreadsheetId = await findOrCreateSheet(token, email);
    if (!spreadsheetId) {
      return { success: false, message: 'Failed to create/find spreadsheet' };
    }

    // Get local page history
    const localHistory = await getPageHistory();
    const pages = Object.values(localHistory);

    if (pages.length === 0) {
      return { success: true, synced: 0, message: 'No pages to sync' };
    }

    // Prepare data for sheets (skip header row)
    const rows = pages.map(page => [
      page.title,
      page.url,
      page.domain,
      new Date(page.lastVisited).toISOString(),
      page.visitCount
    ]);

    // Clear existing data (except header) and write new data
    const range = 'Page History!A2:E';

    // Clear old data
    await fetch(`${SHEETS_API}/${spreadsheetId}/values/${range}:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Write new data
    await fetch(`${SHEETS_API}/${spreadsheetId}/values/${range}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    });

    return {
      success: true,
      synced: pages.length,
      spreadsheetId,
      message: `Synced ${pages.length} pages to Google Sheets`,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    };
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    return {
      success: false,
      message: error.message || 'Sync failed',
      error
    };
  }
}

/**
 * Get current user info
 * @returns {Object|null} User info
 */
export async function getCurrentUser() {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const email = await getUserEmail(token);
    return email ? { email } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Sign out (remove cached token)
 * @returns {boolean} Success status
 */
export async function signOut() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Check if Google Sheets sync is available
 * @returns {boolean}
 */
export function isGoogleSheetsAvailable() {
  return true; // Always available with chrome.identity
}
