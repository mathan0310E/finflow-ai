'use client'

import { motion } from 'framer-motion'
import {
  GitBranch,
  Users,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
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

const DEPARTMENTS = [
  {
    name: 'Engineering',
    head: 'Rachel Green',
    members: 48,
    budget: formatCurrency(500000),
    spent: formatCurrency(378000),
    utilization: 76,
    trend: 'up' as const,
  },
  {
    name: 'Marketing',
    head: 'David Lee',
    members: 24,
    budget: formatCurrency(250000),
    spent: formatCurrency(212000),
    utilization: 85,
    trend: 'up' as const,
  },
  {
    name: 'Sales',
    head: 'Sarah Chen',
    members: 32,
    budget: formatCurrency(300000),
    spent: formatCurrency(195000),
    utilization: 65,
    trend: 'down' as const,
  },
  {
    name: 'Operations',
    head: 'James Wilson',
    members: 18,
    budget: formatCurrency(180000),
    spent: formatCurrency(145000),
    utilization: 81,
    trend: 'up' as const,
  },
  {
    name: 'Human Resources',
    head: 'Emily Watson',
    members: 12,
    budget: formatCurrency(80000),
    spent: formatCurrency(52000),
    utilization: 65,
    trend: 'down' as const,
  },
  {
    name: 'Finance',
    head: 'Michael Torres',
    members: 15,
    budget: formatCurrency(120000),
    spent: formatCurrency(89000),
    utilization: 74,
    trend: 'up' as const,
  },
  {
    name: 'Design',
    head: 'Anna Petrova',
    members: 14,
    budget: formatCurrency(95000),
    spent: formatCurrency(72000),
    utilization: 76,
    trend: 'up' as const,
  },
  {
    name: 'Customer Support',
    head: 'Tom Baker',
    members: 28,
    budget: formatCurrency(110000),
    spent: formatCurrency(81000),
    utilization: 74,
    trend: 'down' as const,
  },
]

export default function DepartmentsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Departments"
        description="Manage departments, teams, and budgets"
      >
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </PageHeader>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Departments',
            value: '8',
            change: 'Active',
            direction: 'neutral' as const,
          },
          {
            label: 'Total Headcount',
            value: '191',
            change: '+14 this quarter',
            direction: 'up' as const,
          },
          {
            label: 'Combined Budget',
            value: formatCurrency(1635000),
            change: 'FY 2025',
            direction: 'neutral' as const,
          },
          {
            label: 'Avg Utilization',
            value: '74.5%',
            change: '+3.2% vs last quarter',
            direction: 'up' as const,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              {stat.direction === 'up' && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              )}
              {stat.direction === 'down' && (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.direction === 'up' &&
                    'text-emerald-600 dark:text-emerald-400',
                  stat.direction === 'down' &&
                    'text-red-600 dark:text-red-400',
                  stat.direction === 'neutral' &&
                    'text-gray-500 dark:text-gray-400',
                )}
              >
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Department cards grid */}
      <motion.div
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {DEPARTMENTS.map((dept, i) => (
          <motion.div
            key={dept.name}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5 dark:border-gray-800/60 dark:bg-gray-900/80"
          >
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                View
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              {dept.name}
            </h3>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {dept.members} members &middot; Head: {dept.head}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Budget: {dept.budget}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Spent: {dept.spent}
                </span>
              </div>
            </div>

            {/* Utilization bar */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  Utilization
                </span>
                <div className="flex items-center gap-1">
                  {dept.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                  )}
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      dept.utilization > 80
                        ? 'text-red-500'
                        : 'text-gray-500 dark:text-gray-400',
                    )}
                  >
                    {dept.utilization}%
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.utilization}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + i * 0.04,
                    ease: 'easeOut' as const,
                  }}
                  className={cn(
                    'h-full rounded-full',
                    dept.utilization > 80
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500',
                  )}
                />
              </div>
            </div>

            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50/30 via-transparent to-violet-50/30 dark:from-indigo-950/10 dark:to-violet-950/10" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
