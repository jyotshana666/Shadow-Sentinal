// utils/storage.js

/**
 * @description Retrieves values from chrome.storage.local.
 * @param {string|Array<string>|Object} keys - Keys to retrieve, can be a string, array of strings, or an object with default values.
 * @returns {Promise<Object>} Resolves with an object containing the requested key/value pairs.
 */
function storageGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(items);
    });
  });
}

/**
 * @description Stores key/value pairs in chrome.storage.local.
 * @param {Object} items - An object containing key/value pairs to store.
 * @returns {Promise<void>} Resolves when the write completes.
 */
function storageSet(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * @description Removes keys from chrome.storage.local.
 * @param {string|Array<string>} keys - Key or array of keys to remove.
 * @returns {Promise<void>} Resolves when removal completes.
 */
function storageRemove(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

// Export for importScripts environment
self.storageGet = storageGet;
self.storageSet = storageSet;
self.storageRemove = storageRemove;
