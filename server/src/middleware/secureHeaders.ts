// ────────────────────────────────────────────────────
// Additional Security Headers Middleware
// ────────────────────────────────────────────────────
// Sets security-related HTTP headers that Helmet doesn't cover
// or that need explicit configuration for maximum protection.
// ────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Sets additional security headers on every response.
 * Should be registered before any route handlers.
 */
export function secureHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ── HTTP Strict Transport Security ──
  // Forces browsers to use HTTPS only for the specified period.
  // In production, use a long max-age with includeSubDomains and preload.
  const hstsMaxAge = env.NODE_ENV === 'production' ? 31536000 : 0; // 1 year in prod
  if (hstsMaxAge > 0) {
    res.setHeader(
      'Strict-Transport-Security',
      `max-age=${hstsMaxAge}; includeSubDomains; preload`
    );
  } else {
    // In development, still set but with short duration
    res.setHeader('Strict-Transport-Security', `max-age=${hstsMaxAge}`);
  }

  // ── X-Content-Type-Options ──
  // Prevents MIME type sniffing by browsers.
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── X-Frame-Options ──
  // Precludes clickjacking by blocking embedding in frames.
  res.setHeader('X-Frame-Options', 'DENY');

  // ── Permissions-Policy ──
  // Restricts which browser APIs and features can be used.
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'fullscreen=(self)',
      'payment=()',
      'sync-xhr=(self)',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'autoplay=(self)',
      'cross-origin-isolated=(self)',
      'display-capture=()',
      'encrypted-media=(self)',
      'execution-while-not-rendered=(self)',
      'execution-while-out-of-viewport=(self)',
      'hid=()',
      'idle-detection=()',
      'screen-wake-lock=()',
      'serial=()',
      'picture-in-picture=(self)',
    ].join(', ')
  );

  // ── Referrer-Policy ──
  // Controls how much referrer information is sent with requests.
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ── Cross-Origin-Opener-Policy ──
  // Isolates your origin from cross-origin documents.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // ── Cross-Origin-Resource-Policy ──
  // Restricts which origins can load cross-origin resources.
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // ── Cross-Origin-Embedder-Policy ──
  // Prevents loading cross-origin resources that don't explicitly grant permission.
  // Set to 'require-corp' for maximum security, but this may break some CDN resources.
  // 'unsafe-none' is more permissive but less secure.
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  next();
}
