// cache.js - Utility for Frontend LocalStorage Caching with Expiry

const EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generate a standard cache key
 * @param {string} docId - The Document ID
 * @param {number} pageNum - The Page Number
 * @param {string} lang - Language code
 * @param {string} type - 'summary', 'audio', or 'translation'
 */
export const generateCacheKey = (docId, pageNum, lang, type) => {
  return `dv_${docId}_p${pageNum}_${lang}_${type}`;
};

/**
 * Get an item from cache
 * @param {string} key - The cache key
 * @returns {any|null} The cached value or null if expired/not found
 */
export const cacheGet = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    
    if (now > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  } catch (err) {
    console.error('Error reading from cache', err);
    return null;
  }
};

/**
 * Set an item in cache
 * @param {string} key - The cache key
 * @param {any} value - The value to store
 */
export const cacheSet = (key, value) => {
  try {
    const item = {
      value: value,
      expiry: new Date().getTime() + EXPIRY_TIME
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (err) {
    console.error('Error writing to cache', err);
  }
};
