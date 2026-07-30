// ──────────────────────────────────────────────
// Analytics Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { buildSuccessResponse } from '../services/firebase.service';
import {
  getDashboardMetrics,
  getDepartmentAnalytics,
  getSpendingTrends,
  getCategoryAnalytics,
} from '../services/analytics.service';
import type { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authenticate);

/**
 * GET /analytics/dashboard
 * Get dashboard metrics based on user role
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const metrics = await getDashboardMetrics(
      companyId,
      req.user!.uid,
      req.user!.role!
    );

    res.json(buildSuccessResponse(metrics));
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch dashboard metrics' });
  }
});

/**
 * GET /analytics/department
 * Get department-level analytics
 */
router.get('/department', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const departmentId = req.query.departmentId as string;
    if (!departmentId) {
      // Default to user's department
      if (req.user?.departmentId) {
        const analytics = await getDepartmentAnalytics(companyId, req.user.departmentId);
        res.json(buildSuccessResponse(analytics));
        return;
      }
      res.status(400).json({ success: false, error: 'Bad Request', message: 'departmentId query parameter is required' });
      return;
    }

    const analytics = await getDepartmentAnalytics(companyId, departmentId);
    res.json(buildSuccessResponse(analytics));
  } catch (error) {
    console.error('Department analytics error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch department analytics' });
  }
});

/**
 * GET /analytics/trends
 * Get spending trends
 */
router.get('/trends', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const trends = await getSpendingTrends(companyId, {
      period: (req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly') || 'monthly',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      departmentId: req.query.departmentId as string,
    });

    res.json(buildSuccessResponse(trends));
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch spending trends' });
  }
});

/**
 * GET /analytics/categories
 * Get category breakdown
 */
router.get('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const analytics = await getCategoryAnalytics(companyId, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      departmentId: req.query.departmentId as string,
    });

    res.json(buildSuccessResponse(analytics));
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch category analytics' });
  }
});

export default router;
