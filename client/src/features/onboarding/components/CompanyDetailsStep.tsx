'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Building2, Globe, DollarSign } from 'lucide-react'
import {
  onboardingCompanyDetailsSchema,
  type OnboardingCompanyDetailsFormData,
} from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/cn'
import { CURRENCIES } from '@/constants'
import type { CompanySetup, CompanySize } from '@/types'

// ── Props ──

export interface CompanyDetailsStepProps {
  initialData?: Partial<CompanySetup>
  onNext: (data: CompanySetup) => void
  onBack: () => void
}

// ── Company size options ──

const COMPANY_SIZES: { value: CompanySize; label: string; description: string }[] = [
  { value: 'startup', label: 'Startup', description: '1-10 employees' },
  { value: 'small_business', label: 'Small Business', description: '11-50 employees' },
  { value: 'medium_business', label: 'Medium Business', description: '51-200 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '201+ employees' },
]

const INDUSTRIES = [
  'Technology & Software',
  'Healthcare & Pharmaceuticals',
  'Finance & Banking',
  'Education & E-Learning',
  'E-Commerce & Retail',
  'Manufacturing & Industrial',
  'Media & Entertainment',
  'Real Estate & Construction',
  'Consulting & Professional Services',
  'Telecommunications',
  'Transportation & Logistics',
  'Energy & Utilities',
  'Hospitality & Tourism',
  'Agriculture & Food',
  'Non-Profit & NGO',
  'Government & Public Sector',
  'Legal & Law',
  'Other',
]

// ── Component ──

export function CompanyDetailsStep({ initialData, onNext, onBack }: CompanyDetailsStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingCompanyDetailsFormData>({
    resolver: zodResolver(onboardingCompanyDetailsSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      size: initialData?.size || 'startup',
      country: initialData?.country || '',
      currency: initialData?.currency || 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      website: initialData?.website || '',
    },
    mode: 'onChange',
  })

  const selectedCurrency = watch('currency')
  const selectedSize = watch('size')

  const onSubmit = (data: OnboardingCompanyDetailsFormData) => {
    onNext({
      name: data.name,
      industry: data.industry,
      size: data.size,
      country: data.country,
      currency: data.currency,
      timezone: data.timezone,
      website: data.website || undefined,
    })
  }

  return (
    <div className="py-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Company details
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Tell us about your company to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Company name */}
        <Input
          id="onboarding-company-name"
          label="Company name"
          type="text"
          placeholder="Acme Corp"
          autoComplete="organization"
          error={errors.name?.message}
          icon={<Building2 className="h-4 w-4" />}
          {...register('name')}
        />

        {/* Company Size Selector */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company size
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COMPANY_SIZES.map((size) => {
              const selected = selectedSize === size.value
              return (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setValue('size', size.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all duration-200',
                    selected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
                  )}
                >
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
        </div>

        {/* Industry & Currency row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry
            </label>
            <Select
              value={watch('industry') || ''}
              onValueChange={(val) => setValue('industry', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind.toLowerCase().replace(/[^a-z0-9]/g, '_')}>
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
              value={selectedCurrency}
              onValueChange={(val) => setValue('currency', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Website */}
        <Input
          id="onboarding-website"
          label="Website (optional)"
          type="url"
          placeholder="https://acme.com"
          autoComplete="url"
          error={errors.website?.message}
          icon={<Globe className="h-4 w-4" />}
          {...register('website')}
        />

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="submit" className="gap-2" size="lg">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
