import { auth } from '@/lib/firebase'

// ──────────────────────────────────────────────
// Enhanced API Client with Security Features
//   • Automatic Firebase auth token injection
//   • CSRF token handling (double-submit cookie pattern)
//   • Request/response interceptors for security headers
//   • Enhanced error handling (no internal leakage)
//   • Request timeout
//   • Retry logic for transient failures
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/** HTTP methods supported by the API client. */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Options accepted by every request method. */
interface RequestOptions {
  /** Additional headers to merge. */
  headers?: Record<string, string>
  /** AbortSignal for cancellation. */
  signal?: AbortSignal
  /** Override the base URL for this request. */
  baseUrl?: string
  /** Skip auth token injection (e.g. for public endpoints). */
  skipAuth?: boolean
  /** Skip CSRF token injection. */
  skipCsrf?: boolean
  /** Request timeout in milliseconds (default: 30000). */
  timeout?: number
  /** Number of retries for transient failures (default: 0). */
  retries?: number
}

/** Payload-bearing request options (POST, PUT, PATCH). */
interface BodyRequestOptions<TBody = unknown> extends RequestOptions {
  /** Request body – will be JSON-serialised. */
  body?: TBody
}

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

/** Default request timeout (30 seconds). */
const DEFAULT_TIMEOUT = 30000

/** Maximum number of retries for transient failures. */
const DEFAULT_RETRIES = 0

/** Retry delay base in ms (exponential backoff). */
const RETRY_DELAY_BASE = 1000

/** CSRF cookie name (must match server). */
const CSRF_COOKIE_NAME = 'XSRF-TOKEN'

/** CSRF header name (must match server). */
const CSRF_HEADER_NAME = 'x-xsrf-token'

// ──────────────────────────────────────────────
// Error class
// ──────────────────────────────────────────────

/** Structured API error returned by the server. */
export interface ApiErrorPayload {
  message: string
  code?: string
  details?: Record<string, string[]>
}

/**
 * Custom error for non-OK HTTP responses.
 * Carries the status code and any structured payload from the server.
 * Does NOT leak internal error details.
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly details?: Record<string, string[]>

  constructor(status: number, payload: ApiErrorPayload) {
    // Sanitize the message — never expose internal details
    const safeMessage = sanitizeErrorMessage(payload.message)
    super(safeMessage)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code
    this.details = payload.details
  }
}

// ──────────────────────────────────────────────
// CSRF Token Helpers
// ──────────────────────────────────────────────

/**
 * Get the CSRF token from the cookie.
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Fetch a fresh CSRF token from the server.
 */
async function fetchCsrfToken(baseUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.data?.token ?? null
  } catch {
    return null
  }
}

/**
 * Ensure a CSRF token is available for mutating requests.
 */
async function ensureCsrfToken(baseUrl: string): Promise<string | null> {
  let token = getCsrfTokenFromCookie()
  if (!token) {
    token = await fetchCsrfToken(baseUrl)
  }
  return token
}

// ──────────────────────────────────────────────
// Token helper
// ──────────────────────────────────────────────

/**
 * Retrieve a fresh Firebase ID token for the currently authenticated user.
 * Returns `null` when no user is signed in.
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  try {
    return await user.getIdToken(false)
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────
// Security utilities
// ──────────────────────────────────────────────

/**
 * Sanitize error messages to prevent information leakage.
 */
function sanitizeErrorMessage(message: string): string {
  // Remove any content that looks like internal paths
  const withoutPaths = message.replace(/[/\\][a-zA-Z0-9_\-./\\]+[/\\]/g, ' [path] ')

  // Remove any content that looks like stack traces
  const withoutStackTrace = withoutPaths.replace(/at\s+\S+\s+\(.*?\)/g, '')

  // Remove potential SQL/NoSQL query fragments
  const withoutQueries = withoutStackTrace.replace(/select\s+.*?\s+from/gi, '[query]')

  // Limit length
  if (withoutQueries.length > 200) {
    return withoutQueries.substring(0, 200) + '...'
  }

  return withoutQueries
}

/**
 * Create a request ID for tracing.
 */
function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ──────────────────────────────────────────────
// Core request
// ──────────────────────────────────────────────

/**
 * Low-level request function used internally by every public method.
 *
 * - Injects `Authorization: Bearer <token>` when the user is signed in.
 * - Injects CSRF token for mutating requests.
 * - Adds security headers (X-Request-ID, X-Content-Type-Options).
 * - Throws an `ApiError` on non-2xx responses with sanitized messages.
 * - Supports request timeout and retry with exponential backoff.
 */
