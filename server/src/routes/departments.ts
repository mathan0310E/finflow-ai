// ──────────────────────────────────────────────
// Departments Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { collectionRef, docRef, serverTimestamp } from '../config/firebase';
import { buildSuccessResponse } from '../services/firebase.service';
import { createAuditLog } from '../utils/audit';
import type { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100),
  headId: z.string().optional(),
  budget: z.number().min(0).default(0),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  headId: z.string().optional().nullable(),
  budget: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * GET /departments
 * List departments for the user's company
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'No company assigned',
      });
      return;
    }

    let query: FirebaseFirestore.Query = collectionRef('departments')
      .where('companyId', '==', companyId)
      .orderBy('name', 'asc');

    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }

    const snapshot = await query.get();
    const departments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(buildSuccessResponse(departments));
  } catch (error) {
    console.error('List departments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch departments',
    });
  }
});

/**
 * POST /departments
 * Create a new department
 */
router.post('/', requireRole('super_admin', 'ceo', 'finance_manager'), validate(createDepartmentSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;
    const { name, headId, budget } = req.body;

    // Check for duplicate
    const existing = await collectionRef('departments')
      .where('companyId', '==', companyId)
      .where('name', '==', name)
      .get();

    if (!existing.empty) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'A department with this name already exists',
      });
      return;
    }

    const deptRef = collectionRef('departments').doc();
    const deptData = {
      id: deptRef.id,
      companyId,
      name,
      headId: headId || null,
      budget: budget || 0,
      budgetSpent: 0,
      budgetRemaining: budget || 0,
      headCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await deptRef.set(deptData);

    await createAuditLog({
      companyId,
      userId: req.user!.uid,
      action: 'department.created',
      resource: 'departments',
      resourceId: deptRef.id,
      details: { name, budget },
    });

    res.status(201).json(buildSuccessResponse(deptData, 'Department created'));
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create department',
    });
  }
});

/**
 * PUT /departments/:id
 * Update a department
 */
router.put('/:id', requireRole('super_admin', 'ceo', 'finance_manager'), validate(updateDepartmentSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const doc = await docRef('departments', id).get();
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Department not found',
      });
      return;
    }

    const existingData = doc.data()!;

    // Company scope check
    if (existingData.companyId !== companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    const updates: Record<string, unknown> = { ...req.body, updatedAt: serverTimestamp() };

    // Recalculate remaining budget if budget changed
    if (req.body.budget !== undefined) {
      updates.budgetRemaining = req.body.budget - existingData.budgetSpent;
    }

    await docRef('departments', id).update(updates);

    await createAuditLog({
      companyId: existingData.companyId,
      userId: req.user!.uid,
      action: 'department.updated',
      resource: 'departments',
      resourceId: id,
      details: { updates: Object.keys(req.body) },
    });

    const updated = await docRef('departments', id).get();
    res.json(buildSuccessResponse({ id: updated.id, ...updated.data() }, 'Department updated'));
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update department',
    });
  }
});

/**
 * DELETE /departments/:id
 * Delete a department
 */
router.delete('/:id', requireRole('super_admin', 'ceo'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const doc = await docRef('departments', id).get();
    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Department not found',
      });
      return;
    }

    const deptData = doc.data()!;

    if (deptData.companyId !== companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    // Check for associated users
    const userSnapshot = await collectionRef('users')
      .where('departmentId', '==', id)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Cannot delete department with active users. Reassign users first.',
      });
      return;
    }

    await docRef('departments', id).delete();

    await createAuditLog({
      companyId: deptData.companyId,
      userId: req.user!.uid,
      action: 'department.deleted',
      resource: 'departments',
      resourceId: id,
      details: { name: deptData.name },
    });

    res.json(buildSuccessResponse(null, 'Department deleted'));
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete department',
    });
  }
});

export default router;
