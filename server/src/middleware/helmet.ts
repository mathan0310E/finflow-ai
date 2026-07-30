// ────────────────────────────────────────────────────
// Enhanced Helmet Configuration
// ────────────────────────────────────────────────────
// Provides a pre-configured Helmet middleware with strict
// Content Security Policy, XSS Protection, Frame Options,
// and Referrer Policy tailored for the FinFlow AI API.
// ────────────────────────────────────────────────────

import helmet from 'helmet';
import { env } from '../config/env';

/**
 * Pre-configured Helmet middleware with strict security defaults.
 *
 * Usage:
 * ```typescript
 * import { enhancedHelmet } from './middleware/helmet';
 * app.use(enhancedHelmet);
 * ```
 */
export const enhancedHelmet = helmet({
  // ── Content Security Policy ──
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },
  },

  // ── Cross-Origin Resource Policy ──
  crossOriginResourcePolicy: {
    policy: env.NODE_ENV === 'production' ? 'same-origin' : 'cross-origin',
  },

  // ── Cross-Origin Opener Policy ──
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  // ── Cross-Origin Embedder Policy ──
  crossOriginEmbedderPolicy: false,

  // ── DNS Prefetch Control ──
  dnsPrefetchControl: {
    allow: false,
  },

  // ── Frameguard ──
  frameguard: {
    action: 'deny',
  },

  // ── Hide Powered-By ──
  hidePoweredBy: true,

  // ── HTTP Strict Transport Security ──
  hsts: {
    maxAge: env.NODE_ENV === 'production' ? 31536000 : 0,
    includeSubDomains: true,
    preload: env.NODE_ENV === 'production',
  },

  // ── IE No Open ──
  ieNoOpen: true,

  // ── No Sniff ──
  noSniff: true,

  // ── Permitted Cross-Domain Policies ──
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // ── Referrer Policy ──
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

});
