﻿﻿'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Clock,
  Send,
  AlertTriangle,
  User as UserIcon,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/format'
import {
  getStatusLabel,
  getStatusColor,
  getStatusTextColor,
  getRoleLabel,
} from '@/utils/helpers'
import { EXPENSE_CATEGORIES_MAP, EXPENSE_STATUS_MAP } from '@/constants'
import {
  useApprovalDetail,
  useApproveExpense,
  useRejectExpense,
  useRequestChanges,
} from '@/features/approvals/hooks/useApprovals'
import { ApprovalTimeline } from '@/features/approvals/components/ApprovalTimeline'
import { useAuth } from '@/hooks/useAuth'
import type { Expense } from '@/types'

// 
// Props
// 

export interface ApprovalDetailPageProps {
  /** The expense/approval ID from the URL params. */
  approvalId: string
  /** Optional callback for navigating back. */
  onBack?: () => void
  /** Optional user map for resolving approval chain avatars. */
  userMap?: Record<string, { displayName: string; photoURL?: string }>
}

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.08,
      duration: 0.3,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

// 
// Loading skeleton
// 

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// 
// Info row component
// 

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  )
}

// 
// Main component
// 

export function ApprovalDetailPage({
  approvalId,
  onBack,
  userMap = {},
}: ApprovalDetailPageProps) {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  //  Comment state for reject / changes 
  const [comment, setComment] = useState('')
  const [actionMode, setActionMode] = useState<'approve' | 'reject' | 'changes' | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  //  Queries 
  const {
    data: expense,
    isLoading,
    error,
    refetch,
  } = useApprovalDetail(approvalId)

  //  Mutations 
  const approveMutation = useApproveExpense()
  const rejectMutation = useRejectExpense()
  const requestChangesMutation = useRequestChanges()

  const isProcessing =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    requestChangesMutation.isPending

  //  Current user's role in the approval chain 
  const currentChainEntry = useMemo(() => {
    if (!expense || !currentUser) return null
    return expense.approvalChain.find(
      (entry) =>
        entry.role === currentUser.role &&
        entry.action === 'pending' &&
        entry.level === expense.currentApprovalLevel,
    ) ?? null
  }, [expense, currentUser])

  const canAct =
    !!currentChainEntry &&
    (expense?.status === 'pending' ||
      expense?.status === 'manager_approved' ||
      expense?.status === 'finance_approved')

  //  Handlers 
  const handleApprove = useCallback(() => {
    if (!expense) return
    approveMutation.mutate(
      { id: expense.id, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast({
            title: 'Approved!',
            description: 'The expense has been successfully approved.',
            variant: 'success',
          })
          setComment('')
          setActionMode(null)
          refetch()
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
  }, [expense, approveMutation, comment, toast, refetch])

  const handleReject = useCallback(() => {
    if (!expense || !comment.trim()) return
    rejectMutation.mutate(
      { id: expense.id, comment: comment.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Rejected',
            description: 'The expense has been rejected.',
            variant: 'success',
          })
          setComment('')
          setActionMode(null)
          setConfirmDialogOpen(false)
          refetch()
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
  }, [expense, rejectMutation, comment, toast, refetch])

  const handleRequestChanges = useCallback(() => {
    if (!expense || !comment.trim()) return
    requestChangesMutation.mutate(
      { id: expense.id, comment: comment.trim() },
      {
        onSuccess: () => {
          toast({
            title: 'Changes requested',
            description: 'The submitter has been notified.',
            variant: 'success',
          })
          setComment('')
          setActionMode(null)
          setConfirmDialogOpen(false)
          refetch()
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
  }, [expense, requestChangesMutation, comment, toast, refetch])

  const handleConfirmAction = useCallback(() => {
    if (actionMode === 'reject') {
      handleReject()
    } else if (actionMode === 'changes') {
      handleRequestChanges()
    }
  }, [actionMode, handleReject, handleRequestChanges])

  //  Derived data 
  const category = expense ? EXPENSE_CATEGORIES_MAP[expense.category] : undefined
  const statusConfig = expense ? EXPENSE_STATUS_MAP[expense.status] : undefined

  //  Error state 
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <PageHeader title="Approval Detail" onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Failed to load approval
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  //  Loading state 
  if (isLoading || !expense) {
    return <DetailSkeleton />
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl px-4 pb-12 pt-4 sm:px-6 lg:px-8"
    >
      {/*  Header  */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          title={expense.title}
          description={`Submitted ${formatRelativeTime(expense.createdAt)}`}
          onBack={onBack}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={expense.receiptUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Receipt
            </a>
          </Button>
        </PageHeader>
      </motion.div>

      {/*  Main grid  */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/*  Left column: details + timeline  */}
        <div className="space-y-6 lg:col-span-2">
          {/*  Expense details card  */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>{category?.icon ?? '📋'}</span>
                      <span>{category?.label ?? expense.category}</span>
                    </CardTitle>
                    <CardDescription>
                      {expense.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 border-0',
                      getStatusColor(expense.status),
                      getStatusTextColor(expense.status),
                    )}
                  >
                    {getStatusLabel(expense.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow
                    icon={DollarSign}
                    label="Amount"
                    value={
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={formatDate(expense.date)}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Submitted"
                    value={formatRelativeTime(expense.createdAt)}
                  />
                  {expense.vendor && (
                    <InfoRow icon={Building2} label="Vendor" value={expense.vendor} />
                  )}
                  {expense.subCategory && (
                    <InfoRow
                      icon={Tag}
                      label="Sub-Category"
                      value={expense.subCategory}
                    />
                  )}
                  {expense.project && (
                    <InfoRow icon={Tag} label="Project" value={expense.project} />
                  )}
                </div>

                {/*  Tags  */}
                {expense.tags.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-1.5">
                      {expense.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                {/*  Policy violations  */}
                {expense.policyViolations.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        Policy Violations
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {expense.policyViolations.map((v, i) => (
                          <li
                            key={i}
                            className="text-sm text-red-600 dark:text-red-300"
                          >
                            &bull; {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/*  Receipt card  */}
          {expense.receiptUrl && (
            <motion.div variants={sectionVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {expense.receiptUrl.match(/\.pdf$/i) ? (
                      <FileText className="h-5 w-5 text-red-400" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-blue-400" />
                    )}
                    Receipt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    {expense.receiptUrl.match(/\.(png|jpe?g|webp|heic|heif)$/i) ? (
                      <img
                        src={expense.receiptUrl}
                        alt="Receipt"
                        className="h-auto max-h-96 w-full object-contain bg-gray-50 dark:bg-gray-900"
                      />
                    ) : (
                      <div className="flex items-center justify-center bg-gray-50 px-6 py-12 dark:bg-gray-900">
                        <div className="text-center">
                          <FileText className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            PDF Receipt
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              Open PDF
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/*  OCR data card  */}
          {expense.ocrData && (
            <motion.div variants={sectionVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    OCR Extracted Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    {expense.ocrData.storeName && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Store</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {expense.ocrData.storeName}
                        </p>
                      </div>
                    )}
                    {expense.ocrData.invoiceNumber && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Invoice #</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {expense.ocrData.invoiceNumber}
                        </p>
                      </div>
                    )}
                    {expense.ocrData.gst && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">GST</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {expense.ocrData.gst}
                        </p>
                      </div>
                    )}
                    {expense.ocrData.date && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {expense.ocrData.date}
                        </p>
                      </div>
                    )}
                    {expense.ocrData.tax != null && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tax</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(expense.ocrData.tax, expense.currency)}
                        </p>
                      </div>
                    )}
                    {expense.ocrData.confidence != null && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {(expense.ocrData.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/*  Approval timeline  */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-gray-400" />
                  Approval Timeline
                </CardTitle>
                <CardDescription>
                  Step {expense.currentApprovalLevel + 1} of {expense.approvalChain.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalTimeline chain={expense.approvalChain} userMap={userMap} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/*  Right column: actions  */}
        <div className="space-y-6">
          {canAct && (
            <motion.div variants={sectionVariants}>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    Your Action Required
                  </CardTitle>
                  <CardDescription>
                    You are the next approver as{' '}
                    <span className="font-medium">
                      {getRoleLabel(currentChainEntry!.role)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/*  Comment input  */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Comment{actionMode === 'reject' || actionMode === 'changes' ? ' (required)' : ' (optional)'}
                    </label>
                    <div className="relative">
                      <Input
                        placeholder={
                          actionMode === 'reject'
                            ? 'Why are you rejecting?'
                            : actionMode === 'changes'
                              ? 'What changes are needed?'
                              : 'Add a comment…'
                        }
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/*  Request Changes  */}
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    disabled={isProcessing}
                    onClick={() => {
                      if (!comment.trim()) {
                        toast({
                          title: 'Comment required',
                          description: 'Please describe the changes needed.',
                          variant: 'destructive',
                        })
                        return
                      }
                      setActionMode('changes')
                      setConfirmDialogOpen(true)
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request Changes
                  </Button>

                  {/*  Reject  */}
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                    disabled={isProcessing}
                    onClick={() => {
                      if (!comment.trim()) {
                        toast({
                          title: 'Comment required',
                          description: 'Please provide a reason for rejection.',
                          variant: 'destructive',
                        })
                        return
                      }
                      setActionMode('reject')
                      setConfirmDialogOpen(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>

                  {/*  Approve  */}
                  <Button
                    className="w-full bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    disabled={isProcessing}
                    onClick={() => {
                      setActionMode('approve')
                      handleApprove()
                    }}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>

                  {/*  AI suggestion hint  */}
                  {expense.aiConfidence != null && (
                    <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                      <p className="font-medium">AI Insights</p>
                      <p className="mt-0.5">
                        AI confidence: {(expense.aiConfidence * 100).toFixed(0)}%
                        {expense.aiCategory &&
                          ` | Suggested category: ${expense.aiCategory}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/*  Summary info card  */}
          <motion.div variants={sectionVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'border-0',
                      getStatusColor(expense.status),
                      getStatusTextColor(expense.status),
                    )}
                  >
                    {getStatusLabel(expense.status)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <span>
                    {category?.icon} {category?.label ?? expense.category}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Chain Level</span>
                  <span>
                    {expense.currentApprovalLevel + 1}/{expense.approvalChain.length}
                  </span>
                </div>
                {expense.vendor && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Vendor</span>
                      <span className="text-right">{expense.vendor}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/*  Confirm action dialog  */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionMode === 'reject' ? 'Reject Expense' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {actionMode === 'reject'
                ? 'This action will reject the expense. The submitter will be notified.'
                : 'The submitter will be asked to make the requested changes.'}
            </DialogDescription>
          </DialogHeader>

          {comment && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Your comment:
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{comment}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setActionMode(null)
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionMode === 'reject' ? 'destructive' : 'default'}
              disabled={isProcessing}
              onClick={handleConfirmAction}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : actionMode === 'reject' ? (
                <XCircle className="mr-2 h-4 w-4" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {actionMode === 'reject' ? 'Confirm Reject' : 'Confirm Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
