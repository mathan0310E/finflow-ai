﻿'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Loader2,
  Gauge,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/auth-store'
import {
  useAiInsights,
  useAiHealthScore,
  useAiSummary,
} from '../hooks/useAi'
import { AiChat } from '../components/AiChat'
import { AiInsightCard, type InsightType } from '../components/AiInsightCard'
import { AiAssistantPanel } from '../components/AiAssistantPanel'
import { formatCurrency } from '@/utils/format'

// 
// Page variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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

// 
// Helpers
// 

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-amber-500'
  if (score >= 20) return 'text-orange-500'
  return 'text-red-500'
}

function getHealthProgressColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 20) return 'Poor'
  return 'Critical'
}

// 
// Sub-components
// 

function HealthScoreGauge({ score }: { score: number }) {
  const percentage = Math.min(Math.max(score, 0), 100)

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Circular gauge */}
      <div className="relative mb-3 flex h-28 w-28 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress arc */}
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 52 * (1 - percentage / 100),
            }}
            transition={{ duration: 1.5, ease: 'easeOut' as const }}
            className={getHealthColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className={cn('text-3xl font-bold', getHealthColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
            / 100
          </span>
        </div>
      </div>
      <span
        className={cn(
          'rounded-full px-3 py-0.5 text-xs font-semibold',
          score >= 80 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
          score >= 60 && score < 80 && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
          score >= 40 && score < 60 && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
          score >= 20 && score < 40 && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
          score < 20 && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        )}
      >
        {getHealthLabel(score)}
      </span>
    </div>
  )
}

function InsightSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 
// Main Page Component
// 

/**
 * Full AI assistant page with a split layout: chat on the left,
 * insights and health score on the right.
 *
 * @example
 * ```tsx
 * <AiPage />
 * ```
 */
export function AiPage() {
  const user = useAuthStore((s) => s.user)
  const companyId = user?.companyId
  const [showPanel, setShowPanel] = useState(false)

  //  Data fetching 

  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const {
    data: insightsData,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useAiInsights(companyId)

  const {
    data: healthData,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useAiHealthScore(companyId)

  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useAiSummary(companyId, currentMonth)

  //  Transform insights to card format 

  const insightCards = useMemo(() => {
    if (!insightsData?.insights) return []

    return insightsData.insights.map((insight, idx) => {
      const typeMap: Record<string, InsightType> = {
        positive: 'trend',
        negative: 'warning',
        neutral: 'insight',
        warning: 'warning',
      }

      return {
        type: typeMap[insight.type] ?? 'insight' as InsightType,
        title: insight.title,
        description: insight.description,
        metric: insight.metric,
        change: insight.change,
        animationDelay: idx * 0.1,
      }
    })
  }, [insightsData])

  //  Render 

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col"
    >
      <PageHeader
        title="AI Assistant"
        description="Intelligent financial insights and expense management"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPanel(!showPanel)}
            className="hidden lg:flex"
          >
            <Bot className="mr-1.5 h-4 w-4" />
            {showPanel ? 'Hide Panel' : 'AI Panel'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchInsights()
              refetchHealth()
              refetchSummary()
            }}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/*  Left: Chat  */}
        <div className="flex flex-1 flex-col">
          <AiChat
            className="flex-1"
            maxHeight="100%"
            showQuickActions
          />
        </div>

        {/*  Right: Insights + Health + Summary  */}
        <div className="flex w-[400px] flex-col gap-6 overflow-y-auto pr-1">
          {/*  Spending Summary  */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      Monthly Summary
                    </div>
                  </CardTitle>
                  {summaryLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : summaryData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-center dark:bg-blue-950/50">
                        <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          Total
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(summaryData.totalSpent)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2 text-center dark:bg-emerald-950/50">
                        <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Approved
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(summaryData.totalApproved)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-2 text-center dark:bg-red-950/50">
                        <p className="text-[10px] font-medium text-red-600 dark:text-red-400">
                          Rejected
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(summaryData.totalRejected)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {summaryData.summary}
                    </p>
                    {summaryData.keyInsights.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Key Insights
                        </p>
                        <ul className="space-y-0.5">
                          {summaryData.keyInsights.map((insight, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No summary available
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/*  Health Score  */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-rose-500" />
                      Financial Health
                    </div>
                  </CardTitle>
                  {healthLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Skeleton className="h-28 w-28 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : healthData ? (
                  <div className="space-y-4">
                    <HealthScoreGauge score={healthData.score} />

                    {/* Metric breakdown */}
                    <div className="space-y-2">
                      {healthData.metrics.slice(0, 4).map((metric) => (
                        <div key={metric.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              {metric.label}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {metric.score}/{metric.maxScore}
                            </span>
                          </div>
                          <Progress
                            value={(metric.score / metric.maxScore) * 100}
                            className="h-1.5"
                            indicatorClassName={getHealthProgressColor(
                              (metric.score / metric.maxScore) * 100,
                            )}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Trend */}
                    <div className="flex items-center gap-1.5 text-xs">
                      {healthData.trend === 'improving' ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : healthData.trend === 'declining' ? (
                        <TrendingUp className="h-3.5 w-3.5 rotate-180 text-red-500" />
                      ) : (
                        <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          healthData.trend === 'improving' && 'text-emerald-600 dark:text-emerald-400',
                          healthData.trend === 'declining' && 'text-red-600 dark:text-red-400',
                          healthData.trend === 'stable' && 'text-gray-500 dark:text-gray-400',
                        )}
                      >
                        {healthData.trend === 'improving'
                          ? 'Improving'
                          : healthData.trend === 'declining'
                            ? 'Declining'
                            : 'Stable'}
                      </span>
                    </div>

                    {/* Recommendations */}
                    {healthData.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Recommendations
                        </p>
                        <ul className="space-y-0.5">
                          {healthData.recommendations.slice(0, 3).map((rec, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No health data available
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/*  AI Insights  */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      AI Insights
                    </div>
                  </CardTitle>
                  {insightsLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <InsightSkeleton />
                ) : insightCards.length > 0 ? (
                  <div className="space-y-2">
                    {insightCards.map((card, idx) => (
                      <AiInsightCard
                        key={`${card.title}-${idx}`}
                        type={card.type}
                        title={card.title}
                        description={card.description}
                        metric={card.metric}
                        change={card.change}
                        animationDelay={0}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No insights available yet. Try refreshing.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/*  Floating AI Panel  */}
        {showPanel && (
          <div className="hidden lg:block">
            <AiAssistantPanel companyId={companyId} defaultCollapsed={false} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
