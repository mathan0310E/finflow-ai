// ──────────────────────────────────────────────
// Expense Categories
// ──────────────────────────────────────────────

export interface ExpenseCategory {
  value: string
  label: string
  icon: string
  subCategories?: string[]
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    value: 'travel',
    label: 'Travel',
    icon: '✈️',
    subCategories: ['Flights', 'Trains', 'Taxis', 'Ride-sharing', 'Parking', 'Tolls']
  },
  {
    value: 'food',
    label: 'Food',
    icon: '🍽️',
    subCategories: ['Meals', 'Groceries', 'Client Lunch', 'Team Lunch', 'Coffee & Drinks']
  },
  {
    value: 'fuel',
    label: 'Fuel',
    icon: '⛽',
    subCategories: ['Petrol', 'Diesel', 'EV Charging', 'CNG']
  },
  {
    value: 'accommodation',
    label: 'Accommodation',
    icon: '🏨',
    subCategories: ['Hotel', 'Serviced Apartment', 'Hostel', 'Short-term Rental']
  },
  {
    value: 'office_supplies',
    label: 'Office Supplies',
    icon: '📎',
    subCategories: ['Stationery', 'Printing', 'Furniture', 'Cleaning', ' pantry']
  },
  {
    value: 'software',
    label: 'Software',
    icon: '💻',
    subCategories: ['SaaS Subscriptions', 'Licenses', 'Cloud Services', 'Development Tools']
  },
  {
    value: 'hardware',
    label: 'Hardware',
    icon: '🖥️',
    subCategories: ['Laptops', 'Monitors', 'Peripherals', 'Servers', 'Networking', 'Accessories']
  },
  {
    value: 'internet',
    label: 'Internet',
    icon: '🌐',
    subCategories: ['Broadband', 'Mobile Data', 'Hotspot', 'VPN']
  },
  {
    value: 'utilities',
    label: 'Utilities',
    icon: '💡',
    subCategories: ['Electricity', 'Water', 'Gas', 'Waste Management']
  },
  {
    value: 'medical',
    label: 'Medical',
    icon: '🏥',
    subCategories: ['Insurance', 'Doctor Visit', 'Medicine', 'Health Checkup', 'Wellness']
  },
  {
    value: 'training',
    label: 'Training',
    icon: '📚',
    subCategories: ['Courses', 'Workshops', 'Certifications', 'Conference', 'Books']
  },
  {
    value: 'marketing',
    label: 'Marketing',
    icon: '📢',
    subCategories: ['Ads', 'Social Media', 'Events', 'Promotions', 'Branding', 'PR']
  },
  {
    value: 'legal',
    label: 'Legal',
    icon: '⚖️',
    subCategories: ['Consultation', 'Contracts', 'Compliance', 'Licenses', 'Registration']
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: '📋',
    subCategories: []
  }
] as const

export const EXPENSE_CATEGORIES_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((cat) => [cat.value, cat])
) as Record<(typeof EXPENSE_CATEGORIES)[number]['value'], ExpenseCategory>

// ──────────────────────────────────────────────
// Expense Status
// ──────────────────────────────────────────────

export interface ExpenseStatusConfig {
  value: string
  label: string
  color: string      // Tailwind bg class (light)
  textColor: string  // Tailwind text class
  borderColor: string
  dotColor: string   // For status indicators
  description: string
}

