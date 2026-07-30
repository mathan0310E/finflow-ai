// ──────────────────────────────────────────────
// Role-Based Access Control Middleware
// ──────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../types';

/**
 * Require specific roles to access a route.
 * Returns a middleware that checks req.user.role against allowed roles.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role;

    if (!userRole) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'User role not found. Complete your profile.',
      });
      return;
    }

    // Super admin has universal access
    if (userRole === 'super_admin') {
      next();
      return;
    }

    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require user to belong to a specific company.
 * Checks req.user.companyId against the companyId in route params or body.
 */
export function requireCompanyAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  // Super admin has cross-company access
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  const targetCompanyId =
    req.params.companyId || req.body.companyId || req.query.companyId;

  if (!targetCompanyId) {
    // If no explicit companyId in request, the route is likely scoped by auth
    next();
    return;
  }

  if (req.user.companyId !== targetCompanyId) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You do not have access to this company\'s data',
    });
    return;
  }

  next();
}

/**
 * Require self or higher role access.
 * For routes where users can access their own data,
 * but managers/finance can access department data, etc.
 */
export function requireSelfOrRole(userIdParam: string = 'id', ...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Super admin bypass
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    const targetUserId = req.params[userIdParam];

    // If accessing own data, allow
    if (targetUserId && targetUserId === req.user.uid) {
      next();
      return;
    }

    // If user has one of the allowed roles, allow
    if (req.user.role && roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You can only access your own data',
    });
  };
}
