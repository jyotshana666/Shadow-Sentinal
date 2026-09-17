# Shadow Sentinel - Spring Boot Backend

## 1. Purpose
The Shadow Sentinel Backend is the central governance core for corporate AI monitoring. It ingests browser activity and signal telemetry from the Chrome Extension edge module, stores classification evidence, runs governance policy evaluation, assesses operational risk levels, generates alerts, and exposes REST APIs for users and enterprise administrators.

## 2. Responsibilities
**In Scope:**
* Authenticating enterprise users and administrators via JWT.
* Ingesting batch telemetry data directly from the Extension (`/api/v1/sessions/batch`).
* Persisting browser sessions and associated classification evidence (Metadata, UI, and Interaction signals).
* Providing an explicit classification boundary (`ClassificationService`) to interface with rule engines or future ML services.
* Evaluating risk and policy rules (`RiskService`) with explainable risk reasons (LOW, MEDIUM, HIGH, CRITICAL).
* Generating and managing security alerts (`AlertService`) when activities violate governance thresholds.
* Security audit logging (`AuditLogService`) for administrative actions.

**Out of Scope:**
* Directly scraping or capturing browser page text or private chat content (Extension edge handles evidence extraction; backend respects privacy boundaries).
* Direct ML model training (ML model inference interface is decoupled via `ClassificationService`).
* Frontend UI rendering.

## 3. Architecture
Data flows into and through the backend as follows:
`Chrome Extension ↓ REST API (/api/v1/sessions/batch) ↓ Authentication / Authorization ↓ BrowserActivityService ↓ JPA Persistence ↓ PostgreSQL ↓ ClassificationService (ML/Heuristic) ↓ RiskService (Policy Engine) ↓ AlertService ↓ Audit Service`

## 4. Package Structure
The backend uses a clean, feature-oriented package layout:
* `com.shadowsentinel.backend.auth`: Authentication controllers, JWT generation/validation, DTOs, and login/registration services.
* `com.shadowsentinel.backend.user`: User entity, repositories, user profiles, and blocked domain APIs.
* `com.shadowsentinel.backend.browser`: Session and activity ingestion controller, DTOs matching Extension payloads, `BrowserSession` and `ClassificationEvidence` entities.
* `com.shadowsentinel.backend.classification`: `ClassificationResult` entity, `ClassificationService` boundary, and heuristic rule classifier implementation.
* `com.shadowsentinel.backend.policy`: Data-driven `Policy` entity, CRUD service, and admin policy management controllers.
* `com.shadowsentinel.backend.risk`: `RiskAssessment` entity, policy-based `RiskService` implementation evaluating session evidence.
* `com.shadowsentinel.backend.alert`: `Alert` entity, alert lifecycle management (OPEN, ACKNOWLEDGED, RESOLVED), and alert trigger logic.
* `com.shadowsentinel.backend.audit`: Administrative `AuditLog` entity, log persistence, and query endpoints.
* `com.shadowsentinel.backend.common`: Centralized security configuration (`SecurityConfig`, `JwtAuthenticationFilter`, `UserPrincipal`), CORS rules, `GlobalExceptionHandler`, and `ApiResponse`/`ErrorResponse` definitions.

## 5. Domain Model
* `User`: Enterprise user/admin entity (`id`, `email`, `passwordHash`, `role` [USER, ADMIN], `orgId`, `status`, `createdAt`, `updatedAt`).
* `BrowserSession`: Browser session metadata (`sessionId`, `userId`, `orgId`, `domain`, `startTime`, `endTime`, `duration`, `visitCount`, `requestCount`, `requestFrequency`, `rapidRequestBurst`, `sseDetected`, `totalSseEvents`, `interactionCount`, `sessionEngagement`, `siteType`, `aiCapability`, `generationActive`, `siteCategory`).
* `ClassificationEvidence`: Ground evidence captured from the browser page (`hasChatInput`, `hasStreamingDiv`, `hasAiTermsInTitle`, `hasAiTermsInMeta`, `detectedAiClasses`, `formInteractionRate`, `aiConfidenceScore`).
* `ClassificationResult`: Site classification decision (`siteType`, `aiCapability`, `generationActive`, `siteCategory`, `confidenceScore`, `classifiedBy`).
* `Policy`: Governance policy rule (`name`, `description`, `domainPattern`, `minRiskLevel`, `action` [BLOCK, ALERT, MONITOR], `enabled`).
* `RiskAssessment`: Evaluated risk state (`riskLevel` [LOW, MEDIUM, HIGH, CRITICAL], `reasons` list, `evaluatedAt`).
* `Alert`: Security alert raised for high-risk sessions (`user`, `browserSession`, `riskLevel`, `reason`, `status` [OPEN, ACKNOWLEDGED, RESOLVED], `createdAt`, `resolvedAt`).
* `AuditLog`: Security log entry (`actor`, `action`, `target`, `details`, `timestamp`).