export const EXPENSE_STATUS: ExpenseStatusConfig[] = [
  {
    value: 'draft',
    label: 'Draft',
    color: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    dotColor: '#9CA3AF',
    description: 'Not yet submitted for approval'
  },
  {
    value: 'pending',
    label: 'Pending',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    dotColor: '#F59E0B',
    description: 'Awaiting manager approval'
  },
  {
    value: 'manager_approved',
    label: 'Manager Approved',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    dotColor: '#3B82F6',
    description: 'Approved by department manager'
  },
  {
    value: 'finance_approved',
    label: 'Finance Approved',
    color: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300',
    dotColor: '#6366F1',
    description: 'Approved by finance team'
  },
  {
    value: 'ceo_approved',
    label: 'CEO Approved',
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    dotColor: '#8B5CF6',
    description: 'Approved by CEO'
  },
  {
    value: 'approved',
    label: 'Approved',
    color: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    dotColor: '#10B981',
    description: 'Fully approved and ready for reimbursement'
  },
  {
    value: 'rejected',
    label: 'Rejected',
    color: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    dotColor: '#EF4444',
    description: 'Expense claim has been rejected'
  },
  {
    value: 'changes_requested',
    label: 'Changes Requested',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    dotColor: '#F97316',
    description: 'Modifications requested by approver'
  },
  {
    value: 'reimbursed',
    label: 'Reimbursed',
    color: 'bg-teal-100',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
    dotColor: '#14B8A6',
    description: 'Amount has been reimbursed'
  }
] as const

export const EXPENSE_STATUS_MAP = Object.fromEntries(
  EXPENSE_STATUS.map((s) => [s.value, s])
) as Record<(typeof EXPENSE_STATUS)[number]['value'], ExpenseStatusConfig>

// ──────────────────────────────────────────────
// User Roles
// ──────────────────────────────────────────────

export interface UserRoleConfig {
  value: string
  label: string
  description: string
  color: string
  textColor: string
  level: number // hierarchy level (higher = more authority)
}

export const USER_ROLES: UserRoleConfig[] = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full system access across all companies',
    color: 'bg-red-100',
    textColor: 'text-red-800',
    level: 5
  },
  {
    value: 'ceo',
    label: 'CEO',
    description: 'Company-wide oversight, final approval authority',
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    level: 4
  },
  {
    value: 'finance_manager',
    label: 'Finance Manager',
    description: 'Manages budgets, reviews and approves expenses',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    level: 3
  },
  {
    value: 'dept_manager',
    label: 'Department Manager',
    description: 'Approves expenses for team members',
    color: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    level: 2
  },
  {
    value: 'employee',
    label: 'Employee',
    description: 'Can submit and view own expenses',
    color: 'bg-gray-100',
    textColor: 'text-gray-800',
    level: 1
  }
] as const

export const USER_ROLES_MAP = Object.fromEntries(
  USER_ROLES.map((r) => [r.value, r])
) as Record<(typeof USER_ROLES)[number]['value'], UserRoleConfig>

// ──────────────────────────────────────────────
// Currencies
// ──────────────────────────────────────────────

export interface Currency {
  code: string
  symbol: string
  name: string
  locale: string
  decimalPlaces: number
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimalPlaces: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', decimalPlaces: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimalPlaces: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimalPlaces: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimalPlaces: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimalPlaces: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimalPlaces: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimalPlaces: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimalPlaces: 2 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH', decimalPlaces: 2 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', decimalPlaces: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', decimalPlaces: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimalPlaces: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', decimalPlaces: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimalPlaces: 0 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimalPlaces: 2 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', locale: 'es-MX', decimalPlaces: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ', decimalPlaces: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE', decimalPlaces: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO', decimalPlaces: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK', decimalPlaces: 2 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL', decimalPlaces: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', decimalPlaces: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK', decimalPlaces: 2 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW', decimalPlaces: 2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR', decimalPlaces: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU', decimalPlaces: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimalPlaces: 0 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', decimalPlaces: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimalPlaces: 0 }
] as const

export const CURRENCIES_MAP = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c])
) as Record<(typeof CURRENCIES)[number]['code'], Currency>

export const DEFAULT_CURRENCY = CURRENCIES_MAP.USD

// ──────────────────────────────────────────────
// Departments (common org departments)
// ──────────────────────────────────────────────

export interface DepartmentConfig {
  value: string
  label: string
  description: string
}

