// utils/uuid.js

/**
 * @description Generates a cryptographically‑secure UUID v4 string. Works in both service‑worker (self) and content‑script (window) contexts.
 * @returns {string} UUID v4 formatted as xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID() {
  const cryptoObj = (typeof self !== 'undefined' ? self : window).crypto;
  const buffer = new Uint8Array(16);
  cryptoObj.getRandomValues(buffer);
  // Set version to 4
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  // Set variant to RFC4122
  buffer[8] = (buffer[8] & 0x3f) | 0x80;
  const hex = [...buffer].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export { generateUUID };
