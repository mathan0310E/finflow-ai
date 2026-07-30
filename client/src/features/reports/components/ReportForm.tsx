'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Calendar,
  Building2,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { REPORT_TYPES, REPORT_TYPES_MAP, DEPARTMENTS } from '@/constants'
import { useReportStore, type ReportType, type ReportFormat, type ReportPeriod } from '../stores/report-store'
import { useGenerateReport } from '../hooks/useReports'
import { formatDate } from '@/utils/format'

// 
// Types
// 

export interface ReportFormProps {
  /** Optional class name for the root element. */
  className?: string
  /** Callback fired after a report is successfully generated. */
  onGenerated?: (report: unknown) => void
}

// 
// Constants
// 

const REPORT_FORMATS: { value: ReportFormat; label: string; description: string }[] = [
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel (.xlsx)' },
  { value: 'csv', label: 'CSV', description: 'Comma Separated Values' },
]

const REPORT_PERIODS: { value: ReportPeriod; label: string; description: string }[] = [
  { value: 'monthly', label: 'Monthly', description: 'Current month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Current quarter' },
  { value: 'yearly', label: 'Yearly', description: 'Current year' },
  { value: 'custom', label: 'Custom Range', description: 'Pick a date range' },
]

// 
// Animation variants
// 

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

// 
// Helpers
// 

function getDefaultDateRange(period: ReportPeriod): { dateFrom: string; dateTo: string } {
  const now = new Date()

  switch (period) {
    case 'monthly': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return {
        dateFrom: formatDate(from, 'yyyy-MM-dd'),
        dateTo: formatDate(to, 'yyyy-MM-dd'),
      }
    }
    case 'quarterly': {
      const quarter = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), quarter * 3, 1)
      const to = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      return {
        dateFrom: formatDate(from, 'yyyy-MM-dd'),
        dateTo: formatDate(to, 'yyyy-MM-dd'),
      }
    }
    case 'yearly': {
      const from = new Date(now.getFullYear(), 0, 1)
      const to = new Date(now.getFullYear(), 11, 31)
      return {
        dateFrom: formatDate(from, 'yyyy-MM-dd'),
        dateTo: formatDate(to, 'yyyy-MM-dd'),
      }
    }
    case 'custom':
    default:
      return { dateFrom: '', dateTo: '' }
  }
}

// 
// Component
// 

/**
 * Report generation form with type, date range, department filter,
 * format selection, and a generate button with loading state.
 *
 * @example
 * ```tsx
 * <ReportForm onGenerated={(report) => console.log('Generated:', report)} />
 * ```
 */
export function ReportForm({ className, onGenerated }: ReportFormProps) {
  const formValues = useReportStore((s) => s.formValues)
  const isGenerating = useReportStore((s) => s.isGenerating)
  const setFormValues = useReportStore((s) => s.setFormValues)
  const setGenerating = useReportStore((s) => s.setGenerating)
  const setError = useReportStore((s) => s.setError)
  const addReport = useReportStore((s) => s.addReport)

  const generateMutation = useGenerateReport()

  //  Local error state for form validation 

  const [validationError, setValidationError] = useState<string | null>(null)

  //  Computed 

  const selectedReportType = useMemo(
    () => REPORT_TYPES_MAP[formValues.type],
    [formValues.type],
  )

  //  Period change handler 

  const handlePeriodChange = (period: ReportPeriod) => {
    const dateRange = getDefaultDateRange(period)
    setFormValues({
      period,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    })
    setValidationError(null)
  }

  //  Generate 

  const handleGenerate = async () => {
    // Validate
    if (!formValues.dateFrom || !formValues.dateTo) {
      setValidationError('Please select a date range')
      return
    }
    if (new Date(formValues.dateFrom) > new Date(formValues.dateTo)) {
      setValidationError('Start date must be before end date')
      return
    }

    setValidationError(null)
    setGenerating(true)
    setError(null)

    try {
      const report = await generateMutation.mutateAsync({
        type: formValues.type,
        format: formValues.format,
        period: formValues.period,
        dateFrom: formValues.dateFrom,
        dateTo: formValues.dateTo,
        departmentId: formValues.departmentId,
        filters: formValues.filters,
      })

      addReport(report)
      onGenerated?.(report)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate report'
      setError(message)
      setValidationError(message)
    } finally {
      setGenerating(false)
    }
  }

  //  Render 

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Generate Report
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create custom reports for your business
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-5">
            {/*  Report Type  */}
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select
                value={formValues.type}
                onValueChange={(value: ReportType) => {
                  setFormValues({ type: value })
                  setValidationError(null)
                }}
              >
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      <div className="flex items-center gap-2">
                        <span>{rt.icon}</span>
                        <span>{rt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReportType && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedReportType.description}
                </p>
              )}
            </div>

            {/*  Period  */}
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="grid grid-cols-4 gap-2">
                {REPORT_PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePeriodChange(p.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all',
                      formValues.period === p.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700',
                    )}
                  >
                    <span className="block font-semibold">{p.label}</span>
                    <span className="mt-0.5 block text-[10px] opacity-70">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/*  Date Range  */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">Start Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={formValues.dateFrom}
                  onChange={(e) => {
                    setFormValues({ dateFrom: e.target.value })
                    setValidationError(null)
                  }}
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">End Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={formValues.dateTo}
                  onChange={(e) => {
                    setFormValues({ dateTo: e.target.value })
                    setValidationError(null)
                  }}
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>
            </div>

            {/*  Department Filter  */}
            <div className="space-y-2">
              <Label htmlFor="department">Department (optional)</Label>
              <Select
                value={formValues.departmentId ?? 'all'}
                onValueChange={(value: string) => {
                  setFormValues({
                    departmentId: value === 'all' ? undefined : value,
                  })
                }}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>All Departments</span>
                    </div>
                  </SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      <span>{dept.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/*  Format  */}
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {REPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => {
                      setFormValues({ format: fmt.value })
                      setValidationError(null)
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all',
                      formValues.format === fmt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700',
                    )}
                  >
                    <FileDown className="h-5 w-5" />
                    <span className="text-xs font-semibold">{fmt.label}</span>
                    <span className="text-[10px] opacity-70">{fmt.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/*  Validation Error  */}
            {validationError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 dark:text-red-400"
              >
                {validationError}
              </motion.p>
            )}

            {/*  Submit  */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
