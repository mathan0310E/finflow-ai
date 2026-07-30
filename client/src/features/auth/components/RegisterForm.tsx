'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  Building2,
  User,
  AtSign,
  LockKeyhole,
  Sparkles,
  Briefcase,
  Users,
  ArrowLeft,
  Check,
  Globe,
  DollarSign,
  ChevronRight,
} from 'lucide-react'
import { z } from 'zod'
import {
  personalRegisterSchema,
  companyRegisterSchema,
  joinCompanySchema,
  type PersonalRegisterFormData,
  type CompanyRegisterFormData,
  type JoinCompanyFormData,
} from '@/utils/validation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/cn'
import { CURRENCIES } from '@/constants'

// ── Types ──

export type RegisterMode = 'personal' | 'company' | 'join'

export interface RegisterFormProps {
  /** Default registration mode. */
  defaultMode?: RegisterMode
  /** Optional callback invoked after a successful registration. */
  onSuccess?: () => void
  /** Optional className for the outer card wrapper. */
  className?: string
}

// ── Animation variants ──

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const formVariants = {
  enter: { opacity: 0, x: 40, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -40, scale: 0.97 },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' as const },
  }),
}

// ── Company size options ──

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup', description: '1-10 employees', icon: Sparkles },
  { value: 'small_business', label: 'Small Business', description: '11-50 employees', icon: User },
  { value: 'medium_business', label: 'Medium Business', description: '51-200 employees', icon: Users },
  { value: 'enterprise', label: 'Enterprise', description: '201+ employees', icon: Building2 },
] as const

// ── Component ──

