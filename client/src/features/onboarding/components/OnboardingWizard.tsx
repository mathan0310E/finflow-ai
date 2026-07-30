'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Progress } from '@/components/ui/progress'
import { useOnboarding, ONBOARDING_STEPS, STEP_LABELS, STEP_ORDER } from '@/features/onboarding/hooks/useOnboarding'
import { WelcomeStep } from '@/features/onboarding/components/WelcomeStep'
import { WorkspaceStep } from '@/features/onboarding/components/WorkspaceStep'
import { PersonalStep } from '@/features/onboarding/components/PersonalStep'
import { CompanyDetailsStep } from '@/features/onboarding/components/CompanyDetailsStep'
import { DepartmentsStep } from '@/features/onboarding/components/DepartmentsStep'
import { InviteStep } from '@/features/onboarding/components/InviteStep'
import { BudgetStep } from '@/features/onboarding/components/BudgetStep'
import { PoliciesStep } from '@/features/onboarding/components/PoliciesStep'
import { AiPreferencesStep } from '@/features/onboarding/components/AiPreferencesStep'
import { CompleteStep } from '@/features/onboarding/components/CompleteStep'
import type { WorkspaceType, PersonalWorkspace, CompanySetup } from '@/types'
import type { DepartmentInput, InviteInput, BudgetInput, PolicyInput, AiPreferenceInput } from '@/features/onboarding/hooks/useOnboarding'

// ── Animation variants ──

const pageVariants = {
  enter: { opacity: 0, x: 40, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -40, scale: 0.97 },
}

// ── Component ──

export function OnboardingWizard() {
  const {
    currentStep,
    data,
    isSaving,
    error,
    progress,
    isFirstStep,
    isLastStep,
    isCompanyFlow,
    goToStep,
    goNext,
    goBack,
    updateData,
    completeOnboarding,
    setError,
  } = useOnboarding()

  // ── Step handlers ──

  const handleWelcomeNext = useCallback(() => {
    goToStep('workspace')
  }, [goToStep])

  const handleWorkspaceNext = useCallback((type: WorkspaceType) => {
    updateData({ workspaceType: type })
    if (type === 'personal') {
      goToStep('complete')
    } else {
      goToStep('company-details')
    }
  }, [updateData, goToStep])

  const handleCompanyDetailsNext = useCallback((setup: CompanySetup) => {
    updateData({ companySetup: setup })
    goToStep('departments')
  }, [updateData, goToStep])

  const handleDepartmentsNext = useCallback((departments: DepartmentInput[]) => {
    updateData({ departments })
    goToStep('invite')
  }, [updateData, goToStep])

  const handleInviteNext = useCallback((invites: InviteInput[]) => {
    updateData({ invites })
    goToStep('budget')
  }, [updateData, goToStep])

  const handleInviteSkip = useCallback(() => {
    goToStep('budget')
  }, [goToStep])

  const handleBudgetNext = useCallback((budget: BudgetInput) => {
    updateData({ budget })
    goToStep('policies')
  }, [updateData, goToStep])

  const handlePoliciesNext = useCallback((policies: PolicyInput) => {
    updateData({ policies })
    goToStep('ai-preferences')
  }, [updateData, goToStep])

  const handleAiNext = useCallback((aiPrefs: AiPreferenceInput) => {
    updateData({ aiPreferences: aiPrefs })
    goToStep('complete')
  }, [updateData, goToStep])

  const handlePersonalNext = useCallback((workspace: PersonalWorkspace) => {
    updateData({ personalWorkspace: workspace })
    goToStep('complete')
  }, [updateData, goToStep])

  // ── Render step ──

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onStart={handleWelcomeNext} />
      case 'workspace':
        return <WorkspaceStep onNext={handleWorkspaceNext} onBack={() => goToStep('welcome')} />
      case 'company-details':
        return (
          <CompanyDetailsStep
            initialData={data.companySetup ?? undefined}
            onNext={handleCompanyDetailsNext}
            onBack={() => goToStep('workspace')}
          />
        )
      case 'departments':
        return (
          <DepartmentsStep
            initialData={data.departments}
            onNext={handleDepartmentsNext}
            onBack={() => goToStep('company-details')}
          />
        )
      case 'invite':
        return (
          <InviteStep
            initialData={data.invites}
            onNext={handleInviteNext}
            onBack={() => goToStep('departments')}
            onSkip={handleInviteSkip}
          />
        )
      case 'budget':
        return (
          <BudgetStep
            initialData={data.budget ?? undefined}
            onNext={handleBudgetNext}
            onBack={() => goToStep('invite')}
          />
        )
      case 'policies':
        return (
          <PoliciesStep
            initialData={data.policies ?? undefined}
            onNext={handlePoliciesNext}
            onBack={() => goToStep('budget')}
          />
        )
      case 'ai-preferences':
        return (
          <AiPreferencesStep
            initialData={data.aiPreferences ?? undefined}
            onNext={handleAiNext}
            onBack={() => goToStep('policies')}
          />
        )
      case 'complete':
        if (data.workspaceType === 'personal') {
          return (
            <PersonalStep
              initialData={data.personalWorkspace ?? undefined}
              onNext={handlePersonalNext}
              onBack={() => goToStep('workspace')}
            />
          )
        }
        return (
          <CompleteStep
            isSaving={isSaving}
            error={error}
            onComplete={completeOnboarding}
            isCompanyFlow={isCompanyFlow}
          />
        )
      default:
        return <WelcomeStep onStart={handleWelcomeNext} />
    }
  }

  // Don't show progress bar on welcome step
  const showProgress = currentStep !== 'welcome'

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20',
        'bg-white/70 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        'dark:border-gray-700/50 dark:bg-gray-900/70 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      )}
    >
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/5" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/5" />
      </div>

      <div className="p-6 sm:p-8">
        {/* Header with progress */}
        {showProgress && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {STEP_LABELS[currentStep]}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Step {STEP_ORDER[currentStep]} of {ONBOARDING_STEPS.length - 1}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>
        )}

        {/* Animated step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
