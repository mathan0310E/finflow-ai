'use client'

import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/utils/api'
import type { Expense } from '@/types'

// ──────────────────────────────────────────────
// Query keys
// ──────────────────────────────────────────────

export const aiKeys = {
  all: ['ai'] as const,
  chat: () => [...aiKeys.all, 'chat'] as const,
  categorize: () => [...aiKeys.all, 'categorize'] as const,
  insights: (companyId: string) => [...aiKeys.all, 'insights', companyId] as const,
  healthScore: (companyId: string) => [...aiKeys.all, 'health-score', companyId] as const,
  summary: (companyId: string, period: string) =>
    [...aiKeys.all, 'summary', companyId, period] as const,
  predict: (companyId: string, category: string) =>
    [...aiKeys.all, 'predict', companyId, category] as const,
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface AiChatRequest {
  message: string
  context?: Record<string, unknown>
}

export interface AiChatResponse {
  reply: string
  chatId: string
  suggestions?: { type: string; title: string; description: string }[]
}

export interface AiCategorizeRequest {
  expenseData: Partial<Expense>
}

export interface AiCategorizeResponse {
  category: string
  subCategory: string
  confidence: number
  explanation: string
}

export interface AiInsightsResponse {
  insights: {
    type: 'positive' | 'negative' | 'neutral' | 'warning'
    title: string
    description: string
    metric?: string
    change?: number
  }[]
  period: { from: string; to: string }
  totalSpent: number
  averagePerDay: number
  topCategory: string
  anomalyCount: number
}

export interface AiHealthScoreResponse {
  score: number
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  metrics: {
    label: string
    value: number
    score: number
    maxScore: number
  }[]
  recommendations: string[]
  trend: 'improving' | 'declining' | 'stable'
}

export interface AiSummaryResponse {
  summary: string
  period: string
  totalSpent: number
  totalApproved: number
  totalRejected: number
  expenseCount: number
  topCategories: { name: string; amount: number }[]
  keyInsights: string[]
}

export interface AiPredictResponse {
  predictions: {
    month: string
    predictedAmount: number
    lowerBound: number
    upperBound: number
  }[]
  category: string
  confidence: number
  trend: 'up' | 'down' | 'stable'
  factors: string[]
}

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────

/**
 * Send a chat message to the AI assistant and receive a response.
 *
 * @example
 * ```tsx
 * const chatMutation = useAiChat()
 * chatMutation.mutate({ message: 'How much did I spend on travel last month?' })
 * ```
 */
export function useAiChat() {
  return useMutation<AiChatResponse, Error, AiChatRequest>({
    mutationFn: async (data) => {
      return api.post<AiChatResponse, AiChatRequest>('/ai/chat', { body: data })
    },
  })
}

/**
 * Categorize an expense using AI.
 *
 * @example
 * ```tsx
 * const categorizeMutation = useAiCategorize()
 * categorizeMutation.mutate({ expenseData: { title: 'Uber ride to airport', amount: 45 } })
 * ```
 */
export function useAiCategorize() {
  return useMutation<AiCategorizeResponse, Error, AiCategorizeRequest>({
    mutationFn: async (data) => {
      return api.post<AiCategorizeResponse, AiCategorizeRequest>('/ai/categorize', {
        body: data,
      })
    },
  })
}

/**
 * Fetch AI-generated spending insights for a company.
 *
 * @example
 * ```tsx
 * const { data: insights, isLoading } = useAiInsights('company-123')
 * ```
 */
export function useAiInsights(
  companyId: string | undefined,
  options?: Omit<UseQueryOptions<AiInsightsResponse>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  return useQuery<AiInsightsResponse>({
    queryKey: aiKeys.insights(companyId ?? ''),
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID is required')
      return api.post<AiInsightsResponse, { companyId: string }>('/ai/insights', {
        body: { companyId },
      })
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes – insights don't change that rapidly
    ...options,
  })
}

/**
 * Fetch the financial health score for a company.
 *
 * @example
 * ```tsx
 * const { data: health } = useAiHealthScore('company-123')
 * ```
 */
export function useAiHealthScore(
  companyId: string | undefined,
  options?: Omit<UseQueryOptions<AiHealthScoreResponse>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  return useQuery<AiHealthScoreResponse>({
    queryKey: aiKeys.healthScore(companyId ?? ''),
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID is required')
      return api.post<AiHealthScoreResponse, { companyId: string }>('/ai/health-score', {
        body: { companyId },
      })
    },
    enabled: !!companyId,
    staleTime: 60 * 60 * 1000, // 1 hour – health score is relatively stable
    ...options,
  })
}

/**
 * Fetch a monthly spending summary generated by AI.
 *
 * @example
 * ```tsx
 * const { data: summary } = useAiSummary('company-123', '2025-01')
 * ```
 */
export function useAiSummary(
  companyId: string | undefined,
  period: string | undefined,
  options?: Omit<UseQueryOptions<AiSummaryResponse>, 'queryKey' | 'queryFn' | 'enabled'>,
) {
  return useQuery<AiSummaryResponse>({
    queryKey: aiKeys.summary(companyId ?? '', period ?? ''),
    queryFn: async () => {
      if (!companyId || !period) throw new Error('Company ID and period are required')
      return api.post<AiSummaryResponse, { companyId: string; period: string }>(
        '/ai/summary',
        { body: { companyId, period } },
      )
    },
    enabled: !!companyId && !!period,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  })
}

/**
 * Predict future expenses for a given category using AI.
 *
 * @example
 * ```tsx
 * const predictMutation = useAiPredict()
 * predictMutation.mutate({ companyId: 'company-123', category: 'travel' })
 * ```
 */
export function useAiPredict() {
  return useMutation<
    AiPredictResponse,
    Error,
    { companyId: string; category: string }
  >({
    mutationFn: async (data) => {
      return api.post<AiPredictResponse, { companyId: string; category: string }>(
        '/ai/predict',
        { body: data },
      )
    },
  })
}
