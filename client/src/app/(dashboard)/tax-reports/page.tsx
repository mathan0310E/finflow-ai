'use client'

import { motion } from 'framer-motion'
import {
  FileSpreadsheet,
  Download,
  FileText,
  Calendar,
  Shield,
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

const TAX_PERIODS = [
  { quarter: 'Q1 2025', period: 'Jan - Mar 2025', status: 'upcoming', dueDate: 'Apr 15, 2025' },
  { quarter: 'Q4 2024', period: 'Oct - Dec 2024', status: 'filed', dueDate: 'Jan 15, 2025', filedDate: 'Jan 12, 2025' },
  { quarter: 'Q3 2024', period: 'Jul - Sep 2024', status: 'filed', dueDate: 'Oct 15, 2024', filedDate: 'Oct 10, 2024' },
  { quarter: 'Q2 2024', period: 'Apr - Jun 2024', status: 'filed', dueDate: 'Jul 15, 2024', filedDate: 'Jul 08, 2024' },
]

const SUMMARY_METRICS = [
  { label: 'Total Taxable Spend', value: formatCurrency(4280000) },
  { label: 'GST Reclaimable', value: formatCurrency(385200) },
  { label: 'Avg Effective Rate', value: '9.0%' },
  { label: 'Compliance Score', value: '98.5%' },
]

export default function TaxReportsPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Tax Reports"
        description="Tax compliance reports and filings"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            FY 2025
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_METRICS.map((metric, i) => (
          <motion.div
            key={metric.label}
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/80"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tax periods table */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/80"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filing Periods
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Quarterly tax filing schedule and status
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/60 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
                <th className="pb-3 pr-6">Quarter</th>
                <th className="pb-3 pr-6">Period</th>
                <th className="pb-3 pr-6">Status</th>
                <th className="pb-3 pr-6">Due Date</th>
                <th className="pb-3 pr-6">Filed Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TAX_PERIODS.map((period, i) => (
                <motion.tr
                  key={period.quarter}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="border-b border-gray-100/80 transition-colors hover:bg-gray-50/50 dark:border-gray-800/40 dark:hover:bg-gray-800/30"
                >
                  <td className="py-4 pr-6">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {period.quarter}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span className="text-gray-500 dark:text-gray-400">
                      {period.period}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                        period.status === 'filed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                      )}
                    >
                      {period.status === 'filed' ? 'Filed' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span className="text-gray-500 dark:text-gray-400">
                      {period.dueDate}
                    </span>
                  </td>
                  <td className="py-4 pr-6">
                    <span className="text-gray-500 dark:text-gray-400">
                      {period.filedDate ?? '—'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Compliance info */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-teal-950/20"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Tax Compliance
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Automated GST/HST reconciliation, multi-jurisdiction tax
              reporting, and audit-ready documentation. Full tax report
              generation coming soon.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
