﻿﻿'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  Inbox,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime } from '@/utils/format'
import { NOTIFICATION_TYPES_MAP } from '@/constants'
import type { Notification } from '@/types'

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const notificationVariants = {
  hidden: { opacity: 0, x: -20, height: 0 } as const,
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
  exit: {
    opacity: 0,
    x: 20,
    height: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  } as const,
}

// 
// Mock data
// 

const MOCK_NOTIFICATIONS: Notification[] = [
  // Today
  { id: 'n1', companyId: 'c1', userId: 'u1', type: 'expense_approved', title: 'Expense Approved', message: 'Your lunch meeting expense of $45.00 has been approved.', read: false, createdAt: new Date(Date.now() - 1_800_000) },
  { id: 'n2', companyId: 'c1', userId: 'u1', type: 'expense_submitted', title: 'New Expense Submitted', message: 'Alice submitted a travel expense of $320.00 for review.', read: false, createdAt: new Date(Date.now() - 3_600_000) },
  { id: 'n3', companyId: 'c1', userId: 'u1', type: 'budget_alert', title: 'Budget Alert', message: 'Marketing department has used 85% of its monthly budget.', read: false, createdAt: new Date(Date.now() - 5_400_000) },
  // Yesterday
  { id: 'n4', companyId: 'c1', userId: 'u1', type: 'expense_rejected', title: 'Expense Rejected', message: 'Your software subscription expense of $299.00 was rejected. Reason: Missing invoice.', read: true, createdAt: new Date(Date.now() - 86_400_000) },
  { id: 'n5', companyId: 'c1', userId: 'u1', type: 'approval_reminder', title: 'Approval Reminder', message: 'You have 3 pending expense approvals waiting for your review.', read: true, createdAt: new Date(Date.now() - 90_000_000) },
  { id: 'n6', companyId: 'c1', userId: 'u1', type: 'new_user_joined', title: 'New Team Member', message: 'Frank Designer has joined the Design department.', read: false, createdAt: new Date(Date.now() - 100_000_000) },
  // This week
  { id: 'n7', companyId: 'c1', userId: 'u1', type: 'expense_changes_requested', title: 'Changes Requested', message: 'Please update the receipt for your client dinner expense.', read: true, createdAt: new Date(Date.now() - 172_800_000) },
  { id: 'n8', companyId: 'c1', userId: 'u1', type: 'policy_violation', title: 'Policy Violation', message: 'Expense #1024 flagged: Amount exceeds per-meal limit of $75.', read: true, createdAt: new Date(Date.now() - 200_000_000) },
  { id: 'n9', companyId: 'c1', userId: 'u1', type: 'report_ready', title: 'Report Ready', message: 'Your Q2 Expense Summary report is ready to view.', read: true, createdAt: new Date(Date.now() - 250_000_000) },
  { id: 'n10', companyId: 'c1', userId: 'u1', type: 'system_update', title: 'System Update', message: 'FinFlow AI will undergo maintenance on Saturday, 2 AM EST.', read: false, createdAt: new Date(Date.now() - 300_000_000) },
  // Earlier
  { id: 'n11', companyId: 'c1', userId: 'u1', type: 'expense_reimbursed', title: 'Expense Reimbursed', message: '$1,250.00 has been deposited to your account for expense #089.', read: true, createdAt: new Date(Date.now() - 700_000_000) },
  { id: 'n12', companyId: 'c1', userId: 'u1', type: 'role_changed', title: 'Role Updated', message: 'Your role has been updated to Department Manager.', read: true, createdAt: new Date(Date.now() - 1_200_000_000) },
  { id: 'n13', companyId: 'c1', userId: 'u1', type: 'company_settings_updated', title: 'Settings Changed', message: 'Company expense policies have been updated by the admin.', read: true, createdAt: new Date(Date.now() - 1_500_000_000) },
]

// 
// Date grouping helper
// 

type DateGroup = 'today' | 'yesterday' | 'this_week' | 'earlier'

function getDateGroup(date: Date): DateGroup {
  const now = Date.now()
  const diff = now - date.getTime()
  const oneDay = 86_400_000
  const oneWeek = 604_800_000

  if (diff < oneDay) return 'today'
  if (diff < 2 * oneDay) return 'yesterday'
  if (diff < oneWeek) return 'this_week'
  return 'earlier'
}

