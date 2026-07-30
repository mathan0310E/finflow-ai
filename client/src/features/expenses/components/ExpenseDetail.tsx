'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Edit3,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldAlert,
  Clock,
  User,
  Building2,
  Tag,
  Calendar,
  DollarSign,
  FileImage,
  ExternalLink,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils/format'
import { getStatusColor, getStatusTextColor, getStatusLabel, getRoleLabel } from '@/utils/helpers'
import { EXPENSE_CATEGORIES_MAP, EXPENSE_STATUS_MAP } from '@/constants'
import type { Expense, ApprovalAction, UserRole } from '@/types'

// 
// Types
// 

export interface ExpenseDetailProps {
  expense: Expense
  userRole?: UserRole
  onApprove?: (expense: Expense, comment?: string) => void
  onReject?: (expense: Expense, comment?: string) => void
  onRequestChanges?: (expense: Expense, comment?: string) => void
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  onClose?: () => void
  className?: string
}

// 
// Receipt Preview
// 

function ReceiptPreview({ url, alt }: { url?: string | null; alt: string }) {
  const [zoomed, setZoomed] = useState(false)

  if (!url) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <FileImage className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">No receipt</p>
        </div>
      </div>
    )
  }

  const isPdf = url.match(/\.pdf$/i)

  return (
    <>
      <div
        className="relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
        onClick={() => setZoomed(true)}
      >
        {isPdf ? (
          <div className="flex h-48 items-center justify-center bg-red-50 dark:bg-red-950/30">
            <div className="text-center">
              <FileText className="mx-auto h-10 w-10 text-red-400" />
              <p className="mt-1 text-sm text-red-500">PDF Receipt</p>
              <p className="text-xs text-red-400">Click to view</p>
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt={alt}
            className="h-48 w-full object-cover transition-transform duration-200 hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/10">
          <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-white p-2 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomed(false)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
              {isPdf ? (
                <iframe src={url} className="h-[80vh] w-[60vw] rounded-lg" title="Receipt PDF" />
              ) : (
                <img src={url} alt={alt} className="max-h-[85vh] w-auto rounded-lg" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// 
// Approval Timeline
// 

function ApprovalTimeline({ approvalChain }: { approvalChain: Expense['approvalChain'] }) {
  if (!approvalChain || approvalChain.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-gray-400 dark:text-gray-500">
        No approval chain configured
      </div>
    )
  }

  return (
    <div className="relative">
      {approvalChain.map((entry, index) => {
        const isLast = index === approvalChain.length - 1
        const isActive = entry.action === 'pending'
        const isApproved = entry.action === 'approved'
        const isRejected = entry.action === 'rejected'
        const isChangesRequested = entry.action === 'changes_requested'

        let dotColor = 'bg-gray-300 dark:bg-gray-600'
        let lineColor = 'bg-gray-200 dark:bg-gray-700'
        let statusIcon = <Clock className="h-3.5 w-3.5 text-gray-400" />

        if (isApproved) {
          dotColor = 'bg-green-500'
          lineColor = 'bg-green-300 dark:bg-green-700'
          statusIcon = <Check className="h-3.5 w-3.5 text-green-500" />
        } else if (isRejected) {
          dotColor = 'bg-red-500'
          statusIcon = <X className="h-3.5 w-3.5 text-red-500" />
        } else if (isChangesRequested) {
          dotColor = 'bg-orange-500'
          statusIcon = <RefreshCw className="h-3.5 w-3.5 text-orange-500" />
        } else if (isActive) {
          dotColor = 'bg-blue-500'
          statusIcon = <Clock className="h-3.5 w-3.5 text-blue-500" />
        }

        return (
          <div key={index} className="relative flex gap-4 pb-6">
            {/*  Vertical line  */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[11px] top-6 h-full w-0.5',
                  isApproved ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700',
                )}
              />
            )}

            {/*  Dot  */}
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              <div className={cn('h-3 w-3 rounded-full', dotColor)} />
            </div>

            {/*  Content  */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {getRoleLabel(entry.role)}
                </span>
                {entry.action !== 'pending' && (
                  <Badge
                    variant={
                      isApproved
                        ? 'success'
                        : isRejected
                          ? 'destructive'
                          : isChangesRequested
                            ? 'warning'
                            : 'secondary'
                    }
                    className="text-[10px] px-1.5 py-0"
                  >
                    {entry.action.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              {entry.comment && (
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                  &quot;{entry.comment}&quot;
                </p>
              )}
              {entry.timestamp && (
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 
// OCR Data Display
// 

function OcrDataDisplay({ ocrData }: { ocrData: Expense['ocrData'] }) {
  if (!ocrData) return null

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          OCR Data
        </h4>
        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">
          {(ocrData.confidence * 100).toFixed(0)}% confidence
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {ocrData.storeName && (
          <>
            <span className="text-gray-500 dark:text-gray-400">Store</span>
            <span className="text-gray-900 dark:text-gray-100">{ocrData.storeName}</span>
          </>
        )}
        {ocrData.amount != null && (
          <>
            <span className="text-gray-500 dark:text-gray-400">Amount</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatCurrency(ocrData.amount)}
            </span>
          </>
        )}
        {ocrData.date && (
          <>
            <span className="text-gray-500 dark:text-gray-400">Date</span>
            <span className="text-gray-900 dark:text-gray-100">{ocrData.date}</span>
          </>
        )}
        {ocrData.invoiceNumber && (
          <>
            <span className="text-gray-500 dark:text-gray-400">Invoice #</span>
            <span className="text-gray-900 dark:text-gray-100">{ocrData.invoiceNumber}</span>
          </>
        )}
        {ocrData.gst && (
          <>
            <span className="text-gray-500 dark:text-gray-400">GST</span>
            <span className="text-gray-900 dark:text-gray-100">{ocrData.gst}</span>
          </>
        )}
      </div>
    </div>
  )
}

// 
// Main Component
// 

export function ExpenseDetail({
  expense,
  userRole,
  onApprove,
  onReject,
  onRequestChanges,
  onEdit,
  onDelete,
  onClose,
  className,
}: ExpenseDetailProps) {
  const [comment, setComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)

  const category = EXPENSE_CATEGORIES_MAP[expense.category]
  const statusConfig = EXPENSE_STATUS_MAP[expense.status]
  const canApprove =
    userRole &&
    (
      (expense.status === 'pending' && (userRole === 'dept_manager' || userRole === 'finance_manager' || userRole === 'ceo')) ||
      (expense.status === 'manager_approved' && (userRole === 'finance_manager' || userRole === 'ceo')) ||
      (expense.status === 'finance_approved' && userRole === 'ceo')
    )
  const canEdit = expense.status === 'draft'
  const canDelete = expense.status === 'draft'
  const hasPolicyViolations = expense.policyViolations && expense.policyViolations.length > 0

  return (
    <div className={cn('space-y-6', className)}>
      {/*  Header section  */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category?.icon ?? '??'}</span>
            <h2 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">
              {expense.title}
            </h2>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                getStatusColor(expense.status),
                getStatusTextColor(expense.status),
              )}
            >
              <span
                className="mr-1.5 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusConfig?.dotColor }}
              />
              {getStatusLabel(expense.status)}
            </span>
            {expense.aiCategory && (
              <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                <Sparkles className="h-3 w-3 text-purple-500" />
                AI: {expense.aiCategory}
                {expense.aiConfidence != null && (
                  <span className="text-gray-400">
                    ({(expense.aiConfidence * 100).toFixed(0)}%)
                  </span>
                )}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/*  Policy violations warning  */}
      {hasPolicyViolations && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
                Policy Violations Detected
              </h4>
              <ul className="mt-1 space-y-0.5">
                {expense.policyViolations.map((v, i) => (
                  <li key={i} className="text-sm text-red-600 dark:text-red-300">
                    &bull; {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/*  Two-column layout  */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/*  Left column: details  */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 lg:col-span-2"
        >
          {/*  Info grid  */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-3">
            <InfoItem icon={DollarSign} label="Amount" value={formatCurrency(expense.amount, expense.currency)} />
            <InfoItem icon={Calendar} label="Date" value={formatDate(expense.date)} />
            <InfoItem icon={Building2} label="Category" value={category?.label ?? expense.category} />
            {expense.subCategory && (
              <InfoItem icon={Tag} label="Sub-Category" value={expense.subCategory} />
            )}
            {expense.vendor && (
              <InfoItem icon={User} label="Vendor" value={expense.vendor} />
            )}
            {expense.project && (
              <InfoItem icon={Tag} label="Project" value={expense.project} />
            )}
            {expense.departmentId && (
              <InfoItem icon={Building2} label="Department" value={expense.departmentId} />
            )}
            {expense.departmentId && (
              <InfoItem icon={Building2} label="Department ID" value={expense.departmentId} />
            )}
            <InfoItem icon={Clock} label="Created" value={formatRelativeTime(expense.createdAt)} />
            <InfoItem icon={RefreshCw} label="Updated" value={formatRelativeTime(expense.updatedAt)} />
          </div>

          {/*  Description  */}
          {expense.description && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
              <p className="text-sm text-gray-900 dark:text-gray-100">{expense.description}</p>
            </div>
          )}

          {/*  Notes  */}
          {expense.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
              <p className="text-sm text-gray-900 dark:text-gray-100">{expense.notes}</p>
            </div>
          )}

          {/*  Tags  */}
          {expense.tags && expense.tags.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {expense.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/*  OCR data  */}
          {expense.ocrData && <OcrDataDisplay ocrData={expense.ocrData} />}

          {/*  Approval comment input  */}
          {canApprove && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              {showCommentInput ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Add Comment
                    </h4>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment for this action..."
                    className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                    rows={3}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(expense, comment || undefined)}
                    >
                      <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(expense, comment || undefined)}
                    >
                      <ThumbsDown className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRequestChanges?.(expense, comment || undefined)}
                    >
                      <RefreshCw className="mr-1 h-3.5 w-3.5" />
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowCommentInput(false)
                        setComment('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentInput(true)}
                  className="w-full"
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  Approve / Reject
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/*  Right column: receipt + timeline  */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/*  Receipt preview  */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Receipt
            </h4>
            <ReceiptPreview url={expense.receiptUrl} alt={'Receipt for ' + expense.title} />
            {expense.receiptUrl && (
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <ExternalLink className="h-3 w-3" />
                Open full receipt
              </a>
            )}
          </div>

          {/*  Approval timeline  */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Approval Timeline
            </h4>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <ApprovalTimeline approvalChain={expense.approvalChain} />
            </div>
          </div>

          {/*  Action buttons  */}
          <div className="flex flex-col gap-2">
            {canEdit && onEdit && (
              <Button variant="default" onClick={() => onEdit(expense)}>
                <Edit3 className="mr-1 h-4 w-4" />
                Edit Expense
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(expense)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete Expense
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// 
// Info Item Helper
// 

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  )
}
