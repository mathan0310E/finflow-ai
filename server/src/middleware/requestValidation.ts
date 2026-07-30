// ────────────────────────────────────────────────────
// Request Validation Middleware
// ────────────────────────────────────────────────────
// Validates basic HTTP properties before routes process
// the request. Includes:
//   • HTTP method whitelist
//   • Content-Type validation
//   • Accept header validation
//   • Request size limits
//   • User-Agent presence check (optional)
// ────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// ── Constants ──

/**
 * Allowed HTTP methods for the API.
 */
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

/**
 * Allowed Content-Type headers for request bodies.
 */
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

/**
 * Maximum body size for JSON requests (in bytes).
 * Defaults to 1 MB if not configured, capped at 10 MB.
 */
const MAX_BODY_SIZE = Math.min(
  env.MAX_FILE_SIZE ? parseInt(String(env.MAX_FILE_SIZE), 10) : 5 * 1024 * 1024,
  10 * 1024 * 1024
);

/**
 * Maximum depth for nested JSON objects (prevents Stack Overflow / ReDoS).
 */
const MAX_JSON_DEPTH = 20;

// ── Helpers ──

/**
 * Check if a Content-Type header matches one of the allowed types.
 * Handles charset and boundary parameters by only comparing the MIME type.
 */
function isAllowedContentType(contentType: string | undefined): boolean {
  if (!contentType) return true; // No content-type means no body — skip

  const mimeType = contentType.split(';')[0]?.trim().toLowerCase();
  if (!mimeType) return true;

  return ALLOWED_CONTENT_TYPES.some((allowed) => mimeType.startsWith(allowed));
}

/**
 * Check if a Content-Type header indicates JSON.
 */
function isJsonContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;
  const mimeType = contentType.split(';')[0]?.trim().toLowerCase();
  return mimeType === 'application/json';
}

/**
 * Recursively check the depth of a nested object.
 */
function getObjectDepth(value: unknown, depth: number = 0): number {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.values(value as Record<string, unknown>);
    if (entries.length === 0) return depth + 1;
    return Math.max(...entries.map((v) => getObjectDepth(v, depth + 1)));
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return depth + 1;
    return Math.max(...value.map((v) => getObjectDepth(v, depth + 1)));
  }
  return depth;
}

// ── Middleware ──

/**
 * Basic HTTP request validation.
 * Checks method, content-type, body size, and JSON depth.
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ── 1. HTTP Method Whitelist ──
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: `HTTP method "${req.method}" is not allowed.`,
    });
    return;
  }

  // ── 2. Content-Type Validation ──
  const contentType = req.headers['content-type'] as string | undefined;

  // For methods with a body, validate Content-Type
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (contentType && !isAllowedContentType(contentType)) {
      res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message: `Content-Type "${contentType}" is not supported. Use application/json, multipart/form-data, or application/x-www-form-urlencoded.`,
      });
      return;
    }

    // ── 3. Body Size Check ──
    if (contentType && isJsonContentType(contentType)) {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > MAX_BODY_SIZE) {
        res.status(413).json({
          success: false,
          error: 'Payload Too Large',
          message: `Request body exceeds maximum size of ${Math.round(MAX_BODY_SIZE / 1024 / 1024 * 100) / 100} MB.`,
        });
        return;
      }

      // ── 4. JSON Depth Validation ──
      if (req.body && typeof req.body === 'object') {
        const depth = getObjectDepth(req.body);
        if (depth > MAX_JSON_DEPTH) {
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Request body is too deeply nested.',
          });
          return;
        }
      }
    }
  }

  // ── 5. Accept Header Validation (optional) ──
  // In production, ensure the client accepts JSON responses
  if (env.NODE_ENV === 'production') {
    const accept = req.headers['accept'] as string | undefined;
    if (accept && !accept.includes('*/*') && !accept.includes('application/json')) {
      // Just warn, don't reject — some clients may not set Accept
      if (accept.includes('text/html') && req.path.startsWith('/api')) {
        res.status(406).json({
          success: false,
          error: 'Not Acceptable',
          message: 'This API endpoint only produces application/json responses.',
        });
        return;
      }
    }
  }

  // ── 6. User-Agent Check (optional, for bots) ──
  // Log requests with suspicious or missing User-Agent
  if (env.NODE_ENV === 'production' && !req.headers['user-agent']) {
    console.warn(`[SECURITY] Request without User-Agent: ${req.method} ${req.originalUrl} from ${req.ip}`);
  }

  next();
}

/**
 * Middleware that validates only specific aspects of the request.
 * This is a lighter version that can be applied selectively.
 */
export function validateMethod(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: `HTTP method "${req.method}" is not allowed.`,
    });
    return;
  }
  next();
}

export { MAX_BODY_SIZE, MAX_JSON_DEPTH };
