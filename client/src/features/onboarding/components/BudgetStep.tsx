'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, ArrowLeft, DollarSign, Calendar } from 'lucide-react'
import {
  onboardingBudgetSchema,
  type OnboardingBudgetFormData,
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
import type { BudgetInput } from '@/features/onboarding/hooks/useOnboarding'

// ── Props ──

export interface BudgetStepProps {
  initialData?: Partial<BudgetInput>
  onNext: (data: BudgetInput) => void
  onBack: () => void
}

// ── Component ──

export function BudgetStep({ initialData, onNext, onBack }: BudgetStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingBudgetFormData>({
    resolver: zodResolver(onboardingBudgetSchema) as any,
    defaultValues: {
      totalBudget: initialData?.totalBudget || 0,
      fiscalYear: initialData?.fiscalYear || new Date().getFullYear().toString(),
      period: initialData?.period || 'annual',
    },
    mode: 'onChange',
  })

  const selectedPeriod = watch('period')

  const onSubmit = (data: OnboardingBudgetFormData) => {
    onNext({
      totalBudget: data.totalBudget,
      fiscalYear: data.fiscalYear,
      period: data.period,
    })
  }

  return (
    <div className="py-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Set your budget
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Define your company&apos;s expense budget to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Total budget */}
        <Input
          id="budget-total"
          label="Total budget"
          type="number"
          placeholder="0.00"
          error={errors.totalBudget?.message}
          icon={<DollarSign className="h-4 w-4" />}
          {...register('totalBudget', { valueAsNumber: true })}
        />

        {/* Fiscal year & Period */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="budget-fiscal-year"
            label="Fiscal year"
            type="text"
            placeholder="2025"
            error={errors.fiscalYear?.message}
            icon={<Calendar className="h-4 w-4" />}
            {...register('fiscalYear')}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget period
            </label>
            <Select
              value={selectedPeriod}
              onValueChange={(val) => setValue('period', val as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            You can always adjust budgets and add more details later in your company settings.
          </p>
        </div>

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
