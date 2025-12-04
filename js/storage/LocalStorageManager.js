// LocalStorageManager.js - Handles all localStorage operations

class LocalStorageManager {
  static KEYS = {
    RACES: 'avrellant_races',
    CLASSES: 'avrellant_classes',
    BACKGROUNDS: 'avrellant_backgrounds',
    TALENTS: 'avrellant_talents',
    SPELLS: 'avrellant_spells',
    WEAPONS: 'avrellant_weapons',
    ARMOR: 'avrellant_armor',
    ITEMS: 'avrellant_items',
    CHARACTER: 'avrellant_current_character'
  };

  // Save content to localStorage
  static saveContent(type, content) {
    try {
      const key = this.KEYS[type.toUpperCase()];
      if (!key) {
        console.error(`Unknown content type: ${type}`);
        return false;
      }

      const existing = this.loadContent(type);
      const merged = [...existing, ...content];
      localStorage.setItem(key, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      return false;
    }
  }

  // Load content from localStorage
  static loadContent(type) {
    try {
      const key = this.KEYS[type.toUpperCase()];
      if (!key) {
        console.error(`Unknown content type: ${type}`);
        return [];
      }

      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      return [];
    }
  }

  // Delete specific content item by name
  static deleteContent(type, itemName) {
    try {
      const key = this.KEYS[type.toUpperCase()];
      if (!key) {
        console.error(`Unknown content type: ${type}`);
        return false;
      }

      const existing = this.loadContent(type);
      const filtered = existing.filter(item => item.name !== itemName);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      return false;
    }
  }

  // Clear all content of a specific type
  static clearContentType(type) {
    try {
      const key = this.KEYS[type.toUpperCase()];
      if (!key) {
        console.error(`Unknown content type: ${type}`);
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error clearing ${type}:`, error);
      return false;
    }
  }

  // Clear all application data
  static clearAll() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Save current character
  static saveCharacter(character) {
    try {
      localStorage.setItem(this.KEYS.CHARACTER, JSON.stringify(character));
      return true;
    } catch (error) {
      console.error('Error saving character:', error);
      return false;
    }
  }

  // Load current character
  static loadCharacter() {
    try {
      const data = localStorage.getItem(this.KEYS.CHARACTER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading character:', error);
      return null;
    }
  }

  // Clear current character
  static clearCharacter() {
    try {
      localStorage.removeItem(this.KEYS.CHARACTER);
      return true;
    } catch (error) {
      console.error('Error clearing character:', error);
      return false;
    }
  }

  // Get storage usage statistics
  static getStorageStats() {
    let totalSize = 0;
    const stats = {};

    Object.entries(this.KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      const size = data ? data.length : 0;
      stats[name] = {
        size: size,
        items: data ? JSON.parse(data).length || 1 : 0
      };
      totalSize += size;
    });

    return {
      total: totalSize,
      details: stats,
      percentUsed: (totalSize / (5 * 1024 * 1024) * 100).toFixed(2) // Assuming 5MB limit
    };
  }
}
