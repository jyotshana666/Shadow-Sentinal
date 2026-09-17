// background/sync-manager.js

/**
 * Sync Manager – handles periodic syncing of sessions and refreshing blocked domains.
 * No business logic beyond delegating to utils/api and queueManager.
 */

/**
 * @description Sets up Chrome alarms for syncing and blocked‑domain refresh.
 */
function setupAlarms() {
  chrome.alarms.create(CONFIG.SYNC_ALARM_NAME, { periodInMinutes: CONFIG.SYNC_INTERVAL_MINUTES });
  if (chrome.runtime.lastError) logError('Alarm create error (sync):', chrome.runtime.lastError);
  chrome.alarms.create(CONFIG.BLOCK_CHECK_ALARM_NAME, { periodInMinutes: CONFIG.BLOCK_CHECK_INTERVAL_MINUTES });
  if (chrome.runtime.lastError) logError('Alarm create error (block):', chrome.runtime.lastError);
}

/**
 * @description Syncs pending sessions to the backend.
 */
function sync() {
  storageGet([CONFIG.STORAGE_KEYS.AUTH])
    .then(res => {
      const auth = res[CONFIG.STORAGE_KEYS.AUTH];
      if (!auth || !auth.jwt) return; // no auth, nothing to do
      const jwt = auth.jwt;
      return queueManager.getPending()
        .then(pending => {
          if (!pending.length) return;
          const sessions = pending.map(s => ({ ...s })); // strip internal fields if any
          return apiSyncSessions(sessions, jwt)
            .then(resp => {
              // Assume resp.synced contains number of synced sessions
              const syncedIds = sessions.map(s => s.sessionId);
              return queueManager.dequeue(syncedIds)
                .then(() => storageSet({ [CONFIG.STORAGE_KEYS.LAST_SYNC_TIME]: new Date().toISOString() }));
            })
            .catch(err => {
              if (err.status === 401) {
                // Auth invalid – clear and force re‑login
                storageRemove(CONFIG.STORAGE_KEYS.AUTH);
                logError('Sync unauthorized, cleared auth');
              } else {
                // Increment retry count for all pending sessions
                queueManager.incrementRetry(pending);
                logError('Sync error', err);
              }
            });
        });
    })
    .catch(err => logError('Sync storage error', err));
}

/**
 * @description Refreshes the blocked‑domain list from the backend.
 */
function refreshBlockedDomains() {
  storageGet([CONFIG.STORAGE_KEYS.AUTH])
    .then(res => {
      const auth = res[CONFIG.STORAGE_KEYS.AUTH];
      if (!auth || !auth.jwt) return;
      const jwt = auth.jwt;
      return apiGetBlockedDomains(jwt)
        .then(resp => {
          if (Array.isArray(resp.blockedDomains)) {
            return storageSet({ [CONFIG.STORAGE_KEYS.BLOCKED_DOMAINS]: resp.blockedDomains });
          }
        })
        .catch(err => {
          logError('Refresh blocked domains failed', err);
          // Keep existing blocked domains unchanged
        });
    })
    .catch(err => logError('Refresh storage error', err));
}

self.syncManager = { setupAlarms, sync, refreshBlockedDomains };
