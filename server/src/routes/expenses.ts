// ──────────────────────────────────────────────
// Expenses Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { uploadSingle, handleMulterError } from '../middleware/upload';
import { docRef, collectionRef } from '../config/firebase';
import { buildSuccessResponse } from '../services/firebase.service';
import {
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  listExpenses,
  processApproval,
  uploadReceipt,
  getExpenseStats,
} from '../services/expense.service';
import { createNotification } from '../services/notification.service';
import { scanReceipt } from '../services/ocr.service';
import { createAuditLog } from '../utils/audit';
import type { AuthenticatedRequest, ApprovalAction, ExpenseStatus } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  vendor: z.string().optional(),
  project: z.string().optional(),
  departmentId: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const updateExpenseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  category: z.string().min(1).optional(),
  subCategory: z.string().optional(),
  vendor: z.string().optional(),
  project: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const approvalSchema = z.object({
  action: z.enum(['approved', 'rejected', 'changes_requested']),
  comment: z.string().max(500).optional(),
});

/**
 * GET /expenses
 * List expenses with filters
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const result = await listExpenses(
      companyId,
      {
        status: req.query.status as ExpenseStatus | undefined,
        category: req.query.category as string | undefined,
        departmentId: req.query.departmentId as string | undefined,
        userId: req.query.userId as string | undefined,
        vendor: req.query.vendor as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string | undefined,
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      },
      req.user!.role!,
      req.user!.uid
    );

    res.json({
      success: true,
      data: result.expenses,
      pagination: {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (parseInt(req.query.limit as string, 10) || 20)),
      },
    });
  } catch (error) {
    console.error('List expenses error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch expenses' });
  }
});

/**
 * POST /expenses
 * Create a new expense
 */
router.post('/', validate(createExpenseSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const userId = req.user!.uid;
    const userRole = req.user!.role!;

    // Fetch company settings
    const companyDoc = await docRef('companies', companyId).get();
    if (!companyDoc.exists) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Company not found' });
      return;
    }
    const companyData = companyDoc.data()!;

    // Find department head and CEO for approval chain
    let departmentHeadId: string | undefined;
    let companyCeoId: string | undefined;

    if (req.body.departmentId) {
      const deptDoc = await docRef('departments', req.body.departmentId).get();
      if (deptDoc.exists) {
        departmentHeadId = deptDoc.data()!.headId;
      }
    }

    // Find CEO of the company
    const ceoSnapshot = await collectionRef('users')
      .where('companyId', '==', companyId)
      .where('role', '==', 'ceo')
      .limit(1)
      .get();
    if (!ceoSnapshot.empty) {
      companyCeoId = ceoSnapshot.docs[0].id;
    }

    const expense = await createExpense({
      expenseData: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        companyId,
        userId,
        status: 'draft',
        currentApprovalLevel: 0,
        approvalChain: [],
        tags: req.body.tags || [],
        policyViolations: [],
        isReimbursed: false,
      },
      companySettings: companyData.settings,
      userRole,
      departmentHeadId,
      companyCeoId,
      userId,
      companyId,
    });

    // Create notification for the expense creator
    await createNotification({
      companyId,
      userId,
      type: 'expense.created',
      title: 'Expense Created',
      message: `Your expense "${expense.title}" for $${expense.amount} has been submitted.`,
      data: { expenseId: expense.id },
    });

    res.status(201).json(buildSuccessResponse(expense, 'Expense created'));
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to create expense' });
  }
});

/**
 * GET /expenses/:id
 * Get expense by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await getExpense(req.params.id);
    if (!expense) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Expense not found' });
      return;
    }

    // Company scope check
    if (expense.companyId !== req.user?.companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    res.json(buildSuccessResponse(expense));
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch expense' });
  }
});

/**
 * PUT /expenses/:id
 * Update expense (only draft or changes_requested)
 */
router.put('/:id', validate(updateExpenseSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await getExpense(req.params.id);
    if (!expense) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Expense not found' });
      return;
    }

    // Only owner or admin can update
    if (expense.userId !== req.user!.uid && !['super_admin', 'ceo'].includes(req.user!.role || '')) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    await updateExpense(req.params.id, req.body, req.user!.uid, req.user!.companyId!);

    const updated = await getExpense(req.params.id);
    res.json(buildSuccessResponse(updated, 'Expense updated'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    res.status(400).json({ success: false, error: 'Update Failed', message });
  }
});

