'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Edit3, Trash2, ArrowLeft } from 'lucide-react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseDetail } from '@/features/expenses/components/ExpenseDetail'
import { useExpense, useUpdateExpense, useDeleteExpense } from '@/features/expenses/hooks/useExpenses'
import { useAuth } from '@/hooks/useAuth'
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
// Props
// 

export interface ExpenseDetailPageProps {
  expenseId: string
}

// 
// Loading State
// 

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

// 
// Page Component
// 

export default function ExpenseDetailPage({ expenseId }: ExpenseDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const { data: expense, isLoading, error } = useExpense(expenseId)
  const [actionLoading, setActionLoading] = useState(false)

  //  Approval actions 

  const handleApprove = useCallback(
    async (exp: Expense, comment?: string) => {
      setActionLoading(true)
      try {
        const currentChain = exp.approvalChain ?? []
        const nextLevel = currentChain.length

        await updateExpense.mutateAsync({
          id: exp.id,
          data: {
            status: nextLevel === 0
              ? 'manager_approved'
              : nextLevel === 1
                ? 'finance_approved'
                : 'approved',
            approvalChain: [
              ...currentChain,
              {
                level: nextLevel,
                role: user?.role ?? 'employee',
                userId: user?.id,
                action: 'approved' as const,
                comment,
                timestamp: new Date(),
              },
            ],
            currentApprovalLevel: nextLevel + 1,
          },
        })
      } finally {
        setActionLoading(false)
      }
    },
    [updateExpense, user],
  )

  const handleReject = useCallback(
    async (exp: Expense, comment?: string) => {
      setActionLoading(true)
      try {
        const currentChain = exp.approvalChain ?? []
        await updateExpense.mutateAsync({
          id: exp.id,
          data: {
            status: 'rejected',
            approvalChain: [
              ...currentChain,
              {
                level: currentChain.length,
                role: user?.role ?? 'employee',
                userId: user?.id,
                action: 'rejected' as const,
                comment,
                timestamp: new Date(),
              },
            ],
          },
        })
      } finally {
        setActionLoading(false)
      }
    },
    [updateExpense, user],
  )

  const handleRequestChanges = useCallback(
    async (exp: Expense, comment?: string) => {
      setActionLoading(true)
      try {
        const currentChain = exp.approvalChain ?? []
        await updateExpense.mutateAsync({
          id: exp.id,
          data: {
            status: 'changes_requested',
            approvalChain: [
              ...currentChain,
              {
                level: currentChain.length,
                role: user?.role ?? 'employee',
                userId: user?.id,
                action: 'changes_requested' as const,
                comment,
                timestamp: new Date(),
              },
            ],
          },
        })
      } finally {
        setActionLoading(false)
      }
    },
    [updateExpense, user],
  )

  //  Edit / Delete 

  const handleEdit = useCallback(
    (exp: Expense) => {
      router.push('/expenses/' + exp.id + '/edit')
    },
    [router],
  )

  const handleDelete = useCallback(
    async (exp: Expense) => {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        setActionLoading(true)
        try {
          await deleteExpense.mutateAsync(exp.id)
          router.push('/expenses')
        } finally {
          setActionLoading(false)
        }
      }
    },
    [deleteExpense, router],
  )

  //  Render 

  if (isLoading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <PageHeader title="Loading..." backHref="/expenses" />
        <DetailSkeleton />
      </motion.div>
    )
  }

  if (error || !expense) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <PageHeader title="Expense Not Found" backHref="/expenses" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Expense not found'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/expenses')}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Expenses
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/*  Header  */}
      <PageHeader
        title="Expense Details"
        description={expense.title}
        backHref="/expenses"
      >
        {expense.status === 'draft' && (
          <>
            <Button
              variant="outline"
              onClick={() => handleEdit(expense)}
              disabled={actionLoading}
            >
              <Edit3 className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(expense)}
              disabled={actionLoading}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      </PageHeader>

      {/*  Detail Component  */}
      <div className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/80 sm:p-8">
        <ExpenseDetail
          expense={expense}
          userRole={user?.role}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </motion.div>
  )
}
