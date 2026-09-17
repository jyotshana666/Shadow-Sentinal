// background/queue-manager.js

/**
 * Queue Manager – handles pending and failed session queues in chrome.storage.
 * Provides enqueue, dequeue, getPending, markFailed, incrementRetry, logBlockedVisit.
 */

const MAX_QUEUE_SIZE = 1000;

/**
 * @description Adds a session to the pending queue.
 * @param {Object} session - Session object to enqueue.
 * @returns {Promise<void>}
 */
function enqueue(session) {
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS])
    .then(res => {
      let pending = res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || [];
      const enriched = Object.assign({}, session, { syncStatus: 'pending', retryCount: 0 });
      pending.push(enriched);
      
      // Enforce storage limits
      if (pending.length > MAX_QUEUE_SIZE) {
        pending = pending.slice(-MAX_QUEUE_SIZE);
      }
      return storageSet({ [CONFIG.STORAGE_KEYS.PENDING_SESSIONS]: pending });
    })
    .catch(err => logError('Enqueue error', err));
}

/**
 * @description Removes sessions from pending queue by IDs.
 * @param {Array<string>} sessionIds - List of sessionId strings to remove.
 * @returns {Promise<void>}
 */
function dequeue(sessionIds) {
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS])
    .then(res => {
      const pending = (res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || []).filter(s => !sessionIds.includes(s.sessionId));
      return storageSet({ [CONFIG.STORAGE_KEYS.PENDING_SESSIONS]: pending });
    })
    .catch(err => logError('Dequeue error', err));
}

/**
 * @description Retrieves the pending sessions array.
 * @returns {Promise<Array<Object>>}
 */
function getPending() {
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS])
    .then(res => res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || [])
    .catch(err => { logError('GetPending error', err); return []; });
}

/**
 * @description Increments retryCount for given sessions; moves to failed if over limit.
 * @param {Array<Object>} sessions - Sessions to retry.
 * @returns {Promise<void>}
 */
function incrementRetry(sessions) {
  const ids = sessions.map(s => s.sessionId);
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS, CONFIG.STORAGE_KEYS.FAILED_SESSIONS])
    .then(res => {
      let pending = res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || [];
      let failed = res[CONFIG.STORAGE_KEYS.FAILED_SESSIONS] || [];
      const newFailed = [];
      
      pending = pending.map(s => {
        if (ids.includes(s.sessionId)) {
          s.retryCount = (s.retryCount || 0) + 1;
          if (s.retryCount > (CONFIG.MAX_RETRY_COUNT || 10)) {
            newFailed.push(Object.assign({}, s, { syncStatus: 'failed' }));
            return null; // will be filtered out
          }
        }
        return s;
      }).filter(Boolean);
      
      if (newFailed.length > 0) {
        failed = failed.concat(newFailed);
        // Enforce limits on failed queue too
        if (failed.length > MAX_QUEUE_SIZE) {
          failed = failed.slice(-MAX_QUEUE_SIZE);
        }
      }
      
      return storageSet({ 
        [CONFIG.STORAGE_KEYS.PENDING_SESSIONS]: pending,
        ...(newFailed.length > 0 ? { [CONFIG.STORAGE_KEYS.FAILED_SESSIONS]: failed } : {})
      });
    })
    .catch(err => logError('IncrementRetry error', err));
}

/**
 * @description Logs a blocked domain visit; caps log at 100 entries.
 * @param {Object} data - Contains hostname.
 */
function logBlockedVisit(data) {
  const entry = { domain: data.hostname, timestamp: new Date().toISOString() };
  storageGet(['blockedVisitLog'])
    .then(res => {
      const log = (res['blockedVisitLog'] || []).concat(entry);
      const capped = log.slice(-100);
      return storageSet({ blockedVisitLog: capped });
    })
    .catch(err => logError('logBlockedVisit error', err));
}

self.queueManager = { enqueue, dequeue, getPending, incrementRetry, logBlockedVisit };
