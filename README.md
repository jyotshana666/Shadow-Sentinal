# Shadow Sentinel — Integrated Enterprise AI Governance Console (நிழல் AI)

**Shadow Sentinel (நிழal AI)** is an enterprise-grade AI governance, security monitoring, and risk management platform. It combines real-time browser extension telemetry collection, a Spring Boot backend engine, a FastAPI ML classification microservice with dynamic policy risk scoring, and a React + TypeScript security console for end users and enterprise security administrators.

---

## 1. Unified Architecture & Directory Structure

```text
Shadow-Sentinal/
├── Extension/          # Manifest V3 Chrome Extension (Telemetry & UI Signal Collector)
├── Backend/            # Spring Boot 3.3 REST API (Ingestion, Auth, Risk Engine, Persistence)
├── ML/                 # Python 3 FastAPI Microservice & ML Classifier Models
│   ├── Classification/ # Hybrid Feature Extractor & AI Site Classifier
│   ├── Risk/           # Context-Aware Policy & Risk Evaluator
│   ├── api/            # FastAPI microservice REST app & Pydantic schemas
│   ├── artifacts/      # Trained JSON model weight artifacts
│   └── tests/          # Python unittest suite
├── Frontend/           # React 18 + TypeScript + Vite Web Console (User & Admin Portals)
└── Deployment/         # Containerization, Docker Compose, and K8s manifests
```

---

## 2. End-to-End Telemetry & Classification Flow

```text
Browser Extension (Telemetry & Signals)
         │
         ▼  (POST /api/v1/sessions/batch with JWT)
Spring Boot Backend (Authentication & Ingestion)
         │
         ├─────────────────────────────────────────┐
         ▼ (HTTP POST /api/v1/ml/classify)          ▼ (HTTP POST /api/v1/ml/assess-risk)
Python FastAPI ML Microservice             Policy Risk Evaluator
(Hybrid AI Classification)                  (Active Governance Rules)
         │                                         │
         └────────────────────┬────────────────────┘
                              ▼
               PostgreSQL Persistence Layer
                              │
                              ▼ (REST API)
             React + TypeScript Security Console
```

---

## 3. Local Development Prerequisites

- **Java Development Kit (JDK)**: 21 or higher
- **Maven**: 3.8+
- **Python**: 3.10+ (with `fastapi`, `uvicorn`, `pydantic`, `numpy`, `scikit-learn`)
- **Node.js**: v18+ / npm v9+
- **Database**: PostgreSQL 14+ (or embedded H2 for rapid local testing)
- **Browser**: Google Chrome / Chromium (Manifest V3 support)

---

## 4. Local Service Startup Order

### Step 1: Python ML Microservice
```bash
cd ML
pip install -r requirements.txt
python -m uvicorn api.app:app --host 127.0.0.1 --port 5000
```
*Health Check*: `GET http://localhost:5000/health`

### Step 2: Spring Boot Backend
```bash
cd Backend
mvn clean package -DskipTests
java -jar target/backend-1.0.0.jar --spring.profiles.active=dev
```
*Health Check*: `GET http://localhost:8080/api/v1/users/me`

### Step 3: React Frontend Console
```bash
cd Frontend
npm install
npm run dev
```
*Access Console*: `http://localhost:5173`

### Step 4: Chrome Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `Extension/` directory.

---

## 5. Environment Configuration

### Backend (`Backend/src/main/resources/application.yml`)
- `DB_URL`: PostgreSQL JDBC URL (default: `jdbc:postgresql://localhost:5432/shadow_sentinel`)
- `DB_USERNAME` / `DB_PASSWORD`: Database credentials
- `JWT_SECRET`: 512-bit HMAC key
- `ML_SERVICE_URL`: ML microservice endpoint (default: `http://localhost:5000`)
- `FRONTEND_ORIGIN`: Permitted CORS origins (default: `http://localhost:5173,http://localhost:3000`)

### Frontend (`Frontend/.env`)
- `VITE_API_BASE_URL`: Spring Boot API base URL (default: `http://localhost:8080`)

### Extension (`Extension/constants/constants.js`)
- `API_BASE_URL`: Extension API endpoint (default: `http://localhost:8080/api/v1`)

---

## 6. Security, RBAC & Privacy Standards

- **JWT Authentication**: All sensitive API routes require `Authorization: Bearer <token>`.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_USER`: Access to personal telemetry sessions, classification logs, and personal security alerts.
  - `ROLE_ADMIN`: Access to enterprise user management, system-wide session logs, alert triage, policy CRUD, and enterprise audit logs.
- **Graceful ML Fallback**: If the Python ML microservice becomes unavailable, Spring Boot automatically degrades to the local Java heuristic classifier (`HEURISTIC_RULE_ENGINE`) and policy risk engine without throwing exceptions.
- **Privacy Audit**: Telemetry captures metadata (domain, active time), UI indicators (chat inputs, streaming containers), and interaction counts. **No passwords, authentication tokens, cookies, raw chat prompts, or raw AI responses are captured or stored.**

---

## 7. Testing Suites

### Backend Unit & Integration Tests
```bash
cd Backend
mvn test
```

### ML Microservice Tests
```bash
python ML/tests/run_tests.py
```

### Frontend Vitest & TypeScript Tests
```bash
cd Frontend
npm test -- --run
npm run lint
```
