﻿'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Receipt,
  UserPlus,
  FileText,
  BarChart3,
  ArrowUpRight,
  Wallet,
  Bell,
  AlertCircle,
  GitBranch,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/utils/format'

// 
// Mock data
// 

const MOCK_EXPENSES: ExpenseRow[] = [
  { id: 'EXP-1001', merchant: 'Adobe Creative Cloud', category: 'Software', amount: 599.99, date: 'Mar 15', status: 'pending', user: 'Alice M.' },
  { id: 'EXP-1002', merchant: 'Uber Corp', category: 'Travel', amount: 127.50, date: 'Mar 14', status: 'pending', user: 'Bob K.' },
  { id: 'EXP-1003', merchant: 'Amazon Business', category: 'Office Supplies', amount: 345.00, date: 'Mar 12', status: 'approved', user: 'Carol S.' },
  { id: 'EXP-1004', merchant: 'DoorDash', category: 'Food & Dining', amount: 48.75, date: 'Mar 11', status: 'pending', user: 'Dan W.' },
  { id: 'EXP-1005', merchant: 'WeWork', category: 'Utilities', amount: 1200.00, date: 'Mar 10', status: 'approved', user: 'Eve J.' },
  { id: 'EXP-1006', merchant: 'LinkedIn Premium', category: 'Software', amount: 59.99, date: 'Mar 08', status: 'approved', user: 'Frank L.' },
  { id: 'EXP-1007', merchant: 'Google Cloud', category: 'Software', amount: 4500.00, date: 'Mar 07', status: 'pending', user: 'Grace H.' },
]

const TEAM_MEMBERS = [
  { name: 'Alice M.', role: 'Senior Developer', pending: 2, total: 3450 },
  { name: 'Bob K.', role: 'UX Designer', pending: 1, total: 2100 },
  { name: 'Carol S.', role: 'Product Manager', pending: 0, total: 4890 },
  { name: 'Dan W.', role: 'Junior Developer', pending: 1, total: 890 },
  { name: 'Eve J.', role: 'QA Engineer', pending: 0, total: 1650 },
  { name: 'Frank L.', role: 'DevOps Engineer', pending: 1, total: 3200 },
  { name: 'Grace H.', role: 'Data Scientist', pending: 2, total: 5670 },
]

const DEPARTMENT_MONTHLY = [
  { month: 'Oct', amount: 42500 },
  { month: 'Nov', amount: 48200 },
  { month: 'Dec', amount: 31500 },
  { month: 'Jan', amount: 52300 },
  { month: 'Feb', amount: 47800 },
  { month: 'Mar', amount: 55100 },
]

