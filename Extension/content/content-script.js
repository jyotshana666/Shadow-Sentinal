// content/content-script.js

// DEBUG flag is shared via background; we'll define a local one for safety
const DEBUG = false;
function log(...args) { if (DEBUG) console.log('[ShadowSentinel CS]', ...args); }
function logError(...args) { if (DEBUG) console.error('[ShadowSentinel CS ERROR]', ...args); }

/**
 * @description Injects a blocking overlay when the current hostname is in the blocked list.
 */
function enforceBlockIfNeeded() {
  // PRIVACY: only hostname is used, no path/query
  const hostname = window.location.hostname;
  chrome.storage.local.get(['blockedDomains'], (result) => {
    if (chrome.runtime.lastError) {
      logError('storage error', chrome.runtime.lastError.message);
      return;
    }
    const blocked = result.blockedDomains || [];
    if (blocked.includes(hostname)) {
      // Hide existing content
      document.body.style.display = 'none';
      // Create overlay div appended to document.documentElement
      const overlay = document.createElement('div');
      overlay.id = 'shadow-sentinel-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = '#FFFFFF';
      overlay.style.zIndex = '2147483647';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.fontFamily = 'Arial, sans-serif';
      overlay.innerHTML = `
        <div style="text-align:center;color:#000000;">
          <h1 style="font-size:2em;margin:0;font-weight:bold;">Access Restricted</h1>
          <p style="margin:0.5em 0;">This site has been blocked by your IT governance policy</p>
          <p style="margin:0.5em 0;font-weight:bold;">${hostname}</p>
          <p style="margin:0.5em 0;">Contact your administrator to request access</p>
          <small style="margin-top:2em;color:#777777;">ShadowSentinel — Corporate AI Governance</small>
        </div>`;
      document.documentElement.appendChild(overlay);
      // Notify background
      chrome.runtime.sendMessage({ type: 'BLOCKED_SITE_VISITED' }, (resp) => {});
    } else {
      // Not blocked – proceed with UI signal collection
      collectUISignals();
    }
  });
}

function getClassName(element) {
  if (!element) return '';
  if (typeof element.className === 'string') return element.className;
  if (element.className && typeof element.className.baseVal === 'string') return element.className.baseVal;
  return element.getAttribute ? (element.getAttribute('class') || '') : '';
}

/**
 * @description Collects UI signals according to specification and sends them to background.
 */
function collectUISignals() {
  // PRIVACY: never read actual text/value content
  const hasChatInput = !!document.querySelector('textarea, input[type="text"], [role="textbox"]');
  const hasStreamingDiv = !!Array.from(document.querySelectorAll('*')).find(el => {
    const className = getClassName(el);
    const classMatch = /response|output|answer|message|stream|chat/i.test(className);
    const ariaLive = el.getAttribute && el.getAttribute('aria-live') !== null;
    const dataMessage = el.hasAttribute && el.hasAttribute('data-message');
    return classMatch || ariaLive || dataMessage;
  });
  const titleLower = document.title.toLowerCase();
  const aiTitleTerms = ['chatgpt','claude','gemini','copilot','ai','bard','chatbot','assistant','tutor','doubt','generate','gpt','llm'];
  const hasAiTermsInTitle = aiTitleTerms.some(term => titleLower.includes(term));
  const metaElements = document.querySelectorAll('meta[name]');
  const hasAiTermsInMeta = Array.from(metaElements).some(meta => {
    const name = meta.getAttribute ? meta.getAttribute('name') : null;
    return aiTitleTerms.some(term => name && name.toLowerCase().includes(term));
  });
  const detectedAiClassesSet = new Set();
  const classKeywords = ['__chat','message-bubble','response-container','chat-container','prompt-input','ai-response','doubt-box','ask-ai','generate-btn','chat-window','copilot-panel','assistant-message','user-message','chat-input','ai-message','bot-message','typing-indicator'];
  document.querySelectorAll('*').forEach(el => {
    const className = getClassName(el);
    const classes = className.split(/\s+/).filter(Boolean);
    classKeywords.forEach(kw => {
      if (classes.some(cls => cls.includes(kw))) {
        detectedAiClassesSet.add(kw);
      }
    });
  });
  const detectedAiClasses = Array.from(detectedAiClassesSet);
  // Form interaction tracking
  let formSubmitCount = 0;
  const formHandler = () => { formSubmitCount++; };
  document.addEventListener('submit', formHandler);

  // Compute confidence score
  let aiConfidenceScore = 0;
  if (hasChatInput) aiConfidenceScore += 30;
  if (hasStreamingDiv) aiConfidenceScore += 25;
  if (hasAiTermsInTitle) aiConfidenceScore += 20;
  if (hasAiTermsInMeta) aiConfidenceScore += 10;
  if (detectedAiClasses.length > 0) aiConfidenceScore += 10;
  if (formSubmitCount > 3) aiConfidenceScore += 5;

  // Send UI_SIGNALS message
  chrome.runtime.sendMessage({
    type: 'UI_SIGNALS',
    data: {
      hasChatInput,
      hasStreamingDiv,
      hasAiTermsInTitle,
      hasAiTermsInMeta,
      detectedAiClasses,
      formInteractionRate: formSubmitCount,
      aiConfidenceScore,
      url: window.location.hostname // PRIVACY: hostname only
    }
  }, (resp) => {});

  // Interaction event example: listen for clicks on AI-like buttons (no content read)
  // We'll just forward a generic interaction after a short delay
  setTimeout(() => {
    chrome.runtime.sendMessage({ type: 'INTERACTION_EVENT' }, () => {});
  }, 5000);

  // Cleanup listeners after short period (script runs once)
  setTimeout(() => {
    document.removeEventListener('submit', formHandler);
  }, 15000);
}

// Run on document idle
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  enforceBlockIfNeeded();
} else {
  window.addEventListener('DOMContentLoaded', enforceBlockIfNeeded);
}
