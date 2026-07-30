'use client'

import { motion } from 'framer-motion'
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Shield,
  User,
  FileText,
  Settings,
  LogIn,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

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

interface AuditEntry {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  icon: typeof Shield
}

const AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'AUD-001',
    action: 'User Login',
    user: 'Sarah Chen',
    target: 'sarah.chen@finflow.ai',
    timestamp: '2025-03-15 09:23:14',
    severity: 'info',
    icon: LogIn,
  },
  {
    id: 'AUD-002',
    action: 'Expense Approved',
    user: 'Mike Reynolds',
    target: 'EXP-1004 - $12,450.00',
    timestamp: '2025-03-15 09:15:42',
    severity: 'info',
    icon: FileText,
  },
  {
    id: 'AUD-003',
    action: 'Budget Modified',
    user: 'Lisa Torres',
    target: 'Marketing Budget Q2 2025',
    timestamp: '2025-03-15 08:55:30',
    severity: 'warning',
    icon: Settings,
  },
  {
    id: 'AUD-004',
    action: 'User Role Changed',
    user: 'Admin System',
    target: 'john.doe@finflow.ai: Employee → Dept Manager',
    timestamp: '2025-03-14 17:30:00',
    severity: 'warning',
    icon: User,
  },
  {
    id: 'AUD-005',
    action: 'Expense Deleted',
    user: 'Alice Morrison',
    target: 'EXP-0982 - $345.00',
    timestamp: '2025-03-14 16:12:20',
    severity: 'critical',
    icon: FileText,
  },
  {
    id: 'AUD-006',
    action: 'Company Settings Updated',
    user: 'David Clark',
    target: 'Approval threshold changed to $25,000',
    timestamp: '2025-03-14 15:45:10',
    severity: 'critical',
    icon: Settings,
  },
  {
    id: 'AUD-007',
    action: 'New Vendor Added',
    user: 'Finance System',
    target: 'Vendor: CloudCorp Inc.',
    timestamp: '2025-03-14 14:20:33',
    severity: 'info',
    icon: Shield,
  },
  {
    id: 'AUD-008',
    action: 'User Logout',
    user: 'Emily Watson',
    target: 'Session duration: 4h 12m',
    timestamp: '2025-03-14 13:05:00',
    severity: 'info',
    icon: LogIn,
  },
]

const severityStyles = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  critical:
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function AuditLogsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Audit Logs"
        description="System-wide audit trail and security events"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Search bar */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search audit logs by user, action, or target..."
            className="h-11 rounded-xl border-gray-200/60 bg-white/80 pl-10 text-sm backdrop-blur-sm placeholder:text-gray-400 dark:border-gray-800/60 dark:bg-gray-900/80"
          />
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Events (30d)', value: '1,284' },
          { label: 'Critical Events', value: '23', accent: true },
          { label: 'Unique Users', value: '47' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={cn(
              'rounded-2xl border border-gray-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80',
              stat.accent &&
                'border-red-200/60 dark:border-red-800/40',
            )}
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-bold tracking-tight',
                stat.accent
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white',
              )}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Audit log table */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
                <th className="px-6 pb-3 pt-5">Event</th>
                <th className="pb-3 pr-6 pt-5">User</th>
                <th className="pb-3 pr-6 pt-5">Target</th>
                <th className="pb-3 pr-6 pt-5">Timestamp</th>
                <th className="pb-3 pr-6 pt-5 text-right">Severity</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((entry, i) => {
                const Icon = entry.icon
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="border-b border-gray-100/80 transition-colors hover:bg-gray-50/50 dark:border-gray-800/40 dark:hover:bg-gray-800/30"
                  >
                    <td className="flex items-center gap-3 px-6 py-3.5">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          entry.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : entry.severity === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            entry.severity === 'critical'
                              ? 'text-red-600 dark:text-red-400'
                              : entry.severity === 'warning'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-blue-600 dark:text-blue-400',
                          )}
                        />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <span className="text-gray-700 dark:text-gray-300">
                        {entry.user}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <span className="text-gray-500 dark:text-gray-400">
                        {entry.target}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6">
                      <span className="font-mono text-xs text-gray-400">
                        {entry.timestamp}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                          severityStyles[entry.severity],
                        )}
                      >
                        {entry.severity}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between border-t border-gray-200/60 px-6 py-4 dark:border-gray-800/60">
          <p className="text-xs text-gray-400">
            Showing 8 of 1,284 events
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
