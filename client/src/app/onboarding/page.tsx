'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard'
import { cn } from '@/lib/cn'

export default function OnboardingRoute() {
  return (
    <div
      className={cn(
        'relative flex min-h-dvh flex-col items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8',
        'bg-gray-50 dark:bg-gray-950',
      )}
    >
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' as const }}
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-500/10"
        />
        <motion.div
          animate={{ x: [0, -25, 35, 0], y: [0, 30, -25, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' as const }}
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-500/10"
        />
      </div>

      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            FinFlow AI
          </span>
        </div>
      </motion.div>

      {/* Wizard */}
      <OnboardingWizard />
    </div>
  )
}
