// Configuration constants for the extension

export const CONFIG = {
  // Storage key for page history data
  STORAGE_KEY: 'page_history',

  // Storage key for sync settings
  SYNC_ENABLED_KEY: 'sync_enabled',

  // Google Sheets settings
  SHEETS_SPREADSHEET_NAME: 'WhereDidISeeThis_History',
  GOOGLE_API_KEY: '', // Not needed - using OAuth

  // URL patterns to exclude from tracking
  EXCLUDED_PATTERNS: [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^edge:/,
    /^brave:/
  ]
};