const DATE_GROUP_LABELS: Record<DateGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  earlier: 'Earlier',
}

const DATE_GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'this_week', 'earlier']

// 
// Sub-components
// 

function NotificationItem({
  notification,
  onMarkRead,
  onClick,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onClick: (notification: Notification) => void
  onDelete: (id: string) => void
}) {
  const typeConfig = NOTIFICATION_TYPES_MAP[notification.type]

  return (
    <motion.div
      variants={notificationVariants}
      layout
      className={cn(
        'group relative flex cursor-pointer items-start gap-4 rounded-xl p-4 transition-all duration-200',
        notification.read
          ? 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50'
          : 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30',
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          notification.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900/50',
        )}
      >
        <span className="text-lg">{typeConfig?.icon ?? '🔔'}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm truncate',
                notification.read
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'font-semibold text-gray-900 dark:text-white',
              )}
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {notification.message}
            </p>
          </div>

          {/* Unread dot */}
          {!notification.read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(notification.createdAt)}
          </span>
          {typeConfig?.label && (
            <>
              <span>·</span>
              <span>{typeConfig.label}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-3 top-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(notification.id)
            }}
            title="Mark as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(notification.id)
          }}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl p-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 
// Main Notifications Page
// 

export function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')

  //  Computed 

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const filteredNotifications = useMemo(() => {
    const items = activeFilter === 'unread' ? notifications.filter((n) => !n.read) : notifications
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [notifications, activeFilter])

  const groupedNotifications = useMemo(() => {
    const groups: Record<DateGroup, Notification[]> = {
      today: [],
      yesterday: [],
      this_week: [],
      earlier: [],
    }
    for (const n of filteredNotifications) {
      const group = getDateGroup(n.createdAt)
      groups[group].push(n)
    }
    return groups
  }, [filteredNotifications])

  //  Handlers 

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast({ title: 'All marked as read', description: 'All notifications have been marked as read.', variant: 'success' })
  }, [toast])

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleClick = useCallback((notification: Notification) => {
    // Navigate to related resource based on notification type
    // In a real app, use router.push()
    const paths: Record<string, string> = {
      expense_submitted: '/expenses',
      expense_approved: '/expenses',
      expense_rejected: '/expenses',
      expense_changes_requested: '/expenses',
      expense_reimbursed: '/expenses',
      approval_reminder: '/approvals',
      budget_alert: '/reports',
      policy_violation: '/expenses',
      report_ready: '/reports',
      new_user_joined: '/company',
      role_changed: '/settings',
      company_settings_updated: '/settings',
    }
    const path = paths[notification.type] ?? '/dashboard'

    // Mark as read when clicked
    if (!notification.read) {
      handleMarkRead(notification.id)
    }

    // In a real app: router.push(path)
    toast({
      title: 'Navigate to',
      description: `Would navigate to ${path}`,
    })
  }, [handleMarkRead, toast])

  //  Render 

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Notifications"
        description="Stay updated with the latest activity"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </PageHeader>

      {/*  Filter tabs  */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeFilter === 'all'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            )}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeFilter === 'unread'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            )}
            onClick={() => setActiveFilter('unread')}
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1.5 h-4 min-w-[18px] px-1 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/*  Notification list  */}
      <ScrollArea className="h-[calc(100vh-280px)] pr-2">
        {isLoading ? (
          <NotificationSkeleton />
        ) : filteredNotifications.length > 0 ? (
          <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-6">
            {DATE_GROUP_ORDER.map((group) => {
              const items = groupedNotifications[group]
              if (items.length === 0) return null
              return (
                <div key={group}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {DATE_GROUP_LABELS[group]}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                      {items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={handleMarkRead}
                          onClick={handleClick}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {activeFilter === 'unread'
                ? 'You\'re all caught up! New notifications will appear here.'
                : 'When you receive notifications, they will appear here grouped by date.'}
            </p>
          </motion.div>
        )}
      </ScrollArea>
    </motion.div>
  )
}
