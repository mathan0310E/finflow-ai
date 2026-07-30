// ──────────────────────────────────────────────
// Utility Helpers
// ──────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4 string
 */
export function generateUuid(): string {
  return uuidv4();
}

/**
 * Create a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Paginate Firestore query results
 */
export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; page: number; limit: number; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return { data, page, limit, total, totalPages };
}

/**
 * Parse pagination params from request query
 */
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 20));
  return { page, limit };
}

/**
 * Strip undefined fields from an object (for Firestore updates)
 */
export function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned as Partial<T>;
}

/**
 * Convert Firestore Timestamp or Date to ISO string
 */
export function dateToISO(date: unknown): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'object' && 'toDate' in (date as object)) {
    return (date as { toDate: () => Date }).toDate().toISOString();
  }
  if (date instanceof Date) {
    return date.toISOString();
  }
  return String(date);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get the start and end of a month for a given date
 */
export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the start and end of a quarter
 */
export function getQuarterRange(year: number, quarter: number): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the start and end of a fiscal year
 */
export function getYearRange(year: number): { start: Date; end: Date } {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Deep clone an object (JSON-safe)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Mask sensitive data in logs
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

/**
 * Sanitize user input for text search
 */
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[<>{}()"'`;\\]/g, '').trim();
}
