// ──────────────────────────────────────────────
// Budgets Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { buildSuccessResponse } from '../services/firebase.service';
import {
  createBudget,
  getBudget,
  updateBudget,
  listBudgets,
  getBudgetStats,
  closeBudget,
} from '../services/budget.service';
import type { AuthenticatedRequest, BudgetPeriod } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const budgetCategorySchema = z.object({
  name: z.string().min(1),
  allocated: z.number().min(0),
  spent: z.number().min(0).default(0),
  remaining: z.number().optional(),
});

const createBudgetSchema = z.object({
  departmentId: z.string().optional(),
  fiscalYear: z.string().min(4).max(9),
  period: z.enum(['annual', 'quarterly', 'monthly']),
  categories: z.array(budgetCategorySchema).min(1, 'At least one category is required'),
  totalAllocated: z.number().positive('Total budget must be positive'),
});

const updateBudgetSchema = z.object({
  categories: z.array(budgetCategorySchema).optional(),
  totalAllocated: z.number().positive().optional(),
  status: z.enum(['active', 'closed']).optional(),
});

/**
 * GET /budgets
 * List budgets for the company
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const budgets = await listBudgets(companyId, {
      departmentId: req.query.departmentId as string | undefined,
      fiscalYear: req.query.fiscalYear as string | undefined,
      status: req.query.status as string | undefined,
      period: req.query.period as BudgetPeriod | undefined,
    });

    res.json(buildSuccessResponse(budgets));
  } catch (error) {
    console.error('List budgets error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch budgets' });
  }
});

/**
 * POST /budgets
 * Create a new budget
 */
router.post('/', requireRole('super_admin', 'ceo', 'finance_manager'), validate(createBudgetSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const budget = await createBudget({
      companyId: req.user!.companyId!,
      departmentId: req.body.departmentId,
      fiscalYear: req.body.fiscalYear,
      period: req.body.period,
      categories: req.body.categories,
      totalAllocated: req.body.totalAllocated,
      userId: req.user!.uid,
    });

    res.status(201).json(buildSuccessResponse(budget, 'Budget created'));
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to create budget' });
  }
});

/**
 * PUT /budgets/:id
 * Update a budget
 */
router.put('/:id', requireRole('super_admin', 'ceo', 'finance_manager'), validate(updateBudgetSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await updateBudget(req.params.id, req.body, req.user!.uid, req.user!.companyId!);

    const updated = await getBudget(req.params.id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Budget not found' });
      return;
    }

    res.json(buildSuccessResponse(updated, 'Budget updated'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update budget';
    res.status(400).json({ success: false, error: 'Update Failed', message });
  }
});

/**
 * GET /budgets/:id/stats
 * Get budget utilization statistics
 */
router.get('/:id/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getBudgetStats(req.params.id);

    res.json(buildSuccessResponse(stats));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budget stats';
    res.status(400).json({ success: false, error: 'Not Found', message });
  }
});

export default router;
