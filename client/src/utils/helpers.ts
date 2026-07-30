import { type ClassValue } from 'clsx'
import { cn } from '@/lib/cn'
import { EXPENSE_STATUS_MAP, USER_ROLES_MAP } from '@/constants'
import type { ExpenseStatus, UserRole } from '@/types'

// ──────────────────────────────────────────────
// Identity & slugs
// ──────────────────────────────────────────────

/**
 * Generate a cryptographically random, URL-safe ID.
 * Falls back to `Math.random` when `crypto` is unavailable.
 *
 * @example generateId() // "k8f9a3h2j1d0"
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for environments without crypto.randomUUID
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 12)
  return `${timestamp}-${randomPart}`
}

/**
 * Convert arbitrary text into a URL-friendly slug.
 *
 * @example generateSlug('  Hello World!  ') // "hello-world"
 * @example generateSlug('FinFlow AI Rocks') // "finflow-ai-rocks"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove non-word chars (except spaces & hyphens)
    .replace(/[\s_]+/g, '-')    // Replace whitespace/underscores with hyphens
    .replace(/-+/g, '-')        // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')    // Trim leading/trailing hyphens
}

// ──────────────────────────────────────────────
// Text utilities
// ──────────────────────────────────────────────

/**
 * Truncate text to a given length, appending an ellipsis when trimmed.
 *
 * @example truncate('Hello World', 8)   // "Hello Wo…"
 * @example truncate('Short', 20)        // "Short"
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}…`
}

// ──────────────────────────────────────────────
// Performance
// ──────────────────────────────────────────────

/**
 * Create a debounced version of a function.
 *
 * @param fn    - The function to debounce.
 * @param delay - Milliseconds to wait before invoking.
 *
 * @example
 * const save = debounce((val: string) => api.save(val), 300)
 * input.addEventListener('input', (e) => save(e.target.value))
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

// ──────────────────────────────────────────────
// Re-exports
// ──────────────────────────────────────────────

export { cn }

// ──────────────────────────────────────────────
// Status / role colour helpers
// ──────────────────────────────────────────────

/**
 * Map an expense status to a Tailwind background colour class.
 *
 * @example getStatusColor('pending')   // "bg-yellow-100"
 * @example getStatusColor('approved')  // "bg-green-100"
 */
export function getStatusColor(status: ExpenseStatus): string {
  return EXPENSE_STATUS_MAP[status]?.color ?? 'bg-gray-100'
}

/**
 * Map an expense status to a Tailwind text colour class.
 *
 * @example getStatusTextColor('pending')   // "text-yellow-800"
 * @example getStatusTextColor('rejected')  // "text-red-800"
 */
export function getStatusTextColor(status: ExpenseStatus): string {
  return EXPENSE_STATUS_MAP[status]?.textColor ?? 'text-gray-700'
}

/**
 * Map an expense status to a dot / indicator colour (hex).
 *
 * @example getStatusDotColor('pending')  // "#F59E0B"
 */
export function getStatusDotColor(status: ExpenseStatus): string {
  return EXPENSE_STATUS_MAP[status]?.dotColor ?? '#9CA3AF'
}

/**
 * Get the human-readable label for an expense status.
 *
 * @example getStatusLabel('manager_approved') // "Manager Approved"
 */
export function getStatusLabel(status: ExpenseStatus): string {
  return EXPENSE_STATUS_MAP[status]?.label ?? status
}

/**
 * Map a user role to a Tailwind background colour class for badges.
 *
 * @example getRoleBadgeColor('ceo')            // "bg-purple-100"
 * @example getRoleBadgeColor('finance_manager') // "bg-blue-100"
 */
export function getRoleBadgeColor(role: UserRole): string {
  return USER_ROLES_MAP[role]?.color ?? 'bg-gray-100'
}

/**
 * Map a user role to a Tailwind text colour class.
 *
 * @example getRoleTextColor('ceo')  // "text-purple-800"
 */
export function getRoleTextColor(role: UserRole): string {
  return USER_ROLES_MAP[role]?.textColor ?? 'text-gray-800'
}

/**
 * Get the human-readable label for a user role.
 *
 * @example getRoleLabel('dept_manager') // "Department Manager"
 */
export function getRoleLabel(role: UserRole): string {
  return USER_ROLES_MAP[role]?.label ?? role
}
