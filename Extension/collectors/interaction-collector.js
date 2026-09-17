// collectors/interaction-collector.js

/**
 * @description Starts tracking interaction signals on the page.
 * Counts form submissions, click events, and keydown events.
 * Sends INTERACTION_SIGNALS message after 10 seconds or when formSubmitCount > 5.
 */
function startInteractionTracking() {
  let formSubmitCount = 0;
  let userEventCount = 0;

  const onSubmit = (e) => {
    formSubmitCount += 1;
    // PRIVACY: form submit count only — FormData never accessed
  };
  const onClickOrKey = (e) => {
    userEventCount += 1;
    // PRIVACY: event count only — key values, mouse coordinates never stored
  };

  document.addEventListener('submit', onSubmit, true);
  document.addEventListener('click', onClickOrKey, true);
  document.addEventListener('keydown', onClickOrKey, true);

  const sendAndCleanup = () => {
    chrome.runtime.sendMessage({
      type: 'INTERACTION_SIGNALS',
      data: {
        formSubmitCount,
        userEventCount,
        hostname: window.location.hostname // PRIVACY: hostname only
      }
    }, () => { if (chrome.runtime.lastError) {} });
    // Remove listeners
    document.removeEventListener('submit', onSubmit, true);
    document.removeEventListener('click', onClickOrKey, true);
    document.removeEventListener('keydown', onClickOrKey, true);
  };

  const timer = setTimeout(() => {
    sendAndCleanup();
  }, 10000); // 10 seconds

  // If formSubmitCount exceeds threshold before timer fires, send immediately
  const checkThreshold = () => {
    if (formSubmitCount > 5) {
      clearTimeout(timer);
      sendAndCleanup();
    }
  };
  document.addEventListener('submit', checkThreshold, true);
}

// Entry point – start tracking immediately
startInteractionTracking();