## 6. API Documentation

### Authentication
* `POST /api/v1/auth/register` (Public): Register new user account.
* `POST /api/v1/auth/login` or `POST /auth/login` (Public): Authenticate user and receive JWT. Returns `{ jwt, userId, orgId, email, role, jwtExpiry }`.

### Extension Telemetry Ingestion
* `POST /api/v1/sessions/batch` or `POST /api/sessions/batch` (Authenticated): Ingest batch browser sessions collected by the Extension.

### Users
* `GET /api/v1/users/me` (Authenticated): Get profile of logged-in user.
* `GET /api/v1/users/me/blocked-domains` (Authenticated): Get list of policy-blocked domains for extension enforcement.
* `GET /api/v1/users` (ADMIN only): Get list of all users.

### Classification & Risk
* `GET /api/v1/classification/sessions/{sessionId}` (Authenticated): Retrieve classification result for a session.
* `GET /api/v1/risk/sessions/{sessionId}` (Authenticated): Retrieve risk assessment for a session.

### Policies & Alerts (Admin / Users)
* `GET /api/v1/policies` (Authenticated): List governance policies.
* `POST /api/v1/policies` (ADMIN only): Create a new governance policy rule.
* `GET /api/v1/alerts/my` (Authenticated): Get user's active alerts.
* `GET /api/v1/alerts` (ADMIN only): Get all system alerts.
* `PATCH /api/v1/alerts/{id}/status?status=RESOLVED` (ADMIN only): Update alert status.

## 7. Security
* **Authentication:** Stateless JWT bearer token authentication. Secrets are injected via configuration/environment variables.
* **Authorization:** Role-based (`ROLE_USER`, `ROLE_ADMIN`) and ownership enforcement. Telemetry ingestion strictly derives ownership from the authenticated `UserPrincipal` token, disregarding arbitrary client-supplied IDs.
* **Password Security:** BCrypt password hashing (`BCryptPasswordEncoder`). Plaintext passwords are never stored or logged.
* **CORS:** Configurable allowed origins (`FRONTEND_ORIGIN`) restricting unauthorized cross-origin requests.
* **Validation:** Multi-layer request validation via Jakarta Validation (`@NotBlank`, `@Email`, `@Valid`) and centralized `@RestControllerAdvice` error responses that sanitize stack traces and SQL details.

## 8. Database Configuration
Primary production database is **PostgreSQL**.
Configured via environment variables:
* `DB_URL` (default: `jdbc:postgresql://localhost:5432/shadow_sentinel`)
* `DB_USERNAME` (default: `postgres`)
* `DB_PASSWORD` (default: `postgres`)
* `JWT_SECRET` (production JWT signing key)
* `FRONTEND_ORIGIN` (allowed CORS origins)

For testing and local development without PostgreSQL, the `test` profile uses an in-memory **H2 Database**.

## 9. Testing
Automated test suite includes Unit Tests (JUnit 5 + Mockito) and Integration Tests (`@SpringBootTest` + `MockMvc`).

To run unit and integration tests:
```bash
mvn clean test
```

To package the production JAR executable:
```bash
mvn clean package
```

## 10. Local Setup
1. Ensure Java 21 JDK and Maven 3.9+ are installed.
2. Start PostgreSQL locally or use H2 fallback.
3. Run the application:
```bash
mvn spring-boot:run
```
4. On startup, `DataSeeder` automatically creates seed accounts if not present:
   * **Admin:** `admin@shadowsentinel.com` / `Admin@123456`
   * **Standard User:** `user@shadowsentinel.com` / `User@123456`

## 11. Limitations & Status
* **ML Model Integration:** The `ClassificationService` interface is implemented via `HeuristicClassificationServiceImpl` as a temporary baseline rule engine. The actual python/ML microservice integration boundary is defined and ready to be plugged in during Stage 3 (ML).
* **NOT YET VERIFIED IN PRODUCTION DEPLOYMENT:** Containerized packaging is ready via `Dockerfile`, but cloud deployment (Render/AWS) will be finalized in Stage 5 (Deployment).
