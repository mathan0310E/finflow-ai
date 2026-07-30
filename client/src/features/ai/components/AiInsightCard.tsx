'use client'

import { motion } from 'framer-motion'
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 
// Types
// 

export type InsightType = 'insight' | 'trend' | 'warning' | 'action'

export interface AiInsightCardProps {
  /** The type of insight, which determines the icon and color scheme. */
  type: InsightType
  /** The title of the insight. */
  title: string
  /** A short description or body text. */
  description: string
  /** Optional metric value to display prominently. */
  metric?: string
  /** Optional change percentage (positive = up, negative = down). */
  change?: number
  /** Optional action button label. When omitted, no action button is shown. */
  actionLabel?: string
  /** Callback when the action button is clicked. */
  onAction?: () => void
  /** Optional class name for the root element. */
  className?: string
  /** Optional delay for the entrance animation (seconds). */
  animationDelay?: number
}

// 
// Style configuration per type
// 

interface InsightStyle {
  icon: LucideIcon
  gradient: string
  iconBg: string
  iconColor: string
  borderColor: string
  badgeBg: string
  badgeText: string
}

const INSIGHT_STYLES: Record<InsightType, InsightStyle> = {
  insight: {
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200/50 dark:border-amber-800/50',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
  },
  trend: {
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200/50 dark:border-red-800/50',
    badgeBg: 'bg-red-100 dark:bg-red-900/30',
    badgeText: 'text-red-700 dark:text-red-300',
  },
  action: {
    icon: Lightbulb,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
  },
}

// 
// Animation variants
// 

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

// 
// Component
// 

/**
 * An insight card widget with animated entrance, contextual icon,
 * title, description, optional metric, and an action button.
 *
 * @example
 * ```tsx
 * <AiInsightCard
 *   type="insight"
 *   title="Spending increased"
 *   description="Travel expenses are up 23% this month"
 *   metric="$12,430"
 *   change={23}
 *   actionLabel="View Details"
 *   onAction={() => {}}
 *   animationDelay={0.1}
 * />
 * ```
 */
export function AiInsightCard({
  type,
  title,
  description,
  metric,
  change,
  actionLabel,
  onAction,
  className,
  animationDelay = 0,
}: AiInsightCardProps) {
  const styles = INSIGHT_STYLES[type]
  const Icon = styles.icon

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={animationDelay}
      className={cn('group', className)}
    >
      <Card
        className={cn(
          'overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg',
          styles.borderColor,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/*  Icon  */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                styles.iconBg,
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconColor)} />
            </div>

            {/*  Content  */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </h4>
                {change !== undefined && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      change >= 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        'h-3 w-3',
                        change < 0 && 'rotate-180 transform',
                      )}
                    />
                    {Math.abs(change)}%
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {description}
              </p>

              {/*  Metric  */}
              {metric && (
                <p className="mt-1.5 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  {metric}
                </p>
              )}

              {/*  Action  */}
              {actionLabel && onAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAction}
                  className={cn(
                    'mt-2 h-auto px-0 text-xs font-medium hover:bg-transparent',
                    type === 'insight' && 'text-amber-600 hover:text-amber-700 dark:text-amber-400',
                    type === 'trend' && 'text-blue-600 hover:text-blue-700 dark:text-blue-400',
                    type === 'warning' && 'text-red-600 hover:text-red-700 dark:text-red-400',
                    type === 'action' && 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  {actionLabel}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
