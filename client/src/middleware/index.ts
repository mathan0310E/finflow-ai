// ──────────────────────────────────────────────
// Client-Side Middleware
// ──────────────────────────────────────────────
// Provides route protection, permission validation,
// and session timeout handling for the Next.js app.
// ──────────────────────────────────────────────

import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types';

// ── Constants ──

/**
 * Session timeout in milliseconds (24 hours).
 */
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

/**
 * Warning threshold before session timeout (5 minutes).
 */
const SESSION_WARNING_MS = 5 * 60 * 1000;

// ── Types ──

export interface RouteGuardOptions {
  /** Required roles to access the route. */
  allowedRoles?: UserRole[];
  /** Whether authentication is required (default: true). */
  requireAuth?: boolean;
  /** Whether the user must have an active company. */
  requireCompany?: boolean;
  /** Session timeout in milliseconds. */
  sessionTimeout?: number;
}

export interface RouteGuardResult {
  /** Whether access is granted. */
  allowed: boolean;
  /** Redirect URL if access is denied. */
  redirectTo?: string;
  /** Reason for denial. */
  reason?: 'unauthenticated' | 'forbidden' | 'session_expired' | 'no_company' | 'suspended';
}

// ── Session Management ──

interface SessionInfo {
  loginTime: number;
  lastActivity: number;
  deviceFingerprint: string;
}

const SESSION_STORAGE_KEY = 'finflow_session';

/**
 * Get session info from sessionStorage.
 */
function getSessionInfo(): SessionInfo | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionInfo;
  } catch {
    return null;
  }
}

/**
 * Save session info to sessionStorage.
 */
function saveSessionInfo(info: SessionInfo): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

/**
 * Initialize a new session.
 */
export function initSession(): void {
  const session: SessionInfo = {
    loginTime: Date.now(),
    lastActivity: Date.now(),
    deviceFingerprint: generateFingerprint(),
  };
  saveSessionInfo(session);
}

/**
 * Update the last activity timestamp.
 */
export function updateSessionActivity(): void {
  const session = getSessionInfo();
  if (session) {
    session.lastActivity = Date.now();
    saveSessionInfo(session);
  }
}

/**
 * Check if the current session has timed out.
 */
export function isSessionExpired(timeoutMs: number = SESSION_TIMEOUT_MS): boolean {
  const session = getSessionInfo();
  if (!session) return true;

  const elapsed = Date.now() - session.lastActivity;
  return elapsed > timeoutMs;
}

/**
 * Get remaining session time in milliseconds.
 */
export function getSessionRemainingTime(timeoutMs: number = SESSION_TIMEOUT_MS): number {
  const session = getSessionInfo();
  if (!session) return 0;

  const elapsed = Date.now() - session.lastActivity;
  return Math.max(0, timeoutMs - elapsed);
}

/**
 * Check if the session is about to expire (within warning window).
 */
export function isSessionExpiringSoon(timeoutMs: number = SESSION_TIMEOUT_MS): boolean {
  return getSessionRemainingTime(timeoutMs) < SESSION_WARNING_MS;
}

/**
 * Generate a simple device fingerprint.
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.colorDepth || '',
    screen.width || '',
    screen.height || '',
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  ];
  return components.join('||');
}

// ── Route Guard ──

/**
 * Client-side route guard that checks authentication, roles,
 * company membership, and session status.
 *
 * @example
 * ```typescript
 * // In a page component:
 * const guard = checkRouteGuard({ allowedRoles: ['ceo', 'finance_manager'] })
 * if (!guard.allowed) {
 *   router.replace(guard.redirectTo!)
 *   return null
 * }
 * ```
 */
export function checkRouteGuard(options: RouteGuardOptions = {}): RouteGuardResult {
  const {
    allowedRoles,
    requireAuth = true,
    requireCompany = false,
    sessionTimeout = SESSION_TIMEOUT_MS,
  } = options;

  const { user, isAuthenticated } = useAuthStore.getState();

  // ── Authentication Check ──
  if (requireAuth && !isAuthenticated) {
    return {
      allowed: false,
      redirectTo: '/login',
      reason: 'unauthenticated',
    };
  }

  if (!user) {
    if (requireAuth) {
      return {
        allowed: false,
        redirectTo: '/login',
        reason: 'unauthenticated',
      };
    }
    return { allowed: true };
  }

  // ── Account Status Check ──
  if (user.status === 'suspended') {
    return {
      allowed: false,
      redirectTo: '/login?error=suspended',
      reason: 'suspended',
    };
  }

  // ── Session Timeout Check ──
  if (isSessionExpired(sessionTimeout)) {
    return {
      allowed: false,
      redirectTo: '/login?error=session_expired',
      reason: 'session_expired',
    };
  }

  // ── Company Membership Check ──
  if (requireCompany && !user.companyId) {
    return {
      allowed: false,
      redirectTo: '/company/setup',
      reason: 'no_company',
    };
  }

  // ── Role-Based Access Check ──
  if (allowedRoles && allowedRoles.length > 0) {
    // Super admin has universal access
    if (user.role === 'super_admin') {
      return { allowed: true };
    }

    if (!allowedRoles.includes(user.role)) {
      return {
        allowed: false,
        redirectTo: '/403',
        reason: 'forbidden',
      };
    }
  }

  // Update session activity on successful check
  updateSessionActivity();

  return { allowed: true };
}

/**
 * React hook-friendly version of the route guard.
 * Returns the same result as checkRouteGuard.
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const guard = useRouteGuard({ allowedRoles: ['ceo'] })
 *
 *   if (!guard.allowed) {
 *     return null // Component handles redirect via useEffect
 *   }
 *
 *   return <PageContent />
 * }
 * ```
 */
export function useRouteGuard(options: RouteGuardOptions = {}): RouteGuardResult {
  return checkRouteGuard(options);
}

/**
 * Check if the current user has any of the given permissions.
 */
export function hasPermission(requiredRoles: UserRole[]): boolean {
  const { user } = useAuthStore.getState();
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return requiredRoles.includes(user.role);
}

/**
 * Check if the current user can access a specific company's data.
 */
export function canAccessCompany(companyId: string): boolean {
  const { user } = useAuthStore.getState();
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.companyId === companyId;
}

/**
 * Check if the current user can modify a specific resource.
 */
export function canModifyResource(resourceUserId?: string, requiredRoles?: UserRole[]): boolean {
  const { user } = useAuthStore.getState();
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  // Own data
  if (resourceUserId && user.id === resourceUserId) return true;

  // Role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    return requiredRoles.includes(user.role);
  }

  return false;
}
