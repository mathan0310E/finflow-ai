import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  addDoc,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { generateId, generateSlug } from '@/utils/helpers'
import type {
  User,
  Company,
  UserRole,
  WorkspaceType,
  CompanySize,
  PersonalWorkspace,
  CompanySetup,
} from '@/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface RegisterData {
  email: string
  password: string
  displayName: string
  companyName?: string
  role: UserRole
}

export interface PersonalRegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  currency?: string
  monthlyBudget?: number
}

export interface CompanyRegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName: string
  industry?: string
  companySize?: CompanySize
  country?: string
  currency?: string
}

export interface JoinCompanyData {
  email: string
  password: string
  firstName: string
  lastName: string
  invitationCode: string
}

export type SignInFlow = 'login' | 'personal' | 'company' | 'join'

export interface AuthState {
  /** The currently authenticated user's profile (from Firestore). */
  user: User | null

  /** Derived convenience — `true` when `user` is non-null. */
  isAuthenticated: boolean

  /** `true` while an auth operation is in flight. */
  isLoading: boolean

  /** Last error message, or `null` if no error. */
  error: string | null

  /** The registration flow type being used. */
  registrationFlow: 'personal' | 'company' | 'join' | null

  // ── Actions ──────────────────────────────────

  /** Imperatively set the user (used by `useAuth` hook on auth-state changes). */
  setUser: (user: User | null) => void

  /** Sign in with email + password. */
  login: (email: string, password: string) => Promise<void>

  /** Create a new account (Firebase auth + company + user doc). */
  register: (data: RegisterData) => Promise<void>

  /** Register a personal workspace (individual user). */
  registerPersonal: (data: PersonalRegisterData) => Promise<void>

  /** Register a new company (founder/CEO creates company). */
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

  /** Clear the error state. */
  clearError: () => void
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Map common Firebase Auth error codes to human-readable messages.
 */
function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as any).code as string | undefined
    if (code) {
      switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'Invalid email or password'
        case 'auth/email-already-in-use':
          return 'An account with this email already exists'
        case 'auth/weak-password':
          return 'Password is too weak'
        case 'auth/invalid-email':
          return 'Invalid email address'
        case 'auth/user-disabled':
          return 'This account has been disabled'
        case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later'
        case 'auth/popup-closed-by-user':
          return 'Sign-in popup was closed'
        case 'auth/popup-blocked':
          return 'Sign-in popup was blocked by your browser'
        case 'auth/cancelled-popup-request':
          return 'Sign-in was cancelled'
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection'
        default:
          return error.message
      }
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Convert a Firestore Timestamp or Date to a Date object for the User model.
 */
function toDate(value: Timestamp | Date | undefined): Date {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return new Date()
}

/**
 * Build the default `CompanySettings` for a new company.
 */
