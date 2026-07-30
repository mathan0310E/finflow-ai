'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  GitBranch,
  DollarSign,
  Search,
  Plus,
  Mail,
  BadgePercent,
  Calendar,
  Edit3,
  Trash2,
  UserPlus,
  MapPin,
  Briefcase,
  Loader2,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatNumber, formatDate, formatRelativeTime } from '@/utils/format'
import { USER_ROLES_MAP } from '@/constants'
import type { User, Department, UserRole } from '@/types'

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
  hidden: { opacity: 0, y: 16 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// 
// Mock data
// 

interface CompanyOverviewStats {
  totalEmployees: number
  activeDepartments: number
  totalBudget: number
  spentBudget: number
  pendingExpenses: number
  monthlySpend: number
}

const MOCK_STATS: CompanyOverviewStats = {
  totalEmployees: 85,
  activeDepartments: 7,
  totalBudget: 2_500_000,
  spentBudget: 1_780_000,
  pendingExpenses: 23,
  monthlySpend: 142_000,
}

const MOCK_EMPLOYEES: User[] = [
  { id: 'u1', email: 'ceo@acme.com', displayName: 'Jane CEO', role: 'ceo', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Chief Executive Officer', employeeId: 'EMP-001', phone: '+1-555-0100', joiningDate: new Date('2020-01-15'), createdAt: new Date('2020-01-15'), updatedAt: new Date('2025-07-28') },
  { id: 'u2', email: 'finance@acme.com', displayName: 'Bob Finance', role: 'finance_manager', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Finance Manager', employeeId: 'EMP-002', phone: '+1-555-0101', joiningDate: new Date('2020-03-01'), createdAt: new Date('2020-03-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u3', email: 'eng-mgr@acme.com', displayName: 'Alice Engineer', role: 'dept_manager', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Engineering Manager', employeeId: 'EMP-003', phone: '+1-555-0102', joiningDate: new Date('2021-06-01'), createdAt: new Date('2021-06-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u4', email: 'dev1@acme.com', displayName: 'Charlie Dev', role: 'employee', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Senior Developer', employeeId: 'EMP-004', joiningDate: new Date('2022-01-10'), createdAt: new Date('2022-01-10'), updatedAt: new Date('2025-07-28') },
  { id: 'u5', email: 'mkt@acme.com', displayName: 'Diana Marketer', role: 'employee', companyId: 'c1', departmentId: 'd2', status: 'active', designation: 'Marketing Lead', employeeId: 'EMP-005', phone: '+1-555-0103', joiningDate: new Date('2022-03-15'), createdAt: new Date('2022-03-15'), updatedAt: new Date('2025-07-28') },
  { id: 'u6', email: 'sales@acme.com', displayName: 'Eve Sales', role: 'employee', companyId: 'c1', departmentId: 'd3', status: 'active', designation: 'Sales Representative', employeeId: 'EMP-006', joiningDate: new Date('2023-02-20'), createdAt: new Date('2023-02-20'), updatedAt: new Date('2025-07-28') },
  { id: 'u7', email: 'design@acme.com', displayName: 'Frank Designer', role: 'employee', companyId: 'c1', departmentId: 'd4', status: 'inactive', designation: 'UI/UX Designer', employeeId: 'EMP-007', joiningDate: new Date('2023-05-01'), createdAt: new Date('2023-05-01'), updatedAt: new Date('2025-06-30') },
]

const MOCK_DEPARTMENTS: (Department & { description?: string })[] = [
  { id: 'd1', companyId: 'c1', name: 'Engineering', headId: 'u3', budget: 800000, budgetSpent: 520000, budgetRemaining: 280000, headCount: 28, status: 'active', description: 'Software development & infrastructure', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd2', companyId: 'c1', name: 'Marketing', headId: 'u5', budget: 300000, budgetSpent: 185000, budgetRemaining: 115000, headCount: 12, status: 'active', description: 'Marketing, comms & PR', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd3', companyId: 'c1', name: 'Sales', budget: 400000, budgetSpent: 380000, budgetRemaining: 20000, headCount: 15, status: 'active', description: 'Sales & business development', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd4', companyId: 'c1', name: 'Design', budget: 200000, budgetSpent: 125000, budgetRemaining: 75000, headCount: 8, status: 'active', description: 'UI/UX & graphic design', createdAt: new Date('2024-06-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd5', companyId: 'c1', name: 'Operations', budget: 150000, budgetSpent: 62000, budgetRemaining: 88000, headCount: 6, status: 'inactive', description: 'Operations & admin', createdAt: new Date('2024-03-01'), updatedAt: new Date('2025-06-15') },
]

// 
// Sub-components
// 

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string
  value: string
  icon: typeof Building2
  color: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// 
// Main Company Page
// 

export function CompanyPage() {
  const { toast } = useToast()
  const { user, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const isCeoOrAdmin = hasRole('ceo', 'super_admin')

  const overviewStats = MOCK_STATS
  const employees = MOCK_EMPLOYEES
  const departments = MOCK_DEPARTMENTS

  //  Filters 

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (employeeSearch) {
        const q = employeeSearch.toLowerCase()
        if (!emp.displayName.toLowerCase().includes(q) && !emp.email.toLowerCase().includes(q) && !(emp.designation ?? '').toLowerCase().includes(q)) return false
      }
      if (deptFilter !== 'all' && emp.departmentId !== deptFilter) return false
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false
      return true
    })
  }, [employees, employeeSearch, deptFilter, roleFilter])

  //  Handlers 

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    toast({ title: 'Invitation sent', description: `Invitation sent to ${inviteEmail}.`, variant: 'success' })
    setInviteEmail('')
    setInviteDialogOpen(false)
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
        title="Company"
        description="Manage your organization, departments, and team"
      >
        {isCeoOrAdmin && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite Employee
          </Button>
        )}
      </PageHeader>

      {/*  Overview stats  */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Employees" value={formatNumber(overviewStats.totalEmployees)} icon={Users} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard label="Departments" value={formatNumber(overviewStats.activeDepartments)} icon={GitBranch} color="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard label="Total Budget" value={formatCurrency(overviewStats.totalBudget)} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard label="Budget Used" value={formatCurrency(overviewStats.spentBudget)} icon={BadgePercent} color="bg-gradient-to-br from-amber-500 to-orange-600" subtitle={`${Math.round((overviewStats.spentBudget / overviewStats.totalBudget) * 100)}% utilization`} />
        <StatCard label="Pending Expenses" value={formatNumber(overviewStats.pendingExpenses)} icon={Calendar} color="bg-gradient-to-br from-rose-500 to-pink-600" />
        <StatCard label="Monthly Spend" value={formatCurrency(overviewStats.monthlySpend)} icon={DollarSign} color="bg-gradient-to-br from-cyan-500 to-blue-600" />
      </motion.div>

      {/*  Tabs  */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          {isCeoOrAdmin && (
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Allocation
            </TabsTrigger>
          )}
        </TabsList>

        {/* 
             TAB: OVERVIEW
            */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                      A
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Acme Corporation</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Technology · 51-200 employees</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Industry</p>
                      <p className="font-medium text-gray-900 dark:text-white">Technology</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Currency</p>
                      <p className="font-medium text-gray-900 dark:text-white">USD ($)</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Timezone</p>
                      <p className="font-medium text-gray-900 dark:text-white">America/New_York</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tier</p>
                      <Badge variant="default" className="uppercase text-[10px]">Business</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-violet-500" />
                    Department Quick View
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {departments.filter(d => d.status === 'active').slice(0, 5).map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <GitBranch className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{dept.headCount} members</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(dept.budget)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* 
             TAB: DEPARTMENTS
            */}
        <TabsContent value="departments" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const budgetPct = dept.budget > 0 ? (dept.budgetSpent / dept.budget) * 100 : 0
              return (
                <Card key={dept.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{dept.name}</CardTitle>
                      <Badge variant={dept.status === 'active' ? 'success' : 'secondary'} className="capitalize text-[10px]">{dept.status}</Badge>
                    </div>
                    {dept.description && (
                      <CardDescription className="text-xs">{dept.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(dept.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(dept.budgetSpent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(dept.budgetRemaining)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Headcount</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dept.headCount}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Budget utilization</span>
                        <span>{budgetPct.toFixed(0)}%</span>
                      </div>
                      <Progress value={budgetPct} className="h-1.5" />
                    </div>
                    {isCeoOrAdmin && (
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="h-8 flex-1 text-xs">
                          <Edit3 className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>
        </TabsContent>

        {/* 
             TAB: EMPLOYEES
            */}
        <TabsContent value="employees" className="mt-0 space-y-4">
          {/* Filters */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or designation..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.filter(d => d.status === 'active').map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.values(USER_ROLES_MAP).map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {filteredEmployees.length} of {employees.length}
            </span>
          </motion.div>

          {/* Employee grid */}
          <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredEmployees.map((emp, idx) => {
                const roleConfig = USER_ROLES_MAP[emp.role]
                const dept = departments.find(d => d.id === emp.departmentId)
                return (
                  <motion.div
                    key={emp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <Card className="group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-800">
                            {emp.photoURL ? <AvatarImage src={emp.photoURL} /> : null}
                            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                              {emp.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{emp.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{emp.designation ?? '—'}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <Badge variant="outline" className={cn('border-0 text-[10px]', roleConfig?.color, roleConfig?.textColor)}>
                                {roleConfig?.label ?? emp.role}
                              </Badge>
                              <Badge variant={emp.status === 'active' ? 'success' : 'secondary'} className="text-[10px] capitalize">
                                {emp.status}
                              </Badge>
                            </div>
                          </div>
                          {isCeoOrAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {dept?.name ?? 'No Dept'}
                          </span>
                          {emp.joiningDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(emp.joiningDate, 'MMM yyyy')}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Empty state */}
            {filteredEmployees.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-16 text-center"
              >
                <Users className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">No employees found</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* 
             TAB: BUDGET ALLOCATION
            */}
        <TabsContent value="budget" className="mt-0 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Budget Allocation Overview
                </CardTitle>
                <CardDescription>
                  Total: {formatCurrency(MOCK_STATS.totalBudget)} · Utilized: {formatCurrency(MOCK_STATS.spentBudget)} ({(MOCK_STATS.spentBudget / MOCK_STATS.totalBudget * 100).toFixed(0)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {departments.filter(d => d.status === 'active').map((dept) => {
                    const pct = (dept.budget / MOCK_STATS.totalBudget) * 100
                    const spentPct = dept.budget > 0 ? (dept.budgetSpent / dept.budget) * 100 : 0
                    return (
                      <div key={dept.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</span>
                            <Badge variant="secondary" className="text-[10px]">{dept.headCount} members</Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(dept.budget)}</span>
                            <span className="text-xs text-gray-400 ml-2">({pct.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={spentPct} className="h-2.5" />
                          <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Spent: {formatCurrency(dept.budgetSpent)}</span>
                            <span>Remaining: {formatCurrency(dept.budgetRemaining)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/*  Invite Employee Dialog  */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Employee</DialogTitle>
            <DialogDescription>Send an invitation to join your company</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="employee@company.com" icon={<Mail className="h-4 w-4" />} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES_MAP).filter(r => r.value !== 'super_admin' && r.value !== 'ceo').map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <Select defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter(d => d.status === 'active').map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
