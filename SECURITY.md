# FinFlow AI Enterprise — Security Architecture

## Overview

FinFlow AI Enterprise is a financial management platform built with a **defense-in-depth** security strategy. Every layer — from the client application to the API server to the Firebase backend — implements multiple, overlapping security controls to protect financial data and ensure proper access governance.

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Authorization Model (RBAC)](#3-authorization-model-rbac)
4. [Data Isolation Strategy](#4-data-isolation-strategy)
5. [API Security Measures](#5-api-security-measures)
6. [Client Security Measures](#6-client-security-measures)
7. [OWASP Top 10 Protections](#7-owasp-top-10-protections)
8. [Security Checklist](#8-security-checklist)
9. [Incident Response](#9-incident-response)
10. [Security Contacts](#10-security-contacts)

---

## 1. Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT (Next.js)                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ AuthGuard    │  │ API Client   │  │ Client Middleware          │  │
│  │ • Route guard│  │ • JWT inject │  │ • Session tracking         │  │
│  │ • Role check │  │ • CSRF token │  │ • Permission validation    │  │
│  │ • Session    │  │ • Timeout    │  │ • Activity monitoring      │  │
│  └─────────────┘  └──────────────┘  └───────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS / TLS 1.3
                         │ CORS-restricted
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API GATEWAY (Express)                                              │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐         │
│  │ Helmet   │ │ CORS      │ │ Rate     │ │ Request      │         │
│  │ (CSP,    │ │ (strict   │ │ Limiter  │ │ Validation   │         │
│  │  HSTS)   │ │  origin)  │ │          │ │ (method, CT) │         │
│  ├──────────┤ ├───────────┤ ├──────────┤ ├──────────────┤         │
│  │ Sanitize │ │ CSRF      │ │ Auth     │ │ RBAC         │         │
│  │ (XSS     │ │ (double-  │ │ (Firebase│ │ (role-based  │         │
│  │  prevent)│ │  submit)  │ │  JWT)    │ │  access)     │         │
│  ├──────────┤ ├───────────┤ ├──────────┤ ├──────────────┤         │
│  │ Secure   │ │ Zod       │ │ Audit   │ │ Error        │         │
│  │ Headers  │ │ Validation │ │ Logging │ │ Handler      │         │
│  │ (extra)  │ │ (strict)  │ │          │ │ (no leaks)   │         │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────┘         │
└────────────────────────┬────────────────────────────────────────────┘
                         │ Firebase Admin SDK
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FIREBASE BACKEND                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │ Firestore Rules  │  │ Storage Rules    │  │ Firebase Auth     │  │
│  │ • Company        │  │ • Auth required  │  │ • Email/Password  │  │
│  │   isolation      │  │ • Company path   │  │ • Google SSO      │  │
│  │ • Role-based     │  │ • File type      │  │ • Custom claims   │  │
│  │ • Data validation│  │ • Size limits    │  │ • Token expiry    │  │
│  └─────────────────┘  └─────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Security Layers (from outermost to innermost)

| Layer | Protection | Implementation |
|-------|-----------|----------------|
| 1. Network | HTTPS, TLS 1.3 | Infrastructure level |
| 2. Edge | Rate limiting, IP blocking | express-rate-limit |
| 3. Headers | CSP, HSTS, X-Frame-Options, etc. | Helmet + custom headers |
| 4. CORS | Strict origin validation | cors middleware |
| 5. Request | Method, content-type, size validation | requestValidation middleware |
| 6. Sanitization | XSS, HTML injection prevention | sanitize middleware |
| 7. CSRF | Double-submit cookie pattern | csrf middleware |
| 8. Auth | Firebase JWT verification | auth middleware |
| 9. RBAC | Role-based access control | rbac middleware |
| 10. Validation | Zod schema validation | validate middleware |
| 11. Data | Company isolation, ownership checks | firebase.service.ts |
| 12. Backend | Firestore + Storage security rules | firestore.rules, storage.rules |

---

## 2. Authentication Flow

### 2.1 Supported Methods

- **Email + Password** — Firebase Authentication with bcrypt-equivalent hashing
- **Google SSO** — OAuth 2.0 via Firebase Google provider
- **Custom Token** — Server-generated tokens for trusted clients

### 2.2 Authentication Process

```
Client                   Server                    Firebase
  │                        │                         │
  │── 1. Sign In ──────────│─────────────────────────│──►
  │◄── 2. ID Token ───────│◄────────────────────────│───
  │── 3. API Request ─────│                         │
  │   + Bearer token      │                         │
  │                        │── 4. Verify ID Token ──│──►
  │                        │◄── 5. Decoded Claims ──│───
  │                        │
  │                        │── 6. Fetch User Doc ───│──► (Firestore)
  │                        │◄── 7. User Profile ────│───
  │                        │
  │                        │── 8. Check Role/Status ─│
  │                        │── 9. Process Request ──│──►
  │◄── 10. Response ──────│◄────────────────────────│───
```

### 2.3 Token Security

| Feature | Implementation |
|---------|---------------|
| Token type | Firebase ID Token (JWT) |
| Token expiry | 1 hour (configurable in Firebase Console) |
| Refresh token | Automatic via Firebase SDK |
| Token blacklist | In-memory Set with periodic cleanup (Redis in production) |
| Custom claims | Role and companyId embedded in JWT |
| Device fingerprint | User-agent, accept-language, IP combined for anomaly detection |

### 2.4 Session Management

- **Session timeout**: 24 hours of inactivity by default
- **Activity tracking**: Mouse/keyboard/touch events reset the timer
- **Warning**: 5-minute warning before timeout
- **Simultaneous sessions**: Allowed — each has its own ID token
- **Logout all devices**: Token blacklist revocation supported

---

## 3. Authorization Model (RBAC)

### 3.1 Roles & Permissions

| Role | Scope | Description |
|------|-------|-------------|
| `super_admin` | Global | Cross-company access, system configuration |
| `ceo` | Company | Full company access, approvals, reports |
| `finance_manager` | Company | Financial operations, budget management |
| `dept_manager` | Department | Department-level oversight, expense approval |
| `employee` | Self | Create and manage own expenses |

### 3.2 Permission Matrix

| Resource | super_admin | ceo | finance_manager | dept_manager | employee |
|----------|-------------|-----|-----------------|--------------|----------|
| Read own expense | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read company expenses | ✅ | ✅ | ✅ | Department | ❌ |
| Create expense | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve expense | ✅ | ✅ | ✅ | Department | ❌ |
| Manage company | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage budgets | ✅ | ✅ | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete data | ✅ | CEO only | ❌ | ❌ | ❌ |

### 3.3 Enforcement Points

1. **Firestore Security Rules** — First line of defense at the database level
2. **RBAC Middleware** (`rbac.ts`) — Server-side route protection
3. **AuthGuard Component** (`AuthGuard.tsx`) — Client-side UI protection
4. **Client Middleware** (`middleware/index.ts`) — Programmatic route guarding

### 3.4 Privilege Escalation Prevention

- Users cannot change their own `role` field
- Only `super_admin` can assign the `super_admin` role
- `companyId` is immutable once set
- Custom claims are set server-side, not client-side

---

## 4. Data Isolation Strategy

### 4.1 Company-Level Isolation

Every document in Firestore includes a `companyId` field. The security rules and application code enforce that:

- **Users can only read documents** belonging to their own company
- **Users can only create documents** with their own `companyId`
- **Users cannot query** across company boundaries
- **super_admin** has cross-company access for support/audit

### 4.2 Collection Isolation

| Collection | Isolation | Read Access | Write Access |
|------------|-----------|-------------|--------------|
| `users` | User ID | Self or super_admin | Self or super_admin |
| `companies` | Company ID | Member or super_admin | super_admin only |
| `expenses` | Company ID + User ID | Company scoped | Owner + authorized roles |
| `departments` | Company ID | Company scoped | CEO/finance/dept_manager |
| `budgets` | Company ID | Company scoped | CEO/finance_manager |
| `vendors` | Company ID | Company scoped | CEO/finance_manager |
| `notifications` | User ID | Self or company admin | Self |
| `auditLogs` | Company ID | CEO/finance_manager | Server only |
| `aiChats` | Company ID + User ID | Self | Self |

### 4.3 Storage Path Isolation

Files are stored under `/{companyId}/{category}/{filename}`:
- `/{companyId}/receipts/` — Expense receipts
- `/{companyId}/invoices/` — Invoices
- `/{companyId}/avatars/` — User profile pictures
- `/{companyId}/documents/` — General documents
- `/{companyId}/reports/` — Generated reports

---

## 5. API Security Measures

### 5.1 Transport Security

- **HTTPS enforced** in production (HSTS with `max-age=31536000; includeSubDomains; preload`)
- **TLS 1.3** minimum
- All cookies marked `Secure` and `SameSite=Strict`

### 5.2 Request Security (Middleware Stack)

| Middleware | Function | Applied |
|-----------|----------|---------|
| Helmet | CSP, HSTS, XSS protection, frameguard | Global |
| Secure Headers | Permissions-Policy, Referrer-Policy, COOP, COEP | Global |
| CORS | Strict origin validation | Global |
| Cookie Parser | CSRF token parsing | Global |
| Request Logger | Auditable request log | Global |
| Body Parser | JSON parsing with size limit (1 MB) | Global |
| Request Validation | Method whitelist, Content-Type, size, depth | /api routes |
| Input Sanitization | XSS prevention, HTML stripping | /api routes |
| CSRF Protection | Double-submit cookie pattern | /api routes (excl. webhooks) |
| Rate Limiting | Global 100 req/15min, Auth 20 req/15min | /api routes |
| Authentication | Firebase JWT verification | Protected routes |
| RBAC | Role and company access checks | Protected routes |
| Zod Validation | Request body/query/param validation | Per-route |
| Error Handler | Structured errors, no stack leaks | Global |

### 5.3 Rate Limiting Tiers

| Tier | Window | Max Requests | Applied To |
|------|--------|-------------|------------|
| Global | 15 minutes | 100 | All /api routes |
| Auth | 15 minutes | 20 | /api/auth/* |
| AI | 1 minute | 10 | /api/ai/* |

### 5.4 CSRF Protection

- **Pattern**: Double-submit cookie
- **Cookie**: `XSRF-TOKEN` (httpOnly: false, secure, sameSite: strict)
- **Header**: `X-XSRF-TOKEN` (required on all mutating requests)
- **Excluded**: GET, HEAD, OPTIONS, webhook endpoints

### 5.5 Input Validation & Sanitization

- **Zod schemas**: Every endpoint validates input with strict type checking
- **Unknown field stripping**: Zod's `strip` (or `strict`) removes unexpected fields
- **HTML stripping**: All string inputs are sanitized for HTML tags
- **Event handler removal**: `onclick=`, `onload=`, etc. are removed
- **Protocol filtering**: `javascript:` and `data:` URLs are stripped
- **Maximum depth**: JSON objects limited to 20 levels of nesting
- **Maximum size**: Request body limited to 1 MB

### 5.6 Error Handling

- **No stack traces** in production responses
- **No internal paths** or implementation details leaked
- **Error messages** are sanitized to prevent information disclosure
- **Validation errors** return specific field-level messages
- **All errors** are logged server-side with correlation IDs

---

## 6. Client Security Measures

### 6.1 Route Protection (AuthGuard)

- **Loading skeleton** shown while auth state resolves
- **Role-based rendering**: Content only renders for authorized roles
- **Session timeout tracking**: Auto-redirect on expiry
- **Activity monitoring**: Mouse/keyboard/touch reset the session timer
- **Session warning bar**: 5-minute warning before timeout

### 6.2 API Client Security

| Feature | Implementation |
|---------|---------------|
| Auth token injection | Automatic `Bearer` header from Firebase |
| CSRF token | Read from cookie, sent as header on mutating requests |
| Request timeout | 30-second default with configurable timeout |
| Retry logic | Exponential backoff for transient failures |
| Error sanitization | Internal paths and stack traces removed |
| Request ID | `X-Request-ID` header for tracing |
| Credentials | `credentials: 'include'` for cookie-based CSRF |

### 6.3 Client Middleware

- **`checkRouteGuard()`**: Pre-render authorization check
- **`hasPermission()`**: Role verification utility
- **`canAccessCompany()`**: Company scope verification
- **`canModifyResource()`**: Ownership verification
- **Session management**: `initSession()`, `updateSessionActivity()`, `isSessionExpired()`

### 6.4 Firebase Client SDK

- **Auth state listener**: `onAuthStateChanged` syncs store with Firebase
- **Token refresh**: Automatic via Firebase SDK
- **Minimal exposure**: Only `NEXT_PUBLIC_*` vars exposed to browser

---

## 7. OWASP Top 10 Protections

| # | Category | Protection |
|---|----------|-----------|
| 1 | **Broken Access Control** | RBAC middleware, Firestore rules, company isolation, ownership verification |
| 2 | **Cryptographic Failures** | TLS 1.3, HSTS, Firebase Auth (bcrypt-equivalent), encrypted secrets |
| 3 | **Injection** | Zod validation, input sanitization, parameterized Firestore queries, HTML stripping |
| 4 | **Insecure Design** | Defense-in-depth, rate limiting, CSRF protection, least privilege |
| 5 | **Security Misconfiguration** | Hardened Helmet config, secure headers, CORS strict mode, no debug in production |
| 6 | **Vulnerable Components** | Regular dependency updates, private key protection, SCA scanning recommended |
| 7 | **Authentication Failures** | Firebase Auth, JWT verification, token blacklist, session timeout, device fingerprinting |
| 8 | **Integrity Failures** | CSRF double-submit cookie, signed tokens, audit logging |
| 9 | **Logging & Monitoring** | Audit log service, request logging, error tracking, IP logging |
| 10 | **SSRF** | URL sanitization, outbound request restrictions, Firestore Admin SDK used safely |

---

## 8. Security Checklist

### Configuration

- [ ] All secrets stored in environment variables (never in code)
- [ ] CORS origins set to exact production URLs
- [ ] Firebase private key restricted to authorized personnel
- [ ] HSTS enabled in production with `preload`
- [ ] Rate limits tuned for expected traffic
- [ ] Session timeout set to appropriate duration

### Development

- [ ] All user input validated with Zod schemas
- [ ] All HTML/script injection sanitized
- [ ] All mutating endpoints protected by CSRF
- [ ] All API routes have proper RBAC checks
- [ ] Error messages do not leak internal details
- [ ] Audit logs created for sensitive operations
- [ ] No secrets in client-side code or bundles

### Deployment

- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] Security headers verified (use securityheaders.com)
- [ ] Firestore security rules deployed and tested
- [ ] Storage security rules deployed and tested
- [ ] Composite indexes deployed
- [ ] CORS restricted to known origins
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) configured
- [ ] Regular dependency audits scheduled

### Monitoring

- [ ] Failed authentication attempts logged and alerted
- [ ] Rate limit breaches logged
- [ ] Suspicious access patterns monitored
- [ ] Audit logs reviewed regularly
- [ ] Token revocation capability tested
- [ ] Backup and disaster recovery tested

---

## 9. Incident Response

### 9.1 Security Event Detection

- Audit logs capture all security-relevant events
- Rate limit breaches trigger warnings
- Authentication failures are logged with IP and timestamp
- CSRF token mismatches are logged

### 9.2 Response Procedures

1. **Identify**: Review audit logs and server logs
2. **Contain**: Revoke compromised tokens, suspend affected users
3. **Eradicate**: Patch vulnerability, rotate secrets
4. **Recover**: Restore from clean backup if needed
5. **Post-mortem**: Document root cause and preventive measures

### 9.3 Token Revocation

```typescript
// Server-side: revoke a specific token
import { revokeToken } from '../middleware/auth';
revokeToken(token);

// Server-side: revoke all tokens for a user
import { auth } from '../config/firebase';
await auth().revokeRefreshTokens(uid);
```

---

## 10. Security Contacts

- **Security Team**: security@finflow-ai.com
- **Bug Bounty**: https://hackerone.com/finflow-ai
- **PGP Key**: https://finflow-ai.com/security/pgp.asc

---

## Appendices

### A. Firestore Rules Summary

The `firestore.rules` file enforces:
- Company-level data isolation via `companyId` checks
- Role-based access per collection
- Data structure validation on write
- Write-rate limiting (max 60 writes/minute/user)
- Privilege escalation prevention
- Super_admin cross-company bypass

### B. Security Headers Reference

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforces HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Content-Security-Policy` | (see helmet.ts) | XSS prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Permissions-Policy` | (see secureHeaders.ts) | Feature restriction |
| `Cross-Origin-Opener-Policy` | `same-origin` | Origin isolation |
| `Cross-Origin-Resource-Policy` | `same-origin` | Resource isolation |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Embedding restriction |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |

### C. Dependencies Security

All dependencies are regularly audited. The following packages are critical to security:

| Package | Purpose | Security Notes |
|---------|---------|----------------|
| `firebase-admin` | Firebase Backend SDK | Server-side only, never exposed |
| `firebase` | Firebase Client SDK | Version >= 12.x recommended |
| `helmet` | Security headers | v8.x with CSP enabled |
| `express-rate-limit` | Rate limiting | v7.x with standard headers |
| `zod` | Input validation | v3.x with strict mode |
| `multer` | File upload | v1.4.x with type/size limits |
| `jsonwebtoken` | JWT handling | Used by Firebase internally |

---

*Last updated: July 2026*
*This document should be reviewed quarterly and updated with each security audit.*
