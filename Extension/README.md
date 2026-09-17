# Shadow Sentinel - Chrome Extension

## 1. Purpose
The Shadow Sentinel Chrome Extension is the data collection edge module for the Shadow Sentinel enterprise AI governance platform. It monitors web browsing behavior to detect potential usage of AI tools, collect evidence of interaction, and securely transmit telemetry to the central backend without capturing sensitive user information or content.

## 2. Responsibilities
**In Scope:**
* Monitoring web navigation and session durations.
* Detecting AI-related UI components and interaction patterns.
* Building and queuing session payloads locally.
* Synchronizing data with the production backend API with retry logic.
* Enforcing blocked domain policies (if configured).

**Out of Scope (Handled by Backend/Classification Modules):**
* Machine learning risk classification.
* Enterprise dashboards and reporting.
* Server-side user authentication and role management.
* Final enterprise policy decisions.

## 3. Architecture
Data flows through the extension as follows:
`Browser ↓ Collectors (Content Scripts/Web Request) ↓ Signals ↓ Activity Detection ↓ Session Builder ↓ Payload ↓ Local Queue (Storage) ↓ Sync Manager (Alarms) ↓ Backend API`

## 4. Signal Categories
The extension collects three primary categories of signals:
* **Metadata:** Basic navigation data (domain, visit count, session start/end time, request counts, network burst/SSE patterns).
* **UI Signals:** Page characteristics indicating AI capability (e.g., presence of chat input, streaming response divs, AI terminology in meta tags or titles).
* **Interaction Signals:** Meaningful user activity (e.g., form submissions, click rates, chat input presence).

## 5. Data Privacy
**Strict Privacy Guarantee:** This extension is designed to collect *evidence of AI capability and usage*, not content.
* **What is collected:** Domains, timestamps, click rates, presence of specific CSS classes, existence of chat boxes.
* **What is NOT collected:** Passwords, tokens, cookies, chat prompts, chat responses, inputted form values, financial data, or any private message contents.

## 6. Project Structure
* `auth/`: Login UI for the extension popup/options.
* `background/`: Service worker scripts managing sessions, sync, and the queue.
* `collectors/`: Content scripts extracting UI and interaction metadata.
* `constants/`: Configuration and settings.
* `content/`: Scripts injected into web pages (e.g., block enforcer).
* `popup/`: Extension popup UI.
* `utils/`: Reusable utilities (storage, UUID, API).

## 7. API Contract
The extension expects a Spring Boot backend implementing the following contract:

**Authentication (Login):**
* `POST /auth/login`
* Body: `{ "email": "...", "password": "..." }`
* Response: `{ "jwt": "...", "userId": "...", "orgId": "..." }`

**Batch Session Sync:**
* `POST /api/sessions/batch`
* Headers: `Authorization: Bearer <jwt>`
* Body: `{ "sessions": [ { "sessionId": "...", "domain": "...", ... } ] }`
* Response: `{ "synced": <number> }`

**Blocked Domains:**
* `GET /api/users/me/blocked-domains`
* Headers: `Authorization: Bearer <jwt>`
* Response: `{ "blockedDomains": ["example.com", ...] }`

## 8. Configuration
API endpoints are centralized in `constants/constants.js` and support three environments:
* `development`: `http://localhost:8080/api/v1`
* `testing`: `https://test-api.shadowsentinel.internal/api/v1`
* `production`: `https://api.shadowsentinel.com/api/v1`
To change environments, update the `ENV` constant in `constants.js` before building.

## 9. Queue and Retry
Sessions are collected into a local `PENDING_SESSIONS` queue in `chrome.storage.local`. 
If a sync fails (network or server error), the items remain in the queue and their `retryCount` is incremented.
If an item exceeds the `MAX_RETRY_COUNT` (default 10), it is moved to a `FAILED_SESSIONS` dead-letter queue. Both queues are hard-capped at 1000 items to prevent unbounded storage growth.

## 10. Permissions
Required Chrome permissions (`manifest.json`):
* `storage`: Required for local queuing of sessions and caching authentication tokens.
* `alarms`: Required for background synchronization intervals.
* `webNavigation` / `webRequest`: Required to track network bursts, SSE events, and basic domain navigation.
* `activeTab` / `tabs`: Required to correlate network events with specific browsing tabs and track session durations accurately.
* `<all_urls>` (Host Permission): Required to inject signal collectors across all visited domains.

## 11. Testing
Testing currently consists of manual browser tests (see below) to verify end-to-end telemetry flow without mock servers, and basic validation of the generated payloads to ensure zero PII leakage.

## 12. Manual Installation
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the `shadow-sentinel` directory containing the `manifest.json` file.
5. Inspect the Service Worker to view debug logs.

## 13. Limitations
* AI detection relies on common CSS classes, meta tags, and network patterns (SSE). It is an evidentiary signal, not a perfect classification.
* Requires the backend (Spring Boot) and Classification service to be running to turn these raw signals into actionable enterprise risk scores.
