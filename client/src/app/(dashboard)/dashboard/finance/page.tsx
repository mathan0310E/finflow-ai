﻿'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  BarChart3,
  FileText,
  Wallet,
  ArrowUpRight,
  PiggyBank,
  Receipt,
  Users,
  Banknote,
  Calculator,
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
  type ExpenseRow,
} from '../_components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/utils/format'

// 
// Mock data
// 

const MOCK_EXPENSES: ExpenseRow[] = [
  { id: 'EXP-1001', merchant: 'Amazon Web Services', category: 'Software', amount: 12450.00, date: 'Mar 15', status: 'approved', user: 'Engineering' },
  { id: 'EXP-1002', merchant: 'Marriott Hotel', category: 'Accommodation', amount: 3200.00, date: 'Mar 14', status: 'finance_approved', user: 'Sales' },
  { id: 'EXP-1003', merchant: 'Delta Airlines', category: 'Travel', amount: 5890.00, date: 'Mar 12', status: 'pending', user: 'Marketing' },
  { id: 'EXP-1004', merchant: 'Office Depot', category: 'Office Supplies', amount: 845.00, date: 'Mar 11', status: 'approved', user: 'Operations' },
  { id: 'EXP-1005', merchant: 'Google Cloud', category: 'Software', amount: 21300.00, date: 'Mar 10', status: 'finance_approved', user: 'Engineering' },
  { id: 'EXP-1006', merchant: 'Salesforce', category: 'Software', amount: 18000.00, date: 'Mar 08', status: 'approved', user: 'Sales' },
  { id: 'EXP-1007', merchant: 'HubSpot', category: 'Software', amount: 5600.00, date: 'Mar 07', status: 'pending', user: 'Marketing' },
]

const BUDGET_CATEGORIES = [
  { name: 'Software & SaaS', allocated: 180000, spent: 145000, color: '#6366F1' },
  { name: 'Travel & Transport', allocated: 120000, spent: 89000, color: '#F97316' },
  { name: 'Office & Admin', allocated: 65000, spent: 42000, color: '#22C55E' },
  { name: 'Marketing & Ads', allocated: 95000, spent: 72000, color: '#EC4899' },
  { name: 'Training & Dev', allocated: 40000, spent: 28000, color: '#8B5CF6' },
  { name: 'Facilities', allocated: 85000, spent: 55000, color: '#14B8A6' },
]

const MONTHLY_TREND = [
  { month: 'Oct', amount: 285000 },
  { month: 'Nov', amount: 312000 },
  { month: 'Dec', amount: 198000 },
  { month: 'Jan', amount: 345000 },
  { month: 'Feb', amount: 298000 },
  { month: 'Mar', amount: 362000 },
]

