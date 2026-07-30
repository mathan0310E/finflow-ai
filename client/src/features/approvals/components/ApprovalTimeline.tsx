﻿﻿'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  CircleDot,
  MessageSquare,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/utils/format'
import { getRoleLabel } from '@/utils/helpers'
import type { ApprovalChainEntry, User, UserRole } from '@/types'

// 
// Types
// 

export interface ApprovalTimelineProps {
  /** The ordered approval chain entries. */
  chain: ApprovalChainEntry[]

  /** A map of userId → User for resolving names and avatars. */
  userMap?: Record<string, Pick<User, 'displayName' | 'photoURL'>>

  className?: string
}

// 
// Status config
// 

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-700',
    label: 'Pending',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    label: 'Rejected',
  },
  changes_requested: {
    icon: RefreshCw,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    label: 'Changes Requested',
  },
} as const

function getStatusConfig(action: ApprovalChainEntry['action']) {
  return STATUS_CONFIG[action] ?? STATUS_CONFIG.pending
}

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

// 
// Component
// 

/**
 * Vertical approval timeline showing each stage in the chain.
 *
 * Each step displays:
 * - Status indicator icon with colour
 * - The approver's role
 * - User avatar + name (when resolved via `userMap`)
 * - Timestamp
 * - Optional comment
 * - Connecting lines between stages
 *
 * @example
 * ```tsx
 * <ApprovalTimeline
 *   chain={expense.approvalChain}
 *   userMap={{ 'abc': { displayName: 'Alice', photoURL: '...' } }}
 * />
 * ```
 */
export function ApprovalTimeline({
  chain,
  userMap = {},
  className,
}: ApprovalTimelineProps) {
  if (chain.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CircleDot className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No approval chain entries yet
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('relative', className)}
    >
      {/*  Vertical connecting line  */}
      <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-0">
        {chain.map((entry, index) => {
          const config = getStatusConfig(entry.action)
          const Icon = config.icon
          const user = entry.userId ? userMap[entry.userId] : undefined
          const isLast = index === chain.length - 1

          return (
            <motion.div
              key={`${entry.level}-${entry.role}`}
              variants={itemVariants}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {/*  Status indicator dot  */}
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                  className={cn(
                    'flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 shadow-sm',
                    config.bg,
                    config.border,
                  )}
                >
                  <Icon className={cn('h-4 w-4', config.color)} />
                </motion.div>

                {/*  Connecting line (hidden for last)  */}
                {!isLast && (
                  <div className="absolute left-1/2 top-[38px] h-[calc(100%-38px)] w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>

              {/*  Content card  */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700/50 dark:bg-gray-800/50">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getRoleLabel(entry.role)}
                      </p>
                      {user && (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            {user.photoURL ? (
                              <AvatarImage src={user.photoURL} alt={user.displayName} />
                            ) : (
                              <AvatarFallback className="text-[9px] font-medium">
                                {user.displayName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.displayName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    {entry.timestamp && (
                      <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(entry.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Comment bubble */}
                  {entry.comment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                      className="mt-2 flex items-start gap-1.5 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50"
                    >
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.comment}
                      </p>
                    </motion.div>
                  )}

                  {/* Action label badge */}
                  <div className="mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        config.bg,
                        config.color,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </span>

                    {!entry.timestamp && entry.action === 'pending' && (
                      <span className="ml-2 text-xs text-gray-400">
                        Awaiting action
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
