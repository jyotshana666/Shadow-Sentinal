# Shadow Sentinel — Render Cloud Production Deployment Guide

This guide details the Render Blueprint deployment preparation for **Shadow Sentinel (நிழல் AI)**.

---

## 1. Environment & Resource Plan Requirements

Render compute resources and database plans differ between local development/testing and production:

### Development & Testing Environments
- **Local Multi-Container Stack**: Runs zero-cost via Docker Compose (`Deployment/docker-compose.yml`) utilizing local PostgreSQL, FastAPI ML, Spring Boot, and Nginx containers.
- **Render Free Tier Experimentation**: Free plans are available on Render for Web Services, Static Sites, and temporary PostgreSQL instances.
  > [!WARNING]
  > Render Free PostgreSQL database instances expire after **30 days**. Free Postgres is suitable for temporary experimentation and testing only, not permanent production persistence.

### Production Environment Requirements
- **ML Private Service (`shadowsentinel-ml`)**: Requires a paid compute plan (`plan: starter`, $7/mo minimum). Render does not offer a free compute tier for Private Services (`pserv`).
- **Managed PostgreSQL (`shadowsentinel-db`)**: Requires a paid database instance (`plan: starter`, $7/mo minimum) for persistent production data storage beyond 30 days.
- **Backend API (`shadowsentinel-backend`)**: Web Service (`plan: free` for initial launch or `starter`).
- **Frontend SPA (`shadowsentinel-frontend`)**: Static Site (`runtime: static`, free CDN hosting).

---

## 2. Production Topology Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension Popup                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│        Frontend Static Site (Render CDN / Static)           │
│         https://shadowsentinel-frontend.onrender.com        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Backend Web Service (Docker / Java 21)             │
│          https://shadowsentinel-backend.onrender.com        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ HTTP REST (Internal)         │ JDBC SSL
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│     ML Private Service       │  │    Managed PostgreSQL     │
│   (Render Private Network)   │  │ Database: SHADOW_SENTINEL │
└──────────────────────────────┘  └───────────────────────────┘
```

---

## 3. Render Blueprint Specification (`render.yaml`)

The infrastructure is defined as code in [`render.yaml`](../render.yaml):

| Service Name | Render Service Type | Plan Tier | Source Directory / Dockerfile | Health Check Endpoint | Public Exposure |
|---|---|---|---|---|---|
| `shadowsentinel-db` | Managed PostgreSQL | `starter` (Paid) | PostgreSQL 15 | `pg_isready` | Internal SSL |
| `shadowsentinel-ml` | Private Service (`pserv`) | `starter` (Paid) | `ML/Dockerfile` | `/health` | Private Network Only |
| `shadowsentinel-backend` | Web Service (`web`) | `free` / `starter` | `Backend/Dockerfile` | `/api/v1/health` | Public HTTPS (`:8080`) |
| `shadowsentinel-frontend` | Static Site (`runtime: static`) | Free CDN | `Frontend/` | `/` | Public HTTPS CDN (`:80`) |

---

## 4. Environment Variables Matrix

### Backend Web Service
- `DB_URL`: Dynamically injected from `shadowsentinel-db` connection string (`jdbc:postgresql://...`).
- `DB_USERNAME`: Dynamically injected from `shadowsentinel-db` user.
- `DB_PASSWORD`: Dynamically injected from `shadowsentinel-db` password.
- `JWT_SECRET`: Auto-generated 256-bit secret string (`generateValue: true`).
- `JWT_EXPIRATION`: `86400000` (24 Hours).
- `FRONTEND_ORIGIN`: Injected dynamically from `shadowsentinel-frontend` URL (`https://shadowsentinel-frontend.onrender.com`).
- `ML_SERVICE_URL`: Injected dynamically from `shadowsentinel-ml` host/port on Render private network (`http://shadowsentinel-ml:5000`).

### Frontend Static Site
- `VITE_API_BASE_URL`: Build-time environment variable pointing to `https://shadowsentinel-backend.onrender.com/api/v1`.

### ML Private Service
- `PORT`: `5000`
- `LOG_LEVEL`: `INFO`
- `PYTHONPATH`: `/app` (Set inside `ML/Dockerfile`)

---

## 5. Chrome Extension Production Deployment Setup

To point the Chrome Extension to your deployed Render backend:

1. In [Extension/constants/constants.js](../Extension/constants/constants.js), update line 7:
   ```javascript
   const ENV = 'production';
   ```
2. Set the `production.API_BASE_URL` in `ENV_CONFIG`:
   ```javascript
   production: {
     API_BASE_URL: 'https://shadowsentinel-backend.onrender.com/api/v1',
     DEBUG: false
   }
   ```
3. Load or package the updated extension in Chrome (`chrome://extensions/`).

---

## 6. Database Schema Initialization

The Spring Boot backend uses JPA / Hibernate entity-driven schema management (`spring.jpa.hibernate.ddl-auto: update`). Upon launching against the empty managed Render PostgreSQL database, Hibernate automatically initializes all necessary database tables:
- `users`
- `browser_sessions`
- `classification_evidence`
- `classification_results`
- `risk_assessments`
- `risk_assessment_reasons`
- `alerts`
- `audit_logs`

DataSeeder automatically populates initial admin/user accounts and default AI governance policies on startup.
