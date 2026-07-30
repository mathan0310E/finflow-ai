'use client'

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { GeneratedReport, ReportGenerationRequest, ReportSchedule } from '../stores/report-store'

// ──────────────────────────────────────────────
// Query key helpers
// ──────────────────────────────────────────────

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string | undefined) => [...reportKeys.details(), id ?? ''] as const,
  schedules: () => [...reportKeys.all, 'schedules'] as const,
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ReportListResponse {
  data: GeneratedReport[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

/**
 * Fetch the list of generated reports.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useReportsList()
 * ```
 */
export function useReportsList(
  filters?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<ReportListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ReportListResponse>({
    queryKey: reportKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && value !== 'all') {
            params.set(key, String(value))
          }
        })
      }
      const query = params.toString()
      return api.get<ReportListResponse>(`/reports${query ? `?${query}` : ''}`)
    },
    staleTime: 30_000,
    ...options,
  })
}

/**
 * Fetch a single report by ID.
 *
 * @example
 * ```tsx
 * const { data: report } = useReport('abc-123')
 * ```
 */
export function useReport(
  id: string | undefined,
  options?: Omit<UseQueryOptions<GeneratedReport>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  return useQuery<GeneratedReport>({
    queryKey: reportKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Report ID is required')
      return api.get<GeneratedReport>(`/reports/${encodeURIComponent(id)}`)
    },
    enabled: !!id,
    ...options,
  })
}

/**
 * Generate a new report. Adds it to the list optimistically on success.
 *
 * @example
 * ```tsx
 * const generateMutation = useGenerateReport()
 * generateMutation.mutate({
 *   type: 'expense_summary',
 *   format: 'pdf',
 *   period: 'monthly',
 *   dateFrom: '2025-01-01',
 *   dateTo: '2025-01-31',
 * })
 * ```
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReportGenerationRequest) => {
      return api.post<GeneratedReport, ReportGenerationRequest>('/reports/generate', {
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
    },
  })
}

/**
 * Download a report file. Handles both direct URL download and API-based download.
 *
 * @example
 * ```tsx
 * const downloadMutation = useDownloadReport()
 * downloadMutation.mutate({ id: 'abc-123', format: 'pdf' })
 * ```
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ id, format }: { id: string; format: 'pdf' | 'excel' | 'csv' }) => {
      // Build the appropriate download endpoint
      const endpointMap: Record<string, string> = {
        pdf: `/reports/${encodeURIComponent(id)}/pdf`,
        excel: `/reports/${encodeURIComponent(id)}/excel`,
        csv: `/reports/${encodeURIComponent(id)}/csv`,
      }

      const endpoint = endpointMap[format] ?? `/reports/${encodeURIComponent(id)}/pdf`

      // Use fetch directly to handle blob download
      const token = await getAuthToken()
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'

      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          Accept: 'application/octet-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${id}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      return { id, format }
    },
  })
}

/**
 * Fetch all report schedules.
 *
 * @example
 * ```tsx
 * const { data: schedules } = useReportSchedules()
 * ```
 */
export function useReportSchedules(
  options?: Omit<UseQueryOptions<ReportSchedule[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ReportSchedule[]>({
    queryKey: reportKeys.schedules(),
    queryFn: async () => {
      return api.get<ReportSchedule[]>('/reports/schedules')
    },
    staleTime: 60_000,
    ...options,
  })
}

/**
 * Create a new report schedule.
 *
 * @example
 * ```tsx
 * const scheduleMutation = useCreateSchedule()
 * scheduleMutation.mutate({
 *   reportType: 'expense_summary',
 *   period: 'monthly',
 *   format: 'pdf',
 *   recipients: ['admin@company.com'],
 * })
 * ```
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<ReportSchedule, 'id' | 'createdAt'>) => {
      return api.post<ReportSchedule, Omit<ReportSchedule, 'id' | 'createdAt'>>(
        '/reports/schedules',
        { body: data },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.schedules() })
    },
  })
}

/**
 * Delete a report schedule.
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteSchedule()
 * deleteMutation.mutate('schedule-123')
 * ```
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reports/schedules/${encodeURIComponent(id)}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.schedules() })
    },
  })
}

/**
 * Delete a generated report.
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteReport()
 * deleteMutation.mutate('abc-123')
 * ```
 */
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reports/${encodeURIComponent(id)}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
    },
  })
}

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('@/lib/firebase')
    const user = auth.currentUser
    if (!user) return null
    return await user.getIdToken(false)
  } catch {
    return null
  }
}
