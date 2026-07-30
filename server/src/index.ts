// ──────────────────────────────────────────────
// FinFlow AI Enterprise — Express API Server
// ──────────────────────────────────────────────
// Security-hardened with comprehensive middleware:
//   • Helmet (CSP, HSTS, XSS, Frame, etc.)
//   • CORS with strict origin validation
//   • Request logging via Morgan
//   • JSON body parsing with size/depth limits
//   • Rate limiting (global + auth + AI)
//   • CSRF protection (double-submit cookie)
//   • Input sanitization (XSS prevention)
//   • Request validation (method, content-type, size)
//   • Additional security headers
//   • Authentication (Firebase)
//   • RBAC (role-based access control)
//   • Error handling (structured, no leaks)
// ──────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';

import { env, validateEnv } from './config/env';
import { initFirebase } from './config/firebase';
import { apiRateLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { enhancedHelmet } from './middleware/helmet';
import { secureHeaders } from './middleware/secureHeaders';
import { sanitizeInput } from './middleware/sanitize';
import { csrfProtection } from './middleware/csrf';
import { validateRequest } from './middleware/requestValidation';

// ── Route Imports ──
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import userRoutes from './routes/users';
import departmentRoutes from './routes/departments';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budgets';
import reportRoutes from './routes/reports';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';
import vendorRoutes from './routes/vendors';
import analyticsRoutes from './routes/analytics';
import csrfTokenRoute from './routes/csrf';

// ── Validate Environment ──
validateEnv();

// ── Initialize Firebase ──
initFirebase();

// ── Create Express App ──
const app = express();
const PORT = env.PORT;

// ── Ensure Upload Directory ──
const uploadDir = env.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ══════════════════════════════════════════════════
//  GLOBAL MIDDLEWARE (applied in order)
// ══════════════════════════════════════════════════

// 1. Security Headers (Helmet + custom)
app.use(enhancedHelmet);
app.use(secureHeaders);

// 2. CORS — strict origin validation
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, etc.) in dev
    if (!origin && env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

    // Allow requests with no origin in production too (mobile apps, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[SECURITY] Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-XSRF-TOKEN'],
  exposedHeaders: ['Content-Disposition', 'XSRF-TOKEN'],
  maxAge: 86400, // Preflight cache for 24 hours
}));

// 3. Cookie Parser (required for CSRF)
app.use(cookieParser());

// 4. Request logging
app.use(morgan(env.LOG_LEVEL as string));

// 5. Body parsing with size limits
app.use(express.json({
  limit: '1mb', // Stricter than before
  strict: true, // Reject non-object JSON
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 6. Request validation (method, content-type, size, depth)
app.use('/api', validateRequest);

// 7. Input sanitization (XSS prevention)
app.use('/api', sanitizeInput);

// 8. CSRF protection (exclude webhook and CSRF-token endpoints)
app.use('/api', (req, res, next) => {
  // Skip CSRF for webhook and CSRF-token endpoints
  if (req.path.startsWith('/webhooks') || req.path === '/csrf-token') {
    next();
    return;
  }
  csrfProtection(req, res, next);
});

// 9. Rate limiting (global)
app.use('/api', apiRateLimiter);

// ══════════════════════════════════════════════════

// ── Health Check (no auth required) ──
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FinFlow AI API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/analytics', analyticsRoutes);

// CSRF token endpoint (excluded from CSRF protection)
app.get('/api/csrf-token', csrfTokenRoute);

// Static file serving for uploads (with security: no directory listing)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=3600');
  },
}));

// ══════════════════════════════════════════════════
//  ERROR HANDLING
// ══════════════════════════════════════════════════

// 404 handler — must be registered after all routes
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// ══════════════════════════════════════════════════

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║         FinFlow AI Enterprise — API Server       ║
╠══════════════════════════════════════════════════╣
║  Status:  Running                                ║
║  Port:    ${String(PORT).padEnd(39)}║
║  Mode:    ${env.NODE_ENV.padEnd(39)}║
║  CORS:    ${env.CORS_ORIGIN.padEnd(39)}║
║  AI:      ${env.OPENROUTER_API_KEY ? 'Connected'.padEnd(36) : 'Not Configured'.padEnd(32)}║
║  Security: 🔒 All protections active             ║
╚══════════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ──
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, crash and let the process manager restart
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

export default app;
