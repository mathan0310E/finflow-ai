﻿'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { cn } from '@/lib/cn'
import { APP_NAME, APP_DESCRIPTION } from '@/constants'

// 
// Props
// 

export interface AuthLayoutProps {
  /** Auth form content (login, register, etc.). */
  children: ReactNode

  /** Optional title shown above the card. */
  title?: string

  /** Optional description shown below the title. */
  description?: string
}

// 
// Animated background mesh
// 

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950" />

      {/* Animated mesh blobs */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, #6366F1 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, #06B6D4 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -40, 50, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 2,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute left-1/3 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, #8B5CF6 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut' as const,
          delay: 1,
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYigwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-40 dark:opacity-20"
      />
    </div>
  )
}

// 
// Component
// 

/**
 * Auth pages layout with centered card, brand header, and animated gradient
 * mesh background.
 *
 * @example
 * ```tsx
 * // app/(auth)/login/page.tsx
 * import { AuthLayout } from '@/components/layout/AuthLayout'
 * import { LoginForm } from '@/features/auth/components/LoginForm'
 *
 * export default function LoginPage() {
 *   return (
 *     <AuthLayout title="Welcome back" description="Sign in to your account">
 *       <LoginForm />
 *     </AuthLayout>
 *   )
 * }
 * ```
 */
export function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <AnimatedBackground />

      {/*  Brand header  */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="mb-8 text-center"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {APP_NAME}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {APP_DESCRIPTION}
            </span>
          </div>
        </Link>
      </motion.div>

      {/*  Card  */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1] as const,
          delay: 0.1,
        }}
        className={cn(
          'w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8',
          'border-gray-200/60 bg-white/80 backdrop-blur-xl',
          'dark:border-gray-800/60 dark:bg-gray-900/80',
        )}
      >
        {/* Card header */}
        {(title || description) && (
          <div className="mb-6 text-center">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </motion.div>

      {/*  Footer  */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500"
      >
        <Link
          href="/privacy"
          className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          Terms of Service
        </Link>
        <Link
          href="/support"
          className="transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          Support
        </Link>
        <span className="text-gray-300 dark:text-gray-700">&copy; {new Date().getFullYear()}</span>
      </motion.footer>
    </div>
  )
}
