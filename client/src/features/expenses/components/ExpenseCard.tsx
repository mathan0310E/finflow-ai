'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/utils/format'
import { getStatusColor, getStatusTextColor, getStatusLabel } from '@/utils/helpers'
import { EXPENSE_CATEGORIES_MAP } from '@/constants'
import type { Expense } from '@/types'

// 
// Types
// 

export interface ExpenseCardProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  onView?: (expense: Expense) => void
  selected?: boolean
  onSelect?: (expense: Expense) => void
  className?: string
}

// 
// Component
// 

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onView,
  selected = false,
  onSelect,
  className,
}: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false)

  const category = EXPENSE_CATEGORIES_MAP[expense.category]
  const statusLabel = getStatusLabel(expense.status)
  const statusBg = getStatusColor(expense.status)
  const statusText = getStatusTextColor(expense.status)
  const hasReceipt = Boolean(expense.receiptUrl)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-200',
        selected
          ? 'border-blue-300 bg-blue-50/50 shadow-sm dark:border-blue-600 dark:bg-blue-950/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
        className,
      )}
    >
      {/*  Click area  */}
      <button
        type="button"
        onClick={() => {
          setExpanded(!expanded)
          onSelect?.(expense)
        }}
        className="w-full text-left focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-4 p-4">
          {/*  Category icon  */}
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg',
              selected
                ? 'bg-blue-100 dark:bg-blue-900/40'
                : 'bg-gray-100 dark:bg-gray-700',
            )}
          >
            {category?.icon ?? '??'}
          </div>

          {/*  Info  */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {expense.title}
              </h3>
              {expense.aiCategory && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        AI
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI-categorized as &quot;{expense.aiCategory}&quot;</p>
                      {expense.aiConfidence != null && (
                        <p className="text-xs text-gray-500">
                          Confidence: {(expense.aiConfidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(expense.date)}</span>
              {expense.vendor && (
                <>
                  <span>&middot;</span>
                  <span className="truncate">{expense.vendor}</span>
                </>
              )}
              {expense.departmentId && (
                <>
                  <span>&middot;</span>
                  <span className="truncate">{expense.departmentId}</span>
                </>
              )}
            </div>
          </div>

          {/*  Amount + status  */}
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(expense.amount, expense.currency)}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                statusBg,
                statusText,
              )}
            >
              {statusLabel}
            </span>
          </div>

          {/*  Receipt indicator  */}
          {hasReceipt && (
            <div className="hidden shrink-0 sm:block">
              {expense.receiptUrl?.match(/\.pdf$/i) ? (
                <FileText className="h-4 w-4 text-red-400" />
              ) : (
                <ImageIcon className="h-4 w-4 text-blue-400" />
              )}
            </div>
          )}

          {/*  Expand toggle  */}
          <div className="shrink-0 text-gray-400">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </button>

      {/*  Expanded details  */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' as const }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
              {/* Mobile amount */}
              <div className="sm:hidden">
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
              </div>

              {/* Mobile status */}
              <div className="sm:hidden">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    statusBg,
                    statusText,
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              {expense.description && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {expense.description}
                  </p>
                </div>
              )}

              {expense.subCategory && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sub-Category</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {expense.subCategory}
                  </p>
                </div>
              )}

              {expense.project && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {expense.project}
                  </p>
                </div>
              )}

              {expense.tags && expense.tags.length > 0 && (
                <div className="col-span-2">
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

              {expense.policyViolations && expense.policyViolations.length > 0 && (
                <div className="col-span-2 rounded-lg bg-red-50 p-2 dark:bg-red-950/30">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    Policy Violations
                  </p>
                  {expense.policyViolations.map((v, i) => (
                    <p key={i} className="text-xs text-red-500 dark:text-red-300">
                      &bull; {v}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/*  Quick actions  */}
            <div className="flex items-center gap-1 border-t border-gray-100 bg-gray-50/50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
              {onView && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(expense)
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View details</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onEdit && expense.status === 'draft' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(expense)
                        }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit expense</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onDelete && expense.status === 'draft' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(expense)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete expense</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                ID: {expense.id.slice(0, 8)}...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