export const DEPARTMENTS: DepartmentConfig[] = [
  { value: 'engineering', label: 'Engineering', description: 'Software development & infrastructure' },
  { value: 'design', label: 'Design', description: 'UI/UX, graphic design & branding' },
  { value: 'product', label: 'Product', description: 'Product management & strategy' },
  { value: 'marketing', label: 'Marketing', description: 'Marketing, comms & PR' },
  { value: 'sales', label: 'Sales', description: 'Sales & business development' },
  { value: 'finance', label: 'Finance', description: 'Accounting, finance & audit' },
  { value: 'hr', label: 'Human Resources', description: 'HR, recruitment & people ops' },
  { value: 'operations', label: 'Operations', description: 'Operations & administration' },
  { value: 'legal', label: 'Legal', description: 'Legal, compliance & contracts' },
  { value: 'support', label: 'Customer Support', description: 'Customer success & support' },
  { value: 'it', label: 'IT', description: 'Information technology & infrastructure' },
  { value: 'research', label: 'R&D', description: 'Research & development' },
  { value: 'executive', label: 'Executive', description: 'C-suite & executive management' },
  { value: 'admin', label: 'Administration', description: 'General administration' }
] as const

export const DEPARTMENTS_MAP = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.value, d])
) as Record<(typeof DEPARTMENTS)[number]['value'], DepartmentConfig>

// ──────────────────────────────────────────────
// Company Tiers
// ──────────────────────────────────────────────

export interface CompanyTier {
  value: string
  label: string
  description: string
  monthlyPrice: number
  maxUsers: number
  maxExpenseLimit: number
  features: string[]
  highlighted: boolean
}

export const COMPANY_TIERS: CompanyTier[] = [
  {
    value: 'free',
    label: 'Free',
    description: 'For individuals and small teams getting started',
    monthlyPrice: 0,
    maxUsers: 5,
    maxExpenseLimit: 10000,
    features: [
      'Up to 5 users',
      'Basic expense tracking',
      'Receipt capture',
      'Email support'
    ],
    highlighted: false
  },
  {
    value: 'starter',
    label: 'Starter',
    description: 'For growing teams that need basic approval flows',
    monthlyPrice: 29,
    maxUsers: 20,
    maxExpenseLimit: 50000,
    features: [
      'Up to 20 users',
      'Multi-level approvals',
      'Basic reporting',
      'Department budgets',
      'Receipt OCR',
      'Chat & email support'
    ],
    highlighted: false
  },
  {
    value: 'business',
    label: 'Business',
    description: 'For established companies with advanced needs',
    monthlyPrice: 99,
    maxUsers: 100,
    maxExpenseLimit: 250000,
    features: [
      'Up to 100 users',
      'Advanced approval chains',
      'AI-powered categorization',
      'Custom reporting & analytics',
      'Budget forecasting',
      'Vendor management',
      'Audit logs',
      'Priority support'
    ],
    highlighted: true
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'For large organizations with custom requirements',
    monthlyPrice: -1, // custom pricing
    maxUsers: -1,     // unlimited
    maxExpenseLimit: -1,
    features: [
      'Unlimited users',
      'Custom approval workflows',
      'Dedicated AI model',
      'Advanced analytics & dashboards',
      'SSO & SAML',
      'Custom integrations',
      'SLA guarantees',
      'Dedicated account manager',
      '24/7 phone & email support',
      'On-premise deployment option'
    ],
    highlighted: false
  }
] as const

export const COMPANY_TIERS_MAP = Object.fromEntries(
  COMPANY_TIERS.map((t) => [t.value, t])
) as Record<(typeof COMPANY_TIERS)[number]['value'], CompanyTier>

// ──────────────────────────────────────────────
// Notification Types
// ──────────────────────────────────────────────

export interface NotificationTypeConfig {
  value: string
  label: string
  icon: string
  color: string
  description: string
}

