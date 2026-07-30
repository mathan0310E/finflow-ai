'use client'

import { type ReactNode, type ElementType } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

// 
// Types
// 

export interface StatCardData {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export interface ExpenseRow {
  id: string
  merchant: string
  category: string
  amount: number
  date: string
  status: string
  user?: string
}

// 
// Animation variants
// 

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

// 
// Stat Card
// 

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  iconBg,
  isLoading,
}: StatCardData & { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-blue-500/5 dark:border-gray-800/60 dark:bg-gray-900/80"
    >
      {/* Gradient accent bar */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r', iconBg)} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className="mt-1.5 flex items-center gap-1">
              {changeType === 'positive' && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {changeType === 'negative' && (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                  changeType === 'negative' && 'text-red-600 dark:text-red-400',
                  changeType === 'neutral' && 'text-gray-500 dark:text-gray-400',
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBg,
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>

      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10" />
      </div>
    </motion.div>
  )
}

// 
// Stat Card Skeleton
// 

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// 
// Section Header
// 

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// 
// Glass Card
// 

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

// 
// Quick Action Button
// 

export function QuickAction({
  icon: Icon,
  label,
  onClick,
  gradient,
}: {
  icon: ElementType
  label: string
  onClick?: () => void
  gradient: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 text-left text-sm font-medium transition-all duration-200',
        'border border-gray-200/60 bg-white/50 shadow-sm hover:shadow-md',
        'dark:border-gray-800/60 dark:bg-gray-800/50',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm',
          gradient,
        )}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </motion.button>
  )
}

// 
// Status Badge
// 

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' }> = {
    approved: { label: 'Approved', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    draft: { label: 'Draft', variant: 'secondary' },
    reimbursed: { label: 'Reimbursed', variant: 'default' },
    manager_approved: { label: 'Mgr Approved', variant: 'outline' },
    finance_approved: { label: 'Fin Approved', variant: 'outline' },
    changes_requested: { label: 'Changes Req.', variant: 'warning' },
  }

  const c = config[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

// 
// AI Insight Card
// 

export function AIInsightCard({
  title,
  description,
  type,
}: {
  title: string
  description: string
  type: 'positive' | 'negative' | 'info'
}) {
  const gradients = {
    positive: 'from-emerald-500 to-teal-500',
    negative: 'from-amber-500 to-orange-500',
    info: 'from-blue-500 to-indigo-500',
  }

  const borderColors = {
    positive: 'border-emerald-200/60 dark:border-emerald-800/30',
    negative: 'border-amber-200/60 dark:border-amber-800/30',
    info: 'border-blue-200/60 dark:border-blue-800/30',
  }

  const bgColors = {
    positive: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    negative: 'bg-amber-50/50 dark:bg-amber-950/20',
    info: 'bg-blue-50/50 dark:bg-blue-950/20',
  }

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        borderColors[type],
        bgColors[type],
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm',
          gradients[type],
        )}
      >
        <span className="text-xs font-bold text-white">AI</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

// 
// Section wrapper with animation
// 

export function AnimatedSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 
// Mock data generators
// 

export function generateMockExpenses(count = 5): ExpenseRow[] {
  const merchants = [
    'Amazon Business', 'Uber Corp', 'Starbucks', 'WeWork', 'Adobe',
    'Microsoft 365', 'Delta Airlines', 'Marriott', 'Slack', 'AWS',
    'Google Cloud', 'DoorDash', 'FedEx', 'HP Inc', 'Dell Technologies',
  ]
  const categories = [
    'Software', 'Travel', 'Food & Dining', 'Office Supplies', 'Utilities',
    'Hardware', 'Marketing', 'Training', 'Transportation', 'Accommodation',
  ]
  const statuses = [
    'approved', 'pending', 'rejected', 'draft', 'reimbursed',
    'manager_approved', 'finance_approved', 'changes_requested',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `EXP-${String(1000 + i).padStart(4, '0')}`,
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    amount: Math.round(Math.random() * 5000 * 100) / 100,
    date: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }))
}

export function generateMockMonthlyTrend(): { month: string; amount: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month) => ({
    month,
    amount: Math.round(Math.random() * 80000 + 20000),
  }))
}

export function generateMockCategoryBreakdown(): { name: string; amount: number; percentage: number; color: string }[] {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6']
  const categories = [
    'Software', 'Travel', 'Office Supplies', 'Food & Dining', 'Hardware',
    'Marketing', 'Utilities', 'Training', 'Transportation', 'Accommodation',
  ]
  const total = 500000
  return categories.map((name, i) => {
    const amount = Math.round(Math.random() * 80000 + 10000)
    return {
      name,
      amount,
      percentage: Math.round((amount / total) * 1000) / 10,
      color: colors[i],
    }
  })
}