const REIMBURSEMENT_QUEUE = [
  { id: 'EXP-0987', user: 'Alice M.', amount: 345.00, date: 'Mar 14', status: 'approved' },
  { id: 'EXP-0988', user: 'Bob K.', amount: 1280.00, date: 'Mar 13', status: 'approved' },
  { id: 'EXP-0989', user: 'Carol S.', amount: 567.50, date: 'Mar 12', status: 'approved' },
  { id: 'EXP-0990', user: 'Dan W.', amount: 2100.00, date: 'Mar 11', status: 'approved' },
  { id: 'EXP-0991', user: 'Eve J.', amount: 450.00, date: 'Mar 10', status: 'approved' },
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
        <div>
          <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-5 dark:border-gray-800/60 dark:bg-gray-900/80">
            <Skeleton className="mb-4 h-5 w-32" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 
// Mini Bar Chart
// 

function MiniBarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount))
  return (
    <div className="flex items-end gap-2">
      {data.map((d) => (
        <div key={d.month} className="group relative flex flex-1 flex-col items-center">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.amount / max) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-500 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600"
            style={{ minHeight: 20 }}
          >
            <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-gray-100 dark:text-gray-900">
              {formatCurrency(d.amount)}
            </div>
          </motion.div>
          <span className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  )
}

// 
// Budget Bars
// 

function BudgetProgress({
  data,
}: {
  data: { name: string; allocated: number; spent: number; color: string }[]
}) {
  return (
    <div className="space-y-4">
      {data.map((cat, i) => {
        const pct = Math.round((cat.spent / cat.allocated) * 100)
        const isOver = pct > 90
        return (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(cat.spent)}
                </span>
                <span className={cn(
                  'text-xs',
                  isOver ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500',
                )}>
                  {pct}%
                </span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: 'easeOut' as const }}
                className={cn(
                  'h-full rounded-full transition-all',
                  isOver ? 'bg-red-500' : '',
                )}
                style={{ backgroundColor: isOver ? undefined : cat.color }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
              <span>Allocated: {formatCurrency(cat.allocated)}</span>
              <span>Remaining: {formatCurrency(cat.allocated - cat.spent)}</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 
// Reimbursement Queue
// 

function ReimbursementList({
  items,
}: {
  items: { id: string; user: string; amount: number; date: string; status: string }[]
}) {
  const total = items.reduce((sum, i) => sum + i.amount, 0)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-lg bg-blue-50/50 px-3 py-2 dark:bg-blue-950/20">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Total pending
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatCurrency(total)}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex items-center justify-between rounded-lg border border-gray-100/80 bg-white/50 px-3 py-2.5 dark:border-gray-800/50 dark:bg-gray-800/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-semibold text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                {item.user.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.user}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-400">{item.id}</span>
                  <span className="text-[10px] text-gray-400">{item.date}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.amount)}
              </p>
              <Link
                href={`/reimbursements/${item.id}`}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Process
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// 
// Finance Manager Dashboard Page
// 

export default function FinanceDashboard() {
  const isLoading = false

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

  const totalAllocated = BUDGET_CATEGORIES.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = BUDGET_CATEGORIES.reduce((sum, c) => sum + c.spent, 0)
  const utilizationRate = Math.round((totalSpent / totalAllocated) * 100)
  const pendingFinanceCount = MOCK_EXPENSES.filter(e => e.status === 'pending').length + 4
  const reimbursementTotal = REIMBURSEMENT_QUEUE.reduce((sum, r) => sum + r.amount, 0)

  return (
    <AnimatedSection className="space-y-6">
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Finance Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Budget oversight, approval queue, and financial operations.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalAllocated)}
          change="FY 2025"
          changeType="neutral"
          icon={PiggyBank}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change={`${utilizationRate}% utilization`}
          changeType={utilizationRate > 85 ? 'negative' : 'positive'}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          title="Pending Approval"
          value={String(pendingFinanceCount)}
          change="Needs finance review"
          changeType="negative"
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Reimbursements"
          value={formatCurrency(reimbursementTotal)}
          change={`${REIMBURSEMENT_QUEUE.length} pending`}
          changeType="neutral"
          icon={Banknote}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-900/30"
        />
      </motion.div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Monthly trend */}
          <GlassCard>
            <SectionHeader
              title="Monthly Spend"
              description="Company-wide expenditure"
            />
            <div className="h-52 pt-4">
              <MiniBarChart data={MONTHLY_TREND} />
            </div>
          </GlassCard>

          {/* Budget by category */}
          <GlassCard>
            <SectionHeader
              title="Budget vs. Actual"
              description="Category-wise budget tracking"
            />
            <BudgetProgress data={BUDGET_CATEGORIES} />
          </GlassCard>

          {/* Recent expenses needing finance review */}
          <GlassCard>
            <SectionHeader
              title="Expenses Awaiting Finance Review"
              description="Items that need your approval"
              action={
                <Link href="/approvals">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200/60 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Merchant</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EXPENSES.slice(0, 5).map((expense, i) => (
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
                          {expense.user}
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
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reimbursement queue */}
          <GlassCard>
            <SectionHeader
              title="Reimbursement Queue"
              description="Pending payments to process"
              action={
                <Link href="/reimbursements">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Process
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              }
            />
            <ReimbursementList items={REIMBURSEMENT_QUEUE} />
          </GlassCard>

          {/* Quick actions */}
          <GlassCard>
            <SectionHeader title="Quick Actions" />
            <div className="grid gap-2">
              <Link href="/approvals">
                <QuickAction
                  icon={CheckCircle2}
                  label="Review Expenses"
                  gradient="from-blue-600 to-indigo-600"
                />
              </Link>
              <Link href="/budgets">
                <QuickAction
                  icon={Calculator}
                  label="Manage Budgets"
                  gradient="from-emerald-600 to-teal-600"
                />
              </Link>
              <Link href="/reports">
                <QuickAction
                  icon={FileText}
                  label="Generate Reports"
                  gradient="from-violet-600 to-purple-600"
                />
              </Link>
              <Link href="/reimbursements">
                <QuickAction
                  icon={Banknote}
                  label="Process Payments"
                  gradient="from-amber-500 to-orange-600"
                />
              </Link>
            </div>
          </GlassCard>

          {/* AI Insights */}
          <GlassCard>
            <SectionHeader
              title="AI Finance Insights"
              description="Powered by FinFlow AI"
            />
            <div className="space-y-3">
              <AIInsightCard
                type="info"
                title="Budget forecast"
                description="At current spend rate, annual budget will be exceeded by 8% in Q4."
              />
              <AIInsightCard
                type="negative"
                title="Policy violations"
                description="3 expenses flagged for exceeding department budget limits."
              />
              <AIInsightCard
                type="positive"
                title="Vendor consolidation"
                description="Merging 3 SaaS subscriptions could save $4,200/quarter."
              />
              <AIInsightCard
                type="info"
                title="Monthly anomaly"
                description="Software spend is 35% higher than the 6-month average."
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AnimatedSection>
  )
}