export function defaultCompanySettings() {
  return {
    requireManagerApproval: true,
    requireFinanceApproval: true,
    requireCeoApproval: true,
    autoApprovalLimit: 1000,
    maxExpenseAmount: 100000,
    enableAi: true,
    enableOcr: true,
  }
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Initial state ───────────────────────────

      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registrationFlow: null,

      // ── Actions ─────────────────────────────────

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setRegistrationFlow: (flow) => set({ registrationFlow: flow }),

      // ── Login ───────────────────────────────────

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const credential = await signInWithEmailAndPassword(auth, email, password)
          await fetchAndSetUser(credential)
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Register ────────────────────────────────

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          // 1. Create Firebase auth user
          const credential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password,
          )
          const uid = credential.user.uid

          // 2. Create company document
          const companyId = generateId()
          const companySlug = generateSlug(data.companyName || data.displayName)

          const companyData: Omit<Company, 'id'> = {
            name: data.companyName || `${data.displayName}'s Company`,
            slug: companySlug,
            size: 1,
            currency: 'USD',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            tier: 'free',
            status: 'active',
            settings: defaultCompanySettings(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          await setDoc(doc(db, 'companies', companyId), {
            ...companyData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          // 3. Create user document
          const userData: Omit<User, 'id'> = {
            email: data.email,
            displayName: data.displayName,
            companyId,
            role: data.role as UserRole,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          await setDoc(doc(db, 'users', uid), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          // 4. Set store with fresh user
          const user: User = { id: uid, ...userData }
          set({ user, isAuthenticated: true, isLoading: false, error: null })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Register Personal ────────────────────────

      registerPersonal: async (data) => {
        set({ isLoading: true, error: null, registrationFlow: 'personal' })
        try {
          const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
          const uid = credential.user.uid
          const displayName = `${data.firstName} ${data.lastName}`

          // Create personal workspace as a "company" with no employees
          const companyId = generateId()
          const companySlug = generateSlug(displayName)

          const companyData = {
            name: `${displayName}'s Workspace`,
            slug: companySlug,
            size: 1,
            currency: data.currency || 'USD',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            tier: 'free' as const,
            status: 'active' as const,
            settings: { ...defaultCompanySettings(), enableAi: true, enableOcr: true },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(doc(db, 'companies', companyId), companyData)

          const userData = {
            email: data.email,
            displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            companyId,
            role: 'employee' as UserRole,
            status: 'active' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(doc(db, 'users', uid), userData)

          const user: User = {
            id: uid,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          // Create personal workspace doc
          const workspaceRef = doc(db, 'workspaces', uid)
          await setDoc(workspaceRef, {
            type: 'personal',
            userId: uid,
            companyId,
            currency: data.currency || 'USD',
            monthlyBudget: data.monthlyBudget || 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          set({ user, isAuthenticated: true, isLoading: false, error: null })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Register Company ────────────────────────

      registerCompany: async (data) => {
        set({ isLoading: true, error: null, registrationFlow: 'company' })
        try {
          const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
          const uid = credential.user.uid
          const displayName = `${data.firstName} ${data.lastName}`

          // Create company
          const companyId = generateId()
          const companySlug = generateSlug(data.companyName)

          const companyData = {
            name: data.companyName,
            slug: companySlug,
            size: data.companySize === 'startup' ? 1 : 5,
            industry: data.industry || '',
            currency: data.currency || 'USD',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            tier: 'free' as const,
            status: 'active' as const,
            settings: defaultCompanySettings(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(doc(db, 'companies', companyId), companyData)

          // Create user as CEO
          const userData = {
            email: data.email,
            displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            companyId,
            role: 'ceo' as UserRole,
            status: 'active' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(doc(db, 'users', uid), userData)

          const user: User = {
            id: uid,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set({ user, isAuthenticated: true, isLoading: false, error: null })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Join Company ────────────────────────────

      joinCompany: async (data) => {
        set({ isLoading: true, error: null, registrationFlow: 'join' })
        try {
          // Look up company by invitation code
          const invitationRef = doc(db, 'invitations', data.invitationCode)
          const invitationSnap = await getDoc(invitationRef)

          if (!invitationSnap.exists()) {
            throw new Error('Invalid or expired invitation code')
          }

          const invitationData = invitationSnap.data()
          const companyId = invitationData.companyId

          if (!companyId) {
            throw new Error('Invalid invitation code')
          }

          // Create Firebase auth user
          const credential = await createUserWithEmailAndPassword(auth, data.email, data.password)
          const uid = credential.user.uid
          const displayName = `${data.firstName} ${data.lastName}`

          // Create user as employee
          const userData = {
            email: data.email,
            displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            companyId,
            role: invitationData.role || ('employee' as UserRole),
            status: 'active' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          await setDoc(doc(db, 'users', uid), userData)

          const user: User = {
            id: uid,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set({ user, isAuthenticated: true, isLoading: false, error: null })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Logout ──────────────────────────────────

      logout: async () => {
        set({ isLoading: true })
        try {
          await signOut(auth)
          set({ user: null, isAuthenticated: false, isLoading: false, error: null, registrationFlow: null })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
        }
      },

      // ── Update profile ──────────────────────────

      updateProfile: async (data) => {
        const currentUser = get().user
        if (!currentUser) {
          const errMsg = 'Not authenticated'
          set({ error: errMsg })
          throw new Error(errMsg)
        }

        set({ isLoading: true, error: null })
        try {
          const updatePayload: Record<string, unknown> = {
            ...data,
            updatedAt: serverTimestamp(),
          }

          // Remove `id` from the update payload if it somehow got included
          delete (updatePayload as any).id

          await updateDoc(doc(db, 'users', currentUser.id), updatePayload)

          set({
            user: {
              ...currentUser,
              ...data,
              updatedAt: new Date(),
            },
            isLoading: false,
          })
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Google sign-in ──────────────────────────

      signInWithGoogle: async (flowType = 'login') => {
        set({ isLoading: true, error: null })
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })
          const credential = await signInWithPopup(auth, provider)
          await fetchAndSetUser(credential, flowType)
        } catch (error) {
          const message = getFirebaseErrorMessage(error)
          set({ error: message, isLoading: false })
          throw error
        }
      },

      // ── Clear error ─────────────────────────────

      clearError: () => set({ error: null }),
    }),
    {
      name: 'finflow-auth',
      // Only persist serialisable data – never loading / error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * After a successful Firebase auth event, look up the user's Firestore
 * profile and update the store.
 *
 * If the profile doesn't exist (e.g. Google SSO first-time), create a
 * minimal company + user record automatically, respecting the flow type.
 */
async function fetchAndSetUser(credential: UserCredential, flowType: string = 'login') {
  const uid = credential.user.uid
  const userDoc = await getDoc(doc(db, 'users', uid))

  if (userDoc.exists()) {
    const raw = userDoc.data()
    const user: User = {
      id: userDoc.id,
      email: raw.email ?? credential.user.email ?? '',
      displayName: raw.displayName ?? credential.user.displayName ?? 'User',
      photoURL: raw.photoURL ?? credential.user.photoURL ?? undefined,
      companyId: raw.companyId,
      role: raw.role ?? 'employee',
      departmentId: raw.departmentId,
      designation: raw.designation,
      employeeId: raw.employeeId,
      managerId: raw.managerId,
      costCenter: raw.costCenter,
      phone: raw.phone,
      joiningDate: raw.joiningDate ? toDate(raw.joiningDate) : undefined,
      status: raw.status ?? 'active',
      createdAt: toDate(raw.createdAt),
      updatedAt: toDate(raw.updatedAt),
    }
    useAuthStore.getState().setUser(user)
  } else {
    // First-time Google sign-in – create based on flow type
    const displayName = credential.user.displayName || 'User'
    const googleEmail = credential.user.email ?? ''
    const nameParts = displayName.split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    if (flowType === 'personal') {
      const companyId = generateId()
      const companySlug = generateSlug(displayName)
      const companyData = {
        name: `${displayName}'s Workspace`,
        slug: companySlug,
        size: 1,
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        tier: 'free' as const,
        status: 'active' as const,
        settings: { ...defaultCompanySettings(), enableAi: true, enableOcr: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'companies', companyId), companyData)
      const userData = {
        email: googleEmail,
        displayName,
        firstName,
        lastName,
        photoURL: credential.user.photoURL ?? null,
        companyId,
        role: 'employee' as UserRole,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', uid), userData)
      const workspaceRef = doc(db, 'workspaces', uid)
      await setDoc(workspaceRef, {
        type: 'personal',
        userId: uid,
        companyId,
        currency: 'USD',
        monthlyBudget: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      const user: User = {
        id: uid,
        ...userData,
        photoURL: userData.photoURL ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      useAuthStore.getState().setUser(user)
    } else if (flowType === 'join') {
      // For Google join flow - create a minimal user, they'll need to provide code
      const companyId = generateId()
      const userData = {
        email: googleEmail,
        displayName,
        firstName,
        lastName,
        photoURL: credential.user.photoURL ?? null,
        companyId,
        role: 'employee' as UserRole,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', uid), userData)
      const user: User = {
        id: uid,
        ...userData,
        photoURL: userData.photoURL ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      useAuthStore.getState().setUser(user)
    } else {
      // Default / company flow – create a company with user as CEO
      const companyId = generateId()
      const companySlug = generateSlug(displayName)
      const companyData = {
        name: `${displayName}'s Company`,
        slug: companySlug,
        size: 1,
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        tier: 'free' as const,
        status: 'active' as const,
        settings: defaultCompanySettings(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'companies', companyId), companyData)
      const userData = {
        email: googleEmail,
        displayName,
        firstName,
        lastName,
        photoURL: credential.user.photoURL ?? null,
        companyId,
        role: 'ceo' as UserRole,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, 'users', uid), userData)
      const user: User = {
        id: uid,
        ...userData,
        photoURL: userData.photoURL ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      useAuthStore.getState().setUser(user)
    }
  }
}
