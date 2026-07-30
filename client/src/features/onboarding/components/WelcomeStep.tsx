'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

// ── Props ──

export interface WelcomeStepProps {
  onStart: () => void
}

// ── Animation ──

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
}

// ── Component ──

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {/* Logo animation */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="mb-8"
      >
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-500/30 ring-1 ring-white/20">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl"
      >
        Welcome to FinFlow AI
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
        className="mb-8 max-w-md text-base leading-relaxed text-gray-500 dark:text-gray-400"
      >
        Let&apos;s get you set up in just a few steps. We&apos;ll help you configure
        your workspace, invite your team, and personalize your experience.
      </motion.p>

      {/* Feature preview cards */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={3}
        className="mb-10 grid w-full max-w-lg grid-cols-2 gap-3"
      >
        {features.map((feature) => (
          <div
            key={feature.label}
            className={cn(
              'rounded-xl border border-gray-200/50 bg-white/60 p-4 text-left backdrop-blur-sm',
              'dark:border-gray-700/50 dark:bg-gray-800/40',
            )}
          >
            <div className={cn(
              'mb-2 flex h-8 w-8 items-center justify-center rounded-lg',
              feature.bg,
            )}>
              <feature.icon className={cn('h-4 w-4', feature.color)} />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {feature.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {feature.description}
            </p>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4}
      >
        <Button
          onClick={onStart}
          size="lg"
          className="h-12 gap-2 px-8 text-base shadow-lg shadow-violet-500/25"
        >
          Let&apos;s get started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Step indicator */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="mt-6 text-xs text-gray-400 dark:text-gray-500"
      >
        Takes about 3 minutes
      </motion.p>
    </div>
  )
}

// ── Feature data ──

import { Scan, Brain, GitBranch, BarChart3, type LucideIcon } from 'lucide-react'

interface FeatureItem {
  icon: LucideIcon
  label: string
  description: string
  bg: string
  color: string
}

const features: FeatureItem[] = [
  {
    icon: Scan,
    label: 'Smart Receipts',
    description: 'AI-powered OCR scanning',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Brain,
    label: 'AI Insights',
    description: 'Auto-categorization',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    color: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: GitBranch,
    label: 'Approval Flows',
    description: 'Multi-level workflows',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'Real-time dashboards',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
  },
]