export function RegisterForm({ defaultMode = 'personal', onSuccess, className }: RegisterFormProps) {
  const {
    registerPersonal,
    registerCompany,
    joinCompany,
    signInWithGoogle,
    isLoading,
    error,
    clearError,
  } = useAuth()

  const [mode, setMode] = useState<RegisterMode>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Reset error on mode switch
  const handleModeChange = useCallback((newMode: RegisterMode) => {
    clearError()
    setMode(newMode)
  }, [clearError])

  // ── Personal Form ──

  const personalForm = useForm<PersonalRegisterFormData>({
    resolver: zodResolver(personalRegisterSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  })

  // ── Company Form ──

  const companyForm = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      industry: '',
      companySize: 'startup',
      country: '',
      currency: 'USD',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  })

  // ── Join Form ──

  const joinForm = useForm<JoinCompanyFormData>({
    resolver: zodResolver(joinCompanySchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      invitationCode: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  })

  // ── Submit handlers ──

  const onSubmitPersonal = async (data: PersonalRegisterFormData) => {
    try {
      await registerPersonal({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      onSuccess?.()
    } catch { /* Error surfaced via store */ }
  }

  const onSubmitCompany = async (data: CompanyRegisterFormData) => {
    try {
      await registerCompany({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        country: data.country,
        currency: data.currency,
      })
      onSuccess?.()
    } catch { /* Error surfaced via store */ }
  }

  const onSubmitJoin = async (data: JoinCompanyFormData) => {
    try {
      await joinCompany({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        invitationCode: data.invitationCode,
      })
      onSuccess?.()
    } catch { /* Error surfaced via store */ }
  }

  // ── Google sign-in ──

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle(mode)
      onSuccess?.()
    } catch { /* Error handled by store */ }
    finally { setIsGoogleLoading(false) }
  }

  // ── Shared state ──

  const submitting = isLoading || isGoogleLoading

  // ── Render shared form fields ──

  const renderNameFields = (form: any, prefix: string) => (
    <div className="grid grid-cols-2 gap-3">
      <Input
        id={`${prefix}-first-name`}
        label="First name"
        type="text"
        placeholder="Jane"
        autoComplete="given-name"
        error={form.formState.errors.firstName?.message}
        icon={<User className="h-4 w-4" />}
        {...form.register('firstName')}
      />
      <Input
        id={`${prefix}-last-name`}
        label="Last name"
        type="text"
        placeholder="Smith"
        autoComplete="family-name"
        error={form.formState.errors.lastName?.message}
        icon={<User className="h-4 w-4" />}
        {...form.register('lastName')}
      />
    </div>
  )

  const renderEmailField = (form: any, id: string) => (
    <Input
      id={id}
      label="Email address"
      type="email"
      placeholder="jane@acme.com"
      autoComplete="email"
      error={form.formState.errors.email?.message}
      icon={<AtSign className="h-4 w-4" />}
      {...form.register('email')}
    />
  )

  const renderPasswordFields = (form: any, prefix: string) => (
    <>
      <Input
        id={`${prefix}-password`}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        {...form.register('password')}
        icon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
      <Input
        id={`${prefix}-confirm-password`}
        label="Confirm password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword?.message}
        {...form.register('confirmPassword')}
        icon={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="focus:outline-none"
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
    </>
  )

  const renderTermsFields = (form: any) => (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          {...form.register('acceptTerms')}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
            'dark:border-gray-600 dark:bg-gray-800',
          )}
        />
        <span className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          I accept the{' '}
          <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Terms of Service
          </Link>{' '}
          and agree to the processing of my data as described in the Privacy Policy.
        </span>
      </label>
      {form.formState.errors.acceptTerms?.message && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">
          {form.formState.errors.acceptTerms?.message as string}
        </p>
      )}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          {...form.register('acceptPrivacy')}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
            'dark:border-gray-600 dark:bg-gray-800',
          )}
        />
        <span className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
          I have read and agree to the{' '}
          <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Privacy Policy
          </Link>.
        </span>
      </label>
      {form.formState.errors.acceptPrivacy?.message && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">
          {form.formState.errors.acceptPrivacy?.message as string}
        </p>
      )}
    </div>
  )

  // ── Error banner ──

  const renderError = () => {
    if (!error) return null
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
        role="alert"
      >
        {error}
      </motion.div>
    )
  }

  // ── Mode tabs ──

  const modeTabs = (
    <Tabs value={mode} onValueChange={(v) => handleModeChange(v as RegisterMode)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal" className="gap-1.5 text-xs sm:text-sm">
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Personal</span>
        </TabsTrigger>
        <TabsTrigger value="company" className="gap-1.5 text-xs sm:text-sm">
          <Building2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Company</span>
        </TabsTrigger>
        <TabsTrigger value="join" className="gap-1.5 text-xs sm:text-sm">
          <Users className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Join</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )

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
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-400/5" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia-400/5" />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <motion.div
            variants={fadeUpVariants}
            custom={0}
            className="mb-6 text-center"
          >
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              Choose how you want to get started
            </p>
          </motion.div>

          {/* Mode tabs */}
          <motion.div variants={fadeUpVariants} custom={1} className="mb-6">
            {modeTabs}
          </motion.div>

          {/* Animated form content */}
          <AnimatePresence mode="wait">
            {/* ── PERSONAL MODE ── */}
            {mode === 'personal' && (
              <motion.div
                key="personal"
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Google button */}
                <motion.div variants={fadeUpVariants} custom={0}>
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
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={fadeUpVariants} custom={1} className="my-5">
                  <div className="relative">
                    <Separator />
                    <span className={cn(
                      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium uppercase tracking-wider',
                      'bg-white/70 text-gray-400 dark:bg-gray-900/70 dark:text-gray-500',
                    )}>
                      or sign up with email
                    </span>
                  </div>
                </motion.div>

                {/* Personal Form */}
                <form onSubmit={personalForm.handleSubmit(onSubmitPersonal)} noValidate>
                  <motion.div variants={fadeUpVariants} custom={2} className="space-y-4">
                    {renderError()}
                    {renderNameFields(personalForm, 'personal')}
                    {renderEmailField(personalForm, 'personal-email')}
                    {renderPasswordFields(personalForm, 'personal')}
                    {renderTermsFields(personalForm)}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2"
                      size="lg"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating workspace…</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Create personal workspace</>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* ── COMPANY MODE ── */}
            {mode === 'company' && (
              <motion.div
                key="company"
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Google button */}
                <motion.div variants={fadeUpVariants} custom={0}>
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
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={fadeUpVariants} custom={1} className="my-5">
                  <div className="relative">
                    <Separator />
                    <span className={cn(
                      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium uppercase tracking-wider',
                      'bg-white/70 text-gray-400 dark:bg-gray-900/70 dark:text-gray-500',
                    )}>
                      or register your company
                    </span>
                  </div>
                </motion.div>

                {/* Company Form */}
                <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} noValidate>
                  <motion.div variants={fadeUpVariants} custom={2} className="space-y-4">
                    {renderError()}

                    {/* Company name */}
                    <Input
                      id="company-name"
                      label="Company name"
                      type="text"
                      placeholder="Acme Corp"
                      autoComplete="organization"
                      error={companyForm.formState.errors.companyName?.message}
                      icon={<Building2 className="h-4 w-4" />}
                      {...companyForm.register('companyName')}
                    />

                    {/* Company Size Selector with Icons */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company size
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMPANY_SIZES.map((size) => {
                          const selected = companyForm.watch('companySize') === size.value
                          return (
                            <button
                              key={size.value}
                              type="button"
                              onClick={() => companyForm.setValue('companySize', size.value as any)}
                              className={cn(
                                'flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all duration-200',
                                selected
                                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40'
                                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
                              )}
                            >
                              <size.icon className={cn(
                                'h-5 w-5',
                                selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
                              )} />
                              <span className={cn(
                                'text-xs font-medium',
                                selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400',
                              )}>
                                {size.label}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {size.description}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {companyForm.formState.errors.companySize?.message && (
                        <p className="text-sm text-red-500">{companyForm.formState.errors.companySize?.message as string}</p>
                      )}
                    </div>

                    {/* Industry & Country row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Industry
                        </label>
                        <Select
                          value={companyForm.watch('industry') || ''}
                          onValueChange={(val) => companyForm.setValue('industry', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Technology & Software', 'Healthcare', 'Finance & Banking', 'Education', 'E-Commerce & Retail', 'Manufacturing', 'Media & Entertainment', 'Real Estate', 'Consulting', 'Telecommunications', 'Transportation', 'Energy', 'Hospitality', 'Agriculture', 'Non-Profit', 'Other'].map((ind) => (
                              <SelectItem key={ind} value={ind.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}>
                                {ind}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Currency
                        </label>
                        <Select
                          value={companyForm.watch('currency') || 'USD'}
                          onValueChange={(val) => companyForm.setValue('currency', val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.symbol} {c.code} - {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {renderNameFields(companyForm, 'company')}
                    {renderEmailField(companyForm, 'company-email')}
                    {renderPasswordFields(companyForm, 'company')}
                    {renderTermsFields(companyForm)}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2"
                      size="lg"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating company…</>
                      ) : (
                        <><Building2 className="h-4 w-4" /> Create company account</>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* ── JOIN MODE ── */}
            {mode === 'join' && (
              <motion.div
                key="join"
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Google button */}
                <motion.div variants={fadeUpVariants} custom={0}>
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
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={fadeUpVariants} custom={1} className="my-5">
                  <div className="relative">
                    <Separator />
                    <span className={cn(
                      'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium uppercase tracking-wider',
                      'bg-white/70 text-gray-400 dark:bg-gray-900/70 dark:text-gray-500',
                    )}>
                      or join with invitation
                    </span>
                  </div>
                </motion.div>

                {/* Join Form */}
                <form onSubmit={joinForm.handleSubmit(onSubmitJoin)} noValidate>
                  <motion.div variants={fadeUpVariants} custom={2} className="space-y-4">
                    {renderError()}

                    {/* Invitation code */}
                    <Input
                      id="join-code"
                      label="Invitation code"
                      type="text"
                      placeholder="Enter your invitation code"
                      autoComplete="off"
                      error={joinForm.formState.errors.invitationCode?.message}
                      icon={<LockKeyhole className="h-4 w-4" />}
                      {...joinForm.register('invitationCode')}
                    />

                    {renderNameFields(joinForm, 'join')}
                    {renderEmailField(joinForm, 'join-email')}
                    {renderPasswordFields(joinForm, 'join')}
                    {renderTermsFields(joinForm)}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2"
                      size="lg"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Joining company…</>
                      ) : (
                        <><Users className="h-4 w-4" /> Join company</>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer link */}
          <motion.div
            variants={fadeUpVariants}
            custom={5}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                onClick={clearError}
                className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
