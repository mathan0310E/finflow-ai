'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Wallet,
  DollarSign,
  Shield,
  Activity,
  ClipboardList,
  Bell,
  Settings2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Power,
  Edit3,
  Trash2,
  Eye,
  Download,
  Filter,
  Ban,
  CheckCheck,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/toast'
import { formatCurrency, formatNumber, formatDate, formatRelativeTime } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { COMPANY_TIERS_MAP, USER_ROLES_MAP } from '@/constants'
import type { Company, User, AuditLog } from '@/types'

// 
// Types
// 

interface PlatformStats {
  totalCompanies: number
  totalUsers: number
  totalExpenses: number
  totalRevenue: number
  activeUsers: number
  pendingApprovals: number
  monthlyActiveCompanies: number
  systemUptime: number
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  apiLatency: number
  databaseConnections: number
  activeSessions: number
  lastIncident?: string
  services: { name: string; status: 'up' | 'down' | 'degraded'; latency: number }[]
}

interface FeatureFlag {
  id: string
  key: string
  label: string
  description: string
  enabled: boolean
  beta: boolean
  category: string
}

// 
// Animation variants
// 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// 
// Mock data (placeholder — replace with real API calls)
// 

const MOCK_STATS: PlatformStats = {
  totalCompanies: 128,
  totalUsers: 3_842,
  totalExpenses: 47_291,
  totalRevenue: 89_420,
  activeUsers: 2_145,
  pendingApprovals: 347,
  monthlyActiveCompanies: 112,
  systemUptime: 99.97,
}

const MOCK_COMPANIES: (Company & { userCount: number })[] = [
  { id: 'c1', name: 'Acme Corp', slug: 'acme-corp', size: 45, currency: 'USD', timezone: 'America/New_York', tier: 'business', status: 'active', settings: {} as any, userCount: 42, createdAt: new Date('2024-06-01'), updatedAt: new Date('2025-07-28') },
  { id: 'c2', name: 'Globex Inc', slug: 'globex-inc', size: 12, currency: 'USD', timezone: 'America/Chicago', tier: 'starter', status: 'active', settings: {} as any, userCount: 11, createdAt: new Date('2024-08-15'), updatedAt: new Date('2025-07-27') },
  { id: 'c3', name: 'Initech', slug: 'initech', size: 120, currency: 'USD', timezone: 'America/Denver', tier: 'enterprise', status: 'active', settings: {} as any, userCount: 115, createdAt: new Date('2024-03-10'), updatedAt: new Date('2025-07-28') },
  { id: 'c4', name: 'Hooli', slug: 'hooli', size: 3, currency: 'USD', timezone: 'America/Los_Angeles', tier: 'free', status: 'suspended', settings: {} as any, userCount: 3, createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-06-15') },
  { id: 'c5', name: 'Stark Industries', slug: 'stark-industries', size: 85, currency: 'USD', timezone: 'America/New_York', tier: 'enterprise', status: 'active', settings: {} as any, userCount: 80, createdAt: new Date('2024-01-05'), updatedAt: new Date('2025-07-28') },
]

const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@acme.com', displayName: 'John Admin', role: 'super_admin', companyId: 'c1', status: 'active', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u2', email: 'ceo@acme.com', displayName: 'Jane CEO', role: 'ceo', companyId: 'c1', status: 'active', createdAt: new Date('2024-01-15'), updatedAt: new Date('2025-07-28') },
  { id: 'u3', email: 'finance@globex.com', displayName: 'Bob Finance', role: 'finance_manager', companyId: 'c2', status: 'active', createdAt: new Date('2024-03-01'), updatedAt: new Date('2025-07-27') },
  { id: 'u4', email: 'inactive@hooli.com', displayName: 'Ghost User', role: 'employee', companyId: 'c4', status: 'inactive', createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-06-15') },
  { id: 'u5', email: 'manager@initech.com', displayName: 'Mike Manager', role: 'dept_manager', companyId: 'c3', status: 'active', createdAt: new Date('2024-02-10'), updatedAt: new Date('2025-07-25') },
]

const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'f1', key: 'ai_categorization', label: 'AI Categorization', description: 'Auto-categorize expenses using AI', enabled: true, beta: false, category: 'ai' },
  { id: 'f2', key: 'ocr_receipts', label: 'OCR Receipt Scanning', description: 'Extract data from receipt images', enabled: true, beta: false, category: 'ai' },
  { id: 'f3', key: 'auto_approval', label: 'Auto-Approval', description: 'Auto-approve expenses below threshold', enabled: false, beta: true, category: 'approval' },
  { id: 'f4', key: 'multi_currency', label: 'Multi-Currency', description: 'Support for multiple currencies', enabled: true, beta: false, category: 'core' },
  { id: 'f5', key: 'budget_forecasting', label: 'Budget Forecasting', description: 'AI-powered budget predictions', enabled: false, beta: true, category: 'ai' },
  { id: 'f6', key: 'sso_saml', label: 'SSO / SAML', description: 'Single sign-on with SAML providers', enabled: false, beta: false, category: 'security' },
]

