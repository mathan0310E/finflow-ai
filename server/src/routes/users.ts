// ──────────────────────────────────────────────
// Users Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole, requireSelfOrRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { collectionRef, docRef, auth, serverTimestamp } from '../config/firebase';
import { buildSuccessResponse } from '../services/firebase.service';
import { createAuditLog } from '../utils/audit';
import { createNotification } from '../services/notification.service';
import type { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().optional(),
  role: z.enum(['ceo', 'finance_manager', 'dept_manager', 'employee']).optional(),
  departmentId: z.string().optional(),
  designation: z.string().optional(),
  employeeId: z.string().optional(),
  managerId: z.string().optional(),
  costCenter: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  role: z.enum(['finance_manager', 'dept_manager', 'employee']).default('employee'),
  departmentId: z.string().optional(),
  designation: z.string().optional(),
  employeeId: z.string().optional(),
});

/**
 * GET /users
 * List users (scoped to company)
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'No company assigned to your account',
      });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    let query: FirebaseFirestore.Query = collectionRef('users')
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc');

    // Filter by role
    if (req.query.role) {
      query = query.where('role', '==', req.query.role);
    }
    if (req.query.departmentId) {
      query = query.where('departmentId', '==', req.query.departmentId);
    }
    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    query = query.limit(limit).offset((page - 1) * limit);
    const snapshot = await query.get();

    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch users',
    });
  }
});

/**
 * GET /users/:id
 * Get a single user
 */
router.get('/:id', requireSelfOrRole('id', 'super_admin', 'ceo', 'finance_manager', 'dept_manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await docRef('users', id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    const userData = doc.data()!;

    // Company scoping
    if (req.user?.role !== 'super_admin' && userData.companyId !== req.user?.companyId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied',
      });
      return;
    }

    res.json(buildSuccessResponse({ id: doc.id, ...userData }));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user',
    });
  }
});

/**
 * PUT /users/:id
 * Update a user
 */
router.put('/:id', requireSelfOrRole('id', 'super_admin', 'ceo', 'finance_manager'), validate(updateUserSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await docRef('users', id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    const existingData = doc.data()!;

    // Prevent non-super-admins from changing roles to super_admin
    if (req.body.role === 'super_admin' && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only super admins can assign super_admin role',
      });
      return;
    }

    await docRef('users', id).update({
      ...req.body,
      updatedAt: serverTimestamp(),
    });

    // Update Firebase Auth display name if provided
    if (req.body.displayName) {
      try {
        await auth().updateUser(id, { displayName: req.body.displayName });
      } catch {
        // Non-critical
      }
    }

    // Update custom claims if role changed
    if (req.body.role) {
      try {
        await auth().setCustomUserClaims(id, {
          role: req.body.role,
          companyId: existingData.companyId,
        });
      } catch {
        // Non-critical
      }
    }

    await createAuditLog({
      companyId: existingData.companyId,
      userId: req.user!.uid,
      action: 'user.updated',
      resource: 'users',
      resourceId: id,
      details: { updates: Object.keys(req.body) },
    });

    const updated = await docRef('users', id).get();
    res.json(buildSuccessResponse({ id: updated.id, ...updated.data() }, 'User updated'));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update user',
    });
  }
});

/**
 * DELETE /users/:id
 * Delete a user (soft delete by setting status to inactive)
 */
router.delete('/:id', requireRole('super_admin', 'ceo'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await docRef('users', id).get();

    if (!doc.exists) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    const userData = doc.data()!;

    // Soft delete — set status to inactive
    await docRef('users', id).update({
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });

    // Disable Firebase Auth user
    try {
      await auth().updateUser(id, { disabled: true });
    } catch {
      // Non-critical
    }

    await createAuditLog({
      companyId: userData.companyId,
      userId: req.user!.uid,
      action: 'user.deleted',
      resource: 'users',
      resourceId: id,
      details: { email: userData.email },
    });

    res.json(buildSuccessResponse(null, 'User deactivated'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to delete user',
    });
  }
});

/**
 * POST /users/invite
 * Invite an employee via email
 */
router.post('/invite', requireRole('super_admin', 'ceo', 'finance_manager', 'dept_manager'), validate(inviteUserSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, displayName, role, departmentId, designation, employeeId } = req.body;
    const companyId = req.user!.companyId!;

    // Check if user already exists
    try {
      const existingUser = await auth().getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'A user with this email already exists',
        });
        return;
      }
    } catch {
      // User doesn't exist — good to proceed
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';

    // Create Firebase Auth user
    const userRecord = await auth().createUser({
      email,
      displayName,
      password: tempPassword,
    });

    // Create user profile
    const userRef = collectionRef('users').doc(userRecord.uid);
    await userRef.set({
      id: userRecord.uid,
      email,
      displayName,
      companyId,
      role,
      departmentId,
      designation,
      employeeId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify the new user
    await createNotification({
      companyId,
      userId: userRecord.uid,
      type: 'invitation',
      title: 'Welcome to FinFlow AI!',
      message: `You've been invited to join the company expense management system. Sign in with your email and the temporary password provided by your admin.`,
      data: { tempPassword, email },
    });

    await createAuditLog({
      companyId,
      userId: req.user!.uid,
      action: 'user.invited',
      resource: 'users',
      resourceId: userRecord.uid,
      details: { email, role },
    });

    res.status(201).json(buildSuccessResponse({
      uid: userRecord.uid,
      email,
      displayName,
      role,
    }, `Invitation sent to ${email}`));
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to invite user',
    });
  }
});

export default router;
