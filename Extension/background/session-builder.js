// background/session-builder.js

/** Session Builder – merges collector data, classifies, validates, and enqueues sessions. */
// Imports from importScripts (globals): CONFIG, generateUUID, storageGet, storageSet, storageRemove, getMetadataSnapshot, clearMetadataSession, queueManager, log, logError

const activeSessions = new Map(); // tabId -> session
const inactivityTimers = new Map();

/** Start a session on navigation. */
function onNavigation(tabId, domain) {
  const existing = activeSessions.get(tabId);
  if (existing && existing.domain !== domain) endSession(tabId);
  const session = {
    sessionId: generateUUID(),
    domain,
    startTime: new Date().toISOString(),
    visitCount: 1,
    uiSignalsReceived: false,
    interactionSignalsReceived: false,
    rapidRequestBurst: false,
    sseDetected: false,
    totalSseEvents: 0,
    userEventCount: 0,
    formSubmitCount: 0,
    aiConfidenceScore: 0,
    detectedAiClasses: [],
    site_type: 'unknown',
    ai_capability: 'non_ai_capable',
    generation_active: false,
    site_category: 'unknown'
  };
  // Load auth info
  storageGet([CONFIG.STORAGE_KEYS.AUTH])
    .then(r => { const a = r[CONFIG.STORAGE_KEYS.AUTH]; if (a) { session.userId = a.userId; session.orgId = a.orgId; } })
    .catch(e => logError('Auth load error', e))
    .finally(() => {
      activeSessions.set(tabId, session);
      resetInactivityTimer(tabId);
      if (CONFIG.KNOWN_AI_DOMAINS.has(domain)) {
        session.site_type = 'ai_website';
        session.ai_capability = 'ai_capable';
        session.generation_active = true;
        session.uiSignalsReceived = true;
        session.interactionSignalsReceived = true;
        tryFinalize(tabId);
      }
    });
}

/** Receive UI signals. */
function receiveUiSignals(tabId, uiData) {
  const s = activeSessions.get(tabId);
  if (!s) return;
  Object.assign(s, uiData);
  s.uiSignalsReceived = true;
  if (uiData.aiConfidenceScore >= CONFIG.MIN_AI_SCORE) {
    s.site_type = 'ai_capable_website';
    s.ai_capability = 'ai_capable';
  } else if (uiData.aiConfidenceScore < CONFIG.MONITOR_AI_SCORE && !CONFIG.KNOWN_AI_DOMAINS.has(s.domain)) {
    discardSession(tabId);
    return;
  }
  tryFinalize(tabId);
}

/** Receive interaction signals. */
function receiveInteractionSignals(tabId, interData) {
  const s = activeSessions.get(tabId);
  if (!s) return;
  Object.assign(s, interData);
  s.interactionSignalsReceived = true;
  resetInactivityTimer(tabId);
  tryFinalize(tabId);
}

/** Attempt to finalize when both signals received. */
function tryFinalize(tabId) {
  const s = activeSessions.get(tabId);
  if (!s) return;
  if (!s.uiSignalsReceived || !s.interactionSignalsReceived) return;
  if (s.site_type === 'unknown' && s.aiConfidenceScore < CONFIG.MIN_AI_SCORE) return;
  // Wait for tab close or inactivity to end session.
}

/** End session, merge metadata, classify, validate, enqueue. */
function endSession(tabId) {
  const s = activeSessions.get(tabId);
  if (!s) return;
  const meta = getMetadataSnapshot(tabId);
  if (meta) Object.assign(s, meta);
  s.endTime = new Date().toISOString();
  s.durationSec = Math.round((new Date(s.endTime) - new Date(s.startTime)) / 1000);
  if (s.durationSec < CONFIG.MIN_SESSION_DURATION_SEC) { discardSession(tabId); return; }
  classifySession(s);
  if (!validateSession(s)) { logError('Invalid session', s); discardSession(tabId); return; }
  queueManager.enqueue(s);
  clearInactivityTimer(tabId);
  clearMetadataSession(tabId);
  activeSessions.delete(tabId);
}

/** Classify session fields. */
function classifySession(s) {
  if (CONFIG.KNOWN_AI_DOMAINS.has(s.domain)) s.site_type = 'ai_website';
  else if (s.aiConfidenceScore >= CONFIG.MIN_AI_SCORE) s.site_type = 'ai_capable_website';
  else if (s.aiConfidenceScore >= CONFIG.MONITOR_AI_SCORE) s.site_type = 'monitored_website';
  else s.site_type = 'non_ai_website';
  s.ai_capability = (s.site_type === 'ai_website' || s.site_type === 'ai_capable_website') ? 'ai_capable' : 'non_ai_capable';
  s.generation_active = !!(s.sseDetected || s.rapidRequestBurst || (s.userEventCount && s.userEventCount > 10));
  if (CONFIG.KNOWN_AI_DOMAINS.has(s.domain)) s.site_category = 'ai_tool';
  else if (CONFIG.CATEGORY_MAP[s.domain]) s.site_category = CONFIG.CATEGORY_MAP[s.domain];
  else if (s.hasAiTermsInTitle) s.site_category = 'education_learning';
  else s.site_category = 'unknown';
  // Risk badge default thresholds
  if (s.aiConfidenceScore >= 80) s.risk = 'HIGH';
  else if (s.aiConfidenceScore >= 50) s.risk = 'MEDIUM';
  else s.risk = 'LOW';
}

/** Validate required session fields. */
function validateSession(s) {
  if (!s.sessionId || typeof s.sessionId !== 'string') return false;
  if (!s.domain || /[\/\?]/.test(s.domain)) return false;
  if (!s.startTime || !s.endTime) return false;
  if (isNaN(Date.parse(s.startTime)) || isNaN(Date.parse(s.endTime))) return false;
  if (s.durationSec < CONFIG.MIN_SESSION_DURATION_SEC) return false;
  if (!s.userId || !s.orgId) return false;
  return true;
}

/** Discard session without enqueue. */
function discardSession(tabId) {
  clearInactivityTimer(tabId);
  clearMetadataSession(tabId);
  activeSessions.delete(tabId);
}

/** Reset inactivity timer for a tab. */
function resetInactivityTimer(tabId) {
  clearInactivityTimer(tabId);
  const t = setTimeout(() => endSession(tabId), CONFIG.SESSION_INACTIVITY_MS);
  inactivityTimers.set(tabId, t);
}

/** Clear inactivity timer. */
function clearInactivityTimer(tabId) {
  const t = inactivityTimers.get(tabId);
  if (t) { clearTimeout(t); inactivityTimers.delete(tabId); }
}

// Export functions for service worker
self.sessionBuilder = { onNavigation, receiveUiSignals, receiveInteractionSignals, endSession };
