export type UserRole = 'super_admin' | 'ceo' | 'finance_manager' | 'dept_manager' | 'employee'

// ── Onboarding & Workspace Types ──

export type WorkspaceType = 'personal' | 'company'
export type CompanySize = 'startup' | 'small_business' | 'medium_business' | 'enterprise'
export type OnboardingStep =
  | 'welcome'
  | 'workspace'
  | 'company-details'
  | 'departments'
  | 'invite'
  | 'budget'
  | 'policies'
  | 'ai-preferences'
  | 'complete'

export interface PersonalWorkspace {
  type: 'personal'
  currency: string
  monthlyBudget?: number
  categories?: string[]
}

export interface CompanySetup {
  name: string
  industry?: string
  size: CompanySize
  country?: string
  currency: string
  timezone?: string
  logo?: string
  website?: string
}

export interface OnboardingState {
  step: OnboardingStep
  workspaceType?: WorkspaceType
  companySetup?: CompanySetup
  personalWorkspace?: PersonalWorkspace
  completed: boolean
}

export interface Company {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  industry?: string
  size: number
  currency: string
  timezone: string
  tier: 'free' | 'starter' | 'business' | 'enterprise'
  status: 'active' | 'suspended' | 'disabled'
  settings: CompanySettings
  createdAt: Date
  updatedAt: Date
}

export interface CompanySettings {
  requireManagerApproval: boolean
  requireFinanceApproval: boolean
  requireCeoApproval: boolean
  autoApprovalLimit: number
  maxExpenseAmount: number
  enableAi: boolean
  enableOcr: boolean
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  companyId: string
  role: UserRole
  departmentId?: string
  designation?: string
  employeeId?: string
  managerId?: string
  costCenter?: string
  phone?: string
  joiningDate?: Date
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  companyId: string
  name: string
  headId?: string
  budget: number
  budgetSpent: number
  budgetRemaining: number
  headCount: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export type ExpenseStatus =
  | 'draft'
  | 'pending'
  | 'manager_approved'
  | 'finance_approved'
  | 'ceo_approved'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'reimbursed'

export type ApprovalAction = 'pending' | 'approved' | 'rejected' | 'changes_requested'

export interface ApprovalChainEntry {
  level: number
  role: UserRole
  userId?: string
  action: ApprovalAction
  comment?: string
  timestamp?: Date
}

export interface OcrData {
  storeName?: string
  amount?: number
  gst?: string
  invoiceNumber?: string
  date?: string
  items?: string[]
  tax?: number
  confidence: number
}

export interface Expense {
  id: string
  companyId: string
  userId: string
  departmentId?: string
  title: string
  description?: string
  amount: number
  currency: string
  category: string
  subCategory?: string
  receiptUrl?: string
  invoiceUrl?: string
  vendor?: string
  project?: string
  tags: string[]
  date: Date
  status: ExpenseStatus
  currentApprovalLevel: number
  approvalChain: ApprovalChainEntry[]
  ocrData?: OcrData
  aiCategory?: string
  aiConfidence?: number
  isReimbursed: boolean
  reimbursedAt?: Date
  policyViolations: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface BudgetCategory {
  name: string
  allocated: number
  spent: number
  remaining: number
}

export interface Budget {
  id: string
  companyId: string
  departmentId?: string
  fiscalYear: string
  period: 'annual' | 'quarterly' | 'monthly'
  categories: BudgetCategory[]
  totalAllocated: number
  totalSpent: number
  totalRemaining: number
  status: 'active' | 'closed'
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  companyId: string
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}

export interface Vendor {
  id: string
  companyId: string
  name: string
  category?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  gst?: string
  paymentTerms?: string
  totalSpent: number
  lastTransaction?: Date
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  companyId: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AiChat {
  id: string
  companyId: string
  userId: string
  messages: AiMessage[]
  context?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface DashboardWidget {
  id: string
  userId: string
  type: string
  config: Record<string, unknown>
  position: number
}

export interface DashboardMetrics {
  totalExpenses: number
  pendingApprovals: number
  approvedAmount: number
  rejectedAmount: number
  monthlySpend: number
  budgetUtilization: number
  departmentComparison: { name: string; amount: number }[]
  categoryBreakdown: { name: string; amount: number; percentage: number }[]
  monthlyTrend: { month: string; amount: number }[]
  recentExpenses: Expense[]
  pendingCount: number
  budgetRemaining: number
  averageExpense: number
  topVendors: { name: string; total: number; count: number }[]
}
