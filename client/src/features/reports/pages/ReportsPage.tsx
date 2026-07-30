'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  RefreshCw,
  Clock,
  Calendar,
  Filter,
  Grid3X3,
  List,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Bell,
  Trash2,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReportStore } from '../stores/report-store'
import { useReportsList, useReportSchedules, useDeleteSchedule } from '../hooks/useReports'
import { ReportForm } from '../components/ReportForm'
import { ReportCard } from '../components/ReportCard'
import type { ReportSchedule } from '../stores/report-store'

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

// 
// Types
// 

type ViewMode = 'grid' | 'list'

// 
// Sub-components
// 

function ReportStatsCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: typeof FileText
  color: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ScheduleItem({
  schedule,
  onDelete,
}: {
  schedule: ReportSchedule
  onDelete: (id: string) => void
}) {
  const deleteMutation = useDeleteSchedule()

  const handleDelete = () => {
    deleteMutation.mutate(schedule.id)
    onDelete(schedule.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {schedule.reportType.replace(/_/g, ' ')}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="capitalize">{schedule.period}</span>
            <span>·</span>
            <span className="uppercase">{schedule.format}</span>
            {schedule.active && (
              <>
                <span>·</span>
                <Badge variant="success" className="text-[10px]">
                  Active
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-gray-400 hover:text-red-500"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </motion.div>
  )
}

function ReportsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
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
 * Reports dashboard with generation form, reports list,
 * download actions, stats, and schedule management.
 *
 * @example
 * ```tsx
 * <ReportsPage />
 * ```
 */
export function ReportsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all-reports')

  const reports = useReportStore((s) => s.reports)
  const setReports = useReportStore((s) => s.setReports)

  //  Data fetching 

  const { data: reportsData, isLoading, refetch } = useReportsList()
  const { data: schedulesData, isLoading: schedulesLoading } = useReportSchedules()

  // Sync server data to store
  if (reportsData?.data && reports.length === 0) {
    setReports(reportsData.data)
  }

  //  Computed 

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports
    return reports.filter((r) => r.status === statusFilter)
  }, [reports, statusFilter])

  const stats = useMemo(() => {
    const total = reports.length
    const generating = reports.filter((r) => r.status === 'generating').length
    const ready = reports.filter((r) => r.status === 'ready').length
    const failed = reports.filter((r) => r.status === 'failed').length
    return { total, generating, ready, failed }
  }, [reports])

  const schedules: ReportSchedule[] = schedulesData ?? []

  //  Handlers 

  const handleReportGenerated = () => {
    refetch()
  }

  const handleReportDeleted = () => {
    refetch()
  }

  //  Render 

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col"
    >
      <PageHeader
        title="Reports"
        description="Generate, schedule, and download business reports"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/*  Stats Row  */}
      <motion.div
        variants={itemVariants}
        className="mb-6 grid grid-cols-4 gap-4"
      >
        <ReportStatsCard
          label="Total Reports"
          value={stats.total}
          icon={FileText}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <ReportStatsCard
          label="Ready"
          value={stats.ready}
          icon={CheckCircle2}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <ReportStatsCard
          label="Generating"
          value={stats.generating}
          icon={Loader2}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <ReportStatsCard
          label="Failed"
          value={stats.failed}
          icon={AlertCircle}
          color="bg-gradient-to-br from-red-500 to-rose-600"
        />
      </motion.div>

      {/*  Main Content  */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="all-reports">All Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="schedules">
            Schedules
            {schedules.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {schedules.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/*  Tab: All Reports  */}
        <TabsContent value="all-reports" className="mt-0 flex-1">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Reports list */}
            <div className="flex-1">
              {/* Filters bar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[140px] text-xs">
                      <Filter className="mr-1.5 h-3.5 w-3.5" />
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="generating">Generating</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1 rounded-lg border p-0.5 dark:border-gray-700">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Report cards */}
              {isLoading ? (
                <ReportsLoadingSkeleton />
              ) : filteredReports.length > 0 ? (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                      : 'space-y-2',
                  )}
                >
                  {filteredReports.map((report, idx) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      animationDelay={idx * 0.04}
                      onDeleted={handleReportDeleted}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-700"
                >
                  <FileText className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                    No reports yet
                  </h3>
                  <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
                    Generate your first report to get started
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('generate')}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Generate Report
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        {/*  Tab: Generate  */}
        <TabsContent value="generate" className="mt-0">
          <div className="mx-auto max-w-2xl">
            <ReportForm onGenerated={handleReportGenerated} />
          </div>
        </TabsContent>

        {/*  Tab: Schedules  */}
        <TabsContent value="schedules" className="mt-0">
          <motion.div
            variants={itemVariants}
            className="mx-auto max-w-2xl space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Scheduled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : schedules.length > 0 ? (
                  <div className="space-y-2">
                    {schedules.map((schedule) => (
                      <ScheduleItem
                        key={schedule.id}
                        schedule={schedule}
                        onDelete={handleReportDeleted}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="mb-2 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      No scheduled reports
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Schedule recurring reports for automatic delivery
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  Schedule New Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  First generate a report, then use the schedule option to set up
                  recurring delivery. Scheduled reports can be delivered via email
                  to your team.
                </p>
                <ol className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      1
                    </span>
                    Go to the <strong>Generate</strong> tab and create a report
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      2
                    </span>
                    Configure the period, format, and filters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      3
                    </span>
                    Use the schedule button to set up recurring delivery
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
