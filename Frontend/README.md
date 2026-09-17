# Shadow Sentinel — Frontend Module (நிழல் AI)

The **Frontend Module** of Shadow Sentinel provides a modern, responsive web console for end users and enterprise security administrators to monitor browser telemetry, review AI model classifications, analyze risk assessments, manage security policies, handle security alerts, and inspect audit logs.

---

## 1. Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tooling**: Vite 5
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (Utility CSS with custom UI components)
- **Icons**: Lucide React
- **Testing**: Vitest
- **API Communication**: Axios with custom interceptors for JWT Bearer tokens and auto-logout on `401 Unauthorized`.

---

## 2. Directory Structure

```text
Frontend/
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite build and test configuration
├── .env.example                # Base environment variables template
├── dist/                       # Compiled production build artifacts
└── src/
    ├── main.tsx                # React application bootstrapper
    ├── App.tsx                 # Root router and page definitions
    ├── index.css               # Global utility CSS styles
    ├── vite-env.d.ts           # Vite client type declarations
    ├── api/
    │   └── client.ts           # Centralized Axios client & interceptors
    ├── context/
    │   └── AuthContext.tsx     # Global JWT auth & RBAC state context
    ├── types/
    │   └── index.ts            # TypeScript interfaces matching Backend DTOs
    ├── services/               # REST API service layers
    │   ├── auth.service.ts
    │   ├── user.service.ts
    │   ├── browser.service.ts
    │   ├── classification.service.ts
    │   ├── risk.service.ts
    │   ├── alert.service.ts
    │   ├── policy.service.ts
    │   └── audit.service.ts
    ├── components/             # Reusable UI & Layout components
    │   ├── Navbar.tsx
    │   ├── Sidebar.tsx
    │   ├── DashboardLayout.tsx
    │   ├── ProtectedRoute.tsx
    │   ├── RiskBadge.tsx
    │   ├── LoadingSpinner.tsx
    │   └── ErrorAlert.tsx
    ├── pages/                  # Views for User and Admin portals
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   ├── UserDashboardPage.tsx
    │   ├── BrowserActivityPage.tsx
    │   ├── UserAlertsPage.tsx
    │   ├── AdminDashboardPage.tsx
    │   ├── AdminUsersPage.tsx
    │   ├── AdminSessionsPage.tsx
    │   ├── AdminAlertsPage.tsx
    │   ├── AdminPoliciesPage.tsx
    │   └── AdminAuditLogsPage.tsx
    └── tests/                  # Automated test specifications
        └── RiskBadge.test.ts
```

---

## 3. Architecture & Authentication Flow

### Authentication & RBAC
1. **JWT Storage**: JWT token received upon login/registration is saved in `localStorage`.
2. **Bearer Token Injection**: Centralized Axios client (`src/api/client.ts`) attaches `Authorization: Bearer <token>` to all outgoing REST requests.
3. **Session Expiry Handling**: Interceptor listens for `401 Unauthorized` responses and automatically clears local auth state, redirecting the user to `/login`.
4. **Role-Based Guards**: `<ProtectedRoute requiredRole="ROLE_ADMIN">` checks `user.role` from `AuthContext` to restrict admin pages (`/admin/*`) strictly to admin accounts.

---

## 4. Endpoints Consumed & Backend DTO Contracts

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | User/Admin authentication |
| **Auth** | `POST` | `/api/v1/auth/register` | Account registration |
| **Users** | `GET` | `/api/v1/users/me` | Fetch authenticated user profile |
| **Users** | `GET` | `/api/v1/users` | List all users (Admin only) |
| **Sessions** | `GET` | `/api/v1/browser/sessions/my` | User browser sessions |
| **Sessions** | `GET` | `/api/v1/browser/sessions` | All browser sessions (Admin only) |
| **Classification** | `GET` | `/api/v1/classification/sessions/{sessionId}` | Session AI classification results |
| **Risk** | `GET` | `/api/v1/risk/sessions/{sessionId}` | Session risk evaluation results |
| **Alerts** | `GET` | `/api/v1/alerts/my` | User security alerts |
| **Alerts** | `GET` | `/api/v1/alerts` | System security alerts (Admin only) |
| **Alerts** | `PATCH` | `/api/v1/alerts/{id}/status?status=...` | Update alert status |
| **Policies** | `GET` | `/api/v1/policies` | Security policies |
| **Policies** | `POST` | `/api/v1/policies` | Create policy (Admin only) |
| **Policies** | `PUT` | `/api/v1/policies/{id}` | Update policy (Admin only) |
| **Policies** | `DELETE` | `/api/v1/policies/{id}` | Delete policy (Admin only) |
| **Audit Logs** | `GET` | `/api/v1/admin/audit-logs` | Enterprise audit trail (Admin only) |

---

## 5. Development & Testing Instructions

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8080
```

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Output static bundle will be generated in `dist/`.

---

## 6. Security & Production Deployment Considerations

- **Strict Authorization**: Frontend routes provide user experience boundaries; all data access and actions are strictly validated server-side by Spring Boot Security & JWT filter.
- **Environment Isolation**: API endpoints are fully configurable via Vite environment variable `VITE_API_BASE_URL`.
- **CORS Support**: Designed to work seamlessly with backend CORS origins configured in Spring Boot (`SecurityConfig`).
