'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Users, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

// ── Props ──

export interface WorkspaceStepProps {
  onNext: (type: 'personal' | 'company') => void
  onBack: () => void
}

// ── Options ──

interface WorkspaceOption {
  type: 'personal' | 'company'
  title: string
  description: string
  features: string[]
  icon: typeof User
  gradient: string
  shadow: string
  iconBg: string
}

const options: WorkspaceOption[] = [
  {
    type: 'personal',
    title: 'Personal Workspace',
    description: 'For individuals managing their own expenses and budgets.',
    features: ['Track personal expenses', 'Receipt scanning', 'Budget planning', 'Spending insights'],
    icon: User,
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/25',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    type: 'company',
    title: 'Company Workspace',
    description: 'For teams and organizations with multi-user expense management.',
    features: ['Team expense tracking', 'Approval workflows', 'Department budgets', 'Admin controls'],
    icon: Building2,
    gradient: 'from-violet-600 to-fuchsia-600',
    shadow: 'shadow-violet-500/25',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
]

// ── Component ──

export function WorkspaceStep({ onNext, onBack }: WorkspaceStepProps) {
  const [selected, setSelected] = useState<'personal' | 'company' | null>(null)

  return (
    <div className="py-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Choose your workspace
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Select the type of workspace that best fits your needs
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option, i) => {
          const isSelected = selected === option.type
          const Icon = option.icon

          return (
            <motion.button
              key={option.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              type="button"
              onClick={() => setSelected(option.type)}
              className={cn(
                'relative flex flex-col items-center rounded-2xl border-2 p-6 text-center transition-all duration-300',
                'hover:shadow-lg',
                isSelected
                  ? cn('border-transparent shadow-xl', option.shadow)
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
              )}
            >
              {isSelected && (
                <div className={cn(
                  'absolute inset-0 rounded-2xl opacity-5',
                  'bg-gradient-to-br',
                  option.gradient,
                )} />
              )}

              <div className={cn(
                'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl',
                isSelected
                  ? cn('bg-gradient-to-br', option.gradient, option.shadow)
                  : option.iconBg,
              )}>
                <Icon className={cn(
                  'h-8 w-8',
                  isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300',
                )} />
              </div>

              <h3 className={cn(
                'mb-2 text-lg font-semibold',
                isSelected ? 'text-gray-900 dark:text-gray-50' : 'text-gray-900 dark:text-gray-100',
              )}>
                {option.title}
              </h3>

              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {option.description}
              </p>

              <ul className="space-y-1.5 text-left">
                {option.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Sparkles className={cn(
                      'h-3 w-3',
                      isSelected ? 'text-blue-500' : 'text-gray-400',
                    )} />
                    {feature}
                  </li>
                ))}
              </ul>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
