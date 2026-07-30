'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileType,
  Trash2,
  ExternalLink,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { REPORT_TYPES_MAP } from '@/constants'
import { useDownloadReport, useDeleteReport } from '../hooks/useReports'
import { formatDate, formatRelativeTime } from '@/utils/format'
import type { GeneratedReport } from '../stores/report-store'

// 
// Types
// 

export interface ReportCardProps {
  /** The generated report to display. */
  report: GeneratedReport
  /** Optional class name for the root element. */
  className?: string
  /** Optional animation delay (seconds). */
  animationDelay?: number
  /** Callback when the report is deleted. */
  onDeleted?: (id: string) => void
}

// 
// Animation variants
// 

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

// 
// Helpers
// 

function getStatusConfig(status: string): {
  label: string
  icon: typeof Clock
  color: string
  bgColor: string
} {
  switch (status) {
    case 'generating':
      return {
        label: 'Generating',
        icon: Loader2,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      }
    case 'ready':
      return {
        label: 'Ready',
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      }
    case 'failed':
      return {
        label: 'Failed',
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/50',
      }
    default:
      return {
        label: status,
        icon: Clock,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
      }
  }
}

function getFormatIcon(format: string) {
  switch (format) {
    case 'pdf':
      return FileText
    case 'excel':
      return FileSpreadsheet
    case 'csv':
      return FileType
    default:
      return FileText
  }
}

function getFormatBadgeVariant(format: string): 'default' | 'secondary' | 'success' | 'warning' {
  switch (format) {
    case 'pdf':
      return 'default'
    case 'excel':
      return 'success'
    case 'csv':
      return 'warning'
    default:
      return 'secondary'
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// 
// Component
// 

/**
 * A generated report card with name, date range, format badge,
 * status indicator, and download / delete actions.
 *
 * @example
 * ```tsx
 * <ReportCard
 *   report={report}
 *   animationDelay={0.1}
 *   onDeleted={(id) => console.log('Deleted:', id)}
 * />
 * ```
 */
export function ReportCard({
  report,
  className,
  animationDelay = 0,
  onDeleted,
}: ReportCardProps) {
  const downloadMutation = useDownloadReport()
  const deleteMutation = useDeleteReport()

  const reportTypeConfig = REPORT_TYPES_MAP[report.type]
  const statusConfig = getStatusConfig(report.status)
  const StatusIcon = statusConfig.icon
  const FormatIcon = getFormatIcon(report.format)

  //  Handlers 

  const handleDownload = async () => {
    if (report.status !== 'ready' || !report.id) return
    try {
      await downloadMutation.mutateAsync({
        id: report.id,
        format: report.format,
      })
    } catch {
      // Error is handled by the mutation
    }
  }

  const handleDelete = async () => {
    if (!report.id) return
    try {
      await deleteMutation.mutateAsync(report.id)
      onDeleted?.(report.id)
    } catch {
      // Error is handled by the mutation
    }
  }

  //  Render 

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={animationDelay}
      className={className}
    >
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Title area */}
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <FormatIcon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">
                  {report.title || reportTypeConfig?.label || report.type}
                </span>
              </CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {/* Format badge */}
                <Badge
                  variant={getFormatBadgeVariant(report.format)}
                  className="text-[10px] uppercase"
                >
                  {report.format}
                </Badge>

                {/* Period badge */}
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {report.period}
                </span>
              </div>
            </div>

            {/* Status */}
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1',
                statusConfig.bgColor,
              )}
            >
              <StatusIcon
                className={cn(
                  'h-3.5 w-3.5',
                  report.status === 'generating' && 'animate-spin',
                  statusConfig.color,
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  statusConfig.color,
                )}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formatDate(report.dateFrom, 'MMM dd, yyyy')} —{' '}
                {formatDate(report.dateTo, 'MMM dd, yyyy')}
              </span>
            </div>

            {/* Created time */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Created {formatRelativeTime(report.createdAt)}</span>
            </div>

            {/* File size (if available) */}
            {report.fileSize && (
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>{formatFileSize(report.fileSize)}</span>
              </div>
            )}

            {/* Department (if filtered) */}
            {report.departmentId && (
              <div className="flex items-center gap-1.5">
                <span>Department: {report.departmentId}</span>
              </div>
            )}

            {/* Error message (if failed) */}
            {report.status === 'failed' && report.error && (
              <p className="mt-1 text-red-500 dark:text-red-400">
                {report.error}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex w-full items-center justify-between">
            {/* Left: completed time */}
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {report.completedAt
                ? `Completed ${formatRelativeTime(report.completedAt)}`
                : report.status === 'generating'
                  ? 'Processing...'
                  : ''}
            </span>

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              {report.status === 'ready' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="h-8 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-1 h-3.5 w-3.5" />
                  )}
                  Download
                </Button>
              )}

              {report.fileUrl && report.status === 'ready' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  asChild
                >
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-3.5 w-3.5" />
                    View
                  </a>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
