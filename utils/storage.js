// utils/storage.js

/**
 * @description Wrapper for chrome.storage.local with Promise interface and error handling.
 * @param {string|Array<string>|Object<string,any>} keys - Keys to retrieve. Can be a string key, array of keys, or object specifying default values.
 * @returns {Promise<Object>} Resolves with an object containing the requested key/value pairs.
 */
function storageGet(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

/**
 * @description Wrapper for chrome.storage.local.set with Promise interface and error handling.
 * @param {Object<string,any>} items - Object containing key/value pairs to store.
 * @returns {Promise<void>} Resolves when the values are stored.
 */
function storageSet(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

/**
 * @description Wrapper for chrome.storage.local.remove with Promise interface and error handling.
 * @param {string|Array<string>} keys - Key or array of keys to remove.
 * @returns {Promise<void>} Resolves when the keys are removed.
 */
function storageRemove(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

// Expose functions globally for importScripts usage
self.storageGet = storageGet;
self.storageSet = storageSet;
self.storageRemove = storageRemove;
