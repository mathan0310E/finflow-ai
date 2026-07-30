'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Filter,
  ArrowUpDown,
  Trash2,
  Receipt,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard'
import { formatCurrency, formatDate } from '@/utils/format'
import { getStatusColor, getStatusTextColor, getStatusLabel } from '@/utils/helpers'
import { EXPENSE_CATEGORIES_MAP, EXPENSE_STATUS, PAGINATION } from '@/constants'
import type { Expense, ExpenseStatus } from '@/types'

// 
// Types
// 

export interface ExpenseListFilters {
  status: ExpenseStatus | 'all'
  category: string
  dateFrom: string
  dateTo: string
  search: string
}

export interface ExpenseListPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ViewMode = 'grid' | 'list'
export type SortField = 'date' | 'amount' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface ExpenseListProps {
  expenses: Expense[]
  pagination: ExpenseListPagination
  filters: ExpenseListFilters
  viewMode?: ViewMode
  sortField?: SortField
  sortOrder?: SortOrder
  selectedIds?: Set<string>
  isLoading?: boolean
  onFiltersChange?: (filters: Partial<ExpenseListFilters>) => void
  onPageChange?: (page: number) => void
  onViewModeChange?: (mode: ViewMode) => void
  onSortChange?: (field: SortField, order: SortOrder) => void
  onSelectId?: (id: string) => void
  onSelectAll?: () => void
  onClearSelection?: () => void
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  onView?: (expense: Expense) => void
  className?: string
}

// 
// Loading Skeleton
// 

function ExpenseSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 
// Empty State
// 

function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {hasFilters ? 'No matching expenses' : 'No expenses yet'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {hasFilters
          ? 'Try adjusting your filters or search terms'
          : 'Create your first expense to get started'}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </motion.div>
  )
}

// 
// Filter Toolbar
// 

function FilterToolbar({
  filters,
  onFiltersChange,
  onClearFilters,
}: {
  filters: ExpenseListFilters
  onFiltersChange: (filters: Partial<ExpenseListFilters>) => void
  onClearFilters: () => void
}) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.category !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.search !== ''

  return (
    <div className="space-y-3">
      {/*  Search + quick filters  */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as ExpenseStatus | 'all' })}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Status</option>
          {EXPENSE_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ category: e.target.value })}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All Categories</option>
          {Object.values(EXPENSE_CATEGORIES_MAP).map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="From"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="To"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

// 
// Pagination
// 

function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (page <= 3) {
              pageNum = i + 1
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = page - 2 + i
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// 
// Table View (Desktop)
// 

function TableView({
  expenses,
  selectedIds,
  onSelectId,
  onEdit,
  onDelete,
  onView,
  sortField,
  sortOrder,
  onSortChange,
}: {
  expenses: Expense[]
  selectedIds?: Set<string>
  onSelectId?: (id: string) => void
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  onView?: (expense: Expense) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSortChange?: (field: SortField, order: SortOrder) => void
}) {
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange?.(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange?.(field, 'desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-gray-300" />
    return (
      <ArrowUpDown
        className={cn(
          'h-3 w-3',
          sortOrder === 'asc' ? 'text-blue-500 rotate-180' : 'text-blue-500',
        )}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={selectedIds?.size === expenses.length && expenses.length > 0}
                onChange={() => {}}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Expense
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center gap-1">
                Amount
                <SortIcon field="amount" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Category
            </th>
            <th
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-1">
                Date
                <SortIcon field="date" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className={cn(
                'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                selectedIds?.has(expense.id) && 'bg-blue-50 dark:bg-blue-950/20',
              )}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedIds?.has(expense.id) ?? false}
                  onChange={() => onSelectId?.(expense.id)}
                />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onView?.(expense)}
                  className="text-left font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                >
                  {expense.title}
                </button>
                {expense.vendor && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{expense.vendor}</p>
                )}
              </td>
              <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                {formatCurrency(expense.amount, expense.currency)}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {EXPENSE_CATEGORIES_MAP[expense.category]?.icon}{' '}
                {EXPENSE_CATEGORIES_MAP[expense.category]?.label ?? expense.category}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {formatDate(expense.date)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    getStatusColor(expense.status),
                    getStatusTextColor(expense.status),
                  )}
                >
                  {getStatusLabel(expense.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {onView && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onView(expense)}>
                      View
                    </Button>
                  )}
                  {onEdit && expense.status === 'draft' && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onEdit(expense)}>
                      Edit
                    </Button>
                  )}
                  {onDelete && expense.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                      onClick={() => onDelete(expense)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 
// Main Component
// 

export function ExpenseList({
  expenses,
  pagination,
  filters,
  viewMode = 'grid',
  sortField = 'date',
  sortOrder = 'desc',
  selectedIds = new Set(),
  isLoading = false,
  onFiltersChange,
  onPageChange,
  onViewModeChange,
  onSortChange,
  onSelectId,
  onEdit,
  onDelete,
  onView,
  className,
}: ExpenseListProps) {
  const hasFilters =
    filters.status !== 'all' ||
    filters.category !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.search !== ''

  const handleClearFilters = useCallback(() => {
    onFiltersChange?.({
      status: 'all',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    })
  }, [onFiltersChange])

  return (
    <div className={cn('space-y-4', className)}>
      {/*  Filter toolbar  */}
      <FilterToolbar
        filters={filters}
        onFiltersChange={(f) => onFiltersChange?.(f)}
        onClearFilters={handleClearFilters}
      />

      {/*  View mode toggle  */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} {pagination.total === 1 ? 'expense' : 'expenses'}
            {selectedIds.size > 0 && (
              <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">
                ({selectedIds.size} selected)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => onViewModeChange?.('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange?.('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Separator />

      {/*  Content  */}
      {isLoading ? (
        <ExpenseSkeleton viewMode={viewMode} />
      ) : expenses.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  selected={selectedIds.has(expense.id)}
                  onSelect={(e) => onSelectId?.(e.id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TableView
                expenses={expenses}
                selectedIds={selectedIds}
                onSelectId={onSelectId}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/*  Pagination  */}
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={onPageChange ?? (() => {})}
      />
    </div>
  )
}
