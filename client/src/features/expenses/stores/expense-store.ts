'use client'

import { create } from 'zustand'
import { api } from '@/utils/api'
import type { Expense, ExpenseStatus } from '@/types'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ExpenseFilters {
  status: ExpenseStatus | 'all'
  category: string
  dateFrom: string
  dateTo: string
  search: string
}

export interface ExpensePagination {
  page: number
  limit: number
  total: number
}

export interface ExpenseState {
  /** All loaded expenses. */
  expenses: Expense[]

  /** Currently selected expense (for detail view / edit). */
  selectedExpense: Expense | null

  /** Active filter values. */
  filters: ExpenseFilters

  /** Pagination state. */
  pagination: ExpensePagination

  /** `true` while a network request is in flight. */
  isLoading: boolean

  /** Last error message, or `null`. */
  error: string | null

  // ── Actions ──────────────────────────────────

  /** Fetch paginated expenses from the server. */
  fetchExpenses: () => Promise<void>

  /** Create a new expense. */
  createExpense: (data: Partial<Expense>) => Promise<Expense>

  /** Update an existing expense. */
  updateExpense: (id: string, data: Partial<Expense>) => Promise<Expense>

  /** Delete an expense. */
  deleteExpense: (id: string) => Promise<void>

  /** Fetch a single expense by ID. */
  getExpenseById: (id: string) => Promise<void>

  /** Update filter values (resets page to 1 unless `keepPage` is true). */
  setFilters: (filters: Partial<ExpenseFilters>, keepPage?: boolean) => void

  /** Set the current page number. */
  setPage: (page: number) => void

  /** Clear the selected expense. */
  clearSelected: () => void

  /** Set multiple expenses directly (e.g. after a mutation). */
  setExpenses: (expenses: Expense[]) => void

  /** Clear all errors. */
  clearError: () => void
}

// ──────────────────────────────────────────────
// Defaults
// ──────────────────────────────────────────────

const DEFAULT_FILTERS: ExpenseFilters = {
  status: 'all',
  category: '',
  dateFrom: '',
  dateTo: '',
  search: '',
}

const DEFAULT_PAGINATION: ExpensePagination = {
  page: 1,
  limit: 20,
  total: 0,
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useExpenseStore = create<ExpenseState>()((set, get) => ({
  // ── Initial state ───────────────────────────

  expenses: [],
  selectedExpense: null,
  filters: { ...DEFAULT_FILTERS },
  pagination: { ...DEFAULT_PAGINATION },
  isLoading: false,
  error: null,

  // ── Actions ─────────────────────────────────

  fetchExpenses: async () => {
    const { filters, pagination } = get()
    set({ isLoading: true, error: null })

    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', String(pagination.page))
      params.set('limit', String(pagination.limit))

      // Filters
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.category) params.set('category', filters.category)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      if (filters.search) params.set('search', filters.search)

      const query = params.toString()

      const response = await api.get<{
        data: Expense[]
        pagination: { page: number; limit: number; total: number }
      }>(`/expenses${query ? `?${query}` : ''}`)

      set({
        expenses: response.data ?? [],
        pagination: {
          page: response.pagination?.page ?? pagination.page,
          limit: response.pagination?.limit ?? pagination.limit,
          total: response.pagination?.total ?? 0,
        },
        isLoading: false,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch expenses'
      set({ error: message, isLoading: false })
    }
  },

  createExpense: async (data) => {
    set({ isLoading: true, error: null })

    try {
      const created = await api.post<Expense, Partial<Expense>>('/expenses', {
        body: data,
      })

      set((state) => ({
        expenses: [created, ...state.expenses],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isLoading: false,
      }))

      return created
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create expense'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  updateExpense: async (id, data) => {
    set({ isLoading: true, error: null })

    try {
      const updated = await api.patch<Expense, Partial<Expense>>(
        `/expenses/${encodeURIComponent(id)}`,
        { body: data },
      )

      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
        selectedExpense:
          state.selectedExpense?.id === id ? updated : state.selectedExpense,
        isLoading: false,
      }))

      return updated
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update expense'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await api.delete(`/expenses/${encodeURIComponent(id)}`)

      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        selectedExpense:
          state.selectedExpense?.id === id ? null : state.selectedExpense,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
      }))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete expense'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  getExpenseById: async (id) => {
    set({ isLoading: true, error: null, selectedExpense: null })

    try {
      const expense = await api.get<Expense>(
        `/expenses/${encodeURIComponent(id)}`,
      )

      set({ selectedExpense: expense, isLoading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch expense'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (newFilters, keepPage = false) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: {
        ...state.pagination,
        page: keepPage ? state.pagination.page : 1,
      },
    }))
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
  },

  clearSelected: () => {
    set({ selectedExpense: null })
  },

  setExpenses: (expenses) => {
    set({ expenses })
  },

  clearError: () => {
    set({ error: null })
  },
}))
