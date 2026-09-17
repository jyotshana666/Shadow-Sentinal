# Shadow Sentinel — Deployment & Containerization Guide

This directory contains the production-ready Docker Compose stack and deployment documentation for **Shadow Sentinel (நிழல் AI)**.

---

## 1. Stack Architecture Overview

The system is containerized into four distinct micro-services operating on a isolated bridge network (`shadowsentinel-net`):

```text
┌─────────────────────────────────────────────────────────────┐
│                   User Browser / Extension                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│                    Frontend (Port 80)                       │
│              Nginx Alpine + React SPA Build                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Port 8080)                     │
│               Spring Boot 3 + Security / JWT                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ HTTP REST                    │ JDBC
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│       ML (Port 5000)         │  │    PostgreSQL (5432)      │
│  FastAPI + Risk Classifier   │  │ Database: SHADOW_SENTINEL │
└──────────────────────────────┘  └───────────────────────────┘
```

---

## 2. Quick Start & Lifecycle Management

### Prerequisites
- Docker Engine 24+ and Docker Compose v2+ installed.
- PostgreSQL container storage volume access.

### Launching the Stack

1. **Environment Setup**:
   Copy `.env.example` to `.env` and set your secrets:
   ```bash
   cp .env.example .env
   ```

2. **Start Services**:
   ```bash
   docker compose up -d --build
   ```

3. **Check Running Status**:
   ```bash
   docker compose ps
   ```

4. **View Container Logs**:
   ```bash
   docker compose logs -f
   ```

5. **Stop Services**:
   ```bash
   docker compose down
   ```

---

## 3. Service Health Endpoints

Each container incorporates automatic healthchecks:

| Service | Port | Health Endpoint / Check |
|---|---|---|
| PostgreSQL | `5432` | `pg_isready -U postgres -d SHADOW_SENTINEL` |
| ML Service | `5000` | `GET http://localhost:5000/health` |
| Backend API | `8080` | `GET http://localhost:8080/api/v1/health` |
| Frontend | `80` | `GET http://localhost:80/` |

---

## 4. Unpacked Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right toggle.
3. Click **Load unpacked** and select the `Extension/` folder from this repository.
4. Open the extension popup, log in, and begin browsing monitored web applications.

---

## 5. Troubleshooting & Diagnostics

- **Database Connection Failure**: Verify that `DB_PASSWORD` in `.env` matches the PostgreSQL credentials and that port `5432` is not occupied by a host PostgreSQL instance.
- **Backend Startup Failure**: Ensure ML service is healthy before Backend attempts model connection during initialization.
- **CORS Issues**: Backend CORS is pre-configured to accept requests from `chrome-extension://*`, `http://localhost:*`, and `http://127.0.0.1:*`.
