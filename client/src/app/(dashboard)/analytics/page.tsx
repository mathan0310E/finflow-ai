'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
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

const MONTHLY_TREND = [
  { month: 'Oct', amount: 245000 },
  { month: 'Nov', amount: 298000 },
  { month: 'Dec', amount: 185000 },
  { month: 'Jan', amount: 312000 },
  { month: 'Feb', amount: 278000 },
  { month: 'Mar', amount: 342000 },
]

const CATEGORY_METRICS = [
  { label: 'Software & SaaS', value: formatCurrency(142000), change: '+18.3%', direction: 'up' as const, color: '#6366F1' },
  { label: 'Travel', value: formatCurrency(89000), change: '+12.7%', direction: 'up' as const, color: '#F97316' },
  { label: 'Office Supplies', value: formatCurrency(34000), change: '-5.2%', direction: 'down' as const, color: '#22C55E' },
  { label: 'Food & Dining', value: formatCurrency(28000), change: '+3.8%', direction: 'up' as const, color: '#EC4899' },
  { label: 'Training', value: formatCurrency(45000), change: '+22.1%', direction: 'up' as const, color: '#8B5CF6' },
  { label: 'Utilities', value: formatCurrency(22000), change: '-1.5%', direction: 'down' as const, color: '#14B8A6' },
]

export default function AnalyticsPage() {
  const maxAmount = Math.max(...MONTHLY_TREND.map((d) => d.amount))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Analytics"
        description="Advanced spending analytics and insights"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 6 Months
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Spend', value: formatCurrency(1660000), change: '+14.2%', direction: 'up' as const },
          { label: 'Avg Monthly', value: formatCurrency(276667), change: '+8.9%', direction: 'up' as const },
          { label: 'YoY Growth', value: '22.4%', change: '+6.1pp', direction: 'up' as const },
          { label: 'Budget Efficiency', value: '78.3%', change: '-2.1pp', direction: 'down' as const },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {metric.value}
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              {metric.direction === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  metric.direction === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {metric.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly trend chart placeholder */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Spend Trend
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Company-wide expenditure over time
              </p>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-3" style={{ height: 220 }}>
              {MONTHLY_TREND.map((d) => (
                <div
                  key={d.month}
                  className="group relative flex flex-1 flex-col items-center"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.amount / maxAmount) * 100}%` }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeOut' as const,
                    }}
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-200 hover:from-blue-600 hover:to-indigo-600"
                    style={{ minHeight: 24 }}
                  >
                    <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-gray-100 dark:text-gray-900">
                      {formatCurrency(d.amount)}
                    </div>
                  </motion.div>
                  <span className="mt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                By Category
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Current period
              </p>
            </div>
            <div className="space-y-4">
              {CATEGORY_METRICS.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {cat.value}
                      </span>
                      <span
                        className={cn(
                          'text-xs',
                          cat.direction === 'up'
                            ? 'text-red-400'
                            : 'text-emerald-400',
                        )}
                      >
                        {cat.change}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 60 + 20}%` }}
                      transition={{
                        duration: 0.6,
                        delay: 0.2 + i * 0.06,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights placeholder */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-indigo-50/50 p-6 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-indigo-950/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Advanced Analytics
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Dive deeper with custom date ranges, department comparisons,
              predictive forecasting, anomaly detection, and exportable
              interactive dashboards. Full analytics suite coming soon.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
