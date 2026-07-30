# FinFlow AI Enterprise - Architecture

## Overview
FinFlow AI Enterprise is a multi-tenant SaaS platform for AI-powered expense management. Built with Next.js 15, Express.js, Firebase, and OpenRouter AI.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js 15)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Pages   │ │Features  │ │Components│ │  State/Zustand│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     API Layer (Express.js)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Routes  │ │Middleware│ │Services  │ │  Validators   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     External Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Firebase  │ │Cloudinary│ │OpenRouter│ │  Tesseract.js │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand, TanStack Query
- **Backend**: Node.js, Express.js, TypeScript
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
- **Storage**: Cloudinary Free
- **AI**: OpenRouter API (free tier)
- **OCR**: Tesseract.js
- **Deployment**: Vercel Free + Render Free

## Feature-Based Structure
```
client/
  features/
    auth/          - Authentication pages & logic
    expenses/      - Expense management
    dashboard/     - Role-based dashboards
    admin/         - Super admin panel
    approvals/     - Approval workflows
    reports/       - Reports & analytics
    ai/            - AI features
    notifications/ - Notification system
    settings/      - User & company settings

shared/
  types/           - Shared TypeScript types
  constants/       - Shared constants
  validation/      - Zod schemas
  utils/           - Shared utilities

server/
  routes/          - API routes (feature-based)
  middleware/      - Auth, RBAC, validation
  services/        - Business logic
  firebase/        - Firebase admin config
```

## Multi-Tenancy
- Every document includes `companyId`
- Firestore Security Rules enforce data isolation
- Users belong to one company via `user.companies[]`
- Super admin has cross-company access

## Data Flow
```
User Action → React Component → Zustand/Hook → API Call →
Express Route → Middleware (Auth/RBAC) → Service →
Firebase SDK → Firestore → Response → UI Update
```
