'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { cn } from '@/lib/cn'
import type { RegisterMode } from '@/features/auth/components/RegisterForm'

// ── Props ──

export interface RegisterPageProps {
  /** Default registration mode. Defaults to 'personal'. */
  defaultMode?: RegisterMode
}

// ── Component ──

/**
 * Full registration page with a split layout:
 * - Left panel: brand identity with animated gradient mesh.
 * - Right panel: multi-flow glassmorphism registration form.
 *
 * Supports `defaultMode` prop to pre-select personal / company / join mode.
 * Responsive — stacks vertically on smaller screens.
 */
export default function RegisterPage({ defaultMode = 'personal' }: RegisterPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams.get('mode') as RegisterMode) || defaultMode

  const handleSuccess = () => {
    router.replace('/onboarding')
  }

  return (
    <div
      className={cn(
        'relative flex min-h-dvh overflow-hidden',
        'bg-gray-50 dark:bg-gray-950',
      )}
    >
      {/* Animated gradient mesh background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

        {/* Animated mesh blobs */}
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 35, -20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute -left-40 -top-32 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[120px] dark:bg-violet-500/10"
        />
        <motion.div
          animate={{
            x: [0, 35, -25, 0],
            y: [0, -25, 30, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-fuchsia-400/20 blur-[120px] dark:bg-fuchsia-500/10"
        />
        <motion.div
          animate={{
            x: [0, -20, 35, 0],
            y: [0, 25, -15, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          }}
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-pink-400/10 blur-[100px] dark:bg-pink-500/5"
        />
      </div>

      {/* Brand panel (hidden on small screens) */}
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
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-10 w-10 text-white" />
          </div>

          <h1
            className={cn(
              'mb-4 text-4xl font-bold tracking-tight',
              'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent',
              'dark:from-gray-100 dark:to-gray-400',
            )}
          >
            Get Started
          </h1>

          <p className="text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            Join thousands of companies managing expenses
            <br />
            smarter with AI-powered automation.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 rounded-xl border border-gray-200/50 bg-white/50 p-5 text-left backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/30"
          >
            <p className="text-sm italic leading-relaxed text-gray-600 dark:text-gray-300">
              &ldquo;FinFlow AI cut our expense reporting time by 80%.
              The AI categorization is scary accurate.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  Sarah Chen
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  CFO, TechNova Inc.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Form panel */}
      <div
        className={cn(
          'flex flex-1 items-center justify-center p-6 sm:p-10',
          'lg:pl-0',
        )}
      >
        <div className="w-full max-w-[480px]">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
              FinFlow AI
            </span>
          </motion.div>

          <RegisterForm defaultMode={mode} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}

// ── Stats data ──

interface Stat {
  value: string
  label: string
}

const stats: Stat[] = [
  { value: '10K+', label: 'Companies' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8★', label: 'Rating' },
]
