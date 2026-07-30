﻿'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Inbox,
  FileCheck,
  Ban,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/toast'
import {
  usePendingApprovals,
  useApprovalHistory,
  useApproveExpense,
  useRejectExpense,
  useRequestChanges,
  useApprovalStats,
} from '@/features/approvals/hooks/useApprovals'
import { useApprovalStore } from '@/features/approvals/stores/approval-store'
import { ApprovalCard } from '@/features/approvals/components/ApprovalCard'
import { ApprovalStats } from '@/features/approvals/components/ApprovalStats'
import type { Expense } from '@/types'

// 
// Constants
// 

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
] as const

// 
// Loading skeleton
// 

function ApprovalCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

// 
// Page transition
// 

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.06,
      duration: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

// 
// Component
// 

export function ApprovalsPage() {
  const { toast } = useToast()
  const { filters, setFilters, activeTab, setActiveTab } = useApprovalStore()
  const [searchInput, setSearchInput] = useState(filters.search)

  //  Queries 
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = usePendingApprovals()

  const {
    data: approvedData,
    isLoading: isApprovedLoading,
  } = useApprovalHistory('approved')

  const {
    data: rejectedData,
    isLoading: isRejectedLoading,
  } = useApprovalHistory('rejected')

  const { data: statsData, isLoading: isStatsLoading } = useApprovalStats()

  //  Mutations 
  const approveMutation = useApproveExpense()
  const rejectMutation = useRejectExpense()
  const requestChangesMutation = useRequestChanges()

  const isProcessing =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    requestChangesMutation.isPending

  //  Handlers 
  const handleApprove = useCallback(
    (id: string) => {
      approveMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({
              title: 'Expense approved',
              description: 'The expense has been successfully approved.',
              variant: 'success',
            })
          },
          onError: (err) => {
            toast({
              title: 'Failed to approve',
              description: err instanceof Error ? err.message : 'Something went wrong',
              variant: 'destructive',
            })
          },
        },
      )
    },
    [approveMutation, toast],
  )

  const handleReject = useCallback(
    (id: string, comment: string) => {
      rejectMutation.mutate(
        { id, comment },
        {
          onSuccess: () => {
            toast({
              title: 'Expense rejected',
              description: 'The expense has been rejected.',
              variant: 'success',
            })
          },
          onError: (err) => {
            toast({
              title: 'Failed to reject',
              description: err instanceof Error ? err.message : 'Something went wrong',
              variant: 'destructive',
            })
          },
        },
      )
    },
    [rejectMutation, toast],
  )

  const handleRequestChanges = useCallback(
    (id: string, comment: string) => {
      requestChangesMutation.mutate(
        { id, comment },
        {
          onSuccess: () => {
            toast({
              title: 'Changes requested',
              description: 'The submitter has been notified.',
              variant: 'success',
            })
          },
          onError: (err) => {
            toast({
              title: 'Failed to request changes',
              description: err instanceof Error ? err.message : 'Something went wrong',
              variant: 'destructive',
            })
          },
        },
      )
    },
    [requestChangesMutation, toast],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value)
      const debounceTimer = setTimeout(() => {
        setFilters({ search: value })
      }, 300)
      return () => clearTimeout(debounceTimer)
    },
    [setFilters],
  )

  //  Filtered data 
  const currentExpenses = useMemo(() => {
    const source =
      activeTab === 'pending'
        ? pendingData?.data ?? []
        : activeTab === 'approved'
          ? approvedData?.data ?? []
          : rejectedData?.data ?? []

    return source.filter((expense) => {
      // Category filter
      if (filters.category && expense.category !== filters.category) return false
      // Date range filter (client-side approximation)
      if (filters.dateRange !== 'all') {
        const now = Date.now()
        const expenseDate = new Date(expense.date).getTime()
        const ranges: Record<string, number> = {
          today: 86_400_000,
          week: 604_800_000,
          month: 2_592_000_000,
          quarter: 7_776_000_000,
        }
        const range = ranges[filters.dateRange]
        if (range && now - expenseDate > range) return false
      }
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesTitle = expense.title.toLowerCase().includes(q)
        const matchesVendor = expense.vendor?.toLowerCase().includes(q)
        const matchesDescription = expense.description?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesVendor && !matchesDescription) return false
      }
      return true
    })
  }, [activeTab, pendingData, approvedData, rejectedData, filters])

  //  Tab counts 
  const pendingCount = pendingData?.data?.length ?? 0
  const approvedCount = approvedData?.data?.length ?? 0
  const rejectedCount = rejectedData?.data?.length ?? 0

  //  Render 
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8"
    >
      {/*  Page header  */}
      <motion.div variants={itemVariants}>
        <PageHeader title="Approvals" description="Review and manage expense approval requests">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPending()}
            disabled={isPendingLoading}
          >
            <RefreshCw
              className={cn('h-4 w-4', isPendingLoading && 'animate-spin')}
            />
            Refresh
          </Button>
        </PageHeader>
      </motion.div>

      {/*  Stats cards  */}
      <motion.div variants={itemVariants}>
        <ApprovalStats data={statsData} isLoading={isStatsLoading} />
      </motion.div>

      {/*  Filters bar  */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by title, vendor, or description…"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Date range */}
          <Select
            value={filters.dateRange}
            onValueChange={(value: string) =>
              setFilters({ dateRange: value as typeof filters.dateRange })
            }
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Slider toggle */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => {}}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/*  Tabs  */}
      <motion.div variants={itemVariants}>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'pending' | 'approved' | 'rejected')}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="pending" className="relative">
                <Inbox className="mr-1.5 h-4 w-4" />
                Pending
                {pendingCount > 0 && (
                  <Badge
                    variant="warning"
                    className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">
                <FileCheck className="mr-1.5 h-4 w-4" />
                Approved
                {approvedCount > 0 && (
                  <Badge
                    variant="success"
                    className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                  >
                    {approvedCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <Ban className="mr-1.5 h-4 w-4" />
                Rejected
                {rejectedCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                  >
                    {rejectedCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator />

          {/*  Tab content  */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value={activeTab} className="mt-0">
                {(isPendingLoading && activeTab === 'pending') ||
                (isApprovedLoading && activeTab === 'approved') ||
                (isRejectedLoading && activeTab === 'rejected') ? (
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <ApprovalCardSkeleton key={i} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : currentExpenses.length > 0 ? (
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {currentExpenses.map((expense) => (
                          <ApprovalCard
                            key={expense.id}
                            expense={expense}
                            // In a real app, resolve the employee from a user map
                            // employee={userMap[expense.userId]}
                            onApprove={activeTab === 'pending' ? handleApprove : undefined}
                            onReject={activeTab === 'pending' ? handleReject : undefined}
                            onRequestChanges={
                              activeTab === 'pending' ? handleRequestChanges : undefined
                            }
                            onView={(exp) => {
                              // Navigate to detail – in a real app use router.push
                              window.location.href = `/approvals/${exp.id}`
                            }}
                            isProcessing={isProcessing}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                      {activeTab === 'pending' ? (
                        <Inbox className="h-8 w-8 text-gray-400" />
                      ) : activeTab === 'approved' ? (
                        <FileCheck className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Ban className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {activeTab === 'pending'
                        ? 'No pending approvals'
                        : activeTab === 'approved'
                          ? 'No approved expenses'
                          : 'No rejected expenses'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {activeTab === 'pending'
                        ? 'All caught up! New requests will appear here.'
                        : activeTab === 'approved'
                          ? 'Expenses you have approved will appear here.'
                          : 'Expenses you have rejected will appear here.'}
                    </p>
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
