// ──────────────────────────────────────────────
// Notification Service
// ──────────────────────────────────────────────

import {
  collectionRef,
  docRef,
  serverTimestamp,
} from '../config/firebase';
import type { Notification } from '../types';

const COLLECTION = 'notifications';

export type NotificationType =
  | 'expense.created'
  | 'expense.approved'
  | 'expense.rejected'
  | 'expense.changes_requested'
  | 'expense.reimbursed'
  | 'approval.required'
  | 'budget.exceeded'
  | 'budget.warning'
  | 'policy.violation'
  | 'report.ready'
  | 'system.alert'
  | 'invitation'
  | 'mention';

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  companyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}): Promise<string> {
  const { companyId, userId, type, title, message, data } = params;

  const docRef = collectionRef(COLLECTION).doc();
  const notification: Omit<Notification, 'id'> & { id: string } = {
    id: docRef.id,
    companyId,
    userId,
    type,
    title,
    message,
    data: data || {},
    read: false,
    createdAt: new Date(),
  };

  await docRef.set({
    ...notification,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Create a notification for multiple users at once
 */
export async function createBulkNotifications(
  notifications: Array<{
    companyId: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }>
): Promise<number> {
  const batch = collectionRef(COLLECTION).firestore.batch();
  let count = 0;

  for (const notif of notifications) {
    const ref = collectionRef(COLLECTION).doc();
    batch.set(ref, {
      id: ref.id,
      companyId: notif.companyId,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      data: notif.data || {},
      read: false,
      createdAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  companyId: string,
  options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<Notification[]> {
  let query: FirebaseFirestore.Query = collectionRef(COLLECTION)
    .where('userId', '==', userId)
    .where('companyId', '==', companyId)
    .orderBy('createdAt', 'desc');

  if (options.unreadOnly) {
    query = query.where('read', '==', false);
  }

  const limit = options.limit || 50;
  query = query.limit(limit);

  if (options.offset) {
    query = query.offset(options.offset);
  }

  const snapshot = await query.get();
  const notifications: Notification[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    notifications.push({
      id: doc.id,
      companyId: data.companyId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: data.read,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    });
  });

  return notifications;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  userId: string,
  companyId: string
): Promise<number> {
  const snapshot = await collectionRef(COLLECTION)
    .where('userId', '==', userId)
    .where('companyId', '==', companyId)
    .where('read', '==', false)
    .count()
    .get();

  return snapshot.data().count;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await docRef(COLLECTION, notificationId).update({
    read: true,
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  userId: string,
  companyId: string
): Promise<number> {
  const snapshot = await collectionRef(COLLECTION)
    .where('userId', '==', userId)
    .where('companyId', '==', companyId)
    .where('read', '==', false)
    .get();

  const batch = collectionRef(COLLECTION).firestore.batch();
  snapshot.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
  return snapshot.size;
}

/**
 * Delete old notifications (cleanup)
 */
export async function deleteOldNotifications(
  olderThanDays: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const snapshot = await collectionRef(COLLECTION)
    .where('createdAt', '<', cutoffDate)
    .get();

  const batch = collectionRef(COLLECTION).firestore.batch();
  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return snapshot.size;
}

/**
 * Send push notification via Firebase Cloud Messaging
 * Note: Requires FCM tokens to be stored in user profiles
 */
export async function sendPushNotification(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  try {
    const { getMessaging } = await import('firebase-admin/messaging');
    const message = {
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data,
      token: params.token,
    };

    await getMessaging().send(message);
  } catch (error) {
    console.error('Failed to send push notification:', error);
    // Don't throw — push notifications are best-effort
  }
}
