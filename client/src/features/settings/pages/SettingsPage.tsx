'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Building2,
  ShieldCheck,
  GitBranch,
  Users,
  Bell,
  CreditCard,
  Key,
  Save,
  Camera,
  Plus,
  Trash2,
  X,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  AlertCircle,
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
import { Switch } from '@/components/ui/switch'
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
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { CURRENCIES, COMPANY_TIERS_MAP, NOTIFICATION_TYPES, APP_NAME } from '@/constants'
import { formatCurrency, formatNumber, formatDate } from '@/utils/format'
import { USER_ROLES_MAP } from '@/constants'
import type { User as AppUser, UserRole, Department } from '@/types'

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

const itemVariants = {
  hidden: { opacity: 0, y: 12 } as const,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  } as const,
}

// 
// Mock data
// 

const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', companyId: 'c1', name: 'Engineering', budget: 500000, budgetSpent: 325000, budgetRemaining: 175000, headCount: 28, status: 'active', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd2', companyId: 'c1', name: 'Marketing', budget: 200000, budgetSpent: 145000, budgetRemaining: 55000, headCount: 12, status: 'active', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd3', companyId: 'c1', name: 'Sales', budget: 300000, budgetSpent: 280000, budgetRemaining: 20000, headCount: 15, status: 'active', createdAt: new Date('2024-01-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd4', companyId: 'c1', name: 'Design', budget: 150000, budgetSpent: 98000, budgetRemaining: 52000, headCount: 8, status: 'active', createdAt: new Date('2024-06-01'), updatedAt: new Date('2025-07-28') },
  { id: 'd5', companyId: 'c1', name: 'Operations', budget: 100000, budgetSpent: 42000, budgetRemaining: 58000, headCount: 6, status: 'inactive', createdAt: new Date('2024-03-01'), updatedAt: new Date('2025-06-15') },
]

const MOCK_USERS: AppUser[] = [
  { id: 'u1', email: 'ceo@acme.com', displayName: 'Jane CEO', role: 'ceo', companyId: 'c1', status: 'active', phone: '+1-555-0100', designation: 'Chief Executive Officer', employeeId: 'EMP-001', createdAt: new Date('2024-01-15'), updatedAt: new Date('2025-07-28') },
  { id: 'u2', email: 'finance@acme.com', displayName: 'Bob Finance', role: 'finance_manager', companyId: 'c1', departmentId: 'd1', status: 'active', phone: '+1-555-0101', designation: 'Finance Manager', employeeId: 'EMP-002', createdAt: new Date('2024-02-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u3', email: 'eng-mgr@acme.com', displayName: 'Alice Engineer', role: 'dept_manager', companyId: 'c1', departmentId: 'd1', status: 'active', phone: '+1-555-0102', designation: 'Engineering Manager', employeeId: 'EMP-003', createdAt: new Date('2024-03-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u4', email: 'dev1@acme.com', displayName: 'Charlie Dev', role: 'employee', companyId: 'c1', departmentId: 'd1', status: 'active', designation: 'Senior Developer', employeeId: 'EMP-004', createdAt: new Date('2024-04-01'), updatedAt: new Date('2025-07-28') },
  { id: 'u5', email: 'mkt@acme.com', displayName: 'Diana Marketer', role: 'employee', companyId: 'c1', departmentId: 'd2', status: 'active', designation: 'Marketing Lead', employeeId: 'EMP-005', createdAt: new Date('2024-05-01'), updatedAt: new Date('2025-07-28') },
]

const MOCK_INVOICES = [
  { id: 'inv-001', date: new Date('2025-07-01'), amount: 99, plan: 'Business', status: 'paid' as const, description: 'Monthly subscription - July 2025' },
  { id: 'inv-002', date: new Date('2025-06-01'), amount: 99, plan: 'Business', status: 'paid' as const, description: 'Monthly subscription - June 2025' },
  { id: 'inv-003', date: new Date('2025-05-01'), amount: 99, plan: 'Business', status: 'paid' as const, description: 'Monthly subscription - May 2025' },
  { id: 'inv-004', date: new Date('2025-04-01'), amount: 49, plan: 'Starter', status: 'paid' as const, description: 'Monthly subscription - April 2025' },
  { id: 'inv-005', date: new Date('2025-03-01'), amount: 49, plan: 'Starter', status: 'paid' as const, description: 'Monthly subscription - March 2025' },
]

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
  lastUsed?: Date
  status: 'active' | 'revoked'
}

const MOCK_API_KEYS: ApiKey[] = [
  { id: 'k1', name: 'Production Integration', key: 'ff_live_8a7f...3b2c', createdAt: new Date('2025-01-15'), lastUsed: new Date(Date.now() - 3_600_000), status: 'active' },
  { id: 'k2', name: 'Development Testing', key: 'ff_test_1d2e...9f8g', createdAt: new Date('2025-03-20'), lastUsed: new Date(Date.now() - 172_800_000), status: 'active' },
]

// 
// Sub-components
// 

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900 sm:p-6', className)}>
      {children}
    </div>
  )
}

