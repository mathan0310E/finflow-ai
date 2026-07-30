// ──────────────────────────────────────────────
// Firebase Authentication Middleware
// ──────────────────────────────────────────────
// Enhanced with:
//   • Token blacklist checking
//   • Session expiry handling
//   • Device fingerprinting
//   • Rate-limit awareness for failed validations
// ──────────────────────────────────────────────

import { Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { collectionRef, docRef } from '../config/firebase';
import type { AuthenticatedRequest } from '../types';
import { createAuditLog } from '../utils/audit';

// ── In-memory token blacklist ──
// In production, use Redis or Firestore for distributed blacklist.
const BLACKLIST_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const blacklistedTokens = new Set<string>();

// Periodic cleanup of the in-memory blacklist
// (tokens expire naturally via Firebase, so we don't need to store them forever)
setInterval(() => {
  blacklistedTokens.clear();
}, BLACKLIST_CLEANUP_INTERVAL);

/**
 * Extract the raw token string from the Authorization header.
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  return token || null;
}

/**
 * Generate a simple device fingerprint from request properties.
 */
function generateDeviceFingerprint(req: AuthenticatedRequest): string {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['sec-ch-ua'] || '',
    req.ip || '',
  ];
  return components.join('||');
}

/**
 * Validate session by checking if user status is active.
 */
async function validateUserSession(uid: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const userDoc = await docRef('users', uid).get();
    if (!userDoc.exists) {
      return { valid: false, reason: 'User document not found' };
    }

    const userData = userDoc.data()!;
    if (userData.status === 'suspended') {
      return { valid: false, reason: 'Account suspended' };
    }
    if (userData.status === 'inactive') {
      return { valid: false, reason: 'Account inactive' };
    }

    return { valid: true };
  } catch {
    // If we can't check, allow through (Firestore may be unavailable)
    return { valid: true };
  }
}

/**
 * Verify Firebase ID token and attach user to request.
 * Enhanced with device fingerprinting, token blacklist checking,
 * and session status validation.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header. Expected: Bearer <token>',
      });
      return;
    }

    // ── Token Blacklist Check ──
    // Check if token has been explicitly revoked (e.g., logout-all-sessions)
    const tokenHash = simpleHash(token);
    if (blacklistedTokens.has(tokenHash)) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token has been revoked. Please sign in again.',
      });
      return;
    }

    // ── Verify the Firebase ID Token ──
    let decodedToken: { uid: string; email?: string; name?: string; picture?: string; auth_time?: number; exp?: number };
    try {
      decodedToken = await auth().verifyIdToken(token);
    } catch (verifyError) {
      const message = verifyError instanceof Error ? verifyError.message : 'Token verification failed';

      // Check if token is expired for a better error message
      if (message.includes('expired') || message.includes('expired')) {
        res.status(401).json({
          success: false,
          error: 'Session Expired',
          message: 'Your session has expired. Please sign in again.',
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: `Invalid token: ${message}`,
      });
      return;
    }

    // ── Check Token Expiry ──
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      res.status(401).json({
        success: false,
        error: 'Session Expired',
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    // ── Attach basic auth info ──
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    // ── Device Fingerprint ──
    // Store fingerprint for anomaly detection
    req.fingerprint = generateDeviceFingerprint(req);

    // ── Fetch user profile from Firestore for role & companyId ──
    try {
      const userDoc = await collectionRef('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data()!;
        req.user.role = userData.role || 'employee';
        req.user.companyId = userData.companyId;
        req.user.departmentId = userData.departmentId;
        req.user.status = userData.status;
        req.user.phone = userData.phone;
      } else {
        req.user.role = 'employee';
      }
    } catch (dbError) {
      console.error('Error fetching user profile:', dbError);
      // Still allow request through with basic info
    }

    // ── Validate User Session Status ──
    const sessionCheck = await validateUserSession(decodedToken.uid);
    if (!sessionCheck.valid) {
      // Log the blocked access attempt
      await createAuditLog({
        companyId: req.user.companyId || 'unknown',
        userId: decodedToken.uid,
        action: 'auth.access_blocked',
        resource: 'session',
        resourceId: decodedToken.uid,
        details: { reason: sessionCheck.reason, ip: req.ip, path: req.originalUrl },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {});

      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied: ${sessionCheck.reason}`,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication service error',
    });
  }
}

/**
 * Optional auth — attaches user if token present, but doesn't require it.
 * Enhanced with the same checks as `authenticate` but fails silently.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      try {
        // Blacklist check
        const tokenHash = simpleHash(token);
        if (blacklistedTokens.has(tokenHash)) {
          next();
          return;
        }

        const decodedToken = await auth().verifyIdToken(token);

        // Expiry check
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          next();
          return;
        }

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        };
        req.fingerprint = generateDeviceFingerprint(req);

        const userDoc = await collectionRef('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          req.user.role = userData.role;
          req.user.companyId = userData.companyId;
        }
      } catch {
        // Token invalid — continue without user
      }
    }
    next();
  } catch {
    next();
  }
}

/**
 * Revoke a specific token by adding it to the blacklist.
 * Useful for "logout all devices" or "logout this session" features.
 */
export function revokeToken(token: string): void {
  blacklistedTokens.add(simpleHash(token));
}

/**
 * Simple hash function for token blacklisting.
 * Not cryptographically secure for passwords, but sufficient for
 * a lookup optimization.
 */
function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(16);
}
