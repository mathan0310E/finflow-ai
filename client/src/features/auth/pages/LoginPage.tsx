﻿'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { cn } from '@/lib/cn'

// 
// Component
// 

/**
 * Full login page with a split layout:
 * - Left panel: brand identity with animated gradient mesh.
 * - Right panel: glassmorphism login form.
 *
 * Responsive — stacks vertically on smaller screens.
 */
export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const handleSuccess = () => {
    router.replace(callbackUrl)
  }

  return (
    <div
      className={cn(
        'relative flex min-h-dvh overflow-hidden',
        'bg-gray-50 dark:bg-gray-950',
      )}
    >
      {/*  Animated gradient mesh background  */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

        {/* Animated mesh blobs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-500/10"
        />
        <motion.div
          animate={{
            x: [0, -25, 35, 0],
            y: [0, 30, -25, 0],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-500/10"
        />
        <motion.div
          animate={{
            x: [0, 40, -15, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute left-1/3 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-500/5"
        />
      </div>

      {/*  Brand panel (hidden on small screens)  */}
      <div
        className={cn(
          'hidden flex-1 flex-col items-center justify-center p-12 lg:flex',
          'relative',
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md text-center"
        >
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
            <Sparkles className="h-10 w-10 text-white" />
          </div>

          <h1
            className={cn(
              'mb-4 text-4xl font-bold tracking-tight',
              'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent',
              'dark:from-gray-100 dark:to-gray-400',
            )}
          >
            FinFlow AI
          </h1>

          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            AI-powered enterprise expense management.
            <br />
            Smart approvals, real-time insights, full control.
          </p>

          {/* Feature teasers */}
          <div className="mt-10 space-y-4 text-left">
            {teasers.map((teaser, i) => (
              <motion.div
                key={teaser.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    teaser.bg,
                  )}
                >
                  <teaser.icon className={cn('h-4 w-4', teaser.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {teaser.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {teaser.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/*  Form panel  */}
      <div
        className={cn(
          'flex flex-1 items-center justify-center p-6 sm:p-10',
          'lg:pl-0',
        )}
      >
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
              FinFlow AI
            </span>
          </motion.div>

          <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}

// 
// Feature teasers data
// 

import {
  Receipt,
  BadgeCheck,
  BarChart3,
  Shield,
  type LucideIcon,
} from 'lucide-react'

interface Teaser {
  icon: LucideIcon
  label: string
  description: string
  bg: string
  color: string
}

const teasers: Teaser[] = [
  {
    icon: Receipt,
    label: 'Smart Receipt Capture',
    description: 'OCR-powered receipt scanning with AI categorization',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: BadgeCheck,
    label: 'Multi-Level Approvals',
    description: 'Custom approval chains that match your org structure',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: BarChart3,
    label: 'Real-Time Analytics',
    description: 'Live dashboards with AI-powered spending insights',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    color: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Shield,
    label: 'Enterprise Security',
    description: 'Role-based access, audit trails, and policy controls',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
  },
]
