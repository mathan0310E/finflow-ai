// ──────────────────────────────────────────────
// Vendors Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { collectionRef, docRef, serverTimestamp } from '../config/firebase';
import { buildSuccessResponse, firebaseService } from '../services/firebase.service';
import { createAuditLog } from '../utils/audit';
import type { AuthenticatedRequest, Vendor } from '../types';

const router = Router();

router.use(authenticate);

// ── Schemas ──
const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(200),
  category: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  gst: z.string().optional(),
  paymentTerms: z.string().optional(),
});

const updateVendorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gst: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

/**
 * GET /vendors
 * List vendors
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const filters: Array<{ field: string; operator: FirebaseFirestore.WhereFilterOp; value: unknown }> = [
      { field: 'companyId', operator: '==', value: companyId },
    ];

    if (req.query.status) {
      filters.push({ field: 'status', operator: '==', value: req.query.status });
    }
    if (req.query.category) {
      filters.push({ field: 'category', operator: '==', value: req.query.category });
    }

    const vendors = await firebaseService.list<Vendor>('vendors', {
      filters,
      orderBy: { field: 'name', direction: 'asc' },
    });

    res.json(buildSuccessResponse(vendors));
  } catch (error) {
    console.error('List vendors error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch vendors' });
  }
});

/**
 * POST /vendors
 * Create a new vendor
 */
router.post('/', requireRole('super_admin', 'ceo', 'finance_manager'), validate(createVendorSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId!;

    // Check for duplicate
    const existing = await collectionRef('vendors')
      .where('companyId', '==', companyId)
      .where('name', '==', req.body.name)
      .get();

    if (!existing.empty) {
      res.status(409).json({ success: false, error: 'Conflict', message: 'A vendor with this name already exists' });
      return;
    }

    const vendorRef = collectionRef('vendors').doc();
    const vendorData = {
      id: vendorRef.id,
      companyId,
      name: req.body.name,
      category: req.body.category || null,
      contactPerson: req.body.contactPerson || null,
      email: req.body.email || null,
      phone: req.body.phone || null,
      address: req.body.address || null,
      gst: req.body.gst || null,
      paymentTerms: req.body.paymentTerms || null,
      totalSpent: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await vendorRef.set(vendorData);

    await createAuditLog({
      companyId,
      userId: req.user!.uid,
      action: 'vendor.created',
      resource: 'vendors',
      resourceId: vendorRef.id,
      details: { name: req.body.name },
    });

    res.status(201).json(buildSuccessResponse(vendorData, 'Vendor created'));
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to create vendor' });
  }
});

/**
 * GET /vendors/:id
 * Get a single vendor
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await firebaseService.getById<Vendor>('vendors', req.params.id);
    if (!vendor) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Vendor not found' });
      return;
    }

    if (vendor.companyId !== req.user?.companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    res.json(buildSuccessResponse(vendor));
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch vendor' });
  }
});

/**
 * PUT /vendors/:id
 * Update a vendor
 */
router.put('/:id', requireRole('super_admin', 'ceo', 'finance_manager'), validate(updateVendorSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const existing = await firebaseService.getById<Vendor>('vendors', req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Vendor not found' });
      return;
    }

    if (existing.companyId !== req.user?.companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    const updates = { ...req.body, updatedAt: serverTimestamp() };
    await docRef('vendors', req.params.id).update(updates);

    await createAuditLog({
      companyId: existing.companyId,
      userId: req.user!.uid,
      action: 'vendor.updated',
      resource: 'vendors',
      resourceId: req.params.id,
      details: { updates: Object.keys(req.body) },
    });

    const updated = await firebaseService.getById<Vendor>('vendors', req.params.id);
    res.json(buildSuccessResponse(updated, 'Vendor updated'));
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to update vendor' });
  }
});

/**
 * DELETE /vendors/:id
 * Delete a vendor (soft delete — set inactive)
 */
router.delete('/:id', requireRole('super_admin', 'ceo'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const existing = await firebaseService.getById<Vendor>('vendors', req.params.id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'Vendor not found' });
      return;
    }

    if (existing.companyId !== req.user?.companyId && req.user?.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Access denied' });
      return;
    }

    await docRef('vendors', req.params.id).update({
      status: 'inactive',
      updatedAt: serverTimestamp(),
    });

    await createAuditLog({
      companyId: existing.companyId,
      userId: req.user!.uid,
      action: 'vendor.deleted',
      resource: 'vendors',
      resourceId: req.params.id,
      details: { name: existing.name },
    });

    res.json(buildSuccessResponse(null, 'Vendor deactivated'));
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to delete vendor' });
  }
});

export default router;
