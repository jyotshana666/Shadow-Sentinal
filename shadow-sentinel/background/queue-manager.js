// background/queue-manager.js

/**
 * Queue Manager – handles pending and failed session queues in chrome.storage.
 * Provides enqueue, dequeue, getPending, markFailed, incrementRetry, logBlockedVisit.
 */

/**
 * @description Adds a session to the pending queue.
 * @param {Object} session - Session object to enqueue.
 * @returns {Promise<void>}
 */
function enqueue(session) {
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS])
    .then(res => {
      const pending = res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || [];
      const enriched = Object.assign({}, session, { syncStatus: 'pending', retryCount: 0 });
      pending.push(enriched);
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
 * @description Moves sessions that exceeded max retries to failed queue.
 * @param {Array<Object>} sessions - Sessions that have just failed.
 * @returns {Promise<void>}
 */
function markFailed(sessions) {
  const ids = sessions.map(s => s.sessionId);
  return Promise.all([
    storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS, CONFIG.STORAGE_KEYS.FAILED_SESSIONS]),
  ]).then(([res]) => {
    const pending = (res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || []).filter(s => !ids.includes(s.sessionId));
    const failed = (res[CONFIG.STORAGE_KEYS.FAILED_SESSIONS] || []).concat(sessions.map(s => Object.assign({}, s, { syncStatus: 'failed' })));
    return storageSet({
      [CONFIG.STORAGE_KEYS.PENDING_SESSIONS]: pending,
      [CONFIG.STORAGE_KEYS.FAILED_SESSIONS]: failed
    });
  }).catch(err => logError('MarkFailed error', err));
}

/**
 * @description Increments retryCount for given sessions; moves to failed if over limit.
 * @param {Array<Object>} sessions - Sessions to retry.
 * @returns {Promise<void>}
 */
function incrementRetry(sessions) {
  const ids = sessions.map(s => s.sessionId);
  return storageGet([CONFIG.STORAGE_KEYS.PENDING_SESSIONS])
    .then(res => {
      const pending = (res[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || []).map(s => {
        if (ids.includes(s.sessionId)) {
          s.retryCount = (s.retryCount || 0) + 1;
          if (s.retryCount > CONFIG.MAX_RETRY_COUNT) {
            // Move to failed
            markFailed([s]);
            return null; // will be filtered out
          }
        }
        return s;
      }).filter(Boolean);
      return storageSet({ [CONFIG.STORAGE_KEYS.PENDING_SESSIONS]: pending });
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

self.queueManager = { enqueue, dequeue, getPending, markFailed, incrementRetry, logBlockedVisit };
