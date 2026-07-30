﻿'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  BarChart3,
  FileText,
  Shield,
  GitBranch,
  Bot,
  ArrowUpRight,
  Wallet,
  PieChart,
  Activity,
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
  { id: 'EXP-1001', merchant: 'Amazon Web Services', category: 'Software', amount: 12450.00, date: 'Mar 15', status: 'approved', user: 'Eng - Sarah K.' },
  { id: 'EXP-1002', merchant: 'Marriott Hotel', category: 'Accommodation', amount: 3200.00, date: 'Mar 14', status: 'pending', user: 'Sales - Mike R.' },
  { id: 'EXP-1003', merchant: 'Delta Airlines', category: 'Travel', amount: 5890.00, date: 'Mar 12', status: 'finance_approved', user: 'Mktg - Lisa T.' },
  { id: 'EXP-1004', merchant: 'WeWork', category: 'Utilities', amount: 8400.00, date: 'Mar 11', status: 'approved', user: 'Ops - James W.' },
  { id: 'EXP-1005', merchant: 'Google Cloud', category: 'Software', amount: 21300.00, date: 'Mar 10', status: 'pending', user: 'Eng - David C.' },
  { id: 'EXP-1006', merchant: 'Salesforce', category: 'Software', amount: 18000.00, date: 'Mar 08', status: 'approved', user: 'Sales - Anna P.' },
  { id: 'EXP-1007', merchant: 'Tech Conference 2025', category: 'Training', amount: 12500.00, date: 'Mar 07', status: 'pending', user: 'Eng - Multiple' },
]

const DEPARTMENT_SPEND = [
  { name: 'Engineering', amount: 158000, budget: 200000, color: '#6366F1' },
  { name: 'Sales', amount: 95000, budget: 150000, color: '#22C55E' },
  { name: 'Marketing', amount: 72000, budget: 100000, color: '#F97316' },
  { name: 'Operations', amount: 43000, budget: 80000, color: '#8B5CF6' },
  { name: 'HR', amount: 18000, budget: 30000, color: '#EC4899' },
  { name: 'Finance', amount: 12000, budget: 25000, color: '#14B8A6' },
]

const MONTHLY_TREND = [
  { month: 'Oct', amount: 245000 },
  { month: 'Nov', amount: 298000 },
  { month: 'Dec', amount: 185000 },
  { month: 'Jan', amount: 312000 },
  { month: 'Feb', amount: 278000 },
  { month: 'Mar', amount: 342000 },
]

