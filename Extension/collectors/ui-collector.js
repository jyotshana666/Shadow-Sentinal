// collectors/ui-collector.js

/**
 * @description Collects UI signals from the page DOM.
 * Runs once on document_idle. Does not poll.
 * Returns a UiResult object and sends it to the service worker.
 */
function collectUiSignals() {
  // hasChatInput
  const hasChatInput = !!document.querySelector('textarea, input[type="text"], [role="textbox"]');
  // PRIVACY: element existence only — .value is never read

  // hasStreamingDiv
  const streamingDivSelector = '*';
  let hasStreamingDiv = false;
  const streamingKeywords = /response|output|answer|message|stream|chat/i;
  document.querySelectorAll(streamingDivSelector).forEach(el => {
    if (streamingKeywords.test(el.className)) hasStreamingDiv = true;
    if (el.getAttribute('aria-live')) hasStreamingDiv = true;
    if (el.hasAttribute('data-message')) hasStreamingDiv = true;
  });
  // PRIVACY: attribute existence check only — attribute values never read

  // hasAiTermsInTitle
  const lowerTitle = document.title.toLowerCase();
  const hasAiTermsInTitle = CONFIG.AI_TITLE_KEYWORDS.some(k => lowerTitle.includes(k));
  // PRIVACY: title checked for keyword presence only — raw title not stored

  // hasAiTermsInMeta
  const metaElements = document.querySelectorAll('meta[name]');
  const hasAiTermsInMeta = Array.from(metaElements).some(meta => {
    const name = meta.getAttribute('name').toLowerCase();
    return CONFIG.AI_TITLE_KEYWORDS.includes(name);
  });
  // PRIVACY: meta tag NAME checked for existence — content never read

  // detectedAiClasses
  const detectedSet = new Set();
  document.querySelectorAll('*').forEach(el => {
    const classes = el.className.split(/\s+/);
    classes.forEach(cls => {
      if (CONFIG.AI_CLASS_NAMES.includes(cls)) detectedSet.add(cls);
    });
  });
  const detectedAiClasses = Array.from(detectedSet);
  // PRIVACY: class names only — no text content read

  // formInteractionRate placeholder (no actual form tracking here)
  const formInteractionRate = 0; // not tracked in this collector

  // aiConfidenceScore calculation
  let aiConfidenceScore = 0;
  if (hasChatInput) aiConfidenceScore += 30;
  if (hasStreamingDiv) aiConfidenceScore += 25;
  if (hasAiTermsInTitle) aiConfidenceScore += 20;
  if (hasAiTermsInMeta) aiConfidenceScore += 10;
  if (detectedAiClasses.length > 0) aiConfidenceScore += 10;
  if (formInteractionRate > 3) aiConfidenceScore += 5;
  aiConfidenceScore = Math.min(aiConfidenceScore, 100);

  return {
    hasChatInput,
    hasStreamingDiv,
    hasAiTermsInTitle,
    hasAiTermsInMeta,
    detectedAiClasses,
    aiConfidenceScore
  };
}

// Send result to background service worker
const uiResult = collectUiSignals();
chrome.runtime.sendMessage({
  type: 'UI_SIGNALS',
  data: {
    ...uiResult,
    hostname: window.location.hostname // PRIVACY: hostname only
  }
}, () => { if (chrome.runtime.lastError) {} });
