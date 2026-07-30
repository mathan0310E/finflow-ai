'use client'

import { useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth-store'
import type { User, UserRole } from '@/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

import type { PersonalRegisterData, CompanyRegisterData, JoinCompanyData, SignInFlow } from '@/stores/auth-store'

export interface UseAuthReturn {
  /** The currently authenticated user's profile, or `null`. */
  user: User | null

  /** `true` when a user is signed in. */
  isAuthenticated: boolean

  /** `true` while an auth operation or initial check is in progress. */
  isLoading: boolean

  /** Last auth-related error message, or `null`. */
  error: string | null

  /** The current registration flow type. */
  registrationFlow: 'personal' | 'company' | 'join' | null

  /** Sign in with email + password. */
  login: (email: string, password: string) => Promise<void>

  /** Create a new account (Firebase auth + company + user doc). */
  register: (data: {
    email: string
    password: string
    displayName: string
    companyName?: string
    role: UserRole
  }) => Promise<void>

  /** Register a personal workspace (individual user). */
  registerPersonal: (data: PersonalRegisterData) => Promise<void>

  /** Register a new company (founder/CEO). */
  registerCompany: (data: CompanyRegisterData) => Promise<void>

  /** Join an existing company via invitation code. */
  joinCompany: (data: JoinCompanyData) => Promise<void>

  /** Sign out the current user. */
  logout: () => Promise<void>

  /** Update the current user's Firestore profile. */
  updateProfile: (data: Partial<User>) => Promise<void>

  /** Sign in with Google (popup). Creates a minimal profile if first-time. */
  signInWithGoogle: (flowType?: SignInFlow) => Promise<void>

  /** Set the registration flow type. */
  setRegistrationFlow: (flow: 'personal' | 'company' | 'join' | null) => void

  /** Clear the last error. */
  clearError: () => void

  /** Convenience: `true` when the user has any of the given roles. */
  hasRole: (...roles: UserRole[]) => boolean

  /** Convenience: `true` when the user is a member of the given company. */
  isInCompany: (companyId: string) => boolean
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

/**
 * Global authentication hook.
 *
 * - Listens to Firebase `onAuthStateChanged` on mount to sync the store with
 *   the actual authentication state (handles page refreshes, token expiry).
 * - Fetches the user's Firestore profile whenever the auth state changes.
 * - Returns the current auth state and all auth actions from the store.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout, hasRole } = useAuth()
 *
 * if (!isAuthenticated) return <LoginPage />
 * if (!hasRole('ceo', 'finance_manager')) return <AccessDenied />
 * ```
 */
export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    registrationFlow,
    setUser,
    login,
    register,
    registerPersonal,
    registerCompany,
    joinCompany,
    logout,
    updateProfile,
    signInWithGoogle,
    setRegistrationFlow,
    clearError,
  } = useAuthStore()

  // ── Firebase auth-state listener ──────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            const raw = userDoc.data()
            const freshUser: User = {
              id: userDoc.id,
              email: raw.email ?? firebaseUser.email ?? '',
              displayName: raw.displayName ?? firebaseUser.displayName ?? 'User',
              photoURL: raw.photoURL ?? firebaseUser.photoURL ?? undefined,
              companyId: raw.companyId,
              role: raw.role ?? 'employee',
              departmentId: raw.departmentId,
              designation: raw.designation,
              employeeId: raw.employeeId,
              managerId: raw.managerId,
              costCenter: raw.costCenter,
              phone: raw.phone,
              joiningDate: raw.joiningDate
                ? raw.joiningDate instanceof Timestamp
                  ? raw.joiningDate.toDate()
                  : raw.joiningDate
                : undefined,
              status: raw.status ?? 'active',
              createdAt:
                raw.createdAt instanceof Timestamp
                  ? raw.createdAt.toDate()
                  : new Date(),
              updatedAt:
                raw.updatedAt instanceof Timestamp
                  ? raw.updatedAt.toDate()
                  : new Date(),
            }
            setUser(freshUser)
          } else {
            // The Firebase user exists but there's no Firestore profile yet.
            // This can happen during a race – the store's `register` action
            // will have already created it, so we keep the persisted user.
            // If there's no store user either, we set null which will force
            // re-login.
            const storeUser = useAuthStore.getState().user
            if (!storeUser) {
              setUser(null)
            }
          }
        } catch {
          // Firestore read failed (network, permission, etc.).
          // Keep the persisted user if available so the app isn't a white screen.
          const storeUser = useAuthStore.getState().user
          if (!storeUser) {
            setUser(null)
          }
        }
      } else {
        // No Firebase user – clear the store
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [setUser])

  // ── Derived helpers ──────────────────────────

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const isInCompany = useCallback(
    (companyId: string): boolean => {
      return user?.companyId === companyId
    },
    [user],
  )

  // ── Return ───────────────────────────────────

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    registrationFlow,
    login,
    register,
    registerPersonal,
    registerCompany,
    joinCompany,
    logout,
    updateProfile,
    signInWithGoogle,
    setRegistrationFlow,
    clearError,
    hasRole,
    isInCompany,
  }
}
