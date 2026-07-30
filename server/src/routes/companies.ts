// ──────────────────────────────────────────────
// Companies Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { collectionRef, docRef, serverTimestamp } from '../config/firebase';
import { buildSuccessResponse } from '../services/firebase.service';
import { createAuditLog } from '../utils/audit';
import { slugify } from '../utils/helpers';
import type { AuthenticatedRequest } from '../types';

const router = Router();

// All company routes require authentication
router.use(authenticate);

// ── Schemas ──
const updateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  tier: z.enum(['free', 'starter', 'business', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'disabled']).optional(),
  settings: z.object({
    requireManagerApproval: z.boolean().optional(),
    requireFinanceApproval: z.boolean().optional(),
    requireCeoApproval: z.boolean().optional(),
    autoApprovalLimit: z.number().optional(),
    maxExpenseAmount: z.number().optional(),
    enableAi: z.boolean().optional(),
    enableOcr: z.boolean().optional(),
  }).optional(),
});

/**
 * GET /companies
 * List all companies (super admin only)
 */
router.get('/', requireRole('super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snapshot = await collectionRef('companies').get();
    const companies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(buildSuccessResponse(companies));
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch companies',
    });
  }
});

/**
 * GET /companies/:id
 * Get company details
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Super admin can access any company; others only their own
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    const doc = await docRef('companies', id).get();
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
      });
      return;
    }

    res.json(buildSuccessResponse({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch company',
    });
  }
});

/**
 * PUT /companies/:id
 * Update company details
 */
router.put('/:id', validate(updateCompanySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (req.user?.role !== 'super_admin' && req.user?.companyId !== id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    const doc = await docRef('companies', id).get();
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
      });
      return;
    }

    const updates: Record<string, unknown> = { ...req.body, updatedAt: serverTimestamp() };

    // If name changed, update slug
    if (req.body.name) {
      updates.slug = slugify(req.body.name);
    }

    await docRef('companies', id).update(updates);

    await createAuditLog({
      companyId: id,
      userId: req.user!.uid,
      action: 'company.updated',
      resource: 'companies',
      resourceId: id,
      details: { updates: Object.keys(req.body) },
    });

    const updated = await docRef('companies', id).get();
    res.json(buildSuccessResponse({ id: updated.id, ...updated.data() }, 'Company updated'));
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update company',
    });
  }
});

/**
 * DELETE /companies/:id
 * Delete a company (super admin only)
 */
router.delete('/:id', requireRole('super_admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await docRef('companies', id).get();
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Company not found',
      });
      return;
    }

    const data = doc.data()!;

    // Delete all company-related data
    const collections = ['users', 'departments', 'expenses', 'budgets', 'notifications', 'vendors', 'auditLogs', 'aiChats'];
    const batch = collectionRef('companies').firestore.batch();

    for (const collection of collections) {
      const snapshot = await collectionRef(collection).where('companyId', '==', id).get();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }

    batch.delete(docRef('companies', id));
    await batch.commit();

    await createAuditLog({
      companyId: id,
      userId: req.user!.uid,
      action: 'company.deleted',
      resource: 'companies',
      resourceId: id,
      details: { companyName: data.name },
    });

    res.json(buildSuccessResponse(null, 'Company and all associated data deleted'));
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete company',
    });
  }
});

/**
 * GET /companies/:id/stats
 * Get company statistics
 */
router.get('/:id/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'super_admin' && req.user?.companyId !== id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    // Gather stats
    const [userCount, deptCount, expenseCount, budgetCount, vendorCount] = await Promise.all([
      collectionRef('users').where('companyId', '==', id).count().get(),
      collectionRef('departments').where('companyId', '==', id).count().get(),
      collectionRef('expenses').where('companyId', '==', id).count().get(),
      collectionRef('budgets').where('companyId', '==', id).where('status', '==', 'active').count().get(),
      collectionRef('vendors').where('companyId', '==', id).where('status', '==', 'active').count().get(),
    ]);

    // Total expense amount
    const expenseSnapshot = await collectionRef('expenses')
      .where('companyId', '==', id)
      .get();

    let totalExpenseAmount = 0;
    expenseSnapshot.forEach((doc) => {
      totalExpenseAmount += doc.data().amount || 0;
    });

    res.json(buildSuccessResponse({
      users: userCount.data().count,
      departments: deptCount.data().count,
      expenses: expenseCount.data().count,
      totalExpenseAmount,
      activeBudgets: budgetCount.data().count,
      activeVendors: vendorCount.data().count,
    }));
  } catch (error) {
    console.error('Company stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch company stats',
    });
  }
});

export default router;
