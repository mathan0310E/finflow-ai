'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Bot, Scan, AlertTriangle, Tag, TrendingUp, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/cn'
import type { AiPreferenceInput } from '@/features/onboarding/hooks/useOnboarding'

// ── Props ──

export interface AiPreferencesStepProps {
  initialData?: Partial<AiPreferenceInput>
  onNext: (data: AiPreferenceInput) => void
  onBack: () => void
}

// ── AI Feature item ──

interface AiFeature {
  key: keyof AiPreferenceInput
  label: string
  description: string
  icon: typeof Bot
  gradient: string
  recommended: boolean
}

const aiFeatures: AiFeature[] = [
  {
    key: 'enableAi',
    label: 'AI-Powered Insights',
    description: 'Get smart recommendations and anomaly detection powered by machine learning',
    icon: Bot,
    gradient: 'from-violet-500 to-purple-600',
    recommended: true,
  },
  {
    key: 'enableOcr',
    label: 'Receipt OCR',
    description: 'Automatically extract data from receipt images using optical character recognition',
    icon: Scan,
    gradient: 'from-blue-500 to-indigo-600',
    recommended: true,
  },
  {
    key: 'enableAnomalyDetection',
    label: 'Anomaly Detection',
    description: 'Flag unusual spending patterns and potential fraud automatically',
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-600',
    recommended: true,
  },
  {
    key: 'enableAutoCategorization',
    label: 'Auto Categorization',
    description: 'Automatically categorize expenses based on merchant and context',
    icon: Tag,
    gradient: 'from-emerald-500 to-teal-600',
    recommended: true,
  },
  {
    key: 'enableBudgetForecasting',
    label: 'Budget Forecasting',
    description: 'Predict future spending trends and receive budget recommendations',
    icon: TrendingUp,
    gradient: 'from-rose-500 to-pink-600',
    recommended: false,
  },
  {
    key: 'enableSmartAlerts',
    label: 'Smart Alerts',
    description: 'Get notified about policy violations, budget thresholds, and approval deadlines',
    icon: Bell,
    gradient: 'from-cyan-500 to-sky-600',
    recommended: true,
  },
]

// ── Component ──

export function AiPreferencesStep({ initialData, onNext, onBack }: AiPreferencesStepProps) {
  const [prefs, setPrefs] = useState<AiPreferenceInput>({
    enableAi: initialData?.enableAi ?? true,
    enableOcr: initialData?.enableOcr ?? true,
    enableAnomalyDetection: initialData?.enableAnomalyDetection ?? true,
    enableAutoCategorization: initialData?.enableAutoCategorization ?? true,
    enableBudgetForecasting: initialData?.enableBudgetForecasting ?? false,
    enableSmartAlerts: initialData?.enableSmartAlerts ?? true,
  })

  const toggle = (key: keyof AiPreferenceInput) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const enabledCount = Object.values(prefs).filter(Boolean).length

  return (
    <div className="py-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          AI & Automation
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Choose which AI features you want to enable ({enabledCount}/6 active)
        </p>
      </div>

      <div className="mb-6 space-y-3">
        {aiFeatures.map((feature, i) => {
          const Icon = feature.icon
          const isEnabled = prefs[feature.key]

          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-start gap-4 rounded-xl border p-4 transition-all duration-200',
                isEnabled
                  ? 'border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'
                  : 'border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50',
              )}
            >
              <div className={cn(
                'mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm',
                feature.gradient,
                !isEnabled && 'opacity-50',
              )}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className={cn(
                      'text-sm font-medium cursor-pointer',
                      isEnabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
                    )}>
                      {feature.label}
                    </label>
                    {feature.recommended && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        Recommended
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggle(feature.key)}
                  />
                </div>
                <p className={cn(
                  'mt-1 text-xs leading-relaxed',
                  isEnabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500',
                )}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => onNext(prefs)} className="gap-2" size="lg">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
