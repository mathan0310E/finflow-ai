// ────────────────────────────────────────────────────
// CSRF Protection Middleware
// ────────────────────────────────────────────────────
// Implements the double-submit cookie pattern for CSRF
// protection. A cryptographically random token is set as
// both a cookie and a header on the client; the server
// verifies they match on every state-changing request.
// ────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

// ── Constants ──

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-xsrf-token';
const CSRF_TOKEN_LENGTH = 32; // bytes => 64 hex chars

// Methods that do NOT need CSRF protection
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// ── Helpers ──

/**
 * Generate a cryptographically secure random token.
 */
function generateToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Use dummy comparison to keep constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Middleware ──

/**
 * CSRF protection middleware using the double-submit cookie pattern.
 *
 * How it works:
 * 1. For every response, if no CSRF cookie exists, set one.
 * 2. For state-changing requests (POST, PUT, DELETE, PATCH),
 *    verify that the X-XSRF-TOKEN header matches the cookie value.
 *
 * The client must read the XSRF-TOKEN cookie and include it as the
 * X-XSRF-TOKEN header on every mutating request.
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ── Step 1: Ensure the CSRF cookie is set ──

  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be readable by client JavaScript
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    // Also set it on the response for convenience
    res.locals.csrfToken = token;
  } else {
    res.locals.csrfToken = req.cookies[CSRF_COOKIE_NAME];
  }

  // ── Step 2: Skip CSRF validation for safe methods ──

  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  // ── Step 3: Validate the CSRF token ──

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      success: false,
      error: 'CSRF Token Missing',
      message: 'A CSRF token is required for this request. Ensure the X-XSRF-TOKEN header is set.',
    });
    return;
  }

  if (!timingSafeEqual(cookieToken, headerToken)) {
    res.status(403).json({
      success: false,
      error: 'CSRF Token Mismatch',
      message: 'The CSRF token in the cookie does not match the token in the request header.',
    });
    return;
  }

  next();
}

/**
 * Middleware that generates a fresh CSRF token and sets it in the response
 * cookie. Use this on the login page or after authentication.
 */
export function setCsrfToken(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = generateToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.locals.csrfToken = token;
  next();
}

/**
 * Expose the CSRF token via a GET endpoint.
 * The client can call this to obtain a fresh token.
 */
export function getCsrfToken(
  _req: Request,
  res: Response
): void {
  const token = res.locals.csrfToken;
  res.json({
    success: true,
    data: { token },
  });
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
