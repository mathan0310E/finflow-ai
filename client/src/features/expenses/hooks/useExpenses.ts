'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { Expense, ExpenseStatus } from '@/types'

// ──────────────────────────────────────────────
// Query key helpers
// ──────────────────────────────────────────────

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string | undefined) => [...expenseKeys.details(), id ?? ''] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ExpenseListFilters {
  status?: ExpenseStatus | 'all'
  category?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ExpenseListResponse {
  data: Expense[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ExpenseStatsResponse {
  totalSpent: number
  averageExpense: number
  expenseCount: number
  categoryBreakdown: { name: string; amount: number; percentage: number }[]
  trend: { direction: 'up' | 'down' | 'stable'; percentage: number }
  period: { from: string; to: string }
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of expenses.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useExpensesList({ status: 'pending', page: 1 })
 * ```
 */
export function useExpensesList(
  filters: ExpenseListFilters = {},
  options?: Omit<
    UseQueryOptions<ExpenseListResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ExpenseListResponse>({
    queryKey: expenseKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params = new URLSearchParams()

      // Build query string from non-empty filter values
      const entries = Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== '' && value !== 'all',
      )
      for (const [key, value] of entries) {
        params.set(key, String(value))
      }

      const query = params.toString()
      return api.get<ExpenseListResponse>(
        `/expenses${query ? `?${query}` : ''}`,
      )
    },
    ...options,
  })
}

/**
 * Fetch a single expense by ID.
 *
 * @example
 * ```tsx
 * const { data: expense, isLoading } = useExpense('abc-123')
 * ```
 */
export function useExpense(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Expense>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery<Expense>({
    queryKey: expenseKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Expense ID is required')
      return api.get<Expense>(`/expenses/${encodeURIComponent(id)}`)
    },
    enabled: !!id,
    ...options,
  })
}

/**
 * Create a new expense. Invalidates the expense list on success.
 *
 * @example
 * ```tsx
 * const createMutation = useCreateExpense()
 * createMutation.mutate({ title: 'Lunch', amount: 25, category: 'food' })
 * ```
 */
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Expense>) => {
      return api.post<Expense, Partial<Expense>>('/expenses', { body: data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

/**
 * Update an existing expense. Invalidates the detail and list caches.
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateExpense()
 * updateMutation.mutate({ id: 'abc-123', data: { amount: 50 } })
 * ```
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Expense>
    }) => {
      return api.patch<Expense, Partial<Expense>>(
        `/expenses/${encodeURIComponent(id)}`,
        { body: data },
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

/**
 * Delete an expense. Invalidates the list cache.
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteExpense()
 * deleteMutation.mutate('abc-123')
 * ```
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/expenses/${encodeURIComponent(id)}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() })
    },
  })
}

/**
 * Upload a receipt file for an expense.
 * Sends `multipart/form-data` to the server.
 *
 * @example
 * ```tsx
 * const uploadMutation = useUploadReceipt()
 * uploadMutation.mutate({ expenseId: 'abc-123', file: receiptFile })
 * ```
 */
export function useUploadReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      expenseId,
      file,
    }: {
      expenseId: string
      file: File
    }) => {
      const formData = new FormData()
      formData.append('receipt', file)

      // Use the raw api for multipart – we need to avoid JSON content-type
      const token = await getAuthToken()
      const url = `/api/expenses/${encodeURIComponent(expenseId)}/receipt`

      const headers: Record<string, string> = {
        Accept: 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({
          message: `Upload failed with status ${response.status}`,
        }))
        throw new Error(payload.message ?? 'Upload failed')
      }

      return response.json() as Promise<{
        receiptUrl: string
        ocrData?: Record<string, unknown>
      }>
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      })
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() })
    },
  })
}

/**
 * Fetch expense statistics for a given period.
 *
 * @example
 * ```tsx
 * const { data: stats } = useExpenseStats({ dateFrom: '2025-01-01', dateTo: '2025-12-31' })
 * ```
 */
export function useExpenseStats(
  params: { dateFrom?: string; dateTo?: string } = {},
  options?: Omit<
    UseQueryOptions<ExpenseStatsResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ExpenseStatsResponse>({
    queryKey: expenseKeys.stats(),
    queryFn: async () => {
      const query = new URLSearchParams()
      if (params.dateFrom) query.set('dateFrom', params.dateFrom)
      if (params.dateTo) query.set('dateTo', params.dateTo)
      const qs = query.toString()
      return api.get<ExpenseStatsResponse>(
        `/expenses/stats${qs ? `?${qs}` : ''}`,
      )
    },
    ...options,
  })
}

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Retrieve a fresh Firebase ID token for multipart uploads.
 * Duplicated from api.ts to avoid circular imports.
 */
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