/**
 * DELETE /expenses/:id
 * Delete expense (only draft)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await getExpense(req.params.id);
    if (!expense) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Expense not found' });
      return;
    }

    if (expense.userId !== req.user!.uid && !['super_admin', 'ceo'].includes(req.user!.role || '')) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    await deleteExpense(req.params.id, req.user!.uid, req.user!.companyId!);
    res.json(buildSuccessResponse(null, 'Expense deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense';
    res.status(400).json({ success: false, error: 'Delete Failed', message });
  }
});

/**
 * POST /expenses/:id/receipt
 * Upload receipt for an expense
 */
router.post('/:id/receipt', uploadSingle('receipt'), handleMulterError, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await getExpense(req.params.id);
    if (!expense) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Expense not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'Bad Request', message: 'No file uploaded' });
      return;
    }

    const receiptUrl = `/uploads/${req.file.filename}`;
    await uploadReceipt(req.params.id, receiptUrl, req.user!.uid, req.user!.companyId!);

    res.json(buildSuccessResponse({ receiptUrl, filename: req.file.filename }, 'Receipt uploaded'));
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to upload receipt' });
  }
});

/**
 * POST /expenses/:id/approve
 * Approve an expense
 */
router.post('/:id/approve', validate(approvalSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await processApproval({
      expenseId: req.params.id,
      userId: req.user!.uid,
      companyId: req.user!.companyId!,
      userRole: req.user!.role!,
      action: 'approved',
      comment: req.body.comment,
    });

    // Notify expense creator
    await createNotification({
      companyId: req.user!.companyId!,
      userId: expense.userId,
      type: 'expense.approved',
      title: 'Expense Approved',
      message: `Your expense "${expense.title}" has been approved by ${req.user!.role}.`,
      data: { expenseId: expense.id },
    });

    res.json(buildSuccessResponse(expense, 'Expense approved'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve expense';
    res.status(400).json({ success: false, error: 'Approval Failed', message });
  }
});

/**
 * POST /expenses/:id/reject
 * Reject an expense
 */
router.post('/:id/reject', validate(approvalSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await processApproval({
      expenseId: req.params.id,
      userId: req.user!.uid,
      companyId: req.user!.companyId!,
      userRole: req.user!.role!,
      action: 'rejected',
      comment: req.body.comment,
    });

    await createNotification({
      companyId: req.user!.companyId!,
      userId: expense.userId,
      type: 'expense.rejected',
      title: 'Expense Rejected',
      message: `Your expense "${expense.title}" has been rejected. Reason: ${req.body.comment || 'No reason provided'}.`,
      data: { expenseId: expense.id },
    });

    res.json(buildSuccessResponse(expense, 'Expense rejected'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject expense';
    res.status(400).json({ success: false, error: 'Rejection Failed', message });
  }
});

/**
 * POST /expenses/:id/request-changes
 * Request changes on an expense
 */
router.post('/:id/request-changes', validate(approvalSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expense = await processApproval({
      expenseId: req.params.id,
      userId: req.user!.uid,
      companyId: req.user!.companyId!,
      userRole: req.user!.role!,
      action: 'changes_requested',
      comment: req.body.comment,
    });

    await createNotification({
      companyId: req.user!.companyId!,
      userId: expense.userId,
      type: 'expense.changes_requested',
      title: 'Changes Requested',
      message: `Changes requested for "${expense.title}". ${req.body.comment ? `Note: ${req.body.comment}` : ''}`,
      data: { expenseId: expense.id },
    });

    res.json(buildSuccessResponse(expense, 'Changes requested'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request changes';
    res.status(400).json({ success: false, error: 'Request Failed', message });
  }
});

/**
 * POST /expenses/ocr
 * OCR scan a receipt
 */
router.post('/ocr', uploadSingle('receipt'), handleMulterError, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Bad Request', message: 'No receipt image uploaded' });
      return;
    }

    const filePath = req.file.path;
    const ocrResult = await scanReceipt(filePath);

    res.json(buildSuccessResponse({
      ...ocrResult,
      filename: req.file.filename,
    }, 'Receipt scanned successfully'));
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ success: false, error: 'OCR Failed', message: 'Failed to scan receipt' });
  }
});

export default router;
