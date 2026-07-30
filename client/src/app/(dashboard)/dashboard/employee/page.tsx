﻿'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Send,
  FileText,
  BarChart3,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react'
import {
  StatCard,
  GlassCard,
  SectionHeader,
  StatusBadge,
  AIInsightCard,
  QuickAction,
  AnimatedSection,
  containerVariants,
  itemVariants,
  generateMockExpenses,
  generateMockMonthlyTrend,
  generateMockCategoryBreakdown,
  type ExpenseRow,
} from '../_components'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/utils/format'

// 
// Mock data
// 

const MOCK_EXPENSES: ExpenseRow[] = [
  { id: 'EXP-1001', merchant: 'Amazon Business', category: 'Office Supplies', amount: 234.50, date: 'Mar 15', status: 'approved' },
  { id: 'EXP-1002', merchant: 'Uber Corp', category: 'Travel', amount: 47.80, date: 'Mar 14', status: 'pending' },
  { id: 'EXP-1003', merchant: 'Adobe Creative Cloud', category: 'Software', amount: 599.99, date: 'Mar 12', status: 'reimbursed' },
  { id: 'EXP-1004', merchant: 'Starbucks', category: 'Food & Dining', amount: 12.50, date: 'Mar 11', status: 'approved' },
  { id: 'EXP-1005', merchant: 'WeWork', category: 'Utilities', amount: 450.00, date: 'Mar 10', status: 'pending' },
  { id: 'EXP-1006', merchant: 'Microsoft 365', category: 'Software', amount: 99.99, date: 'Mar 08', status: 'approved' },
  { id: 'EXP-1007', merchant: 'DoorDash', category: 'Food & Dining', amount: 32.75, date: 'Mar 07', status: 'approved' },
]

const MONTHLY_DATA = [
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1800 },
  { month: 'Dec', amount: 950 },
  { month: 'Jan', amount: 2100 },
  { month: 'Feb', amount: 1600 },
  { month: 'Mar', amount: 2450 },
]

const CATEGORY_DATA = [
  { name: 'Software', amount: 2340, percentage: 35, color: '#6366F1' },
  { name: 'Food & Dining', amount: 980, percentage: 15, color: '#EC4899' },
  { name: 'Travel', amount: 1240, percentage: 18, color: '#F97316' },
  { name: 'Office Supplies', amount: 680, percentage: 10, color: '#22C55E' },
  { name: 'Other', amount: 1420, percentage: 22, color: '#94A3B8' },
]

// 
// Loading Skeleton
// 

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 dark:border-gray-800/60 dark:bg-gray-900/80">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 dark:border-gray-800/60 dark:bg-gray-900/80">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 dark:border-gray-800/60 dark:bg-gray-900/80">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 
// Mini Chart Bars
// 

function MiniBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount))
  return (
    <div className="flex items-end gap-1.5">
      {data.map((d) => (
        <div key={d.month} className="group relative flex flex-1 flex-col items-center">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.amount / max) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-200 hover:from-blue-600 hover:to-indigo-600"
            style={{ minHeight: 16 }}
          />
          <span className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  )
}

// 
// Recent Expenses Table
// 

function RecentExpensesTable({
  expenses,
  isLoading,
}: {
  expenses: ExpenseRow[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200/60 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
            <th className="pb-3 pr-4">ID</th>
            <th className="pb-3 pr-4">Merchant</th>
            <th className="pb-3 pr-4">Category</th>
            <th className="pb-3 pr-4 text-right">Amount</th>
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, i) => (
            <motion.tr
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="border-b border-gray-100/80 transition-colors hover:bg-gray-50/50 dark:border-gray-800/40 dark:hover:bg-gray-800/30"
            >
              <td className="py-3 pr-4">
                <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                  {expense.id}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  {expense.merchant}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="text-gray-500 dark:text-gray-400">
                  {expense.category}
                </span>
              </td>
              <td className="py-3 pr-4 text-right">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount)}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="text-gray-500 dark:text-gray-400">
                  {expense.date}
                </span>
              </td>
              <td className="py-3 text-right">
                <StatusBadge status={expense.status} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 
// Category Pie (simplified horizontal bars)
// 

function CategoryBreakdown({
  data,
}: {
  data: { name: string; amount: number; percentage: number; color: string }[]
}) {
  return (
    <div className="space-y-3">
      {data.map((cat, i) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(cat.amount)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {cat.percentage}%
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cat.percentage}%` }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: 'easeOut' as const }}
              className="h-full rounded-full"
              style={{ backgroundColor: cat.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 
// Employee Dashboard Page
// 

export default function EmployeeDashboard() {
  const isLoading = false // Toggle for loading state demonstration

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-1 h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  const totalSpent = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0)
  const pendingCount = MOCK_EXPENSES.filter((e) => e.status === 'pending').length
  const approvedCount = MOCK_EXPENSES.filter((e) => e.status === 'approved' || e.status === 'reimbursed').length

  return (
    <AnimatedSection className="space-y-6">
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          My Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your expenses, approvals, and budget at a glance.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change="+12.5% vs last month"
          changeType="positive"
          icon={Wallet}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Pending"
          value={String(pendingCount)}
          change="Awaiting approval"
          changeType="neutral"
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Approved"
          value={String(approvedCount)}
          change="This month"
          changeType="positive"
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          title="Budget Used"
          value="68%"
          change="$3,200 remaining"
          changeType="positive"
          icon={BarChart3}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-900/30"
        />
      </motion.div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent expenses & chart */}
        <div className="space-y-6 lg:col-span-2">
          {/* Monthly trend */}
          <GlassCard>
            <SectionHeader
              title="Monthly Spending"
              description="Last 6 months"
            />
            <div className="h-48 pt-4">
              <MiniBarChart data={MONTHLY_DATA} />
            </div>
          </GlassCard>

          {/* Recent expenses */}
          <GlassCard>
            <SectionHeader
              title="Recent Expenses"
              description="Your latest expense submissions"
              action={
                <Link href="/expenses">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              }
            />
            <RecentExpensesTable expenses={MOCK_EXPENSES.slice(0, 5)} />
          </GlassCard>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Quick actions */}
          <GlassCard>
            <SectionHeader title="Quick Actions" />
            <div className="grid gap-2">
              <Link href="/expenses/new">
                <QuickAction
                  icon={Plus}
                  label="New Expense"
                  gradient="from-blue-600 to-indigo-600"
                />
              </Link>
              <QuickAction
                icon={Send}
                label="Submit Report"
                gradient="from-emerald-600 to-teal-600"
              />
              <Link href="/expenses">
                <QuickAction
                  icon={Receipt}
                  label="View Expenses"
                  gradient="from-violet-600 to-purple-600"
                />
              </Link>
              <QuickAction
                icon={FileText}
                label="Generate Report"
                gradient="from-amber-500 to-orange-600"
              />
            </div>
          </GlassCard>

          {/* Category breakdown */}
          <GlassCard>
            <SectionHeader
              title="Spending by Category"
              description="Current month"
            />
            <CategoryBreakdown data={CATEGORY_DATA} />
          </GlassCard>

          {/* AI Insights */}
          <GlassCard>
            <SectionHeader
              title="AI Insights"
              description="Powered by FinFlow AI"
            />
            <div className="space-y-3">
              <AIInsightCard
                type="positive"
                title="Budget on track"
                description="You've used 68% of your monthly budget with 10 days remaining."
              />
              <AIInsightCard
                type="info"
                title="Unusual spending detected"
                description="Software expenses are 40% higher than last month."
              />
              <AIInsightCard
                type="negative"
                title="Receipt missing"
                description="2 expenses are missing receipts. Add them to avoid delays."
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AnimatedSection>
  )
}