const MOCK_AUDIT_LOGS: (AuditLog & { user?: Partial<User> })[] = [
  { id: 'a1', companyId: 'c1', userId: 'u1', action: 'company.updated', resource: 'company', resourceId: 'c1', details: { field: 'tier', old: 'starter', new: 'business' }, createdAt: new Date(Date.now() - 3_600_000), user: { displayName: 'John Admin' } },
  { id: 'a2', companyId: 'c2', userId: 'u3', action: 'user.invited', resource: 'user', resourceId: 'u9', details: { email: 'new@globex.com' }, createdAt: new Date(Date.now() - 7_200_000), user: { displayName: 'Bob Finance' } },
  { id: 'a3', companyId: 'c1', userId: 'u2', action: 'expense.approved', resource: 'expense', resourceId: 'e45', details: { amount: 1200 }, createdAt: new Date(Date.now() - 86_400_000), user: { displayName: 'Jane CEO' } },
  { id: 'a4', companyId: 'c3', userId: 'u5', action: 'department.created', resource: 'department', resourceId: 'd3', details: { name: 'Engineering' }, createdAt: new Date(Date.now() - 172_800_000), user: { displayName: 'Mike Manager' } },
  { id: 'a5', companyId: 'c4', userId: 'u4', action: 'company.suspended', resource: 'company', resourceId: 'c4', details: { reason: 'payment_failed' }, createdAt: new Date(Date.now() - 604_800_000), user: { displayName: 'System' } },
]

const SYSTEM_HEALTH: SystemHealth = {
  status: 'healthy',
  apiLatency: 42,
  databaseConnections: 128,
  activeSessions: 2_156,
  services: [
    { name: 'API Gateway', status: 'up', latency: 12 },
    { name: 'Auth Service', status: 'up', latency: 8 },
    { name: 'Database Primary', status: 'up', latency: 3 },
    { name: 'Database Replica', status: 'up', latency: 5 },
    { name: 'AI Service', status: 'degraded', latency: 245 },
    { name: 'OCR Service', status: 'up', latency: 67 },
    { name: 'Email Service', status: 'up', latency: 34 },
    { name: 'Storage Service', status: 'up', latency: 21 },
  ],
}

