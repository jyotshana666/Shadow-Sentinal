// content/block-enforcer.js

/**
 * Block Enforcer – Content script that checks if the current domain is blocked.
 * If blocked, hides page content and injects an overlay informing the user.
 * Sends a BLOCKED_SITE_VISITED message to the background.
 */

(async function () {
  try {
    // Retrieve blocked domains from storage
    const result = await storageGet(['blockedDomains']);
    const blocked = result['blockedDomains'] || [];
    const hostname = window.location.hostname;
    if (blocked.includes(hostname)) {
      // Hide existing body content
      document.documentElement.style.display = 'none';

      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '2147483647'; // maximum chrome z-index
      overlay.style.background = 'var(--bg, #fff)';
      overlay.style.color = 'var(--text, #000)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.fontFamily = "'Inter', sans-serif";
      overlay.style.border = '2px solid var(--text, #000)';
      overlay.style.boxShadow = '3px 3px 0 var(--text, #000)';

      const logoBox = document.createElement('div');
      logoBox.textContent = 'SS';
      logoBox.style.width = '48px';
      logoBox.style.height = '48px';
      logoBox.style.background = 'var(--text, #000)';
      logoBox.style.color = 'var(--bg, #fff)';
      logoBox.style.fontWeight = 'bold';
      logoBox.style.fontSize = '24px';
      logoBox.style.display = 'flex';
      logoBox.style.justifyContent = 'center';
      logoBox.style.alignItems = 'center';
      logoBox.style.border = '2px solid var(--text, #000)';
      logoBox.style.boxShadow = '3px 3px 0 var(--text, #000)';
      overlay.appendChild(logoBox);

      const msg = document.createElement('div');
      msg.textContent = `Access to ${hostname} is blocked by ShadowSentinel.`;
      msg.style.marginTop = '16px';
      msg.style.fontSize = '14px';
      overlay.appendChild(msg);

      document.body.appendChild(overlay);

      // Notify background
      chrome.runtime.sendMessage({ type: 'BLOCKED_SITE_VISITED', hostname });
    }
  } catch (e) {
    // Log only if DEBUG is true
    if (self.CONFIG && self.CONFIG.DEBUG) {
      console.error('Block Enforcer error', e);
    }
  }
})();
