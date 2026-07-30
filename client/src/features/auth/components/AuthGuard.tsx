﻿'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, Timer } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import type { UserRole } from '@/types'
import {
  initSession,
  updateSessionActivity,
  isSessionExpired,
  isSessionExpiringSoon,
  getSessionRemainingTime,
} from '@/middleware'

// 
// Types
// 

export interface AuthGuardProps {
  /** The protected content. */
  children: React.ReactNode

  /**
   * If provided, only users with one of these roles may access the children.
   * When omitted, any authenticated user is allowed.
   */
  allowedRoles?: UserRole[]

  /**
   * Where to redirect unauthenticated users. Defaults to `/login`.
   */
  redirectTo?: string

  /**
   * Optional path to redirect when the user's role is not permitted.
   * Defaults to `/`.
   */
  forbiddenRedirectTo?: string

  /**
   * Enable session timeout tracking (default: true).
   */
  enableSessionTracking?: boolean

  /**
   * Session timeout in milliseconds (default: 24 hours).
   */
  sessionTimeoutMs?: number
}

// 
// Component
// 

/**
 * Route guard that wraps protected content.
 *
 * - Shows a loading skeleton while the auth state is being resolved.
 * - Redirects unauthenticated users to the login page.
 * - Shows a friendly "access denied" view for users whose role doesn't match.
 * - Tracks session activity and detects session expiry.
 * - Renders `children` when the user is authenticated (and has the correct role).
 *
 * @example
 * ```tsx
 * // Only authenticated users
 * <AuthGuard>
 *   <DashboardPage />
 * </AuthGuard>
 *
 * // Only CEOs and Finance Managers
 * <AuthGuard allowedRoles={['ceo', 'finance_manager']}>
 *   <ApprovalsPage />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
  forbiddenRedirectTo,
  enableSessionTracking = true,
  sessionTimeoutMs = 24 * 60 * 60 * 1000,
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const activityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null)

  //  Initialize session tracking 

  useEffect(() => {
    if (enableSessionTracking && isAuthenticated) {
      initSession()
      updateSessionActivity()
    }
  }, [enableSessionTracking, isAuthenticated])

  //  Track user activity 

  useEffect(() => {
    if (!enableSessionTracking || !isAuthenticated) return

    const updateActivity = () => updateSessionActivity()

    // Update activity on user interactions
    window.addEventListener('mousedown', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('touchstart', updateActivity)
    window.addEventListener('scroll', updateActivity, { passive: true })

    // Periodic activity refresh (every 30 seconds)
    activityTimerRef.current = setInterval(updateActivity, 30000)

    return () => {
      window.removeEventListener('mousedown', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('touchstart', updateActivity)
      window.removeEventListener('scroll', updateActivity)
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current)
      }
    }
  }, [enableSessionTracking, isAuthenticated])

  //  Periodic session timeout check 

  useEffect(() => {
    if (!enableSessionTracking || !isAuthenticated) return

    sessionCheckRef.current = setInterval(() => {
      if (isSessionExpired(sessionTimeoutMs)) {
        const callback = encodeURIComponent(pathname)
        router.replace(`${redirectTo}?error=session_expired&callbackUrl=${callback}`)
      }
    }, 60000) // Check every minute

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current)
      }
    }
  }, [enableSessionTracking, isAuthenticated, sessionTimeoutMs, redirectTo, router, pathname])

  //  Redirect unauthenticated 

  useEffect(() => {
    // Wait for the initial auth check to finish
    if (isLoading) return

    if (!isAuthenticated) {
      // Build the redirect URL with a `callbackUrl` so the user can return
      const callback = encodeURIComponent(pathname)
      router.replace(`${redirectTo}?callbackUrl=${callback}`)
    }
  }, [isLoading, isAuthenticated, redirectTo, router, pathname])

  //  Loading skeleton 

  if (isLoading) {
    return <AuthGuardSkeleton />
  }

  //  Not authenticated (redirect will fire) 

  if (!isAuthenticated || !user) {
    return <AuthGuardSkeleton />
  }

  //  Session expiry warning 

  const showSessionWarning = enableSessionTracking && isSessionExpiringSoon(sessionTimeoutMs)

  //  Role check 

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <AccessDenied
        userRole={user.role}
        allowedRoles={allowedRoles}
        onGoHome={() => router.replace(forbiddenRedirectTo ?? '/')}
      />
    )
  }

  //  Authorized 

  return (
    <>
      {showSessionWarning && (
        <SessionWarning remainingTime={getSessionRemainingTime(sessionTimeoutMs)} />
      )}
      {children}
    </>
  )
}

// 
// Sub-components
// 

/**
 * Skeleton UI shown while auth state is loading.
 */
function AuthGuardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

//  Session Expiry Warning 

function SessionWarning({ remainingTime }: { remainingTime: number }) {
  const minutes = Math.ceil(remainingTime / 60000)

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm',
        'bg-amber-50 text-amber-800 border-b border-amber-200',
        'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
      )}
    >
      <Timer className="h-4 w-4" />
      <span>
        Your session will expire in {minutes} minute{minutes !== 1 ? 's' : ''}.
        {' '}Move your mouse or press a key to stay signed in.
      </span>
    </div>
  )
}

//  Access Denied 

interface AccessDeniedProps {
  userRole: UserRole
  allowedRoles: UserRole[]
  onGoHome: () => void
}

function AccessDenied({ userRole, allowedRoles, onGoHome }: AccessDeniedProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
        className="w-full max-w-md"
      >
        <div
          className={cn(
            'rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg',
            'dark:border-red-900/50 dark:bg-gray-900',
          )}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
            Access Denied
          </h1>

          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Your current role (<span className="font-semibold capitalize">{userRole.replace('_', ' ')}</span>)
            {' '}does not have permission to access this page.
          </p>

          {allowedRoles.length > 0 && (
            <div className="mb-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Required roles
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                {allowedRoles.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                    )}
                  >
                    {role.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={onGoHome} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
