// utils/session.js

/**
 * @description Creates an empty partial session object for a new tab.
 * @param {number} tabId - Chrome tab identifier.
 * @param {string} domain - Hostname of the page (no path/query).
 * @param {string} userId - User identifier from auth storage.
 * @param {string} orgId - Organization identifier from auth storage.
 * @returns {Object} Partial session object with required fields initialized.
 */
function createEmptySession(tabId, domain, userId, orgId) {
  return {
    sessionId: generateUUID(),
    userId,
    orgId,
    domain,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    visitCount: 1,
    requestCount: 0,
    requestFrequency: 0,
    rapidRequestBurst: false,
    sseDetected: false,
    totalSseEvents: 0,
    interactionCount: 0,
    peakRequestWindow: 0,
    sessionEngagement: 'LOW',
    // Layer 2 UI signals defaults
    hasChatInput: false,
    hasStreamingDiv: false,
    hasAiTermsInTitle: false,
    hasAiTermsInMeta: false,
    detectedAiClasses: [],
    formInteractionRate: 0,
    aiConfidenceScore: 0,
    // Classification placeholders
    site_type: null,
    ai_capability: null,
    generation_active: false,
    site_category: null,
    // Sync metadata
    syncStatus: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString()
  };
}

/**
 * @description Finalizes a session by merging UI signals, computing derived fields, and returning a complete session object.
 * @param {Object} partialSession - Partial session built during navigation.
 * @param {Object} uiSignals - UI signals object from content script.
 * @param {Object} interactionData - Interaction data (e.g., interactionCount).
 * @returns {Object} Completed session object ready for storage/sync.
 */
function finalizeSession(partialSession, uiSignals, interactionData) {
  Object.assign(partialSession, uiSignals);
  if (interactionData && typeof interactionData.interactionCount === 'number') {
    partialSession.interactionCount = interactionData.interactionCount;
  }
  // End time and duration
  partialSession.endTime = new Date().toISOString();
  const start = new Date(partialSession.startTime);
  const end = new Date(partialSession.endTime);
  partialSession.duration = Math.round((end - start) / 1000);
  // Request frequency
  partialSession.requestFrequency = partialSession.duration > 0 ? partialSession.requestCount / (partialSession.duration / 60) : 0;
  // Session engagement
  if (partialSession.duration < 60 || partialSession.interactionCount < 2) {
    partialSession.sessionEngagement = 'LOW';
  } else if (partialSession.duration <= 300 && partialSession.interactionCount <= 10) {
    partialSession.sessionEngagement = 'MEDIUM';
  } else {
    partialSession.sessionEngagement = 'HIGH';
  }
  // LEVEL 1 – site_type
  if (KNOWN_AI_DOMAINS.has(partialSession.domain)) {
    partialSession.site_type = 'ai_website';
  } else if (partialSession.aiConfidenceScore >= MIN_AI_CONFIDENCE_SCORE) {
    partialSession.site_type = 'ai_capable_website';
  } else if (partialSession.aiConfidenceScore < MONITOR_CONFIDENCE_SCORE) {
    partialSession.site_type = 'non_ai_website';
  } else {
    partialSession.site_type = 'monitored_website';
  }
  // LEVEL 2 – ai_capability
  if (partialSession.site_type === 'ai_website' || partialSession.site_type === 'ai_capable_website') {
    partialSession.ai_capability = 'ai_capable';
  } else if (partialSession.site_type === 'non_ai_website' || partialSession.site_type === 'monitored_website') {
    partialSession.ai_capability = 'non_ai_capable';
  } else {
    partialSession.ai_capability = 'not_applicable';
  }
  // LEVEL 3 – generation_active
  partialSession.generation_active = partialSession.sseDetected || partialSession.rapidRequestBurst || partialSession.interactionCount > 10;
  // LEVEL 4 – site_category
  if (KNOWN_AI_DOMAINS.has(partialSession.domain)) {
    partialSession.site_category = 'ai_tool';
  } else if (CATEGORY_DOMAIN_MAP[partialSession.domain]) {
    partialSession.site_category = CATEGORY_DOMAIN_MAP[partialSession.domain];
  } else if (partialSession.hasAiTermsInTitle) {
    const eduKeywords = ['education', 'learning', 'course', 'university', 'academy'];
    const title = document.title.toLowerCase();
    partialSession.site_category = eduKeywords.some(k => title.includes(k)) ? 'education_learning' : 'unknown';
  } else {
    partialSession.site_category = 'unknown';
  }
  return partialSession;
}

/**
 * @description Validates a completed session object against schema.
 * @param {Object} session - Session object to validate.
 * @returns {{valid:boolean, errors:Array<string>}} Validation result.
 */
function validateSession(session) {
  const errors = [];
  const required = [
    'sessionId','userId','orgId','domain','startTime','endTime','duration','visitCount','requestCount','requestFrequency','rapidRequestBurst','sseDetected','totalSseEvents','interactionCount','peakRequestWindow','sessionEngagement','hasChatInput','hasStreamingDiv','hasAiTermsInTitle','hasAiTermsInMeta','detectedAiClasses','formInteractionRate','aiConfidenceScore','site_type','ai_capability','generation_active','site_category','syncStatus','retryCount','createdAt'
  ];
  required.forEach(f => {
    if (session[f] === undefined || session[f] === null) errors.push(`Missing ${f}`);
  });
  if (session.duration < 5) errors.push('Duration below minimum');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(session.sessionId)) errors.push('Invalid UUID');
  if (/[\/\?\#]/.test(session.domain)) errors.push('Invalid domain characters');
  if (isNaN(Date.parse(session.startTime)) || isNaN(Date.parse(session.endTime))) errors.push('Invalid timestamps');
  return { valid: errors.length === 0, errors };
}

/**
 * @description Formats seconds into "Xm Ys" format.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted string.
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export { createEmptySession, finalizeSession, validateSession, formatDuration };
