// ──────────────────────────────────────────────
// AI Routes — OpenRouter Integration
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { collectionRef } from '../config/firebase';
import { buildSuccessResponse } from '../services/firebase.service';
import {
  sendChat,
  categorizeExpense,
  generateInsights,
  calculateHealthScore,
  generateSummary,
  predictExpenses,
} from '../services/ai.service';
import { createAuditLog } from '../utils/audit';
import type { AuthenticatedRequest, AiMessage, Expense, Budget } from '../types';

const router = Router();

// All AI routes require authentication
router.use(authenticate);
router.use(aiRateLimiter);

// ── Schemas ──
const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
    timestamp: z.string().optional(),
  })).min(1, 'At least one message is required'),
});

const categorizeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  vendor: z.string().optional(),
  category: z.string().optional(),
});

const insightsSchema = z.object({
  expenseIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const predictSchema = z.object({
  category: z.string().optional(),
  months: z.number().int().min(1).max(12).default(3),
});

const summarySchema = z.object({
  period: z.enum(['monthly', 'quarterly', 'annual']).default('monthly'),
});

/**
 * POST /ai/chat
 * Chat with the AI assistant
 */
router.post('/chat', validate(chatSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messages } = req.body;

    const result = await sendChat(
      req.user!.companyId!,
      req.user!.uid,
      messages.map((m: { role: 'user' | 'assistant'; content: string; timestamp?: string }) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }))
    );

    await createAuditLog({
      companyId: req.user!.companyId!,
      userId: req.user!.uid,
      action: 'ai.chat',
      resource: 'aiChats',
      resourceId: result.chat.id,
      details: { messageCount: messages.length },
    });

    res.json(buildSuccessResponse({
      reply: result.reply,
      chatId: result.chat.id,
    }));
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to process chat message' });
  }
});

/**
 * POST /ai/categorize
 * AI-powered expense categorization
 */
router.post('/categorize', validate(categorizeSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await categorizeExpense(req.body);

    await createAuditLog({
      companyId: req.user!.companyId!,
      userId: req.user!.uid,
      action: 'ai.categorize',
      resource: 'expenses',
      resourceId: 'ai',
      details: { title: req.body.title, suggestedCategory: result.category },
    });

    res.json(buildSuccessResponse(result));
  } catch (error) {
    console.error('AI categorize error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to categorize expense' });
  }
});

/**
 * POST /ai/insights
 * Get spending insights
 */
router.post('/insights', validate(insightsSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;

    // Fetch expenses for analysis
    let query: FirebaseFirestore.Query = collectionRef('expenses')
      .where('companyId', '==', companyId);

    if (req.body.expenseIds) {
      // Fetch specific expenses
      query = query.where('__name__', 'in', req.body.expenseIds.slice(0, 10));
    }
    if (req.body.startDate) {
      query = query.where('date', '>=', new Date(req.body.startDate));
    }
    if (req.body.endDate) {
      query = query.where('date', '<=', new Date(req.body.endDate));
    }

    const snapshot = await query.get();
    const expenses: Expense[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({ id: doc.id, ...data } as Expense);
    });

    const result = await generateInsights(expenses);

    res.json(buildSuccessResponse(result));
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to generate insights' });
  }
});

/**
 * POST /ai/predict
 * Predict future expenses
 */
router.post('/predict', validate(predictSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const userId = req.user!.uid;

    // Fetch historical expenses
    const snapshot = await collectionRef('expenses')
      .where('companyId', '==', companyId)
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(100)
      .get();

    const expenses: Expense[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({ id: doc.id, ...data, date: data.date?.toDate?.() || data.date } as Expense);
    });

    const result = await predictExpenses(expenses, req.body.category);

    await createAuditLog({
      companyId,
      userId,
      action: 'ai.predict',
      resource: 'expenses',
      resourceId: 'ai',
      details: { category: req.body.category, prediction: result.predictedAmount },
    });

    res.json(buildSuccessResponse(result));
  } catch (error) {
    console.error('AI predict error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to predict expenses' });
  }
});

/**
 * POST /ai/health-score
 * Calculate financial health score
 */
router.post('/health-score', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;

    // Fetch expenses
    const expenseSnapshot = await collectionRef('expenses')
      .where('companyId', '==', companyId)
      .get();

    const expenses: Expense[] = [];
    expenseSnapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({ id: doc.id, ...data } as Expense);
    });

    // Fetch budgets
    const budgetSnapshot = await collectionRef('budgets')
      .where('companyId', '==', companyId)
      .where('status', '==', 'active')
      .get();

    const budgets: Budget[] = [];
    budgetSnapshot.forEach((doc) => {
      const data = doc.data();
      budgets.push({ id: doc.id, ...data } as Budget);
    });

    const result = await calculateHealthScore(expenses, budgets);

    await createAuditLog({
      companyId,
      userId: req.user!.uid,
      action: 'ai.health_score',
      resource: 'analytics',
      resourceId: 'health',
      details: { score: result.score, rating: result.rating },
    });

    res.json(buildSuccessResponse(result));
  } catch (error) {
    console.error('AI health score error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to calculate health score' });
  }
});

/**
 * POST /ai/summary
 * Generate monthly summary
 */
router.post('/summary', validate(summarySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const period = req.body.period;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const snapshot = await collectionRef('expenses')
      .where('companyId', '==', companyId)
      .where('date', '>=', startDate)
      .where('date', '<=', now)
      .get();

    const expenses: Expense[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({ id: doc.id, ...data, date: data.date?.toDate?.() || data.date } as Expense);
    });

    const result = await generateSummary(expenses, period);

    res.json(buildSuccessResponse(result));
  } catch (error) {
    console.error('AI summary error:', error);
    res.status(500).json({ success: false, error: 'AI Error', message: 'Failed to generate summary' });
  }
});

export default router;