export const NOTIFICATION_TYPES: NotificationTypeConfig[] = [
  {
    value: 'expense_submitted',
    label: 'Expense Submitted',
    icon: '📤',
    color: 'text-blue-500',
    description: 'An expense has been submitted for approval'
  },
  {
    value: 'expense_approved',
    label: 'Expense Approved',
    icon: '✅',
    color: 'text-green-500',
    description: 'Your expense has been approved'
  },
  {
    value: 'expense_rejected',
    label: 'Expense Rejected',
    icon: '❌',
    color: 'text-red-500',
    description: 'Your expense has been rejected'
  },
  {
    value: 'expense_changes_requested',
    label: 'Changes Requested',
    icon: '🔄',
    color: 'text-orange-500',
    description: 'Changes have been requested for your expense'
  },
  {
    value: 'expense_reimbursed',
    label: 'Expense Reimbursed',
    icon: '💰',
    color: 'text-teal-500',
    description: 'Your expense has been reimbursed'
  },
  {
    value: 'approval_reminder',
    label: 'Approval Reminder',
    icon: '⏰',
    color: 'text-yellow-500',
    description: 'Reminder to review pending approvals'
  },
  {
    value: 'budget_alert',
    label: 'Budget Alert',
    icon: '📊',
    color: 'text-red-500',
    description: 'Department budget threshold exceeded'
  },
  {
    value: 'policy_violation',
    label: 'Policy Violation',
    icon: '⚠️',
    color: 'text-orange-500',
    description: 'Expense flagged for policy violation'
  },
  {
    value: 'report_ready',
    label: 'Report Ready',
    icon: '📄',
    color: 'text-indigo-500',
    description: 'Your generated report is ready to view'
  },
  {
    value: 'system_update',
    label: 'System Update',
    icon: '🔔',
    color: 'text-gray-500',
    description: 'System maintenance or update notification'
  },
  {
    value: 'new_user_joined',
    label: 'New User Joined',
    icon: '👋',
    color: 'text-blue-500',
    description: 'A new user has joined the company'
  },
  {
    value: 'role_changed',
    label: 'Role Changed',
    icon: '🔄',
    color: 'text-purple-500',
    description: 'Your role has been updated'
  },
  {
    value: 'company_settings_updated',
    label: 'Settings Updated',
    icon: '⚙️',
    color: 'text-gray-500',
    description: 'Company settings have been changed'
  }
] as const

export const NOTIFICATION_TYPES_MAP = Object.fromEntries(
  NOTIFICATION_TYPES.map((n) => [n.value, n])
) as Record<(typeof NOTIFICATION_TYPES)[number]['value'], NotificationTypeConfig>

// ──────────────────────────────────────────────
// Report Types
// ──────────────────────────────────────────────

export interface ReportTypeConfig {
  value: string
  label: string
  icon: string
  description: string
  category: 'financial' | 'operational' | 'compliance' | 'analytics'
}

export const REPORT_TYPES: ReportTypeConfig[] = [
  {
    value: 'expense_summary',
    label: 'Expense Summary',
    icon: '📊',
    description: 'Overview of all expenses within a date range',
    category: 'financial'
  },
  {
    value: 'category_breakdown',
    label: 'Category Breakdown',
    icon: '📈',
    description: 'Expenses grouped by category with totals and percentages',
    category: 'financial'
  },
  {
    value: 'department_spend',
    label: 'Department Spend',
    icon: '🏢',
    description: 'Spend analysis across departments',
    category: 'financial'
  },
  {
    value: 'budget_utilization',
    label: 'Budget Utilization',
    icon: '💰',
    description: 'Budget vs actual spend analysis',
    category: 'financial'
  },
  {
    value: 'monthly_trend',
    label: 'Monthly Trend',
    icon: '📉',
    description: 'Month-over-month expense trends',
    category: 'analytics'
  },
  {
    value: 'vendor_analysis',
    label: 'Vendor Analysis',
    icon: '🏪',
    description: 'Spend analysis by vendor',
    category: 'financial'
  },
  {
    value: 'approval_metrics',
    label: 'Approval Metrics',
    icon: '⏱️',
    description: 'Approval cycle times and bottlenecks',
    category: 'operational'
  },
  {
    value: 'policy_compliance',
    label: 'Policy Compliance',
    icon: '🛡️',
    description: 'Expense policy violation report',
    category: 'compliance'
  },
  {
    value: 'reimbursement_report',
    label: 'Reimbursement Report',
    icon: '💳',
    description: 'Pending and completed reimbursements',
    category: 'financial'
  },
  {
    value: 'tax_report',
    label: 'Tax Report',
    icon: '🧾',
    description: 'GST/tax summary for compliance',
    category: 'compliance'
  },
  {
    value: 'user_activity',
    label: 'User Activity',
    icon: '👥',
    description: 'User submission and approval activity',
    category: 'operational'
  },
  {
    value: 'ai_insights',
    label: 'AI Insights',
    icon: '🤖',
    description: 'AI-generated insights and anomaly detection',
    category: 'analytics'
  },
  {
    value: 'custom_report',
    label: 'Custom Report',
    icon: '📋',
    description: 'Build a custom report with selected metrics',
    category: 'analytics'
  }
] as const

