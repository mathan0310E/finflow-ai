'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import {
  defaultCompanySettings,
} from '@/stores/auth-store'
import {
  generateId,
  generateSlug,
} from '@/utils/helpers'
import type {
  WorkspaceType,
  CompanySize,
  OnboardingStep,
  CompanySetup,
  PersonalWorkspace,
} from '@/types'

// ── Steps ──

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'workspace',
  'company-details',
  'departments',
  'invite',
  'budget',
  'policies',
  'ai-preferences',
  'complete',
]

export const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  workspace: 'Workspace Type',
  'company-details': 'Company Details',
  departments: 'Departments',
  invite: 'Invite Team',
  budget: 'Budget Setup',
  policies: 'Expense Policies',
  'ai-preferences': 'AI Preferences',
  complete: 'Complete',
}

export const STEP_ORDER: Record<OnboardingStep, number> = {
  welcome: 0,
  workspace: 1,
  'company-details': 2,
  departments: 3,
  invite: 4,
  budget: 5,
  policies: 6,
  'ai-preferences': 7,
  complete: 8,
}

// ── Types ──

export interface DepartmentInput {
  name: string
  budget: number
}

export interface InviteInput {
  email: string
  role: 'employee' | 'dept_manager' | 'finance_manager'
}

export interface BudgetInput {
  totalBudget: number
  fiscalYear: string
  period: 'annual' | 'quarterly' | 'monthly'
}

export interface PolicyInput {
  requireManagerApproval: boolean
  requireFinanceApproval: boolean
  requireCeoApproval: boolean
  autoApprovalLimit: number
  maxExpenseAmount: number
}

export interface AiPreferenceInput {
  enableAi: boolean
  enableOcr: boolean
  enableAnomalyDetection: boolean
  enableAutoCategorization: boolean
  enableBudgetForecasting: boolean
  enableSmartAlerts: boolean
}

export interface OnboardingData {
  workspaceType: WorkspaceType | null
  companySetup: CompanySetup | null
  personalWorkspace: PersonalWorkspace | null
  departments: DepartmentInput[]
  invites: InviteInput[]
  budget: BudgetInput | null
  policies: PolicyInput | null
  aiPreferences: AiPreferenceInput | null
}

// ── Hook ──

export function useOnboarding() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [data, setData] = useState<OnboardingData>({
    workspaceType: null,
    companySetup: null,
    personalWorkspace: null,
    departments: [],
    invites: [],
    budget: null,
    policies: null,
    aiPreferences: null,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentIndex = STEP_ORDER[currentStep]
  const totalSteps = ONBOARDING_STEPS.length
  const progress = Math.round((currentIndex / (totalSteps - 1)) * 100)

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1
  const isCompanyFlow = data.workspaceType === 'company'

  // ── Update partial data ──

  const updateData = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }, [])

  // ── Navigation ──

  const goToStep = useCallback((step: OnboardingStep) => {
    setError(null)
    setCurrentStep(step)
  }, [])

  const goNext = useCallback(() => {
    setError(null)
    const nextIndex = currentIndex + 1
    if (nextIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(ONBOARDING_STEPS[nextIndex])
    }
  }, [currentIndex])

  const goBack = useCallback(() => {
    setError(null)
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(ONBOARDING_STEPS[prevIndex])
    }
  }, [currentIndex])

  // ── Get visible steps based on flow ──

  const visibleSteps = useMemo(() => {
    if (data.workspaceType === 'personal') {
      // Personal flow: welcome → workspace → complete
      return ['welcome', 'workspace', 'complete'] as OnboardingStep[]
    }
    // Company flow: all steps
    return ONBOARDING_STEPS
  }, [data.workspaceType])

  // ── Save onboarding data to Firestore ──

  const completeOnboarding = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to complete onboarding')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Update user document to mark onboarding complete
      await updateDoc(doc(db, 'users', user.id), {
        onboardingCompleted: true,
        onboardingData: {
          workspaceType: data.workspaceType,
          completedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      })

      // Save company settings if company flow
      if (data.workspaceType === 'company' && data.companySetup) {
        const companyRef = doc(db, 'companies', user.companyId)

        // Update company with onboarding data
        await updateDoc(companyRef, {
          name: data.companySetup.name,
          industry: data.companySetup.industry || '',
          size: data.companySetup.size === 'startup' ? 1
            : data.companySetup.size === 'small_business' ? 25
            : data.companySetup.size === 'medium_business' ? 100
            : 250,
          currency: data.companySetup.currency || 'USD',
          timezone: data.companySetup.timezone || 'UTC',
          website: data.companySetup.website || '',
          updatedAt: serverTimestamp(),
        })

        // Create departments
        if (data.departments.length > 0) {
          const deptsCol = collection(db, 'companies', user.companyId, 'departments')
          for (const dept of data.departments) {
            await addDoc(deptsCol, {
              name: dept.name,
              budget: dept.budget,
              budgetSpent: 0,
              budgetRemaining: dept.budget,
              headCount: 0,
              status: 'active',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
        }

        // Save expense policies
        if (data.policies) {
          await setDoc(doc(db, 'companies', user.companyId, 'settings', 'policies'), {
            ...data.policies,
            updatedAt: serverTimestamp(),
          })
        }

        // Save AI preferences
        if (data.aiPreferences) {
          await updateDoc(companyRef, {
            'settings.enableAi': data.aiPreferences.enableAi,
            'settings.enableOcr': data.aiPreferences.enableOcr,
            updatedAt: serverTimestamp(),
          })
        }

        // Update company settings
        await updateDoc(companyRef, {
          'settings.requireManagerApproval': data.policies?.requireManagerApproval ?? true,
          'settings.requireFinanceApproval': data.policies?.requireFinanceApproval ?? true,
          'settings.requireCeoApproval': data.policies?.requireCeoApproval ?? true,
          'settings.autoApprovalLimit': data.policies?.autoApprovalLimit ?? 1000,
          'settings.maxExpenseAmount': data.policies?.maxExpenseAmount ?? 100000,
          'settings.enableAi': data.aiPreferences?.enableAi ?? true,
          'settings.enableOcr': data.aiPreferences?.enableOcr ?? true,
        })
      }

      // Save personal workspace data
      if (data.workspaceType === 'personal' && data.personalWorkspace) {
        const workspaceRef = doc(db, 'workspaces', user.id)
        await setDoc(workspaceRef, {
          ...data.personalWorkspace,
          userId: user.id,
          companyId: user.companyId,
          updatedAt: serverTimestamp(),
        }, { merge: true })
      }

      // Navigate to dashboard
      router.replace('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete setup'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }, [user, data, router])

  return {
    // State
    currentStep,
    data,
    isSaving,
    error,
    progress,
    isFirstStep,
    isLastStep,
    isCompanyFlow,
    visibleSteps,

    // Actions
    goToStep,
    goNext,
    goBack,
    updateData,
    completeOnboarding,
    setError,
  }
}
