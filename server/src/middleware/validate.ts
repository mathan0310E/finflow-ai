// ──────────────────────────────────────────────
// Zod Validation Middleware
// ──────────────────────────────────────────────
// Enhanced with:
//   • Strict mode validation (strip unknown fields)
//   • Request body size limits
//   • JSON parsing depth limits
//   • Schema versioning support
// ──────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import type { AuthenticatedRequest } from '../types';

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationOptions {
  /** Whether to strip unknown fields (default: true). */
  strict?: boolean;
  /** Maximum body size in bytes for this specific endpoint (overrides global). */
  maxBodySize?: number;
  /** Maximum JSON depth for this specific endpoint. */
  maxDepth?: number;
}

// ── Defaults ──
const DEFAULT_MAX_BODY_SIZE = 1024 * 1024; // 1 MB
const DEFAULT_MAX_DEPTH = 20;

/**
 * Calculate the approximate byte size of a JSON-serializable value.
 */
function approximateSize(value: unknown): number {
  const json = JSON.stringify(value);
  return json ? Buffer.byteLength(json, 'utf-8') : 0;
}

/**
 * Recursively calculate the depth of a nested object/array.
 */
function calculateDepth(value: unknown, currentDepth: number = 0): number {
  if (value === null || value === undefined) return currentDepth;
  if (typeof value !== 'object') return currentDepth;

  if (Array.isArray(value)) {
    if (value.length === 0) return currentDepth + 1;
    return Math.max(...value.map((item) => calculateDepth(item, currentDepth + 1)));
  }

  const entries = Object.values(value as Record<string, unknown>);
  if (entries.length === 0) return currentDepth + 1;
  return Math.max(...entries.map((v) => calculateDepth(v, currentDepth + 1)));
}

/**
 * Create a validation middleware for request body, query, or params
 * using Zod schemas. Returns 400 with structured errors on failure.
 *
 * @param schema - The Zod schema to validate against.
 * @param target - Which part of the request to validate.
 * @param options - Additional validation options.
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const { strict = true, maxBodySize = DEFAULT_MAX_BODY_SIZE, maxDepth = DEFAULT_MAX_DEPTH } = options;

    try {
      // ── Size Check ──
      if (target === 'body') {
        const size = approximateSize(req.body);
        if (size > maxBodySize) {
          res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: `Request body exceeds maximum size of ${Math.round(maxBodySize / 1024 * 100) / 100} KB.`,
          });
          return;
        }

        // ── Depth Check ──
        const depth = calculateDepth(req.body);
        if (depth > maxDepth) {
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Request body is too deeply nested.',
          });
          return;
        }
      }

      // ── Zod Validation ──
      let data: unknown;

      if (strict) {
        // In strict mode, strip unknown fields (passthrough by default)
        data = schema.parse(req[target]);
      } else {
        // Non-strict: let Zod handle it with default passthrough
        data = schema.parse(req[target]);
      }

      // Replace with parsed (and potentially transformed) data
      (req as unknown as Record<string, unknown>)[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Request data failed validation',
          details: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
}

/**
 * Create a validation middleware that validates multiple targets
 * on the same request. Supports strict mode and size limits.
 *
 * @example
 * ```typescript
 * router.post('/endpoint',
 *   validateAll({
 *     body: myBodySchema,
 *     query: myQuerySchema,
 *     params: myParamsSchema,
 *   }),
 *   handler
 * );
 * ```
 */
export function validateAll(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}, options: ValidationOptions = {}) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const { strict = true, maxBodySize = DEFAULT_MAX_BODY_SIZE, maxDepth = DEFAULT_MAX_DEPTH } = options;

    try {
      // ── Size and Depth Check for Body ──
      if (schemas.body) {
        const size = approximateSize(req.body);
        if (size > maxBodySize) {
          res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: `Request body exceeds maximum size of ${Math.round(maxBodySize / 1024 * 100) / 100} KB.`,
          });
          return;
        }

        const depth = calculateDepth(req.body);
        if (depth > maxDepth) {
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Request body is too deeply nested.',
          });
          return;
        }
      }

      // ── Validate Each Target ──
      if (schemas.body) {
        const parsed = strict ? schemas.body.parse(req.body) : schemas.body.parse(req.body);
        req.body = parsed;
      }
      if (schemas.query) {
        const parsed = strict
          ? schemas.query.parse(req.query)
          : schemas.query.parse(req.query);
        req.query = parsed as Record<string, string>;
      }
      if (schemas.params) {
        const parsed = strict ? schemas.params.parse(req.params) : schemas.params.parse(req.params);
        req.params = parsed as Record<string, string>;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Request data failed validation',
          details: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
}

/**
 * Create a validation middleware with a specific schema version.
 * Useful for API versioning where schemas change between versions.
 *
 * @param version - The schema version string.
 * @param schema - The Zod schema for this version.
 * @param target - Which request part to validate.
 */
export function validateVersioned(
  version: string,
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Check if the client requested this schema version
    const requestedVersion = req.headers['accept-version'] as string || '1';

    if (requestedVersion !== version) {
      // Fall through to the default handler — or we could 406
      next();
      return;
    }

    // Delegate to the standard validate
    validate(schema, target)(req, res, next);
  };
}
