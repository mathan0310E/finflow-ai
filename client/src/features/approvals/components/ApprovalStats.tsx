﻿'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  Hourglass,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Gauge,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatNumber } from '@/utils/format'
import type { ApprovalStatsResponse } from '@/features/approvals/hooks/useApprovals'

// 
// Types
// 

export interface ApprovalStatsProps {
  data?: ApprovalStatsResponse | null
  isLoading?: boolean
  className?: string
}

// 
// Animated number helper
// 

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const parts = useMemo(() => {
    const [int, dec] = value.toFixed(1).split('.')
    return { int, dec }
  }, [value])

  return (
    <span className="tabular-nums">
      <motion.span
        key={parts.int}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {parts.int}
      </motion.span>
      {parts.dec && (
        <>
          <motion.span
            key={`dot-${parts.dec}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            key={parts.dec}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            {parts.dec}
          </motion.span>
        </>
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

// 
// Stat card
// 

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  tooltip,
  trend,
  trendLabel,
  progress,
  progressLabel,
  isLoading,
}: {
  title: string
  value: React.ReactNode
  icon: React.ElementType
  color: string
  tooltip?: string
  trend?: 'up' | 'down' | 'stable'
  trendLabel?: string
  progress?: number
  progressLabel?: string
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          {progress !== undefined && (
            <div className="mt-2 h-2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          )}
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {title}
                </CardTitle>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {value}
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

                {progress !== undefined && (
                  <div className="mt-2 space-y-1">
                    <Progress value={progress} className="h-1.5" />
                    {progressLabel && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {progressLabel}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          {tooltip && (
            <TooltipContent side="bottom" className="max-w-[200px] text-xs">
              {tooltip}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}

// 
// Main component
// 

/**
 * Approval statistics dashboard cards.
 *
 * Displays:
 * - Pending approval count
 * - Approved this month
 * - Average approval time
 * - Approval rate percentage
 * - Bottleneck detection (which stage takes longest)
 *
 * @example
 * ```tsx
 * <ApprovalStats data={stats} isLoading={isLoading} />
 * ```
 */
export function ApprovalStats({
  data,
  isLoading,
  className,
}: ApprovalStatsProps) {
  const bottleneckStage = data?.bottleneckStage
  const bottleneckHours = data?.bottleneckAvgHours
  const approvalRate = data?.approvalRate ?? 0

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/*  Pending Count  */}
        <StatCard
          title="Pending Approvals"
          value={
            <AnimatedNumber value={data?.pendingCount ?? 0} />
          }
          icon={Hourglass}
          color="#F59E0B"
          tooltip="Expenses awaiting your approval action"
          isLoading={isLoading}
        />

        {/*  Approved This Month  */}
        <StatCard
          title="Approved This Month"
          value={
            <AnimatedNumber value={data?.approvedThisMonth ?? 0} />
          }
          icon={CheckCircle2}
          color="#10B981"
          tooltip="Total expenses you've approved this month"
          isLoading={isLoading}
        />

        {/*  Average Approval Time  */}
        <StatCard
          title="Avg. Approval Time"
          value={
            <span>
              <AnimatedNumber
                value={data?.averageApprovalTimeHours ?? 0}
                suffix="h"
              />
            </span>
          }
          icon={Clock}
          color="#6366F1"
          trend={
            (data?.averageApprovalTimeHours ?? 0) < 24
              ? 'down'
              : (data?.averageApprovalTimeHours ?? 0) >= 72
                ? 'up'
                : 'stable'
          }
          trendLabel={
            (data?.averageApprovalTimeHours ?? 0) < 24
              ? 'Fast turnaround'
              : (data?.averageApprovalTimeHours ?? 0) >= 72
                ? 'Needs attention'
                : 'On track'
          }
          tooltip="Average time from submission to final decision"
          isLoading={isLoading}
        />

        {/*  Approval Rate  */}
        <StatCard
          title="Approval Rate"
          value={
            <span>
              <AnimatedNumber value={approvalRate * 100} suffix="%" />
            </span>
          }
          icon={Gauge}
          color="#8B5CF6"
          progress={approvalRate}
          progressLabel={`${formatNumber(data?.approvedThisMonth ?? 0)} approved out of ${formatNumber((data?.approvedThisMonth ?? 0) / Math.max(approvalRate, 0.01))} total`}
          tooltip="Percentage of expenses approved vs rejected"
          isLoading={isLoading}
        />
      </div>

      {/*  Bottleneck section  */}
      {bottleneckStage && bottleneckHours != null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Bottleneck Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {bottleneckStage}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average wait time:{' '}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {bottleneckHours.toFixed(1)} hours
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>This stage is slowing down the approval process</span>
                </div>
              </div>

              {/*  Stage breakdown bars  */}
              {data?.stageBreakdown && data.stageBreakdown.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Stage Breakdown
                  </p>
                  {data.stageBreakdown.map((stage) => {
                    const maxHours = Math.max(
                      ...data.stageBreakdown!.map((s) => s.avgHours),
                      1,
                    )
                    const widthPercent = (stage.avgHours / maxHours) * 100
                    const isBottleneck = stage.stage === bottleneckStage

                    return (
                      <div key={stage.stage} className="space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={cn(
                              'font-medium',
                              isBottleneck
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-gray-600 dark:text-gray-400',
                            )}
                          >
                            {stage.label}
                          </span>
                          <span
                            className={cn(
                              isBottleneck
                                ? 'font-semibold text-amber-600 dark:text-amber-400'
                                : 'text-gray-500 dark:text-gray-400',
                            )}
                          >
                            {stage.avgHours.toFixed(1)}h avg
                          </span>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' as const }}
                            className={cn(
                              'h-full rounded-full',
                              isBottleneck
                                ? 'bg-amber-500'
                                : 'bg-blue-500 dark:bg-blue-400',
                            )}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
