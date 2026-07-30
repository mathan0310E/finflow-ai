// ──────────────────────────────────────────────
// FinFlow AI — Shared Type Definitions
// These types mirror the client-side types for consistency
// ──────────────────────────────────────────────

import { Request } from 'express';

// ── User Roles ──
export type UserRole =
  | 'super_admin'
  | 'ceo'
  | 'finance_manager'
  | 'dept_manager'
  | 'employee';

// ── Company ──
export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  industry?: string;
  size: number;
  currency: string;
  timezone: string;
  tier: 'free' | 'starter' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'disabled';
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  requireManagerApproval: boolean;
  requireFinanceApproval: boolean;
  requireCeoApproval: boolean;
  autoApprovalLimit: number;
  maxExpenseAmount: number;
  enableAi: boolean;
  enableOcr: boolean;
}

export type CompanyTier = 'free' | 'starter' | 'business' | 'enterprise';
export type CompanyStatus = 'active' | 'suspended' | 'disabled';

// ── User ──
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  companyId: string;
  role: UserRole;
  departmentId?: string;
  designation?: string;
  employeeId?: string;
  managerId?: string;
  costCenter?: string;
  phone?: string;
  joiningDate?: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

// ── Department ──
export interface Department {
  id: string;
  companyId: string;
  name: string;
  headId?: string;
  budget: number;
  budgetSpent: number;
  budgetRemaining: number;
  headCount: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type DepartmentStatus = 'active' | 'inactive';

// ── Expense ──
export type ExpenseStatus =
  | 'draft'
  | 'pending'
  | 'manager_approved'
  | 'finance_approved'
  | 'ceo_approved'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'reimbursed';

export type ApprovalAction =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export interface ApprovalChainEntry {
  level: number;
  role: UserRole;
  userId?: string;
  action: ApprovalAction;
  comment?: string;
  timestamp?: Date;
}

export interface OcrData {
  storeName?: string;
  amount?: number;
  gst?: string;
  invoiceNumber?: string;
  date?: string;
  items?: string[];
  tax?: number;
  confidence: number;
}

export interface Expense {
  id: string;
  companyId: string;
  userId: string;
  departmentId?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  subCategory?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  vendor?: string;
  project?: string;
  tags: string[];
  date: Date;
  status: ExpenseStatus;
  currentApprovalLevel: number;
  approvalChain: ApprovalChainEntry[];
  ocrData?: OcrData;
  aiCategory?: string;
  aiConfidence?: number;
  isReimbursed: boolean;
  reimbursedAt?: Date;
  policyViolations: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Budget ──
export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface Budget {
  id: string;
  companyId: string;
  departmentId?: string;
  fiscalYear: string;
  period: 'annual' | 'quarterly' | 'monthly';
  categories: BudgetCategory[];
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetPeriod = 'annual' | 'quarterly' | 'monthly';
export type BudgetStatus = 'active' | 'closed';

// ── Notification ──
export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

// ── Vendor ──
export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gst?: string;
  paymentTerms?: string;
  totalSpent: number;
  lastTransaction?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export type VendorStatus = 'active' | 'inactive';

// ── Audit Log ──
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ── AI ──
export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiChat {
  id: string;
  companyId: string;
  userId: string;
  messages: AiMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ── Dashboard ──
export interface DashboardWidget {
  id: string;
  userId: string;
  type: string;
  config: Record<string, unknown>;
  position: number;
}

export interface DashboardMetrics {
  totalExpenses: number;
  pendingApprovals: number;
  approvedAmount: number;
  rejectedAmount: number;
  monthlySpend: number;
  budgetUtilization: number;
  departmentComparison: { name: string; amount: number }[];
  categoryBreakdown: { name: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; amount: number }[];
  recentExpenses: Expense[];
  pendingCount: number;
  budgetRemaining: number;
  averageExpense: number;
  topVendors: { name: string; total: number; count: number }[];
}

// ── Express Request Extension ──
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    // Custom claims / DB fields
    role?: UserRole;
    companyId?: string;
    departmentId?: string;
    status?: UserStatus;
    phone?: string;
  };
  /** Device fingerprint for anomaly detection */
  fingerprint?: string;
  /** CSRF token from cookie (set by csrf middleware) */
  csrfToken?: string;
  // Override to work with Express 5 types where params/query can be string | string[]
  params: Record<string, string>;
  query: Record<string, string | undefined>;
}

// ── API Response Envelope ──
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Expense Filters ──
export interface ExpenseFilters {
  status?: ExpenseStatus;
  category?: string;
  departmentId?: string;
  userId?: string;
  vendor?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Report ──
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportType =
  | 'expense_report'
  | 'budget_report'
  | 'department_report'
  | 'category_report'
  | 'vendor_report'
  | 'custom';

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateRange?: { start: string; end: string };
  departmentId?: string;
  category?: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, unknown>;
}

export interface Report {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  type: ReportType;
  format: ReportFormat;
  config: ReportConfig;
  status: 'generating' | 'completed' | 'failed';
  url?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}
