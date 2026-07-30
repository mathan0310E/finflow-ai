﻿'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/utils/validation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/cn'

// 
// Props
// 

export interface LoginFormProps {
  /** Optional callback invoked after a successful login. */
  onSuccess?: () => void
  /** Optional className for the outer card wrapper. */
  className?: string
}

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

// 
// Component
// 

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { login, signInWithGoogle, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  //  Email/password submit 

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      onSuccess?.()
    } catch {
      // Error is handled by the store and surfaced via `error`
    }
  }

  //  Google sign-in 

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      onSuccess?.()
    } catch {
      // Error handled by store
    } finally {
      setIsGoogleLoading(false)
    }
  }

  //  Derived loading state 

  const submitting = isSubmitting || isLoading || isGoogleLoading

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('w-full', className)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/20',
          'bg-white/70 backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
          'dark:border-gray-700/50 dark:bg-gray-900/70 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        )}
      >
        {/* Subtle gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/5" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/5" />
        </div>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <motion.div
            variants={itemVariants}
            custom={0}
            className="mb-8 text-center"
          >
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in to your FinFlow AI account
            </p>
          </motion.div>

          {/* Google sign-in button */}
          <motion.div variants={itemVariants} custom={1}>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isGoogleLoading ? 'Connecting…' : 'Sign in with Google'}
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} custom={2} className="my-6">
            <div className="relative">
              <Separator />
              <span
                className={cn(
                  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium uppercase tracking-wider',
                  'bg-white/70 text-gray-400 dark:bg-gray-900/70 dark:text-gray-500',
                )}
              >
                or continue with email
              </span>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <motion.div variants={itemVariants} custom={3} className="space-y-5">
              {/* Global error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <div>
                <Input
                  id="login-email"
                  label="Email address"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  id="login-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer link */}
          <motion.div
            variants={itemVariants}
            custom={4}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                onClick={clearError}
                className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
