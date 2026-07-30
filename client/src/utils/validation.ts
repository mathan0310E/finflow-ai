import { z } from 'zod'
import { FILE_SIZE_LIMITS, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from '@/constants'

// ──────────────────────────────────────────────
// Shared primitives
// ──────────────────────────────────────────────

const currencyCode = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')

const phoneRegex = /^\+?[\d\s\-().]{7,20}$/

// ──────────────────────────────────────────────
// Expense schema
// ──────────────────────────────────────────────

export const expenseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),

  description: z
    .string()
    .max(1_000, 'Description must be 1 000 characters or less')
    .optional()
    .or(z.literal('')),

  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .max(999_999_999.99, 'Amount is too large'),

  currency: currencyCode.default('USD'),

  category: z
    .string()
    .min(1, 'Category is required'),

  subCategory: z
    .string()
    .optional()
    .or(z.literal('')),

  date: z
    .union([z.date(), z.string()])
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Invalid date'),

  vendor: z
    .string()
    .max(200, 'Vendor name is too long')
    .optional()
    .or(z.literal('')),

  project: z
    .string()
    .max(200, 'Project name is too long')
    .optional()
    .or(z.literal('')),

  departmentId: z
    .string()
    .optional()
    .or(z.literal('')),

  tags: z
    .array(z.string().max(50))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),

  notes: z
    .string()
    .max(2_000, 'Notes must be 2 000 characters or less')
    .optional()
    .or(z.literal('')),

  receipt: z
    .any()
    .optional(),

  invoice: z
    .any()
    .optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

// ──────────────────────────────────────────────
// Industry list for company registration
// ──────────────────────────────────────────────

const INDUSTRIES = [
  'Technology & Software',
  'Healthcare & Pharmaceuticals',
  'Finance & Banking',
  'Education & E-Learning',
  'E-Commerce & Retail',
  'Manufacturing & Industrial',
  'Media & Entertainment',
  'Real Estate & Construction',
  'Consulting & Professional Services',
  'Telecommunications',
  'Transportation & Logistics',
  'Energy & Utilities',
  'Hospitality & Tourism',
  'Agriculture & Food',
  'Non-Profit & NGO',
  'Government & Public Sector',
  'Legal & Law',
  'Other',
] as const

// ──────────────────────────────────────────────
// Company size options
// ──────────────────────────────────────────────

const companySizeEnum = z.enum(['startup', 'small_business', 'medium_business', 'enterprise'])

// ──────────────────────────────────────────────
// Shared auth primitives
// ──────────────────────────────────────────────

const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const confirmPasswordField = z
  .string()
  .min(1, 'Please confirm your password')

const firstNameField = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be 50 characters or less')
  .trim()

const lastNameField = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must be 50 characters or less')
  .trim()

const acceptTermsField = z
  .boolean()
  .refine((val) => val === true, 'You must accept the Terms of Service')

const acceptPrivacyField = z
  .boolean()
  .refine((val) => val === true, 'You must accept the Privacy Policy')

// ──────────────────────────────────────────────
// New Registration Schemas
// ──────────────────────────────────────────────

export const personalRegisterSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
    acceptTerms: acceptTermsField,
    acceptPrivacy: acceptPrivacyField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PersonalRegisterFormData = z.infer<typeof personalRegisterSchema>

export const companyRegisterSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
    companyName: z
      .string()
      .min(1, 'Company name is required')
      .max(200, 'Company name is too long')
      .trim(),
    industry: z.string().optional().or(z.literal('')),
    companySize: companySizeEnum.default('startup'),
    country: z.string().optional().or(z.literal('')),
    currency: z
      .string()
      .length(3)
      .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
      .default('USD'),
    acceptTerms: acceptTermsField,
    acceptPrivacy: acceptPrivacyField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type CompanyRegisterFormData = z.infer<typeof companyRegisterSchema>

export const joinCompanySchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    password: passwordField,
    confirmPassword: confirmPasswordField,
    invitationCode: z
      .string()
      .min(1, 'Invitation code is required')
      .max(50, 'Invalid invitation code')
      .trim(),
    acceptTerms: acceptTermsField,
    acceptPrivacy: acceptPrivacyField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type JoinCompanyFormData = z.infer<typeof joinCompanySchema>

// ──────────────────────────────────────────────
// Onboarding schemas
// ──────────────────────────────────────────────

export const onboardingWorkspaceSchema = z.object({
  workspaceType: z.enum(['personal', 'company']),
})

export type OnboardingWorkspaceFormData = z.infer<typeof onboardingWorkspaceSchema>

export const onboardingCompanyDetailsSchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long')
    .trim(),
  industry: z.string().optional().or(z.literal('')),
  size: companySizeEnum.default('startup'),
  country: z.string().optional().or(z.literal('')),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
    .default('USD'),
  timezone: z.string().default('UTC'),
  website: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type OnboardingCompanyDetailsFormData = z.infer<typeof onboardingCompanyDetailsSchema>

export const onboardingPersonalSchema = z.object({
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
    .default('USD'),
  monthlyBudget: z
    .number({ message: 'Monthly budget must be a number' })
    .nonnegative('Budget cannot be negative')
    .optional(),
  categories: z
    .array(z.string())
    .max(20, 'Maximum 20 categories allowed')
    .optional()
    .default([]),
})