const CATEGORY_DATA = [
  { name: 'Software', amount: 15800, percentage: 32, color: '#6366F1' },
  { name: 'Travel', amount: 8900, percentage: 18, color: '#F97316' },
  { name: 'Office Supplies', amount: 5200, percentage: 11, color: '#22C55E' },
  { name: 'Food & Dining', amount: 4600, percentage: 9, color: '#EC4899' },
  { name: 'Training', amount: 7200, percentage: 15, color: '#8B5CF6' },
  { name: 'Other', amount: 7400, percentage: 15, color: '#94A3B8' },
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
            className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-200 hover:from-indigo-600 hover:to-violet-600"
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
// Category Breakdown
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
// Team Pending Approvals
// 

function TeamApprovalList({
  members,
}: {
  members: { name: string; role: string; pending: number; total: number }[]
}) {
  const membersWithPending = members.filter((m) => m.pending > 0)
  return (
    <div className="space-y-3">
      {membersWithPending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            All caught up!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No pending approvals from your team.
          </p>
        </div>
      ) : (
        membersWithPending.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white/50 p-3 transition-all hover:shadow-sm dark:border-gray-800/60 dark:bg-gray-800/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-100 text-xs font-semibold text-indigo-700 dark:from-indigo-900/50 dark:to-violet-900/50 dark:text-indigo-300">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {member.role} &middot; {member.pending} pending
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(member.total)}
              </p>
              <Link
                href={`/approvals?user=${member.name.split(' ')[0].toLowerCase()}`}
                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Review
              </Link>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

// 
// Department Manager Dashboard Page
// 

export default function ManagerDashboard() {
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

  const deptBudget = 600000
  const deptSpent = DEPARTMENT_MONTHLY.reduce((sum, m) => sum + m.amount, 0)
  const yearlySpent = deptSpent
  const budgetRemaining = deptBudget - yearlySpent
  const utilizationRate = Math.round((yearlySpent / deptBudget) * 100)
  const pendingCount = MOCK_EXPENSES.filter((e) => e.status === 'pending').length
  const teamSize = TEAM_MEMBERS.length

  return (
    <AnimatedSection className="space-y-6">
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Department Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Engineering department — manage team expenses and budget.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Dept. Budget (YTD)"
          value={formatCurrency(yearlySpent)}
          change={`${utilizationRate}% of ${formatCurrency(deptBudget)}`}
          changeType={utilizationRate > 80 ? 'negative' : 'positive'}
          icon={Wallet}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Budget Remaining"
          value={formatCurrency(budgetRemaining)}
          change={utilizationRate > 80 ? 'CAUTION - Low' : 'On track'}
          changeType={utilizationRate > 80 ? 'negative' : 'positive'}
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          title="Pending Approvals"
          value={String(pendingCount)}
          change="Needs your review"
          changeType={pendingCount > 0 ? 'negative' : 'positive'}
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Team Members"
          value={String(teamSize)}
          change={String(TEAM_MEMBERS.filter((m) => m.pending > 0).length) + ' need review'}
          changeType="neutral"
          icon={Users}
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
              title="Department Monthly Spend"
              description="Engineering department"
            />
            <div className="h-52 pt-4">
              <MiniBarChart data={DEPARTMENT_MONTHLY} />
            </div>
          </GlassCard>

          {/* Recent expenses */}
          <GlassCard>
            <SectionHeader
              title="Team Expenses"
              description="Recent submissions from your team"
              action={
                <Link href="/expenses">
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
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Submitted By</th>
                    <th className="pb-3 pr-4 text-right">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EXPENSES.map((expense, i) => (
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
          {/* Team approval queue */}
          <GlassCard>
            <SectionHeader
              title="Approvals Needed"
              description={`${TEAM_MEMBERS.filter((m) => m.pending > 0).length} team members need review`}
              action={
                <Link href="/approvals">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              }
            />
            <TeamApprovalList members={TEAM_MEMBERS} />
          </GlassCard>

          {/* Quick actions */}
          <GlassCard>
            <SectionHeader title="Quick Actions" />
            <div className="grid gap-2">
              <Link href="/approvals">
                <QuickAction
                  icon={CheckCircle2}
                  label="Review Expenses"
                  gradient="from-indigo-600 to-violet-600"
                />
              </Link>
              <Link href="/expenses/new">
                <QuickAction
                  icon={Receipt}
                  label="Submit Expense"
                  gradient="from-blue-600 to-indigo-600"
                />
              </Link>
              <Link href={`/employees`}>
                <QuickAction
                  icon={Users}
                  label="Team Overview"
                  gradient="from-emerald-600 to-teal-600"
                />
              </Link>
              <Link href="/budgets">
                <QuickAction
                  icon={BarChart3}
                  label="View Budget"
                  gradient="from-amber-500 to-orange-600"
                />
              </Link>
            </div>
          </GlassCard>

          {/* Category breakdown */}
          <GlassCard>
            <SectionHeader
              title="Category Breakdown"
              description="Current month"
            />
            <CategoryBreakdown data={CATEGORY_DATA} />
          </GlassCard>

          {/* AI Insights */}
          <GlassCard>
            <SectionHeader
              title="AI Assistant"
              description="Department insights"
            />
            <div className="space-y-3">
              <AIInsightCard
                type="info"
                title="Approval efficiency"
                description={`You have ${pendingCount} pending approvals. Average review time is 2.3 days.`}
              />
              <AIInsightCard
                type={utilizationRate > 80 ? 'negative' : 'positive'}
                title="Budget status"
                description={`Engineering has used ${utilizationRate}% of annual budget. ${formatCurrency(budgetRemaining)} remaining.`}
              />
              <AIInsightCard
                type="positive"
                title="Team spending pattern"
                description="Software subscriptions account for 32% of department spend."
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AnimatedSection>
  )
}


