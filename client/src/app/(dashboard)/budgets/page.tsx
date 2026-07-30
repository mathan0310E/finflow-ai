'use client'

import { motion } from 'framer-motion'
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/utils/format'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const DEPARTMENT_BUDGETS = [
  { name: 'Engineering', allocated: 500000, spent: 378000, trend: 'up' as const, change: 8.2 },
  { name: 'Marketing', allocated: 250000, spent: 212000, trend: 'up' as const, change: 12.5 },
  { name: 'Sales', allocated: 300000, spent: 195000, trend: 'down' as const, change: 3.1 },
  { name: 'Operations', allocated: 180000, spent: 145000, trend: 'up' as const, change: 5.8 },
  { name: 'HR', allocated: 80000, spent: 52000, trend: 'down' as const, change: 2.4 },
  { name: 'Finance', allocated: 120000, spent: 89000, trend: 'up' as const, change: 6.7 },
]

const QUICK_STATS = [
  {
    label: 'Total Budget (FY)',
    value: formatCurrency(1430000),
    change: '+5.2% vs last year',
    direction: 'up' as const,
  },
  {
    label: 'Total Spent',
    value: formatCurrency(1071000),
    change: '74.9% utilization',
    direction: 'up' as const,
  },
  {
    label: 'Remaining',
    value: formatCurrency(359000),
    change: '25.1% available',
    direction: 'down' as const,
  },
]

export default function BudgetsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Budgets"
        description="Manage department budgets and track spending"
      >
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </PageHeader>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              {stat.direction === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.direction === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Department budgets */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Department Budgets
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Allocated vs. spent across departments
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            View All
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-5">
          {DEPARTMENT_BUDGETS.map((dept, i) => {
            const pct = Math.round((dept.spent / dept.allocated) * 100)
            const isOver = pct > 90
            return (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dept.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(dept.spent)}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isOver ? 'text-red-500' : 'text-gray-400 dark:text-gray-500',
                      )}
                    >
                      {pct}%
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-xs',
                        dept.trend === 'up'
                          ? 'text-red-400'
                          : 'text-emerald-400',
                      )}
                    >
                      {dept.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {dept.change}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 + i * 0.06,
                      ease: 'easeOut' as const,
                    }}
                    className={cn(
                      'h-full rounded-full',
                      isOver
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500',
                    )}
                  />
                </div>
                <div className="mt-0.5 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                  <span>Allocated: {formatCurrency(dept.allocated)}</span>
                  <span>
                    Remaining:{' '}
                    {formatCurrency(dept.allocated - dept.spent)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Coming soon features note */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 dark:border-blue-800/50 dark:from-blue-950/30 dark:to-indigo-950/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              AI-Powered Budgeting
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Smart budget forecasting, automatic reallocation suggestions, and
              real-time spending alerts powered by FinFlow AI. Full budgeting
              features coming soon.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
