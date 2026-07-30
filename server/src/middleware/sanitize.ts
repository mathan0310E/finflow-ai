// ────────────────────────────────────────────────────
// Input Sanitization Middleware
// ────────────────────────────────────────────────────
// Strips or escapes potentially dangerous content from
// user-supplied input to prevent XSS, HTML injection,
// and other injection-based attacks.
// ────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

// ── Constants ──

/**
 * Characters that are stripped from search terms and query params
 * to prevent NoSQL injection and XSS.
 */
const DANGEROUS_CHARS_PATTERN = /[<>{}\[\]()"'`;\\]/g;

/**
 * HTML tags that are stripped from inputs.
 */
const HTML_TAG_PATTERN = /<[^>]*>/g;

/**
 * JavaScript event handlers commonly used in XSS attacks.
 */
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;

/**
 * javascript: protocol URLs for XSS in links.
 */
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript\s*:/gi;

/**
 * data: protocol in dangerous contexts.
 */
const DATA_PROTOCOL_PATTERN = /data\s*:/gi;

// ── Helper Functions ──

/**
 * Recursively sanitize all string values in an object or array.
 * Strips HTML tags and dangerous characters.
 */
function sanitizeValue(value: unknown, maxDepth: number = 10, currentDepth: number = 0): unknown {
  if (currentDepth > maxDepth) {
    // Exceeded recursion depth — truncate
    if (typeof value === 'string') return value.substring(0, 100);
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, maxDepth, currentDepth + 1));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeValue(val, maxDepth, currentDepth + 1);
    }
    return sanitized;
  }

  // Primitives (numbers, booleans, null, undefined) are safe
  return value;
}

/**
 * Sanitize a single string value:
 * 1. Strip HTML tags
 * 2. Strip event handlers (onclick=, onload=, etc.)
 * 3. Strip javascript: protocol
 * 4. Strip data: protocol
 * 5. Strip dangerous special characters
 */
function sanitizeString(input: string): string {
  if (!input) return input;

  let sanitized = input
    // Strip HTML tags first
    .replace(HTML_TAG_PATTERN, '')
    // Remove event handlers
    .replace(EVENT_HANDLER_PATTERN, '')
    // Strip javascript: protocol
    .replace(JAVASCRIPT_PROTOCOL_PATTERN, '')
    // Strip data: protocol
    .replace(DATA_PROTOCOL_PATTERN, '')
    // Remove dangerous characters
    .replace(DANGEROUS_CHARS_PATTERN, '')
    // Trim whitespace
    .trim();

  return sanitized;
}

/**
 * Sanitize URL-like values (such as redirect URLs, profile picture URLs).
 * Only allows http, https, and relative URLs.
 */
function sanitizeUrl(input: string): string {
  if (!input) return input;

  const trimmed = input.trim();

  // Allow relative URLs
  if (trimmed.startsWith('/')) return trimmed;

  // Allow only http and https
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    // Invalid URL — strip it
    return '';
  }

  return '';
}

// ── Middleware ──

/**
 * Middleware that sanitizes all incoming request data.
 * Strips dangerous content from:
 *   - req.body
 *   - req.query
 *   - req.params
 *
 * This runs AFTER JSON body parsing but BEFORE route handlers
 * and Zod validation.
 */
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body) as Record<string, unknown>;
    }

    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(req.query)) {
        sanitizedQuery[key] = typeof value === 'string'
          ? sanitizeString(value)
          : sanitizeValue(value);
      }
      // Replace query object with sanitized version
      (req as unknown as Record<string, unknown>).query = sanitizedQuery;
    }

    if (req.params && typeof req.params === 'object') {
      const sanitizedParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.params)) {
        sanitizedParams[key] = sanitizeString(String(value));
      }
      req.params = sanitizedParams;
    }

    next();
  } catch (error) {
    // If sanitization itself fails, log and continue
    console.error('Sanitization error:', error);
    next();
  }
}

/**
 * Middleware that specifically sanitizes search/filter query params.
 * More aggressive — strips all special characters used in injection.
 */
export function sanitizeSearchParams(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const searchFields = ['search', 'q', 'query', 'term', 'filter'];

  for (const field of searchFields) {
    if (typeof req.query[field] === 'string') {
      req.query[field] = (req.query[field] as string).replace(DANGEROUS_CHARS_PATTERN, '').trim();
    }
  }

  next();
}

/**
 * Sanitize a specific field in the request body.
 * Useful for targeted sanitization of known text fields.
 */
export function sanitizeField(fieldName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body[fieldName] === 'string') {
      req.body[fieldName] = sanitizeString(req.body[fieldName]);
    }
    next();
  };
}

/**
 * Utility: sanitize a URL field (like photoURL, receiptUrl, etc.)
 */
export function sanitizeUrlField(fieldName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body[fieldName] === 'string') {
      req.body[fieldName] = sanitizeUrl(req.body[fieldName]);
    }
    next();
  };
}

export { sanitizeString, sanitizeUrl };
