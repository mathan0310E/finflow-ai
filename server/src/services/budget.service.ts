// ──────────────────────────────────────────────
// Budget Service
// ──────────────────────────────────────────────

import { collectionRef, serverTimestamp } from '../config/firebase';
import type { Budget, BudgetCategory, BudgetPeriod } from '../types';
import { firebaseService } from './firebase.service';
import { createAuditLog } from '../utils/audit';
import { docRef as getDocRef } from '../config/firebase';

const COLLECTION = 'budgets';

/**
 * Create a new budget
 */
export async function createBudget(params: {
  companyId: string;
  departmentId?: string;
  fiscalYear: string;
  period: BudgetPeriod;
  categories: BudgetCategory[];
  totalAllocated: number;
  userId: string;
}): Promise<Budget> {
  const { companyId, departmentId, fiscalYear, period, categories, totalAllocated, userId } = params;

  // Calculate totals
  const totalSpent = categories.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  const docRef = collectionRef(COLLECTION).doc();
  const budget: Omit<Budget, 'id'> & { id: string } = {
    id: docRef.id,
    companyId,
    departmentId,
    fiscalYear,
    period,
    categories,
    totalAllocated,
    totalSpent,
    totalRemaining,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set({
    ...budget,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Also update department budget
  if (departmentId) {
    await getDocRef('departments', departmentId).update({
      budget: totalAllocated,
      budgetSpent: totalSpent,
      budgetRemaining: totalRemaining,
      updatedAt: serverTimestamp(),
    });
  }

  await createAuditLog({
    companyId,
    userId,
    action: 'budget.created',
    resource: 'budgets',
    resourceId: docRef.id,
    details: { fiscalYear, period, totalAllocated },
  });

  return budget as Budget;
}

/**
 * Get budget by ID
 */
export async function getBudget(id: string): Promise<Budget | null> {
  return firebaseService.getById<Budget>(COLLECTION, id);
}

/**
 * Update a budget
 */
export async function updateBudget(
  id: string,
  updates: Partial<Budget>,
  userId: string,
  companyId: string
): Promise<void> {
  const existing = await getBudget(id);
  if (!existing) {
    throw new Error('Budget not found');
  }

  // Recalculate totals if categories changed
  if (updates.categories) {
    updates.totalSpent = updates.categories.reduce((sum, c) => sum + (c.spent || 0), 0);
    updates.totalAllocated = updates.categories.reduce((sum, c) => sum + (c.allocated || 0), 0);
    updates.totalRemaining = (updates.totalAllocated || existing.totalAllocated) - (updates.totalSpent || existing.totalSpent);
  }

  await getDocRef(COLLECTION, id).update({
    ...updates,
    updatedAt: serverTimestamp(),
  });

  // Update department budget if department scoped
  if (existing.departmentId) {
    const finalAllocated = updates.totalAllocated ?? existing.totalAllocated;
    const finalSpent = updates.totalSpent ?? existing.totalSpent;
    await getDocRef('departments', existing.departmentId).update({
      budget: finalAllocated,
      budgetSpent: finalSpent,
      budgetRemaining: finalAllocated - finalSpent,
      updatedAt: serverTimestamp(),
    });
  }

  await createAuditLog({
    companyId,
    userId,
    action: 'budget.updated',
    resource: 'budgets',
    resourceId: id,
    details: { updates: Object.keys(updates) },
  });
}

/**
 * List budgets for a company
 */
export async function listBudgets(
  companyId: string,
  options: {
    departmentId?: string;
    fiscalYear?: string;
    status?: string;
    period?: BudgetPeriod;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Budget[]> {
  const filters: Array<{
    field: string;
    operator: FirebaseFirestore.WhereFilterOp;
    value: unknown;
  }> = [{ field: 'companyId', operator: '==', value: companyId }];

  if (options.departmentId) {
    filters.push({ field: 'departmentId', operator: '==', value: options.departmentId });
  }
  if (options.fiscalYear) {
    filters.push({ field: 'fiscalYear', operator: '==', value: options.fiscalYear });
  }
  if (options.status) {
    filters.push({ field: 'status', operator: '==', value: options.status });
  }
  if (options.period) {
    filters.push({ field: 'period', operator: '==', value: options.period });
  }

  return firebaseService.list<Budget>(COLLECTION, {
    filters,
    orderBy: { field: 'createdAt', direction: 'desc' },
    limit: options.limit || 50,
    offset: options.offset,
  });
}

/**
 * Get budget utilization statistics
 */
export async function getBudgetStats(
  id: string
): Promise<{
  utilizationPercentage: number;
  remainingDays: number;
  projectedSpend: number;
  isOverBudget: boolean;
  categoryUtilization: Array<{ name: string; percentage: number; remaining: number }>;
}> {
  const budget = await getBudget(id);
  if (!budget) {
    throw new Error('Budget not found');
  }

  const utilizationPercentage =
    budget.totalAllocated > 0
      ? (budget.totalSpent / budget.totalAllocated) * 100
      : 0;

  // Calculate remaining days based on period
  const now = new Date();
  const currentYear = now.getFullYear();
  let endDate: Date;

  switch (budget.period) {
    case 'monthly':
      endDate = new Date(currentYear, now.getMonth() + 1, 0);
      break;
    case 'quarterly': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);
      break;
    }
    case 'annual':
    default:
      endDate = new Date(currentYear, 11, 31);
      break;
  }

  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Projected spend based on current rate
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - new Date(budget.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - new Date(budget.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
  const dailyRate = budget.totalSpent / daysElapsed;
  const projectedSpend = dailyRate * totalDays;

  const isOverBudget = budget.totalSpent > budget.totalAllocated;

  const categoryUtilization = budget.categories.map((cat) => ({
    name: cat.name,
    percentage: cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0,
    remaining: cat.remaining,
  }));

  return {
    utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
    remainingDays,
    projectedSpend: Math.round(projectedSpend * 100) / 100,
    isOverBudget,
    categoryUtilization,
  };
}

/**
 * Close a budget
 */
export async function closeBudget(
  id: string,
  userId: string,
  companyId: string
): Promise<void> {
  const existing = await getBudget(id);
  if (!existing) {
    throw new Error('Budget not found');
  }

  await getDocRef(COLLECTION, id).update({
    status: 'closed',
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    companyId,
    userId,
    action: 'budget.closed',
    resource: 'budgets',
    resourceId: id,
    details: { fiscalYear: existing.fiscalYear },
  });
}
