'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { Expense } from '@/types'

// ──────────────────────────────────────────────
// Query key helpers
// ──────────────────────────────────────────────

export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  pending: (filters?: Record<string, unknown>) =>
    [...approvalKeys.lists(), 'pending', filters] as const,
  history: (action?: string) =>
    [...approvalKeys.lists(), 'history', action] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (id: string | undefined) =>
    [...approvalKeys.details(), id ?? ''] as const,
  stats: () => [...approvalKeys.all, 'stats'] as const,
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ApprovalListResponse {
  data: Expense[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApprovalStatsResponse {
  pendingCount: number
  approvedThisMonth: number
  averageApprovalTimeHours: number
  approvalRate: number
  bottleneckStage: string | null
  bottleneckAvgHours: number | null
  stageBreakdown: {
    stage: string
    label: string
    avgHours: number
    count: number
  }[]
}

export interface ApprovalActionPayload {
  id: string
  comment?: string
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

/**
 * Fetch expenses awaiting the current user's approval.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePendingApprovals()
 * ```
 */
export function usePendingApprovals(
  options?: Omit<
    UseQueryOptions<ApprovalListResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ApprovalListResponse>({
    queryKey: approvalKeys.pending(),
    queryFn: async () => {
      return api.get<ApprovalListResponse>('/approvals/pending')
    },
    staleTime: 30_000, // 30 seconds – approvals change frequently
    ...options,
  })
}

/**
 * Fetch past approval / rejection actions by the current user.
 *
 * @param action - Optional filter: `'approved'` | `'rejected'`.
 *
 * @example
 * ```tsx
 * const { data: approved } = useApprovalHistory('approved')
 * const { data: rejected } = useApprovalHistory('rejected')
 * ```
 */
export function useApprovalHistory(
  action?: 'approved' | 'rejected',
  options?: Omit<
    UseQueryOptions<ApprovalListResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ApprovalListResponse>({
    queryKey: approvalKeys.history(action),
    queryFn: async () => {
      const params = action ? `?action=${action}` : ''
      return api.get<ApprovalListResponse>(`/approvals/history${params}`)
    },
    staleTime: 60_000,
    ...options,
  })
}

/**
 * Approve an expense. Invalidates pending and history lists on success.
 *
 * @example
 * ```tsx
 * const approveMutation = useApproveExpense()
 * approveMutation.mutate({ id: 'abc-123', comment: 'Looks good' })
 * ```
 */
export function useApproveExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: ApprovalActionPayload) => {
      return api.post<Expense, { comment?: string }>(
        `/approvals/${encodeURIComponent(id)}/approve`,
        { body: { comment } },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ['expenses', 'detail'] })
    },
  })
}

/**
 * Reject an expense. Invalidates pending and history lists on success.
 *
 * @example
 * ```tsx
 * const rejectMutation = useRejectExpense()
 * rejectMutation.mutate({ id: 'abc-123', comment: 'Missing receipt' })
 * ```
 */
export function useRejectExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: ApprovalActionPayload) => {
      if (!comment) {
        throw new Error('A comment is required when rejecting an expense')
      }
      return api.post<Expense, { comment: string }>(
        `/approvals/${encodeURIComponent(id)}/reject`,
        { body: { comment } },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ['expenses', 'detail'] })
    },
  })
}

/**
 * Request changes on an expense. Invalidates lists on success.
 *
 * @example
 * ```tsx
 * const requestChangesMutation = useRequestChanges()
 * requestChangesMutation.mutate({ id: 'abc-123', comment: 'Please recategorize' })
 * ```
 */
export function useRequestChanges() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, comment }: ApprovalActionPayload) => {
      if (!comment) {
        throw new Error('A comment is required when requesting changes')
      }
      return api.post<Expense, { comment: string }>(
        `/approvals/${encodeURIComponent(id)}/request-changes`,
        { body: { comment } },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ['expenses', 'detail'] })
    },
  })
}

/**
 * Fetch a single expense for the approval detail view.
 *
 * @example
 * ```tsx
 * const { data: expense, isLoading } = useApprovalDetail('abc-123')
 * ```
 */
export function useApprovalDetail(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<Expense>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery<Expense>({
    queryKey: approvalKeys.detail(id),
    queryFn: async () => {
      if (!id) throw new Error('Approval ID is required')
      return api.get<Expense>(`/approvals/${encodeURIComponent(id)}`)
    },
    enabled: !!id,
    staleTime: 30_000,
    ...options,
  })
}

/**
 * Fetch approval statistics for the dashboard.
 *
 * @example
 * ```tsx
 * const { data: stats } = useApprovalStats()
 * ```
 */
export function useApprovalStats(
  options?: Omit<
    UseQueryOptions<ApprovalStatsResponse>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ApprovalStatsResponse>({
    queryKey: approvalKeys.stats(),
    queryFn: async () => {
      return api.get<ApprovalStatsResponse>('/approvals/stats')
    },
    staleTime: 60_000,
    ...options,
  })
}
