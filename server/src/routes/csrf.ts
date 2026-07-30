// ──────────────────────────────────────────────
// CSRF Token Route
// ──────────────────────────────────────────────
// Exposes a GET endpoint for the client to fetch
// a fresh CSRF token. The token is also set as a
// cookie on all responses via the CSRF middleware.
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { setCsrfToken } from '../middleware/csrf';
import type { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * GET /csrf-token
 * Returns a CSRF token. The token is also set as
 * an HttpOnly cookie for automatic inclusion.
 *
 * The client should read the XSRF-TOKEN cookie and
 * include it as the X-XSRF-TOKEN header on mutating
 * requests (POST, PUT, DELETE, PATCH).
 */
router.get('/', setCsrfToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      token: res.locals.csrfToken,
    },
  });
});

export default router;