// 
// Main Settings Page
// 

export function SettingsPage() {
  const { toast } = useToast()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [showPassword, setShowPassword] = useState(false)
  const [departmentDialog, setDepartmentDialog] = useState(false)
  const [inviteDialog, setInviteDialog] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [newKeyDialog, setNewKeyDialog] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    expenseSubmitted: true,
    expenseApproved: true,
    expenseRejected: true,
    budgetAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
  })

  //  Profile state 
  const [profile, setProfile] = useState({
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  //  Company state 
  const [company, setCompany] = useState({
    name: 'Acme Corporation',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '51-200',
    currency: 'USD',
    timezone: 'America/New_York',
  })

  //  Expense policy state 
  const [policies, setPolicies] = useState({
    requireManagerApproval: true,
    requireFinanceApproval: false,
    requireCeoApproval: true,
    autoApprovalLimit: 500,
    maxExpenseAmount: 25000,
    allowReceiptOcr: true,
    enforcePolicyViolations: true,
  })

  //  Departments state 
  const [departments] = useState(MOCK_DEPARTMENTS)
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptBudget, setNewDeptBudget] = useState('')

  //  Users state 
  const [companyUsers] = useState(MOCK_USERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('employee')

  //  API keys 
  const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')

  //  Handlers 

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        displayName: profile.displayName,
        phone: profile.phone,
      })
      toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.', variant: 'success' })
    } catch {
      toast({ title: 'Failed to update', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCompany = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast({ title: 'Company updated', description: 'Company settings have been saved.', variant: 'success' })
      setIsSaving(false)
    }, 500)
  }

  const handleSavePolicies = () => {
    setIsSaving(true)
    setTimeout(() => {
      toast({ title: 'Policies updated', description: 'Expense policies have been saved.', variant: 'success' })
      setIsSaving(false)
    }, 500)
  }

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return
    toast({ title: 'Department added', description: `${newDeptName} has been created.`, variant: 'success' })
    setNewDeptName('')
    setNewDeptBudget('')
    setDepartmentDialog(false)
  }

  const handleDeleteDepartment = (id: string) => {
    toast({ title: 'Department deleted', description: 'The department has been removed.', variant: 'success' })
  }

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return
    toast({ title: 'Invitation sent', description: `Invitation sent to ${inviteEmail}.`, variant: 'success' })
    setInviteEmail('')
    setInviteDialog(false)
  }

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return
    const fakeKey = `ff_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 18)}`
    setGeneratedKey(fakeKey)
    toast({ title: 'API Key created', description: 'Copy your key now. It won\'t be shown again.', variant: 'success' })
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast({ title: 'Copied!', description: 'API key copied to clipboard.', variant: 'success' })
  }

  const handleRevokeKey = (id: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)))
    toast({ title: 'Key revoked', description: 'The API key has been revoked.', variant: 'success' })
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
        title="Settings"
        description="Manage your account, company, and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Expense Policies
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* 
             TAB: PROFILE
            */}
        <TabsContent value="profile" className="mt-0 space-y-6">
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl space-y-6">
            {/* Avatar */}
            <SectionCard>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-2 ring-gray-200 dark:ring-gray-700">
                    {user?.photoURL ? <AvatarImage src={user.photoURL} /> : null}
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <Camera className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.displayName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{user?.role?.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
            </SectionCard>

            {/* Profile form */}
            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              <div className="space-y-4">
                <Input label="Display Name" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
                <Input label="Email" type="email" value={profile.email} disabled />
                <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1-555-0000" />
              </div>
            </SectionCard>

            {/* Change password */}
            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Input label="Current Password" type={showPassword ? 'text' : 'password'} value={profile.currentPassword} onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })} />
                  <button type="button" className="absolute right-3 top-9 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input label="New Password" type="password" value={profile.newPassword} onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })} />
                <Input label="Confirm New Password" type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} />
              </div>
            </SectionCard>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: COMPANY
            */}
        <TabsContent value="company" className="mt-0 space-y-6">
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl space-y-6">
            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Company Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
                    {company.name.charAt(0)}
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-1.5 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Company Name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
                  <Input label="Website" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://example.com" />
                  <Input label="Industry" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                    <Select value={company.size} onValueChange={(v) => setCompany({ ...company, size: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    <Select value={company.currency} onValueChange={(v) => setCompany({ ...company, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <Input label="Timezone" value={company.timezone} onChange={(e) => setCompany({ ...company, timezone: e.target.value })} />
                </div>
              </div>
            </SectionCard>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveCompany} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: EXPENSE POLICIES
            */}
        <TabsContent value="policies" className="mt-0 space-y-6">
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl space-y-6">
            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Approval Requirements</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Require Manager Approval</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expenses need department manager approval</p>
                  </div>
                  <Switch checked={policies.requireManagerApproval} onCheckedChange={(v) => setPolicies({ ...policies, requireManagerApproval: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Require Finance Approval</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expenses above manager limit need finance approval</p>
                  </div>
                  <Switch checked={policies.requireFinanceApproval} onCheckedChange={(v) => setPolicies({ ...policies, requireFinanceApproval: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Require CEO Approval</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expenses above finance limit need CEO approval</p>
                  </div>
                  <Switch checked={policies.requireCeoApproval} onCheckedChange={(v) => setPolicies({ ...policies, requireCeoApproval: v })} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Limits & Thresholds</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Auto-Approval Limit ($)" type="number" value={policies.autoApprovalLimit} onChange={(e) => setPolicies({ ...policies, autoApprovalLimit: Number(e.target.value) })} />
                <Input label="Max Expense Amount ($)" type="number" value={policies.maxExpenseAmount} onChange={(e) => setPolicies({ ...policies, maxExpenseAmount: Number(e.target.value) })} />
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Features</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Receipt OCR</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Auto-extract data from receipt uploads</p>
                  </div>
                  <Switch checked={policies.allowReceiptOcr} onCheckedChange={(v) => setPolicies({ ...policies, allowReceiptOcr: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enforce Policy Violations</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flag and restrict policy-violating expenses</p>
                  </div>
                  <Switch checked={policies.enforcePolicyViolations} onCheckedChange={(v) => setPolicies({ ...policies, enforcePolicyViolations: v })} />
                </div>
              </div>
            </SectionCard>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={handleSavePolicies} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save Policies
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: DEPARTMENTS
            */}
        <TabsContent value="departments" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{departments.length} departments</p>
            <Dialog open={departmentDialog} onOpenChange={setDepartmentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department</DialogTitle>
                  <DialogDescription>Create a new department for your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <Input label="Department Name" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. Engineering" />
                  <Input label="Annual Budget" type="number" value={newDeptBudget} onChange={(e) => setNewDeptBudget(e.target.value)} placeholder="e.g. 500000" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDepartmentDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddDepartment}>Create Department</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{dept.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingDept(dept)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteDepartment(dept.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Budget</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(dept.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Spent</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(dept.budgetSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Headcount</span>
                      <span className="font-medium text-gray-900 dark:text-white">{dept.headCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <Badge variant={dept.status === 'active' ? 'success' : 'secondary'} className="capitalize text-[10px]">{dept.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Budget used</span>
                      <span>{Math.round((dept.budgetSpent / dept.budget) * 100)}%</span>
                    </div>
                    <Progress value={(dept.budgetSpent / dept.budget) * 100} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </TabsContent>

        {/* 
             TAB: USERS
            */}
        <TabsContent value="users" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{companyUsers.length} team members</p>
            <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>Send an invitation to join your company</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <Input label="Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(USER_ROLES_MAP).filter(r => r.value !== 'super_admin').map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialog(false)}>Cancel</Button>
                  <Button onClick={handleInviteUser}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {companyUsers.map((u) => {
                    const roleConfig = USER_ROLES_MAP[u.role]
                    return (
                      <div key={u.id} className="flex items-center gap-4 p-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300">
                            {u.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.displayName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                        <Badge variant="outline" className={cn('border-0 capitalize', roleConfig?.color, roleConfig?.textColor)}>
                          {roleConfig?.label ?? u.role}
                        </Badge>
                        <Badge variant={u.status === 'active' ? 'success' : 'secondary'} className="capitalize text-[10px]">{u.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                          <User className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: NOTIFICATIONS
            */}
        <TabsContent value="notifications" className="mt-0 space-y-6">
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl space-y-6">
            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Delivery Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                  <Switch checked={notifPrefs.emailNotifications} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, emailNotifications: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive in-app push notifications</p>
                  </div>
                  <Switch checked={notifPrefs.pushNotifications} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, pushNotifications: v })} />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Notification Types</h3>
              <div className="space-y-4">
                {NOTIFICATION_TYPES.filter((_, i) => i < 6).map((nt) => (
                  <div key={nt.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{nt.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{nt.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{nt.description}</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-1.5 h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: BILLING
            */}
        <TabsContent value="billing" className="mt-0 space-y-6">
          <motion.div variants={itemVariants} className="mx-auto max-w-2xl space-y-6">
            <SectionCard>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Current Plan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">You are on the Business plan</p>
                </div>
                <Badge variant="default" className="uppercase text-[10px]">Business</Badge>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(99)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">85</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Users (85 / 100)</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" className="flex-1">View Plans</Button>
                <Button className="flex-1">Upgrade Plan</Button>
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Invoices</h3>
              <div className="space-y-2">
                {MOCK_INVOICES.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(inv.date, 'MMM dd, yyyy')} · {inv.plan}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                      <Badge variant="success" className="text-[10px] capitalize">{inv.status}</Badge>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        </TabsContent>

        {/* 
             TAB: API KEYS
            */}
        <TabsContent value="api" className="mt-0 space-y-4">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{apiKeys.filter(k => k.status === 'active').length} active keys</p>
            <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>Give your key a descriptive name</DialogDescription>
                </DialogHeader>
                {generatedKey ? (
                  <div className="space-y-4 py-2">
                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <AlertCircle className="h-4 w-4" />
                        Copy your key now
                      </div>
                      <p className="text-xs">You won&apos;t be able to see it again after closing this dialog.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-mono dark:bg-gray-800">{generatedKey}</code>
                      <Button variant="outline" size="icon" onClick={() => handleCopyKey(generatedKey)}>
                        {copiedKey === generatedKey ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => { setGeneratedKey(''); setNewKeyDialog(false); setNewKeyName(''); }}>Done</Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <Input label="Key Name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g. Production API" />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewKeyDialog(false)}>Cancel</Button>
                      <Button onClick={handleGenerateKey} disabled={!newKeyName.trim()}>Generate Key</Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center gap-4 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Key className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{k.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <code className="font-mono">{k.key}</code>
                          <span>·</span>
                          <span>Created {formatDate(k.createdAt, 'MMM dd, yyyy')}</span>
                          {k.lastUsed && (
                            <>
                              <span>·</span>
                              <span>Last used {formatDate(k.lastUsed, 'MMM dd')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={k.status === 'active' ? 'success' : 'destructive'} className="capitalize text-[10px]">{k.status}</Badge>
                      {k.status === 'active' ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => handleRevokeKey(k.id)}>
                          Revoke
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyKey(k.key)}>
                        {copiedKey === k.key ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
