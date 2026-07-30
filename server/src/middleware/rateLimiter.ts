// ──────────────────────────────────────────────
// Rate Limiting Configuration
// ──────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: `You have exceeded the rate limit of ${env.RATE_LIMIT_MAX} requests per ${env.RATE_LIMIT_WINDOW_MS / 60000} minutes. Please try again later.`,
  },
});

/**
 * Stricter rate limiter for authentication routes
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: `You have exceeded the rate limit of ${env.AUTH_RATE_LIMIT_MAX} requests per ${env.RATE_LIMIT_WINDOW_MS / 60000} minutes for auth endpoints.`,
  },
});

/**
 * AI endpoints rate limiter — more restrictive due to API costs
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'AI endpoint rate limit: 10 requests per minute. Please slow down.',
  },
});
