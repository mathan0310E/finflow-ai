// ──────────────────────────────────────────────
// OpenRouter AI Service
// ──────────────────────────────────────────────

import { env } from '../config/env';
import { collectionRef, serverTimestamp } from '../config/firebase';
import type { Expense, AiMessage, AiChat } from '../types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Make a request to the OpenRouter API
 */
async function callOpenRouter(
  messages: OpenRouterMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://finflow-ai.com',
      'X-Title': 'FinFlow AI Enterprise',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const result = await response.json() as OpenRouterResponse;
  return result.choices[0]?.message?.content || '';
}

// ── Public AI Service API ──

/**
 * Send a chat message and get AI response
 */
export async function sendChat(
  companyId: string,
  userId: string,
  messages: AiMessage[]
): Promise<{ reply: string; chat: AiChat }> {
  // Build context-aware system prompt
  const systemPrompt: OpenRouterMessage = {
    role: 'system',
    content: `You are FinFlow AI, an intelligent financial assistant for enterprise expense management.
You help users with expense tracking, budget management, financial insights, and policy compliance.
You have access to the user's expense data and can provide personalized recommendations.
Be concise, accurate, and helpful. When discussing finances, use clear language.
If asked about specific transactions, request the relevant details.
You operate within a multi-tenant SaaS platform called FinFlow AI Enterprise.`,
  };

  // Convert chat messages to OpenRouter format
  const chatMessages: OpenRouterMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await callOpenRouter([systemPrompt, ...chatMessages]);

  // Save chat to Firestore
  const chatRef = collectionRef('aiChats').doc();
  const chatData: Omit<AiChat, 'id'> = {
    companyId,
    userId,
    messages: [
      ...messages,
      { role: 'assistant', content: response, timestamp: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await chatRef.set({ ...chatData, id: chatRef.id });

  return {
    reply: response,
    chat: { id: chatRef.id, ...chatData } as AiChat,
  };
}

/**
 * Categorize an expense using AI
 */
export async function categorizeExpense(
  expense: Partial<Expense>
): Promise<{ category: string; confidence: number; subCategory?: string }> {
  const prompt = `Categorize the following expense for a business expense management system.
Return ONLY a JSON object with fields: "category", "subCategory" (optional), and "confidence" (0-1).

Expense details:
- Title: "${expense.title || 'N/A'}"
- Description: "${expense.description || 'N/A'}"
- Amount: ${expense.amount || 'N/A'}
- Vendor: ${expense.vendor || 'N/A'}

Valid categories: Travel, Meals & Entertainment, Office Supplies, Software & Subscriptions,
Equipment, Rent & Utilities, Transportation, Professional Services, Training & Development,
Marketing & Advertising, Healthcare, Insurance, Taxes, Other

Return ONLY the JSON object, no other text.`;

  const response = await callOpenRouter(
    [
      {
        role: 'system',
        content: 'You are an AI expense categorization engine. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    0.3, // Lower temperature for more consistent categorization
    200
  );

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonStr);

    return {
      category: parsed.category || 'Other',
      confidence: parsed.confidence || 0.5,
      subCategory: parsed.subCategory,
    };
  } catch {
    // Fallback categorization
    return { category: 'Other', confidence: 0.3 };
  }
}

/**
 * Generate spending insights from expense data
 */
export async function generateInsights(
  expenses: Expense[]
): Promise<{ insights: string[]; recommendations: string[] }> {
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
  const categories = [...new Set(expenses.map((e) => e.category))];

  const prompt = `Analyze the following expense data and provide actionable insights and recommendations.
Return ONLY a JSON object with fields: "insights" (array of strings) and "recommendations" (array of strings).

Expense Summary:
- Total Expenses: ${expenses.length}
- Total Amount: $${totalAmount.toFixed(2)}
- Average Amount: $${avgAmount.toFixed(2)}
- Categories: ${categories.join(', ')}
- Date Range: ${expenses.length > 0 ? `${expenses[0].date} to ${expenses[expenses.length - 1].date}` : 'N/A'}
- Statuses: ${[...new Set(expenses.map((e) => e.status))].join(', ')}

Provide 3-5 insights and 2-3 recommendations.`;

  try {
    const response = await callOpenRouter(
      [
        {
          role: 'system',
          content: 'You are a financial analyst AI. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      0.5,
      500
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonStr);

    return {
      insights: parsed.insights || ['No specific insights generated'],
      recommendations: parsed.recommendations || ['Review your spending patterns'],
    };
  } catch {
    return {
      insights: ['Analysis based on your expense patterns'],
      recommendations: ['Consider setting budget limits for top spending categories'],
    };
  }
}

/**
 * Calculate financial health score
 */
export async function calculateHealthScore(
  expenses: Expense[],
  budgets: Array<{ totalAllocated: number; totalSpent: number }>
): Promise<{
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  breakdown: Record<string, number>;
  suggestions: string[];
}> {
  // Calculate actual metrics
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.totalAllocated, 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length;
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected').length;
  const policyViolations = expenses.filter((e) => e.policyViolations?.length > 0).length;

  // Calculate score components (each 0-25)
  const budgetScore = Math.max(0, 25 - Math.abs(budgetUtilization - 70) * 0.3);
  const approvalScore = pendingExpenses === 0 ? 25 : Math.max(0, 25 - pendingExpenses * 2);
  const complianceScore = policyViolations === 0 ? 25 : Math.max(0, 25 - policyViolations * 5);
  const rejectionScore = rejectedExpenses === 0 ? 25 : Math.max(0, 25 - rejectedExpenses * 3);

  const totalScore = Math.round(budgetScore + approvalScore + complianceScore + rejectionScore);
  const clampedScore = Math.min(100, Math.max(0, totalScore));

  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (clampedScore >= 80) rating = 'excellent';
  else if (clampedScore >= 60) rating = 'good';
  else if (clampedScore >= 40) rating = 'fair';
  else rating = 'poor';

  const suggestions: string[] = [];
  if (budgetUtilization > 90) suggestions.push('Budget utilization is high — consider increasing budgets for certain categories');
  if (pendingExpenses > 5) suggestions.push(`${pendingExpenses} expenses pending approval — review them soon`);
  if (policyViolations > 0) suggestions.push(`${policyViolations} policy violations detected — review company policies`);
  if (rejectedExpenses > 3) suggestions.push('High rejection rate — ensure expenses comply with policies before submission');

  // Use AI for enhanced analysis
  try {
    const prompt = `Based on financial health score of ${clampedScore}/100 (${rating}), provide 2 brief suggestions.
Budget utilization: ${budgetUtilization.toFixed(1)}%. Pending: ${pendingExpenses}. Rejected: ${rejectedExpenses}.
Return as JSON array of strings.`;

    const aiResponse = await callOpenRouter(
      [
        {
          role: 'system',
          content: 'You are a financial health advisor. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      0.5,
      300
    );

    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiSuggestions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(aiSuggestions)) {
        suggestions.push(...aiSuggestions);
      }
    }
  } catch {
    // AI enhancement failed — use basic suggestions
  }

  return {
    score: clampedScore,
    rating,
    breakdown: {
      budgetUtilization: Math.round(budgetScore),
      approvalEfficiency: Math.round(approvalScore),
      policyCompliance: Math.round(complianceScore),
      rejectionRate: Math.round(rejectionScore),
    },
    suggestions: suggestions.slice(0, 5),
  };
}

/**
 * Generate monthly summary
 */
export async function generateSummary(
  expenses: Expense[],
  period: string
): Promise<{
  summary: string;
  highlights: string[];
  totalSpent: number;
  averagePerDay: number;
  topCategory: string;
}> {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const daysInPeriod = period === 'monthly' ? 30 : period === 'quarterly' ? 90 : 365;
  const averagePerDay = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;

  const categoryTotals: Record<string, number> = {};
  for (const expense of expenses) {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  }

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

  const prompt = `Generate a concise ${period} expense summary paragraph based on:
- Total spent: $${totalSpent.toFixed(2)}
- Number of transactions: ${expenses.length}
- Average per day: $${averagePerDay.toFixed(2)}
- Top category: ${topCategory}
- Categories: ${Object.entries(categoryTotals).map(([k, v]) => `${k}: $${v.toFixed(2)}`).join(', ')}

Return as JSON: { "summary": "string", "highlights": ["string"] }`;

  try {
    const response = await callOpenRouter(
      [
        {
          role: 'system',
          content: 'You are a financial reporting AI. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      0.5,
      500
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonStr);

    return {
      summary: parsed.summary || `You spent $${totalSpent.toFixed(2)} across ${expenses.length} transactions this ${period}.`,
      highlights: parsed.highlights || [],
      totalSpent,
      averagePerDay,
      topCategory,
    };
  } catch {
    return {
      summary: `This ${period}, you spent $${totalSpent.toFixed(2)} across ${expenses.length} transactions. Your top spending category was "${topCategory}".`,
      highlights: [`Total expenses: $${totalSpent.toFixed(2)}`],
      totalSpent,
      averagePerDay,
      topCategory,
    };
  }
}

/**
 * Predict future expenses using trend analysis
 */
export async function predictExpenses(
  expenses: Expense[],
  category?: string
): Promise<{
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  breakdown: Record<string, number>;
}> {
  const filteredExpenses = category
    ? expenses.filter((e) => e.category === category)
    : expenses;

  if (filteredExpenses.length < 3) {
    const avgAmount = filteredExpenses.length > 0
      ? filteredExpenses.reduce((s, e) => s + e.amount, 0) / filteredExpenses.length
      : 0;
    return {
      predictedAmount: Math.round(avgAmount * 1.1),
      confidence: 0.3,
      trend: 'stable',
      breakdown: { predicted: Math.round(avgAmount * 1.1) },
    };
  }

  // Simple linear regression for prediction
  const amounts = filteredExpenses.map((e) => e.amount);
  const n = amounts.length;
  const indices = amounts.map((_, i) => i);

  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = amounts.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * amounts[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictedAmount = Math.max(0, slope * n + intercept);

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (slope > amounts.reduce((a, b) => a + b, 0) / n * 0.05) trend = 'increasing';
  else if (slope < -amounts.reduce((a, b) => a + b, 0) / n * 0.05) trend = 'decreasing';
  else trend = 'stable';

  // Calculate confidence based on data variance
  const mean = sumY / n;
  const variance = amounts.reduce((sum, a) => sum + (a - mean) ** 2, 0) / n;
  const confidence = Math.min(0.9, Math.max(0.2, 1 - variance / (mean || 1) / 2));

  return {
    predictedAmount: Math.round(predictedAmount),
    confidence: Math.round(confidence * 100) / 100,
    trend,
    breakdown: { predicted: Math.round(predictedAmount) },
  };
}
