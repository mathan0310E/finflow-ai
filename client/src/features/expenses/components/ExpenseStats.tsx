﻿'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  BarChart3,
  PieChart,
  Wallet,
} from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/format'
import { CHART_COLORS_HEX } from '@/constants'
import type { ExpenseStatsResponse } from '@/features/expenses/hooks/useExpenses'

// 
// Types
// 

export interface ExpenseStatsProps {
  data?: ExpenseStatsResponse | null
  isLoading?: boolean
  className?: string
}

// 
// Animation helpers
// 

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const display = useMemo(() => {
    const str = value.toFixed(2)
    return { int: str.split('.')[0], dec: str.includes('.') ? '.' + str.split('.')[1] : '' }
  }, [value])

  return (
    <span className="tabular-nums">
      {prefix}
      <motion.span
        key={display.int}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {display.int}
      </motion.span>
      {display.dec && (
        <motion.span
          key={display.dec}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {display.dec}
        </motion.span>
      )}
      {suffix}
    </span>
  )
}

// 
// Stat Card
// 

function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  trendLabel,
  color,
  isLoading,
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'stable'
  trendLabel?: string
  color: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </CardTitle>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: color + '20', color }}
          >
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </div>
          {trend && trendLabel && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
              )}
              <span
                className={cn(
                  trend === 'up' && 'text-green-600 dark:text-green-400',
                  trend === 'down' && 'text-red-600 dark:text-red-400',
                  trend === 'stable' && 'text-gray-500 dark:text-gray-400',
                )}
              >
                {trendLabel}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 
// Main Component
// 

export function ExpenseStats({ data, isLoading, className }: ExpenseStatsProps) {
  const breakdown = data?.categoryBreakdown ?? []

  return (
    <div className={cn('space-y-4', className)}>
      {/*  Stat cards grid  */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Spent"
          value={data?.totalSpent ?? 0}
          prefix="$"
          icon={DollarSign}
          trend={data?.trend.direction}
          trendLabel={
            data?.trend.direction === 'up'
              ? data.trend.percentage.toFixed(1) + '% vs last period'
              : data?.trend.direction === 'down'
                ? data.trend.percentage.toFixed(1) + '% vs last period'
                : 'Same as last period'
          }
          color="#6366F1"
          isLoading={isLoading}
        />

        <StatCard
          title="Average Expense"
          value={data?.averageExpense ?? 0}
          prefix="$"
          icon={Wallet}
          color="#8B5CF6"
          isLoading={isLoading}
        />

        <StatCard
          title="Expense Count"
          value={data?.expenseCount ?? 0}
          icon={Receipt}
          color="#F43F5E"
          isLoading={isLoading}
        />

        <StatCard
          title="Categories Used"
          value={breakdown.length}
          icon={BarChart3}
          color="#F97316"
          isLoading={isLoading}
        />
      </div>

      {/*  Category breakdown chart  */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <PieChart className="h-4 w-4" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            ) : breakdown.length > 0 ? (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/*  Pie chart  */}
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {breakdown.map((_, index) => (
                          <Cell
                            key={index}
                            fill={CHART_COLORS_HEX[index % CHART_COLORS_HEX.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/*  Legend  */}
                <div className="flex-1 space-y-2 self-stretch">
                  {breakdown.slice(0, 8).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS_HEX[index % CHART_COLORS_HEX.length],
                          }}
                        />
                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                          {formatPercentage(item.percentage / 100)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {breakdown.length > 8 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                      +{breakdown.length - 8} more categories
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChart className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No expense data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