export const REPORT_TYPES_MAP = Object.fromEntries(
  REPORT_TYPES.map((r) => [r.value, r])
) as Record<(typeof REPORT_TYPES)[number]['value'], ReportTypeConfig>

// ──────────────────────────────────────────────
// Chart Colors
// ──────────────────────────────────────────────

/**
 * Carefully curated palette of colors for charts and visualizations.
 * Each color includes a main hex, a lighter tint for backgrounds/gradients,
 * and a darker shade for accents.
 */
export interface ChartColor {
  main: string
  light: string
  dark: string
  label: string
}

export const CHART_COLORS: ChartColor[] = [
  { main: '#6366F1', light: '#EEF2FF', dark: '#4338CA', label: 'Indigo' },
  { main: '#8B5CF6', light: '#F5F3FF', dark: '#6D28D9', label: 'Violet' },
  { main: '#EC4899', light: '#FDF2F8', dark: '#BE185D', label: 'Pink' },
  { main: '#F43F5E', light: '#FFF1F2', dark: '#BE123C', label: 'Rose' },
  { main: '#F97316', light: '#FFF7ED', dark: '#C2410C', label: 'Orange' },
  { main: '#EAB308', light: '#FEFCE8', dark: '#A16207', label: 'Yellow' },
  { main: '#22C55E', light: '#F0FDF4', dark: '#15803D', label: 'Green' },
  { main: '#14B8A6', light: '#F0FDFA', dark: '#0D9488', label: 'Teal' },
  { main: '#06B6D4', light: '#ECFEFF', dark: '#0891B2', label: 'Cyan' },
  { main: '#3B82F6', light: '#EFF6FF', dark: '#1D4ED8', label: 'Blue' },
  { main: '#A855F7', light: '#FAF5FF', dark: '#7E22CE', label: 'Purple' },
  { main: '#64748B', light: '#F8FAFC', dark: '#475569', label: 'Slate' }
] as const

/** Convenience array of just the main hex values */
export const CHART_COLORS_HEX: string[] = CHART_COLORS.map((c) => c.main)

/** Convenience array of just the light tint hex values */
export const CHART_COLORS_LIGHT: string[] = CHART_COLORS.map((c) => c.light)

// ──────────────────────────────────────────────
// Miscellaneous Constants
// ──────────────────────────────────────────────

export const APP_NAME = 'FinFlow AI'
export const APP_SHORT_NAME = 'FinFlow'
export const APP_DESCRIPTION = 'AI-Powered Enterprise Expense Management'

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  MAX_PAGE_SIZE: 200
} as const

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_SHORT: 'MMM dd',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  API: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMM yyyy',
  YEAR_MONTH: 'yyyy-MM',
  FISCAL: 'yyyy'
} as const

export const FILE_SIZE_LIMITS = {
  RECEIPT: 10 * 1024 * 1024,     // 10 MB
  INVOICE: 10 * 1024 * 1024,     // 10 MB
  AVATAR: 5 * 1024 * 1024,       // 5 MB
  REPORT: 25 * 1024 * 1024       // 25 MB
} as const

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
] as const

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
] as const

export const APPROVAL_THRESHOLDS = {
  MANAGER_LIMIT: 5000,       // Expenses up to $5000 can be manager-approved
  FINANCE_LIMIT: 25000,      // Expenses up to $25000 need finance approval
  CEO_LIMIT: 100000          // Expenses above $100000 need CEO approval
} as const

export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol])
)
