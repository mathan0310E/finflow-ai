// ──────────────────────────────────────────────
// Notifications Routes
// ──────────────────────────────────────────────

import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { buildSuccessResponse } from '../services/firebase.service';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notification.service';
import type { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authenticate);

/**
 * GET /notifications
 * List notifications for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const companyId = req.user!.companyId;

    if (!companyId) {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'No company assigned' });
      return;
    }

    const unreadOnly = req.query.unreadOnly === 'true';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));

    const notifications = await getUserNotifications(userId, companyId, {
      unreadOnly,
      limit,
      offset: (page - 1) * limit,
    });

    const unreadCount = await getUnreadCount(userId, companyId);

    res.json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to fetch notifications' });
  }
});

/**
 * PUT /notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await markAsRead(req.params.id, req.user!.uid);

    res.json(buildSuccessResponse(null, 'Notification marked as read'));
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
router.put('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await markAllAsRead(req.user!.uid, req.user!.companyId!);

    res.json(buildSuccessResponse({ markedRead: count }, `Marked ${count} notifications as read`));
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Failed to mark notifications as read' });
  }
});

export default router;
