'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Shield, DollarSign, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/cn'
import type { PolicyInput } from '@/features/onboarding/hooks/useOnboarding'

// ── Props ──

export interface PoliciesStepProps {
  initialData?: Partial<PolicyInput>
  onNext: (data: PolicyInput) => void
  onBack: () => void
}

// ── Policy toggle item ──

interface PolicyToggle {
  key: keyof PolicyInput
  label: string
  description: string
  icon: typeof Shield
}

const policyToggles: PolicyToggle[] = [
  {
    key: 'requireManagerApproval',
    label: 'Manager approval required',
    description: 'All expenses must be approved by a department manager first',
    icon: Shield,
  },
  {
    key: 'requireFinanceApproval',
    label: 'Finance approval required',
    description: 'Expenses above the auto-approval limit need finance team approval',
    icon: Gavel,
  },
  {
    key: 'requireCeoApproval',
    label: 'CEO approval required',
    description: 'High-value expenses require CEO sign-off',
    icon: Shield,
  },
]

// ── Component ──

export function PoliciesStep({ initialData, onNext, onBack }: PoliciesStepProps) {
  const [policies, setPolicies] = useState<PolicyInput>({
    requireManagerApproval: initialData?.requireManagerApproval ?? true,
    requireFinanceApproval: initialData?.requireFinanceApproval ?? true,
    requireCeoApproval: initialData?.requireCeoApproval ?? true,
    autoApprovalLimit: initialData?.autoApprovalLimit ?? 1000,
    maxExpenseAmount: initialData?.maxExpenseAmount ?? 100000,
  })

  const toggle = (key: keyof PolicyInput) => {
    if (key === 'autoApprovalLimit' || key === 'maxExpenseAmount') return
    setPolicies((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const updateLimit = (key: 'autoApprovalLimit' | 'maxExpenseAmount', value: string) => {
    const num = Number(value)
    if (!isNaN(num)) {
      setPolicies((prev) => ({ ...prev, [key]: num }))
    }
  }

  return (
    <div className="py-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Expense policies
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Configure approval workflows and spending limits
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle switches */}
        <div className="space-y-3">
          {policyToggles.map((item) => {
            const Icon = item.icon
            const isEnabled = policies[item.key] as boolean
            return (
              <div
                key={item.key}
                className={cn(
                  'flex items-start gap-4 rounded-xl border p-4 transition-all duration-200',
                  isEnabled
                    ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
                )}
              >
                <div className={cn(
                  'mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg',
                  isEnabled ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      {item.label}
                    </label>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="policy-auto-approve"
            label="Auto-approval limit ($)"
            type="number"
            placeholder="1000"
            value={policies.autoApprovalLimit}
            onChange={(e) => updateLimit('autoApprovalLimit', e.target.value)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <Input
            id="policy-max-expense"
            label="Max expense amount ($)"
            type="number"
            placeholder="100000"
            value={policies.maxExpenseAmount}
            onChange={(e) => updateLimit('maxExpenseAmount', e.target.value)}
            icon={<DollarSign className="h-4 w-4" />}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => onNext(policies)} className="gap-2" size="lg">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
