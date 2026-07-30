import {
  format as dateFnsFormat,
  formatDistanceToNow,
  formatDistance,
  isValid,
} from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import { DATE_FORMATS, CURRENCIES_MAP } from '@/constants'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type DateLike = Date | Timestamp | string | number | null | undefined

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Normalise a date-like value into a Date object.
 * Supports Firestore Timestamp, ISO strings, Unix ms timestamps, and nullish.
 */
function toDate(value: DateLike): Date | null {
  if (value == null) return null
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isValid(d) ? d : null
  }
  return null
}

// ──────────────────────────────────────────────
// Public formatters
// ──────────────────────────────────────────────

/**
 * Format a monetary amount for display.
 *
 * @param amount  - The numeric value to format.
 * @param currency - ISO 4217 currency code (default USD).
 *
 * @example formatCurrency(1234.5)        // "$1,234.50"
 * @example formatCurrency(1000, 'EUR')   // "€1,000.00"
 * @example formatCurrency(1000, 'INR')   // "₹1,000.00"
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyConfig = CURRENCIES_MAP[currency]
  const locale = currencyConfig?.locale ?? 'en-US'
  const minFraction = currencyConfig?.decimalPlaces ?? 2

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: minFraction,
      maximumFractionDigits: minFraction,
    }).format(amount)
  } catch {
    // Fallback for unsupported currency codes
    return `${currency} ${amount.toFixed(minFraction)}`
  }
}

/**
 * Format a date into a human-readable string.
 *
 * @param date   - Date, Firestore Timestamp, ISO string, or Unix-ms number.
 * @param fmt    - date-fns format string (defaults to `DATE_FORMATS.DISPLAY`).
 *
 * @example formatDate(new Date())                              // "Jan 15, 2025"
 * @example formatDate(timestamp, 'yyyy-MM-dd')                 // "2025-01-15"
 * @example formatDate('2025-01-15T10:30:00Z', DATE_FORMATS.DISPLAY_WITH_TIME)
 *                                                            // "Jan 15, 2025 10:30 AM"
 */
export function formatDate(
  date: DateLike,
  fmt: string = DATE_FORMATS.DISPLAY,
): string {
  const d = toDate(date)
  if (!d) return '—'
  return dateFnsFormat(d, fmt)
}

/**
 * Format a date as a relative time string.
 *
 * @param date   - Date, Firestore Timestamp, ISO string, or Unix-ms number.
 * @param base   - Optional reference date (defaults to `new Date()`).
 *
 * @example formatRelativeTime(new Date(Date.now() - 7_200_000)) // "2 hours ago"
 * @example formatRelativeTime(timestamp)                         // "3 days ago"
 */
export function formatRelativeTime(date: DateLike, base?: Date): string {
  const d = toDate(date)
  if (!d) return '—'

  if (base) {
    return formatDistance(d, base, { addSuffix: true })
  }
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format a ratio as a percentage string.
 *
 * @param value - A number between 0 and 1 (or any number).
 *
 * @example formatPercentage(0.256)   // "25.6%"
 * @example formatPercentage(1)       // "100%"
 * @example formatPercentage(0)       // "0%"
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a number with thousands separators.
 *
 * @param value - The numeric value to format.
 *
 * @example formatNumber(1234567) // "1,234,567"
 * @example formatNumber(1000.5)  // "1,000.5"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// Re-export date-fns format for convenience when callers need a quick one-off
export { dateFnsFormat }
