'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { api } from '@/utils/api'
import type { Expense, ExpenseStatus } from '@/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ApprovalTab = 'pending' | 'approved' | 'rejected'

export interface ApprovalFilters {
  type: string
  status: ExpenseStatus | 'all'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter'
  category: string
  search: string
}

export interface ApprovalStats {
  pendingCount: number
  approvedThisMonth: number
  averageApprovalTimeHours: number
  approvalRate: number
  bottleneckStage: string | null
  bottleneckAvgHours: number | null
}

export interface ApprovalState {
  /** Expenses awaiting current user's approval. */
  pendingApprovals: Expense[]

  /** Expenses previously approved by current user. */
  approvedByMe: Expense[]

  /** Expenses previously rejected by current user. */
  rejectedByMe: Expense[]

  /** Currently selected approval (for detail view). */
  selectedApproval: Expense | null

  /** Active filter values. */
  filters: ApprovalFilters

  /** Active tab. */
  activeTab: ApprovalTab

  /** `true` while any network request is in flight. */
  isLoading: boolean

  /** Last error message, or `null`. */
  error: string | null

  // ── Actions ──────────────────────────────────

  /** Fetch pending approvals from the server. */
  fetchPendingApprovals: () => Promise<void>

  /** Fetch approval history (approved/rejected by current user). */
  fetchApprovalHistory: () => Promise<void>

  /** Approve an expense. */
  approveExpense: (id: string, comment?: string) => Promise<void>

  /** Reject an expense. */
  rejectExpense: (id: string, comment: string) => Promise<void>

  /** Request changes on an expense. */
  requestChanges: (id: string, comment: string) => Promise<void>

  /** Fetch a single approval by ID for detail view. */
  getApprovalById: (id: string) => Promise<void>

  /** Update filter values. */
  setFilters: (filters: Partial<ApprovalFilters>) => void

  /** Set the active tab. */
  setActiveTab: (tab: ApprovalTab) => void

  /** Set the selected approval directly (for optimistic updates). */
  setSelectedApproval: (approval: Expense | null) => void

  /** Clear the selected approval. */
  clearSelected: () => void

  /** Clear all errors. */
  clearError: () => void
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FILTERS: ApprovalFilters = {
  type: '',
  status: 'all',
  dateRange: 'all',
  category: '',
  search: '',
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useApprovalStore = create<ApprovalState>()(
  devtools(
    (set, get) => ({
      // ── Initial state ───────────────────────────

      pendingApprovals: [],
      approvedByMe: [],
      rejectedByMe: [],
      selectedApproval: null,
      filters: { ...DEFAULT_FILTERS },
      activeTab: 'pending',
      isLoading: false,
      error: null,

      // ── Actions ─────────────────────────────────

      fetchPendingApprovals: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await api.get<{
            data: Expense[]
            pagination: { page: number; limit: number; total: number }
          }>('/approvals/pending')

          set({
            pendingApprovals: response.data ?? [],
            isLoading: false,
          })
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch pending approvals'
          set({ error: message, isLoading: false })
        }
      },

      fetchApprovalHistory: async () => {
        set({ isLoading: true, error: null })

        try {
          const [approvedRes, rejectedRes] = await Promise.all([
            api.get<{
              data: Expense[]
              pagination: { page: number; limit: number; total: number }
            }>('/approvals/history?action=approved'),
            api.get<{
              data: Expense[]
              pagination: { page: number; limit: number; total: number }
            }>('/approvals/history?action=rejected'),
          ])

          set({
            approvedByMe: approvedRes.data ?? [],
            rejectedByMe: rejectedRes.data ?? [],
            isLoading: false,
          })
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch approval history'
          set({ error: message, isLoading: false })
        }
      },

      approveExpense: async (id, comment) => {
        set({ isLoading: true, error: null })

        try {
          const updated = await api.post<Expense, { comment?: string }>(
            `/approvals/${encodeURIComponent(id)}/approve`,
            { body: { comment } },
          )

          set((state) => ({
            pendingApprovals: state.pendingApprovals.filter((e) => e.id !== id),
            approvedByMe: [updated, ...state.approvedByMe],
            selectedApproval:
              state.selectedApproval?.id === id
                ? updated
                : state.selectedApproval,
            isLoading: false,
          }))
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to approve expense'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      rejectExpense: async (id, comment) => {
        set({ isLoading: true, error: null })

        try {
          const updated = await api.post<Expense, { comment: string }>(
            `/approvals/${encodeURIComponent(id)}/reject`,
            { body: { comment } },
          )

          set((state) => ({
            pendingApprovals: state.pendingApprovals.filter((e) => e.id !== id),
            rejectedByMe: [updated, ...state.rejectedByMe],
            selectedApproval:
              state.selectedApproval?.id === id
                ? updated
                : state.selectedApproval,
            isLoading: false,
          }))
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to reject expense'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      requestChanges: async (id, comment) => {
        set({ isLoading: true, error: null })

        try {
          const updated = await api.post<Expense, { comment: string }>(
            `/approvals/${encodeURIComponent(id)}/request-changes`,
            { body: { comment } },
          )

          set((state) => ({
            pendingApprovals: state.pendingApprovals.filter((e) => e.id !== id),
            selectedApproval:
              state.selectedApproval?.id === id
                ? updated
                : state.selectedApproval,
            isLoading: false,
          }))
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to request changes'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      getApprovalById: async (id) => {
        set({ isLoading: true, error: null, selectedApproval: null })

        try {
          const expense = await api.get<Expense>(
            `/approvals/${encodeURIComponent(id)}`,
          )

          set({ selectedApproval: expense, isLoading: false })
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch approval'
          set({ error: message, isLoading: false })
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      setSelectedApproval: (approval) => {
        set({ selectedApproval: approval })
      },

      clearSelected: () => {
        set({ selectedApproval: null })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    { name: 'approval-store' },
  ),
)
