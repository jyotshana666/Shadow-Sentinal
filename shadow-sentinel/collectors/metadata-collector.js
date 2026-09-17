// collectors/metadata-collector.js

/**
 * @description In‑memory tracker for navigation and request metadata per tab.
 * This runs in the service worker context.
 */
(function () {
  const trackingMap = new Map(); // tabId -> { domain, startTime, requestCount, requestTimestamps, sseDetected, totalSseEvents, visitCount, rapidRequestBurst }

  /**
   * @description Initializes listeners for navigation and webRequest events.
   */
  function initMetadataCollector() {
    chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);
    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls: ["<all_urls>"] });
    chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, { urls: ["<all_urls>"] }, []);
  }

  function onNavigationCompleted(details) {
    const tabId = details.tabId;
    if (tabId < 0) return; // ignore non-tab contexts
    const domain = new URL(details.url).hostname;
    // PRIVACY: hostname only — path, query string, fragment never stored
    startMetadataSession(tabId, domain);
  }

  function onBeforeRequest(details) {
    const tabId = details.tabId;
    if (tabId < 0) return;
    const timestamp = Date.now();
    updateRequestCount(tabId, timestamp);
  }

  function onBeforeSendHeaders(details) {
    const tabId = details.tabId;
    if (tabId < 0) return;
    const acceptHeader = details.requestHeaders?.find(h => h.name.toLowerCase() === 'accept');
    if (acceptHeader && /text\/event-stream/.test(acceptHeader.value)) {
      // PRIVACY: SSE detected by Accept header name only — value not stored beyond boolean
      markSseDetected(tabId);
    }
  }

  /**
   * @description Starts tracking for a tab.
   * @param {number} tabId - Chrome tab ID.
   * @param {string} domain - Hostname.
   */
  function startMetadataSession(tabId, domain) {
    trackingMap.set(tabId, {
      domain,
      startTime: new Date().toISOString(),
      requestCount: 0,
      requestTimestamps: [],
      sseDetected: false,
      totalSseEvents: 0,
      visitCount: 1,
      rapidRequestBurst: false
    });
  }

  /**
   * @description Updates request count and checks for burst.
   * @param {number} tabId - Chrome tab ID.
   * @param {number} timestamp - Epoch ms of request.
   */
  function updateRequestCount(tabId, timestamp) {
    const entry = trackingMap.get(tabId);
    if (!entry) return;
    entry.requestCount += 1;
    entry.requestTimestamps.push(timestamp);
    // Remove timestamps older than BURST_WINDOW_MS
    const windowStart = timestamp - CONFIG.BURST_WINDOW_MS;
    entry.requestTimestamps = entry.requestTimestamps.filter(t => t >= windowStart);
    if (entry.requestTimestamps.length >= CONFIG.BURST_THRESHOLD) {
      entry.rapidRequestBurst = true;
    }
  }

  /**
   * @description Marks SSE detection for a tab.
   * @param {number} tabId - Chrome tab ID.
   */
  function markSseDetected(tabId) {
    const entry = trackingMap.get(tabId);
    if (!entry) return;
    entry.sseDetected = true;
    entry.totalSseEvents += 1;
  }

  /**
   * @description Returns a snapshot of metadata for a tab.
   * @param {number} tabId - Chrome tab ID.
   * @returns {Object|null} MetadataResult or null if not tracked.
   */
  function getMetadataSnapshot(tabId) {
    const entry = trackingMap.get(tabId);
    if (!entry) return null;
    const elapsedMs = Date.now() - new Date(entry.startTime).getTime();
    const elapsedMinutes = elapsedMs / 60000;
    return {
      domain: entry.domain,
      startTime: entry.startTime,
      requestCount: entry.requestCount,
      requestFrequency: elapsedMinutes > 0 ? entry.requestCount / elapsedMinutes : 0,
      rapidRequestBurst: entry.rapidRequestBurst,
      sseDetected: entry.sseDetected,
      totalSseEvents: entry.totalSseEvents,
      visitCount: entry.visitCount
    };
  }

  /**
   * @description Clears tracking data for a tab.
   * @param {number} tabId - Chrome tab ID.
   */
  function clearMetadataSession(tabId) {
    trackingMap.delete(tabId);
  }

  // Export globals for importScripts
  self.initMetadataCollector = initMetadataCollector;
  self.startMetadataSession = startMetadataSession; // not used externally but kept for completeness
  self.updateRequestCount = updateRequestCount;
  self.markSseDetected = markSseDetected;
  self.getMetadataSnapshot = getMetadataSnapshot;
  self.clearMetadataSession = clearMetadataSession;
})();
