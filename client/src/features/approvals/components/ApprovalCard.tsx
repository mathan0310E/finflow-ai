﻿'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/format'
import { EXPENSE_CATEGORIES_MAP } from '@/constants'
import { getStatusLabel, getStatusColor, getStatusTextColor } from '@/utils/helpers'
import type { Expense, User } from '@/types'

// 
// Types
// 

export interface ApprovalCardProps {
  expense: Expense
  employee?: Pick<User, 'displayName' | 'photoURL'> | null
  onApprove?: (id: string) => void
  onReject?: (id: string, comment: string) => void
  onRequestChanges?: (id: string, comment: string) => void
  onView?: (expense: Expense) => void
  isProcessing?: boolean
  className?: string
}

// 
// Component
// 

export function ApprovalCard({
  expense,
  employee,
  onApprove,
  onReject,
  onRequestChanges,
  onView,
  isProcessing = false,
  className,
}: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [changesDialogOpen, setChangesDialogOpen] = useState(false)
  const [comment, setComment] = useState('')

  const category = EXPENSE_CATEGORIES_MAP[expense.category]
  const statusLabel = getStatusLabel(expense.status)
  const statusBg = getStatusColor(expense.status)
  const statusText = getStatusTextColor(expense.status)
  const hasReceipt = Boolean(expense.receiptUrl)
  const isPending = expense.status === 'pending' || expense.status === 'manager_approved' || expense.status === 'finance_approved'

  const employeeInitials = employee?.displayName
    ? employee.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  //  Reject / Request Changes handlers 

  const handleReject = () => {
    if (comment.trim()) {
      onReject?.(expense.id, comment.trim())
      setComment('')
      setRejectDialogOpen(false)
    }
  }

  const handleRequestChanges = () => {
    if (comment.trim()) {
      onRequestChanges?.(expense.id, comment.trim())
      setComment('')
      setChangesDialogOpen(false)
    }
  }

  //  Policy violations warning 

  const hasViolations = expense.policyViolations.length > 0

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' as const }}
        className={cn(
          // Glassmorphism card
          'relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl',
          'shadow-lg shadow-gray-200/50 transition-all duration-300',
          'dark:border-gray-700/50 dark:bg-gray-900/70 dark:shadow-black/20',
          'hover:shadow-xl hover:border-gray-300/50 dark:hover:border-gray-600/50',
          hasViolations && 'border-amber-200 dark:border-amber-800/50',
          className,
        )}
      >
        {/*  Glassmorphism gradient overlay  */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/5" />

        {/*  Policy violation banner  */}
        {hasViolations && (
          <div className="relative flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              {expense.policyViolations.length} policy violation{expense.policyViolations.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/*  Main content  */}
        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/*  Employee avatar  */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white dark:ring-gray-800">
                    {employee?.photoURL ? (
                      <AvatarImage src={employee.photoURL} alt={employee.displayName} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                        {employeeInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{employee?.displayName ?? 'Unknown user'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/*  Expense info  */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                    {expense.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {employee?.displayName ?? 'Unknown'}
                  </p>
                </div>

                {/*  Status badge  */}
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusBg,
                    statusText,
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              {/*  Meta row  */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                {/* Amount */}
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>

                {/* Category */}
                <span className="flex items-center gap-1">
                  <span className="text-base leading-none">{category?.icon ?? '📋'}</span>
                  <span>{category?.label ?? expense.category}</span>
                </span>

                {/* Date */}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(expense.createdAt)}</span>
                </span>

                {/* Submitted */}
                <span className="hidden sm:inline">{formatDate(expense.date)}</span>
              </div>

              {/*  Receipt thumbnail  */}
              {hasReceipt && (
                <div className="mt-3">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    {expense.receiptUrl?.match(/\.pdf$/i) ? (
                      <FileText className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                    )}
                    <span>Receipt attached</span>
                  </div>
                </div>
              )}

              {/*  Description (if any)  */}
              {expense.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {expense.description}
                </p>
              )}
            </div>

            {/*  Expand toggle  */}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/*  Expanded details  */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' as const }}
              className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
            >
              <div className="relative grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
                {expense.subCategory && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sub-Category</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {expense.subCategory}
                    </p>
                  </div>
                )}

                {expense.vendor && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vendor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {expense.vendor}
                    </p>
                  </div>
                )}

                {expense.project && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Project</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {expense.project}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approval Level</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {expense.currentApprovalLevel + 1} of {expense.approvalChain.length}
                  </p>
                </div>

                {expense.tags.length > 0 && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tags</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {expense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasViolations && (
                  <div className="col-span-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30 sm:col-span-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      Policy Violations
                    </p>
                    {expense.policyViolations.map((v, i) => (
                      <p key={i} className="mt-0.5 text-xs text-amber-600 dark:text-amber-300">
                        &bull; {v}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/*  Approval chain preview  */}
              <div className="space-y-1.5 px-4 py-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Approval Chain
                </p>
                {expense.approvalChain.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        entry.action === 'approved'
                          ? 'bg-green-500'
                          : entry.action === 'rejected'
                            ? 'bg-red-500'
                            : entry.action === 'changes_requested'
                              ? 'bg-orange-500'
                              : 'bg-gray-300 dark:bg-gray-600',
                      )}
                    />
                    <span className="capitalize">{entry.role.replaceAll('_', ' ')}</span>
                    <span className="text-gray-400">
                      &mdash; {entry.action.replaceAll('_', ' ')}
                    </span>
                    {entry.timestamp && (
                      <span className="text-gray-400">{formatDate(entry.timestamp)}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*  Action buttons  */}
        {isPending && (onApprove || onReject || onRequestChanges) && (
          <div className="relative border-t border-gray-100 bg-gray-50/50 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-800/30">
            <div className="flex items-center gap-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(expense)}
                >
                  Details
                </Button>
              )}

              <div className="ml-auto flex items-center gap-2">
                {/* Request Changes */}
                {onRequestChanges && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => setChangesDialogOpen(true)}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Changes</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Request changes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Reject */}
                {onReject && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => setRejectDialogOpen(true)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject expense</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Approve */}
                {onApprove && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => onApprove(expense.id)}
                          className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve expense</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/*  Reject dialog  */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &ldquo;{expense.title}&rdquo;. This will be
              visible to the submitter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              placeholder="Enter rejection reason…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setComment('')
                setRejectDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!comment.trim() || isProcessing}
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*  Request Changes dialog  */}
      <Dialog open={changesDialogOpen} onOpenChange={setChangesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Describe what changes are needed for &ldquo;{expense.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              placeholder="Describe the changes required…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setComment('')
                setChangesDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={!comment.trim() || isProcessing}
              onClick={handleRequestChanges}
            >
              <RefreshCw className="h-4 w-4" />
              Request Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
