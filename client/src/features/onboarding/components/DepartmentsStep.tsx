'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Plus, X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'
import { DEPARTMENTS } from '@/constants'
import type { DepartmentInput } from '@/features/onboarding/hooks/useOnboarding'

// ── Props ──

export interface DepartmentsStepProps {
  initialData?: DepartmentInput[]
  onNext: (departments: DepartmentInput[]) => void
  onBack: () => void
}

// ── Component ──

export function DepartmentsStep({ initialData = [], onNext, onBack }: DepartmentsStepProps) {
  const [departments, setDepartments] = useState<DepartmentInput[]>(initialData)
  const [customName, setCustomName] = useState('')
  const [customBudget, setCustomBudget] = useState('')

  const toggleDefault = (name: string) => {
    setDepartments((prev) => {
      const exists = prev.find((d) => d.name === name)
      if (exists) {
        return prev.filter((d) => d.name !== name)
      }
      const defaultDept = DEPARTMENTS.find((d) => d.label === name)
      return [...prev, { name, budget: defaultDept ? 0 : 0 }]
    })
  }

  const addCustom = () => {
    if (!customName.trim()) return
    setDepartments((prev) => [...prev, { name: customName.trim(), budget: Number(customBudget) || 0 }])
    setCustomName('')
    setCustomBudget('')
  }

  const removeDept = (name: string) => {
    setDepartments((prev) => prev.filter((d) => d.name !== name))
  }

  return (
    <div className="py-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Set up departments
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Select your company departments or create custom ones
        </p>
      </div>

      {/* Default departments */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Common departments
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEPARTMENTS.slice(0, 9).map((dept) => {
            const selected = departments.some((d) => d.name === dept.label)
            return (
              <button
                key={dept.value}
                type="button"
                onClick={() => toggleDefault(dept.label)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200',
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600',
                )}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{dept.label}</span>
                {selected && (
                  <X className="ml-auto h-3 w-3 shrink-0" onClick={(e) => { e.stopPropagation(); removeDept(dept.label) }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected departments summary */}
      {departments.length > 0 && (
        <div className="mb-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected departments ({departments.length})
          </label>
          <div className="space-y-1.5">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{dept.name}</span>
                <button
                  type="button"
                  onClick={() => removeDept(dept.name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add custom department */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add custom department
        </label>
        <div className="flex gap-2">
          <Input
            id="dept-custom-name"
            type="text"
            placeholder="Department name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCustom}
            disabled={!customName.trim()}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2" type="button">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => onNext(departments)} className="gap-2" size="lg">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
