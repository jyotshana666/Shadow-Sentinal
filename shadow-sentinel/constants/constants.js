// constants/constants.js

/**
 * @description Frozen configuration object for ShadowSentinel extension.
 * All values are centralized here; no functions or logic.
 */
const CONFIG = Object.freeze({
  DEBUG: false,
  API_BASE_URL: 'https://api.shadowsentinel.internal',
  SYNC_ALARM_NAME: 'syncSessions',
  BLOCK_CHECK_ALARM_NAME: 'checkBlockedDomains',
  SYNC_INTERVAL_MINUTES: 0.5,
  BLOCK_CHECK_INTERVAL_MINUTES: 1,
  SESSION_INACTIVITY_MS: 300000, // 5 minutes
  MIN_SESSION_DURATION_SEC: 5,
  MAX_RETRY_COUNT: 10,
  BURST_WINDOW_MS: 10000,
  BURST_THRESHOLD: 5,
  MIN_AI_SCORE: 50,
  MONITOR_AI_SCORE: 20,
  KNOWN_AI_DOMAINS: new Set([
    'chat.openai.com','chatgpt.com','claude.ai','gemini.google.com',
    'copilot.microsoft.com','bard.google.com','huggingface.co','poe.com',
    'perplexity.ai','character.ai','you.com','mistral.ai','groq.com',
    'cohere.com','together.ai','replicate.com','stability.ai',
    'midjourney.com','leonardo.ai','runwayml.com','playground.ai',
    'writesonic.com','jasper.ai','copy.ai'
  ]),
  CATEGORY_MAP: {
    'vedantu.com': 'education_learning',
    'byjus.com': 'education_learning',
    'khanacademy.org': 'education_learning',
    'coursera.org': 'education_learning',
    'udemy.com': 'education_learning',
    'unacademy.com': 'education_learning',
    'github.com': 'developer_tool',
    'gitlab.com': 'developer_tool',
    'stackoverflow.com': 'developer_tool',
    'amazon.com': 'ecommerce',
    'flipkart.com': 'ecommerce',
    'linkedin.com': 'social_media',
    'twitter.com': 'social_media',
    'x.com': 'social_media'
  },
  AI_CLASS_NAMES: [
    '__chat','message-bubble','response-container','chat-container',
    'prompt-input','ai-response','doubt-box','ask-ai','generate-btn',
    'chat-window','copilot-panel','assistant-message','user-message',
    'chat-input','ai-message','bot-message','typing-indicator'
  ],
  AI_TITLE_KEYWORDS: [
    'chatgpt','claude','gemini','copilot','ai','bard','chatbot',
    'assistant','tutor','doubt','generate','gpt','llm'
  ],
  STORAGE_KEYS: {
    AUTH: 'auth',
    PENDING_SESSIONS: 'pendingSessions',
    FAILED_SESSIONS: 'failedSessions',
    BLOCKED_DOMAINS: 'blockedDomains',
    LAST_SYNC_TIME: 'lastSyncTime'
  }
});

// Expose globally for importScripts environment
self.CONFIG = CONFIG;

/**
 * @description Helper log that respects CONFIG.DEBUG.
 * @param {...any} args - Values to log.
 */
function log(...args) { if (CONFIG.DEBUG) console.log('[SS]', ...args); }
/**
 * @description Helper error log that respects CONFIG.DEBUG.
 * @param {...any} args - Values to log.
 */
function logError(...args) { if (CONFIG.DEBUG) console.error('[SS ERROR]', ...args); }
self.log = log;
self.logError = logError;
