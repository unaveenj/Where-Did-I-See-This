// Configuration constants for the extension

export const CONFIG = {
  // Storage key for page history data
  STORAGE_KEY: 'page_history',

  // Storage key for sync settings
  SYNC_ENABLED_KEY: 'sync_enabled',

  // Supabase credentials (to be filled when enabling cloud sync)
  SUPABASE_URL: 'https://gngjemwoyrnuylfxqlew.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZ2plbXdveXJudXlsZnhxbGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjU0MjYsImV4cCI6MjA4Mjk0MTQyNn0.V-M6j92Y5piAD81GpL9uK1eE9WZofVLmWw2n5BZQUUk',

  // URL patterns to exclude from tracking
  EXCLUDED_PATTERNS: [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^edge:/,
    /^brave:/
  ]
};
