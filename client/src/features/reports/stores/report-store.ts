'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ReportType =
  | 'expense_summary'
  | 'category_breakdown'
  | 'department_spend'
  | 'budget_utilization'
  | 'monthly_trend'
  | 'vendor_analysis'
  | 'approval_metrics'
  | 'policy_compliance'
  | 'reimbursement_report'
  | 'tax_report'
  | 'user_activity'
  | 'ai_insights'
  | 'custom_report'

export type ReportFormat = 'pdf' | 'excel' | 'csv'

export type ReportPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom'

export type ReportStatus = 'generating' | 'ready' | 'failed'

export interface ReportFilters {
  departmentId?: string
  category?: string
  userId?: string
  status?: string
}

export interface ReportSchedule {
  id: string
  reportType: ReportType
  period: ReportPeriod
  format: ReportFormat
  departmentId?: string
  recipients: string[]
  active: boolean
  nextRunAt?: string
  lastRunAt?: string
  createdAt: string
}

export interface GeneratedReport {
  id: string
  companyId: string
  type: ReportType
  format: ReportFormat
  period: ReportPeriod
  title: string
  dateFrom: string
  dateTo: string
  departmentId?: string
  status: ReportStatus
  fileUrl?: string
  fileSize?: number
  error?: string
  createdAt: string
  completedAt?: string
}

export interface ReportGenerationRequest {
  type: ReportType
  format: ReportFormat
  period: ReportPeriod
  dateFrom: string
  dateTo: string
  departmentId?: string
  filters?: ReportFilters
}

export interface ReportState {
  /** List of generated reports. */
  reports: GeneratedReport[]

  /** Currently selected report (for detail view / download). */
  selectedReport: GeneratedReport | null

  /** Active schedule list. */
  schedules: ReportSchedule[]

  /** Report generation form values. */
  formValues: ReportGenerationRequest

  /** `true` while any network request is in flight. */
  isLoading: boolean

  /** `true` while a report is being generated. */
  isGenerating: boolean

  /** Last error message, or `null`. */
  error: string | null

  // ── Actions ──────────────────────────────────

  /** Set the full reports list. */
  setReports: (reports: GeneratedReport[]) => void

  /** Add a newly generated report to the list. */
  addReport: (report: GeneratedReport) => void

  /** Update a report by ID (e.g. status change). */
  updateReport: (id: string, data: Partial<GeneratedReport>) => void

  /** Set the selected report. */
  setSelectedReport: (report: GeneratedReport | null) => void

  /** Set schedules. */
  setSchedules: (schedules: ReportSchedule[]) => void

  /** Update form values. */
  setFormValues: (values: Partial<ReportGenerationRequest>) => void

  /** Reset form to defaults. */
  resetForm: () => void

  /** Set loading state. */
  setLoading: (loading: boolean) => void

  /** Set generating state. */
  setGenerating: (generating: boolean) => void

  /** Set error state. */
  setError: (error: string | null) => void

  /** Clear all state. */
  clearAll: () => void

  /** Clear error. */
  clearError: () => void
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FORM_VALUES: ReportGenerationRequest = {
  type: 'expense_summary',
  format: 'pdf',
  period: 'monthly',
  dateFrom: '',
  dateTo: '',
  departmentId: undefined,
  filters: undefined,
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useReportStore = create<ReportState>()(
  devtools(
    (set) => ({
      // ── Initial state ───────────────────────────

      reports: [],
      selectedReport: null,
      schedules: [],
      formValues: { ...DEFAULT_FORM_VALUES },
      isLoading: false,
      isGenerating: false,
      error: null,

      // ── Actions ─────────────────────────────────

      setReports: (reports) => set({ reports }),

      addReport: (report) =>
        set((state) => ({
          reports: [report, ...state.reports],
        })),

      updateReport: (id, data) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
          selectedReport:
            state.selectedReport?.id === id
              ? { ...state.selectedReport, ...data }
              : state.selectedReport,
        })),

      setSelectedReport: (report) => set({ selectedReport: report }),

      setSchedules: (schedules) => set({ schedules }),

      setFormValues: (values) =>
        set((state) => ({
          formValues: { ...state.formValues, ...values },
        })),

      resetForm: () => set({ formValues: { ...DEFAULT_FORM_VALUES } }),

      setLoading: (loading) => set({ isLoading: loading }),

      setGenerating: (generating) => set({ isGenerating: generating }),

      setError: (error) => set({ error }),

      clearAll: () =>
        set({
          reports: [],
          selectedReport: null,
          schedules: [],
          error: null,
        }),

      clearError: () => set({ error: null }),
    }),
    { name: 'report-store' },
  ),
)
