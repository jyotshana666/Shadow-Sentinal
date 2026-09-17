// background/service-worker.js

/**
 * Service Worker orchestrator for ShadowSentinel.
 * Registers Chrome event listeners and delegates all logic to imported modules.
 * No business logic is contained here.
 */
importScripts(
  '../constants/constants.js',
  '../utils/uuid.js',
  '../utils/storage.js',
  '../utils/api.js',
  '../collectors/metadata-collector.js',
  '../background/session-builder.js',
  '../background/queue-manager.js',
  '../background/sync-manager.js'
);

/**
 * Handles extension installation.
 */
function onInstalled() {
  log('Extension installed');
  checkAuthAndRedirect();
  syncManager.setupAlarms();
}

/**
 * Handles browser startup.
 */
function onStartup() {
  log('Browser startup');
  syncManager.setupAlarms();
}

/**
 * Handles incoming messages from content scripts.
 * @param {Object} message - Message payload.
 * @param {Object} sender - Sender info (includes tab.id).
 * @returns {boolean} Always true for async handling.
 */
function onMessage(message, sender) {
  const tabId = sender.tab?.id;
  if (!tabId) return false;
  switch (message.type) {
    case 'UI_SIGNALS':
      sessionBuilder.receiveUiSignals(tabId, message.data);
      break;
    case 'INTERACTION_SIGNALS':
      sessionBuilder.receiveInteractionSignals(tabId, message.data);
      break;
    case 'BLOCKED_SITE_VISITED':
      queueManager.logBlockedVisit(message.data);
      break;
    case 'MANUAL_SYNC':
      syncManager.sync();
      break;
    default:
      log('Unknown message type', message.type);
  }
  return true; // async response
}

/**
 * Handles tab removal – ends any active session.
 * @param {number} tabId - ID of the closed tab.
 */
function onTabRemoved(tabId) {
  sessionBuilder.endSession(tabId);
}

/**
 * Handles alarm events.
 * @param {chrome.alarms.Alarm} alarm
 */
function onAlarm(alarm) {
  if (!alarm) return;
  if (alarm.name === CONFIG.SYNC_ALARM_NAME) {
    syncManager.sync();
  } else if (alarm.name === CONFIG.BLOCK_CHECK_ALARM_NAME) {
    syncManager.refreshBlockedDomains();
  }
}

/**
 * Checks authentication; if missing/invalid, opens login page.
 */
function checkAuthAndRedirect() {
  storageGet([CONFIG.STORAGE_KEYS.AUTH])
    .then(result => {
      const auth = result[CONFIG.STORAGE_KEYS.AUTH];
      if (!auth || !auth.jwt) {
        chrome.tabs.create({ url: chrome.runtime.getURL('auth/login.html') });
        return;
      }
      // Validate JWT expiration (exp is seconds since epoch)
      const payload = JSON.parse(atob(auth.jwt.split('.')[1]));
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSec) {
        storageRemove(CONFIG.STORAGE_KEYS.AUTH);
        chrome.tabs.create({ url: chrome.runtime.getURL('auth/login.html') });
      }
    })
    .catch(err => logError('Auth check error:', err));
}

/**
 * Handles navigation completion to start a session.
 * @param {Object} details - chrome.webNavigation details.
 */
function onNavigationCompleted(details) {
  const tabId = details.tabId;
  if (tabId < 0) return;
  const url = details.url;
  const hostname = new URL(url).hostname;
  // Skip internal Chrome URLs
  if (hostname === 'chrome' || hostname === 'chrome-extension' || hostname === 'about') return;
  sessionBuilder.onNavigation(tabId, hostname);
}

// Register listeners
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onStartup.addListener(onStartup);
chrome.runtime.onMessage.addListener(onMessage);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);

// Initialise metadata collector (runs in service worker)
initMetadataCollector();
