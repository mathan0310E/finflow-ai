'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, DollarSign } from 'lucide-react'
import {
  onboardingPersonalSchema,
  type OnboardingPersonalFormData,
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
import { CURRENCIES } from '@/constants'
import type { PersonalWorkspace } from '@/types'

// ── Props ──

export interface PersonalStepProps {
  initialData?: Partial<PersonalWorkspace>
  onNext: (data: PersonalWorkspace) => void
  onBack: () => void
}

// ── Component ──

export function PersonalStep({ initialData, onNext, onBack }: PersonalStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<OnboardingPersonalFormData>({
    resolver: zodResolver(onboardingPersonalSchema) as any,
    defaultValues: {
      currency: initialData?.currency || 'USD',
      monthlyBudget: initialData?.monthlyBudget || 0,
      categories: initialData?.categories || [],
    },
    mode: 'onChange',
  })

  const selectedCurrency = watch('currency')

  const onSubmit = (data: OnboardingPersonalFormData) => {
    onNext({
      type: 'personal',
      currency: data.currency,
      monthlyBudget: data.monthlyBudget || 0,
      categories: data.categories || [],
    })
  }

  return (
    <div className="py-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Personal workspace setup
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Configure your personal expense tracking preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Currency */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preferred currency
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
                  {c.symbol} {c.code} - {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monthly budget */}
        <Input
          id="personal-budget"
          label="Monthly budget (optional)"
          type="number"
          placeholder="0.00"
          error={errors.monthlyBudget?.message}
          icon={<DollarSign className="h-4 w-4" />}
          {...register('monthlyBudget', { valueAsNumber: true })}
        />

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            You can always change these settings later. This is just to get you started.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="submit" className="gap-2" size="lg" disabled={!isValid}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
