/**
 * LocalStorage Module
 * Handles saving/loading wheel data and settings
 */

const Storage = {
  /**
   * Save items for a specific page
   */
  saveItems(pageKey, items) {
    try {
      localStorage.setItem(`${pageKey}:names`, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items:', e);
    }
  },

  /**
   * Load items for a specific page
   */
  loadItems(pageKey) {
    try {
      const data = localStorage.getItem(`${pageKey}:names`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load items:', e);
      return null;
    }
  },

  /**
   * Save title for a specific page
   */
  saveTitle(pageKey, title) {
    try {
      localStorage.setItem(`${pageKey}:title`, title);
    } catch (e) {
      console.error('Failed to save title:', e);
    }
  },

  /**
   * Load title for a specific page
   */
  loadTitle(pageKey) {
    try {
      return localStorage.getItem(`${pageKey}:title`);
    } catch (e) {
      console.error('Failed to load title:', e);
      return null;
    }
  },

  /**
   * Save settings
   */
  saveSettings(settings) {
    try {
      localStorage.setItem('wheel:settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  /**
   * Load settings
   */
  loadSettings() {
    try {
      const data = localStorage.getItem('wheel:settings');
      return data ? JSON.parse(data) : { soundEnabled: false, autoHide: false };
    } catch (e) {
      console.error('Failed to load settings:', e);
      return { soundEnabled: false, autoHide: false };
    }
  },

  /**
   * Clear all data for a specific page
   */
  clearPage(pageKey) {
    try {
      localStorage.removeItem(`${pageKey}:names`);
      localStorage.removeItem(`${pageKey}:title`);
    } catch (e) {
      console.error('Failed to clear page data:', e);
    }
  },

  /**
   * Clear all data
   */
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('wheel:') || key.includes(':names') || key.includes(':title')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Failed to clear all data:', e);
    }
  }
};
