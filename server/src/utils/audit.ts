// ──────────────────────────────────────────────
// Audit Logging Service
// ──────────────────────────────────────────────

import { collectionRef, serverTimestamp } from '../config/firebase';
import admin from 'firebase-admin';
import type { AuditLog } from '../types';

/**
 * Create an audit log entry in Firestore
 */
export async function createAuditLog(params: {
  companyId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<string> {
  try {
    const docRef = collectionRef('auditLogs').doc();
    const auditEntry: Record<string, unknown> = {
      companyId: params.companyId,
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(auditEntry);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Audit logging should never throw — just log and continue
    return '';
  }
}

/**
 * Get audit logs for a company
 */
export async function getAuditLogs(
  companyId: string,
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<AuditLog[]> {
  try {
    let query: FirebaseFirestore.Query = collectionRef('auditLogs')
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc');

    if (options.userId) {
      query = query.where('userId', '==', options.userId);
    }
    if (options.action) {
      query = query.where('action', '==', options.action);
    }
    if (options.resource) {
      query = query.where('resource', '==', options.resource);
    }

    const limitVal = Math.min(options.limit || 50, 500);
    query = query.limit(limitVal);

    const snapshot = await query.get();
    const logs: AuditLog[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        companyId: data.companyId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      } as AuditLog);
    });

    return logs;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