export type OnboardingPersonalFormData = z.infer<typeof onboardingPersonalSchema>

export const onboardingDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name is too long')
    .trim(),
  budget: z
    .number({ message: 'Budget must be a number' })
    .nonnegative('Budget cannot be negative')
    .default(0),
})

export type OnboardingDepartmentFormData = z.infer<typeof onboardingDepartmentSchema>

export const onboardingInviteSchema = z.object({
  emails: z
    .array(
      z
        .string()
        .email('Invalid email address')
    )
    .min(0)
    .max(50, 'Maximum 50 invitations at a time'),
  role: z.enum(['employee', 'dept_manager', 'finance_manager']).default('employee'),
})

export type OnboardingInviteFormData = z.infer<typeof onboardingInviteSchema>

export const onboardingBudgetSchema = z.object({
  totalBudget: z
    .number({ message: 'Budget is required' })
    .nonnegative('Budget cannot be negative')
    .default(0),
  fiscalYear: z.string().default(new Date().getFullYear().toString()),
  period: z.enum(['annual', 'quarterly', 'monthly']).default('annual'),
})

export type OnboardingBudgetFormData = z.infer<typeof onboardingBudgetSchema>

export const onboardingPoliciesSchema = z.object({
  requireManagerApproval: z.boolean().default(true),
  requireFinanceApproval: z.boolean().default(true),
  requireCeoApproval: z.boolean().default(true),
  autoApprovalLimit: z
    .number({ message: 'Auto-approval limit is required' })
    .nonnegative('Limit cannot be negative')
    .default(1000),
  maxExpenseAmount: z
    .number({ message: 'Max expense amount is required' })
    .nonnegative('Amount cannot be negative')
    .default(100000),
})

export type OnboardingPoliciesFormData = z.infer<typeof onboardingPoliciesSchema>

export const onboardingAiPreferencesSchema = z.object({
  enableAi: z.boolean().default(true),
  enableOcr: z.boolean().default(true),
  enableAnomalyDetection: z.boolean().default(true),
  enableAutoCategorization: z.boolean().default(true),
  enableBudgetForecasting: z.boolean().default(false),
  enableSmartAlerts: z.boolean().default(true),
})

export type OnboardingAiPreferencesFormData = z.infer<typeof onboardingAiPreferencesSchema>

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be 128 characters or less')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    displayName: z
      .string()
      .min(1, 'Display name is required')
      .max(100, 'Display name must be 100 characters or less')
      .trim(),

    companyName: z
      .string()
      .min(1, 'Company name is required')
      .max(200, 'Company name is too long')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// ──────────────────────────────────────────────
// Company schema
// ──────────────────────────────────────────────

export const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name is too long')
    .trim(),

  website: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  industry: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  size: z
    .number({ message: 'Size must be a number' })
    .int('Size must be a whole number')
    .nonnegative('Size cannot be negative')
    .default(1),

  currency: currencyCode.default('USD'),

  timezone: z
    .string()
    .default('UTC'),

  logo: z
    .any()
    .optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

// ──────────────────────────────────────────────
// Department schema
// ──────────────────────────────────────────────

export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name is too long')
    .trim(),

  headId: z
    .string()
    .optional()
    .or(z.literal('')),

  budget: z
    .number({ message: 'Budget must be a number' })
    .nonnegative('Budget cannot be negative')
    .default(0),

  status: z
    .enum(['active', 'inactive'])
    .default('active'),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

// ──────────────────────────────────────────────
// Profile schema
// ──────────────────────────────────────────────

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name is too long')
    .trim(),

  email: z
    .string()
    .email('Invalid email address'),

  phone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),

  designation: z
    .string()
    .max(100)
    .optional()
    .or(z.literal('')),

  employeeId: z
    .string()
    .max(50)
    .optional()
    .or(z.literal('')),

  photoURL: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  avatar: z
    .any()
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ──────────────────────────────────────────────
// Reusable helpers
// ──────────────────────────────────────────────

/**
 * Validate that an uploaded file is within the allowed size limit for its type.
 */
export function validateFileSize(
  file: File,
  limit: keyof typeof FILE_SIZE_LIMITS = 'RECEIPT',
): { valid: boolean; message?: string } {
  const maxBytes = FILE_SIZE_LIMITS[limit]
  if (file.size > maxBytes) {
    const maxMB = maxBytes / (1024 * 1024)
    return {
      valid: false,
      message: `File must be smaller than ${maxMB} MB`,
    }
  }
  return { valid: true }
}

/**
 * Validate that an uploaded file has an allowed MIME type.
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[] = ALLOWED_DOCUMENT_TYPES,
): { valid: boolean; message?: string } {
  if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
    return {
      valid: false,
      message: `File type "${file.type}" is not supported`,
    }
  }
  return { valid: true }
}

/**
 * Validate an image file (size + type) in a single call.
 */
export function validateImageFile(
  file: File,
): { valid: boolean; message?: string } {
  const sizeCheck = validateFileSize(file, 'AVATAR')
  if (!sizeCheck.valid) return sizeCheck

  const typeCheck = validateFileType(file, ALLOWED_IMAGE_TYPES)
  if (!typeCheck.valid) return typeCheck

  return { valid: true }
}