// 
// Sub-components
// 

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
  isLoading,
}: {
  label: string
  value: string
  icon: typeof Building2
  color: string
  subtitle?: string
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
              )}
            </div>
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function HealthStatusBadge({ status }: { status: SystemHealth['status'] }) {
  const config = {
    healthy: { label: 'All Systems Operational', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
    degraded: { label: 'Degraded Performance', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', dot: 'bg-amber-500' },
    down: { label: 'System Down', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-500' },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

// 
// Main Admin Page Component
// 

export function AdminPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [companySearch, setCompanySearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [isLoading] = useState(false)

  //  Stats 

  const stats = MOCK_STATS
  const companies = MOCK_COMPANIES
  const platformUsers = MOCK_USERS
  const auditLogs = MOCK_AUDIT_LOGS
  const featureFlags = MOCK_FEATURE_FLAGS
  const health = SYSTEM_HEALTH

  //  Filters 

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies
    const q = companySearch.toLowerCase()
    return companies.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q),
    )
  }, [companies, companySearch])

  const filteredUsers = useMemo(() => {
    if (!userSearch) return platformUsers
    const q = userSearch.toLowerCase()
    return platformUsers.filter((u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    )
  }, [platformUsers, userSearch])

  //  Actions 

  const handleToggleFlag = (flag: FeatureFlag) => {
    toast({
      title: flag.enabled ? 'Feature Disabled' : 'Feature Enabled',
      description: `${flag.label} has been ${flag.enabled ? 'disabled' : 'enabled'}.`,
      variant: 'success',
    })
  }

  //  Render 

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <PageHeader
        title="Admin Panel"
        description="Platform management and system oversight"
      >
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {/*  Tabs  */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* 
             TAB: OVERVIEW
            */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          {/* Stats grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Companies" value={formatNumber(stats.totalCompanies)} icon={Building2} color="bg-gradient-to-br from-blue-500 to-indigo-600" subtitle={`${stats.monthlyActiveCompanies} active this month`} isLoading={isLoading} />
            <StatCard label="Total Users" value={formatNumber(stats.totalUsers)} icon={Users} color="bg-gradient-to-br from-violet-500 to-purple-600" subtitle={`${stats.activeUsers} active now`} isLoading={isLoading} />
            <StatCard label="Total Expenses" value={formatNumber(stats.totalExpenses)} icon={Wallet} color="bg-gradient-to-br from-emerald-500 to-teal-600" subtitle={`${stats.pendingApprovals} pending`} isLoading={isLoading} />
            <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-gradient-to-br from-amber-500 to-orange-600" subtitle="This month" isLoading={isLoading} />
          </motion.div>

          {/* Quick actions and charts placeholder */}
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Platform Activity
                </CardTitle>
                <CardDescription>Recent platform-wide events and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">New companies this week</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">New users this week</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">184</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expenses this week</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">2,847</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stats.systemUptime}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>Latest system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: Building2, color: 'text-blue-500', text: 'New company registered: TechStart Inc', time: '2 hours ago' },
                    { icon: AlertTriangle, color: 'text-amber-500', text: 'AI service latency spike detected', time: '4 hours ago' },
                    { icon: CheckCircle2, color: 'text-emerald-500', text: 'Database maintenance completed', time: '1 day ago' },
                    { icon: Users, color: 'text-violet-500', text: 'Acme Corp upgraded to Business plan', time: '2 days ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <item.icon className={cn('h-4 w-4', item.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: COMPANIES
            */}
        <TabsContent value="companies" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <Building2 className="mr-1.5 h-4 w-4" />
              Add Company
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                              {company.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{company.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={company.status === 'active' ? 'success' : company.status === 'suspended' ? 'warning' : 'destructive'}
                            className="capitalize"
                          >
                            {company.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {company.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {company.userCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(company.createdAt, 'MMM dd, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: USERS
            */}
        <TabsContent value="users" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users across platform..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(USER_ROLES_MAP).map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Company ID</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const roleConfig = USER_ROLES_MAP[u.role]
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {u.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900 dark:text-white">{u.displayName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(roleConfig?.color, roleConfig?.textColor, 'border-0')}>
                              {roleConfig?.label ?? u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.status === 'active' ? 'success' : u.status === 'inactive' ? 'secondary' : 'destructive'}
                              className="capitalize"
                            >
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">{u.companyId.slice(0, 8)}</TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(u.createdAt, 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: FEATURE FLAGS
            */}
        <TabsContent value="features" className="mt-0 space-y-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Feature Flags
                </CardTitle>
                <CardDescription>Toggle platform-wide features and beta flags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {flag.label}
                          </span>
                          {flag.beta && (
                            <Badge variant="warning" className="text-[10px] uppercase">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {flag.description}
                        </p>
                        <code className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {flag.key}
                        </code>
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: SYSTEM HEALTH
            */}
        <TabsContent value="health" className="mt-0 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      System Status
                    </CardTitle>
                    <CardDescription>Overall platform health and performance</CardDescription>
                  </div>
                  <HealthStatusBadge status={health.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">API Latency</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{health.apiLatency}ms</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">DB Connections</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{health.databaseConnections}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Active Sessions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(health.activeSessions)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">99.97%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-gray-400" />
                  Services
                </CardTitle>
                <CardDescription>Individual service health and latency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {health.services.map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            svc.status === 'up' && 'bg-emerald-500',
                            svc.status === 'degraded' && 'bg-amber-500',
                            svc.status === 'down' && 'bg-red-500',
                          )}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{svc.latency}ms</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] capitalize',
                            svc.status === 'up' && 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400',
                            svc.status === 'degraded' && 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400',
                            svc.status === 'down' && 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400',
                          )}
                        >
                          {svc.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: AUDIT LOGS
            */}
        <TabsContent value="audit" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search audit logs..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {log.action}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {log.user?.displayName ?? log.userId.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {log.resource}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-gray-500 dark:text-gray-400">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatRelativeTime(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: SETTINGS
            */}
        <TabsContent value="settings" className="mt-0 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4 text-gray-400" />
                  Platform Settings
                </CardTitle>
                <CardDescription>Global platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Allow Self-Registration</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable open registration for new companies</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Put platform in read-only maintenance mode</p>
                    </div>
                    <Switch />
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Trial Days</label>
                      <Input type="number" defaultValue={14} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Users Per Company (Free)</label>
                      <Input type="number" defaultValue={5} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
                      <Input type="number" defaultValue={60} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Upload Size (MB)</label>
                      <Input type="number" defaultValue={10} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Reset</Button>
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