const PENDING_CEO_APPROVALS: ExpenseRow[] = [
  { id: 'EXP-1008', merchant: 'New Office Lease', category: 'Utilities', amount: 45000.00, date: 'Mar 16', status: 'pending', user: 'Ops - James W.' },
  { id: 'EXP-1009', merchant: 'Enterprise Software Suite', category: 'Software', amount: 89000.00, date: 'Mar 15', status: 'pending', user: 'CTO - Rachel G.' },
  { id: 'EXP-1010', merchant: 'Annual Marketing Campaign', category: 'Marketing', amount: 125000.00, date: 'Mar 14', status: 'pending', user: 'CMO - David L.' },
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
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
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
            className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-200 hover:from-blue-600 hover:to-indigo-600"
            style={{ minHeight: 20 }}
          >
            {/* Tooltip */}
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
// Department Budget Bars
// 

function DepartmentBudgetBars({
  data,
}: {
  data: { name: string; amount: number; budget: number; color: string }[]
}) {
  return (
    <div className="space-y-4">
      {data.map((dept, i) => {
        const pct = Math.round((dept.amount / dept.budget) * 100)
        const isOverBudget = pct > 90
        return (
          <motion.div
            key={dept.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: dept.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dept.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(dept.amount)}
                </span>
                <span className={cn(
                  'text-xs',
                  isOverBudget ? 'text-red-500' : 'text-gray-400 dark:text-gray-500',
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
                  isOverBudget ? 'bg-red-500' : '',
                )}
                style={{ backgroundColor: isOverBudget ? undefined : dept.color }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 
// Pending Approvals List (CEO-specific)
// 

function PendingCEOApprovals({
  approvals,
}: {
  approvals: ExpenseRow[]
}) {
  return (
    <div className="space-y-3">
      {approvals.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white/50 p-3 transition-all hover:shadow-sm dark:border-gray-800/60 dark:bg-gray-800/50"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-400">{item.id}</span>
              <Badge variant="warning" className="text-[10px]">CEO Approval</Badge>
            </div>
            <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
              {item.merchant}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.user} &middot; {item.date}
            </p>
          </div>
          <div className="ml-4 text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(item.amount)}
            </p>
            <Link
              href={`/approvals/${item.id}`}
              className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Review
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 
// CEO Dashboard Page
// 

export default function CEODashboard() {
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

  const totalSpend = MONTHLY_TREND[MONTHLY_TREND.length - 1].amount
  const totalBudget = 585000
  const budgetRemaining = totalBudget - totalSpend
  const utilizationRate = Math.round((totalSpend / totalBudget) * 100)
  const headcount = 247

  return (
    <AnimatedSection className="space-y-6">
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          CEO Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Company-wide financial overview and strategic insights.
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Spend (MTD)"
          value={formatCurrency(totalSpend)}
          change="+12.5% vs last month"
          changeType="positive"
          icon={Wallet}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard
          title="Budget Utilization"
          value={`${utilizationRate}%`}
          change={formatCurrency(budgetRemaining) + ' remaining'}
          changeType={utilizationRate > 85 ? 'negative' : 'positive'}
          icon={Activity}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          title="Pending Approvals"
          value={String(PENDING_CEO_APPROVALS.length + 8)}
          change="3 need CEO review"
          changeType="negative"
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Headcount"
          value={String(headcount)}
          change="+12 this quarter"
          changeType="positive"
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
              title="Company Spend Trend"
              description="Monthly expenditure overview"
            />
            <div className="h-52 pt-4">
              <MiniBarChart data={MONTHLY_TREND} />
            </div>
          </GlassCard>

          {/* Department budgets */}
          <GlassCard>
            <SectionHeader
              title="Department Budget vs. Spend"
              description="Current fiscal year"
            />
            <DepartmentBudgetBars data={DEPARTMENT_SPEND} />
          </GlassCard>

          {/* Recent company expenses */}
          <GlassCard>
            <SectionHeader
              title="Notable Expenses"
              description="High-value expenses this month"
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
          {/* CEO Approvals */}
          <GlassCard>
            <SectionHeader
              title="Needs Your Approval"
              description={`${PENDING_CEO_APPROVALS.length} items requiring CEO sign-off`}
              action={
                <Link href="/approvals">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    All
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              }
            />
            <PendingCEOApprovals approvals={PENDING_CEO_APPROVALS} />
          </GlassCard>

          {/* Quick actions */}
          <GlassCard>
            <SectionHeader title="Quick Actions" />
            <div className="grid gap-2">
              <Link href="/approvals">
                <QuickAction
                  icon={CheckCircle2}
                  label="Review Approvals"
                  gradient="from-blue-600 to-indigo-600"
                />
              </Link>
              <Link href="/analytics">
                <QuickAction
                  icon={BarChart3}
                  label="View Analytics"
                  gradient="from-emerald-600 to-teal-600"
                />
              </Link>
              <Link href="/reports">
                <QuickAction
                  icon={FileText}
                  label="Financial Reports"
                  gradient="from-violet-600 to-purple-600"
                />
              </Link>
              <Link href="/company">
                <QuickAction
                  icon={Building2}
                  label="Company Settings"
                  gradient="from-amber-500 to-orange-600"
                />
              </Link>
            </div>
          </GlassCard>

          {/* AI Insights */}
          <GlassCard>
            <SectionHeader
              title="AI Executive Insights"
              description="Powered by FinFlow AI"
            />
            <div className="space-y-3">
              <AIInsightCard
                type="positive"
                title="Cost optimization opportunity"
                description="Consolidating cloud services across AWS, GCP, and Azure could save an estimated $28,000/year."
              />
              <AIInsightCard
                type="negative"
                title="Engineering budget at 80%"
                description="Engineering department has used 80% of annual budget with 3 months remaining."
              />
              <AIInsightCard
                type="info"
                title="Travel spending trend"
                description="Q1 travel expenses are 25% higher than Q4. Consider reviewing travel policy."
              />
              <AIInsightCard
                type="positive"
                title="Approval efficiency"
                description="Average approval time decreased by 2.5 days this quarter."
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </AnimatedSection>
  )
}
