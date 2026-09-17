// utils/uuid.js

/**
 * @description Generates a UUID v4 string using the Web Crypto API.
 * @returns {string} RFC‑4122 compliant UUID v4.
 */
function generateUUID() {
  const cryptoObj = (typeof self !== 'undefined' ? self : window).crypto;
  const buffer = new Uint8Array(16);
  cryptoObj.getRandomValues(buffer);
  // Set version to 4
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  // Set variant to RFC4122
  buffer[8] = (buffer[8] & 0x3f) | 0x80;
  const hex = [...buffer].map(b => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

// Export for importScripts environment
self.generateUUID = generateUUID;
