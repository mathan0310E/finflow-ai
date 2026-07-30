'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useExpenseStore } from '@/features/expenses/stores/expense-store'
import { ExpenseStats } from '@/features/expenses/components/ExpenseStats'
import { ExpenseList, type ViewMode, type SortField, type SortOrder } from '@/features/expenses/components/ExpenseList'
import { useExpensesList, useExpenseStats } from '@/features/expenses/hooks/useExpenses'
import type { Expense } from '@/types'

// 
// Page Variants
// 

const pageVariants = {
  hidden: { opacity: 0, y: 12 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// 
// Page Component
// 

export default function ExpensesPage() {
  const { filters, pagination, setFilters, setPage } = useExpenseStore()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  //  Queries 

  const {
    data: listData,
    isLoading: isListLoading,
    refetch: refetchList,
  } = useExpensesList({
    status: filters.status === 'all' ? undefined : filters.status,
    category: filters.category || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: filters.search || undefined,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sortField,
    sortOrder,
  })

  const { data: statsData, isLoading: isStatsLoading } = useExpenseStats({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  })

  //  Sync server data to store 

  useEffect(() => {
    if (listData) {
      useExpenseStore.getState().setExpenses(listData.data ?? [])
      if (listData.pagination) {
        useExpenseStore.getState().setPage(listData.pagination.page)
      }
    }
  }, [listData])

  //  Handlers 

  const handleView = useCallback((expense: Expense) => {
    // Uses next/link - navigation handled by Link in the list
  }, [])

  const handleEdit = useCallback((expense: Expense) => {
    // Navigation to edit page
    window.location.href = '/expenses/' + expense.id + '/edit'
  }, [])

  const handleDelete = useCallback(async (expense: Expense) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await useExpenseStore.getState().deleteExpense(expense.id)
        refetchList()
      } catch {
        // Error handled by store
      }
    }
  }, [refetchList])

  const expenses = listData?.data ?? []

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/*  Header  */}
      <PageHeader
        title="Expenses"
        description="Manage and track all expense claims"
      >
        <Link href="/expenses/new">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </PageHeader>

      {/*  Stats  */}
      <ExpenseStats data={statsData ?? null} isLoading={isStatsLoading} />

      {/*  List  */}
      <ExpenseList
        expenses={expenses}
        pagination={{
          page: listData?.pagination?.page ?? pagination.page,
          limit: listData?.pagination?.limit ?? pagination.limit,
          total: listData?.pagination?.total ?? pagination.total,
          totalPages: listData?.pagination?.totalPages ?? 1,
        }}
        filters={filters}
        viewMode={viewMode}
        sortField={sortField}
        sortOrder={sortOrder}
        selectedIds={selectedIds}
        isLoading={isListLoading}
        onFiltersChange={setFilters}
        onPageChange={setPage}
        onViewModeChange={setViewMode}
        onSortChange={(field, order) => {
          setSortField(field)
          setSortOrder(order)
        }}
        onSelectId={(id) => {
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
          })
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </motion.div>
  )
}