async function request<TResponse = unknown>(
  method: HttpMethod,
  path: string,
  options: BodyRequestOptions = {},
  retryCount: number = 0,
): Promise<TResponse> {
  const {
    headers: extraHeaders,
    signal: externalSignal,
    baseUrl,
    skipAuth,
    skipCsrf,
    body,
    timeout = DEFAULT_TIMEOUT,
  } = options

  const url = `${baseUrl ?? DEFAULT_BASE_URL}${path}`
  const requestId = createRequestId()

  // ── Build headers ──
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Request-ID': requestId,
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  }

  // Attach auth token unless explicitly skipped
  if (!skipAuth) {
    const token = await getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // Set content-type for payload-bearing requests
  const hasBody = body !== undefined && method !== 'GET' && method !== 'DELETE'
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  // ── CSRF Token (mutating requests only) ──
  const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
  if (isMutating && !skipCsrf) {
    const csrfToken = await ensureCsrfToken(baseUrl ?? DEFAULT_BASE_URL)
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken
    }
  }

  // ── Timeout handling ──
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Combine external signal with timeout signal
  const signal = externalSignal
    ? combineAbortSignals(externalSignal, controller.signal)
    : controller.signal

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      signal,
      body: hasBody ? JSON.stringify(body) : undefined,
      credentials: 'include', // Send cookies for CSRF
    })
  } catch (err) {
    clearTimeout(timeoutId)

    // Network errors, AbortError, etc.
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw err // External cancellation
      }
      throw new ApiError(408, {
        message: 'Request timed out',
        code: 'TIMEOUT',
      })
    }

    // ── Retry logic for transient failures ──
    const maxRetries = options.retries ?? DEFAULT_RETRIES
    if (retryCount < maxRetries) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount)
      await sleep(delay)
      return request<TResponse>(method, path, options, retryCount + 1)
    }

    throw new ApiError(0, {
      message: 'Network request failed',
      code: 'NETWORK_ERROR',
    })
  }

  clearTimeout(timeoutId)

  // ── Handle empty responses (204 No Content) ──
  const contentLength = response.headers.get('Content-Length')
  const contentType = response.headers.get('Content-Type') ?? ''

  let data: unknown = undefined
  if (
    response.status !== 204 &&
    contentLength !== '0' &&
    contentType.includes('json')
  ) {
    try {
      data = await response.json()
    } catch {
      // Response body is not valid JSON – ignore
    }
  }

  if (!response.ok) {
    // Sanitize error payload — never expose internal details
    const rawPayload =
      data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)
        ? (data as ApiErrorPayload)
        : { message: `Request failed with status ${response.status}` }

    // Sanitize the error message
    const sanitizedPayload: ApiErrorPayload = {
      ...rawPayload,
      message: sanitizeErrorMessage(rawPayload.message),
    }

    throw new ApiError(response.status, sanitizedPayload)
  }

  return data as TResponse
}

// ──────────────────────────────────────────────
// AbortSignal combining utility
// ──────────────────────────────────────────────

/**
 * Combine multiple AbortSignals into one.
 * The combined signal aborts when any of the input signals abort.
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true })
  }

  return controller.signal
}

// ──────────────────────────────────────────────
// Public API client
// ──────────────────────────────────────────────

/**
 * Type-safe fetch wrapper with automatic Firebase auth injection,
 * CSRF protection, timeout, retry, and sanitized error handling.
 *
 * @example
 * ```typescript
 * // GET with typed response
 * const expenses = await api.get<Expense[]>('/expenses')
 *
 * // POST with typed body & response
 * const created = await api.post<Expense, CreateExpenseDto>('/expenses', {
 *   body: { title: 'Lunch', amount: 25 },
 * })
 *
 * // With retry for transient failures
 * const data = await api.get('/important', { retries: 2 })
 *
 * // Error handling (no internal leakage)
 * try {
 *   await api.get('/protected')
 * } catch (err) {
 *   if (err instanceof ApiError) {
 *     console.error(err.status, err.message) // Sanitized
 *   }
 * }
 * ```
 */
export const api = {
  get<TResponse = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>('GET', path, options ?? {})
  },

  post<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: BodyRequestOptions<TBody>,
  ): Promise<TResponse> {
    return request<TResponse>('POST', path, options ?? {})
  },

  put<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: BodyRequestOptions<TBody>,
  ): Promise<TResponse> {
    return request<TResponse>('PUT', path, options ?? {})
  },

  patch<TResponse = unknown, TBody = unknown>(
    path: string,
    options?: BodyRequestOptions<TBody>,
  ): Promise<TResponse> {
    return request<TResponse>('PATCH', path, options ?? {})
  },

  delete<TResponse = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>('DELETE', path, options ?? {})
  },

  /**
   * Get a fresh CSRF token from the server.
   * Useful for pages that will make mutating requests.
   */
  async refreshCsrfToken(): Promise<string | null> {
    return ensureCsrfToken(DEFAULT_BASE_URL)
  },
}

// ──────────────────────────────────────────────
// Convenience: typed resource helpers
// ──────────────────────────────────────────────

/**
 * Create a strongly-typed resource client for a given path prefix.
 *
 * @example
 * ```typescript
 * const expenses = createResource<Expense, CreateExpenseDto>('/expenses')
 * const all    = await expenses.list()          // GET /expenses
 * const one    = await expenses.get('abc')      // GET /expenses/abc
 * const newOne = await expenses.create(dto)     // POST /expenses
 * const upd    = await expenses.update('abc', dto) // PATCH /expenses/abc
 * await expenses.remove('abc')                  // DELETE /expenses/abc
 * ```
 */
export function createResource<TModel, TCreate = TModel, TUpdate = Partial<TCreate>>(
  basePath: string,
) {
  return {
    /** GET /{basePath} */
    list: (options?: RequestOptions) =>
      api.get<TModel[]>(basePath, options),

    /** GET /{basePath}/{id} */
    get: (id: string, options?: RequestOptions) =>
      api.get<TModel>(`${basePath}/${encodeURIComponent(id)}`, options),

    /** POST /{basePath} */
    create: (body: TCreate, options?: BodyRequestOptions<TCreate>) =>
      api.post<TModel, TCreate>(basePath, { ...options, body }),

    /** PATCH /{basePath}/{id} */
    update: (id: string, body: TUpdate, options?: BodyRequestOptions<TUpdate>) =>
      api.patch<TModel, TUpdate>(`${basePath}/${encodeURIComponent(id)}`, { ...options, body }),

    /** PUT /{basePath}/{id} */
    replace: (id: string, body: TCreate, options?: BodyRequestOptions<TCreate>) =>
      api.put<TModel, TCreate>(`${basePath}/${encodeURIComponent(id)}`, { ...options, body }),

    /** DELETE /{basePath}/{id} */
    remove: (id: string, options?: RequestOptions) =>
      api.delete<void>(`${basePath}/${encodeURIComponent(id)}`, options),
  }
}
