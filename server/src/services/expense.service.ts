// ──────────────────────────────────────────────
// Expense Service — Business Logic
// ──────────────────────────────────────────────

import {
  collectionRef,
  docRef,
  serverTimestamp,
} from '../config/firebase';
import type {
  Expense,
  ExpenseFilters,
  ExpenseStatus,
  ApprovalChainEntry,
  ApprovalAction,
  UserRole,
} from '../types';
import { createAuditLog } from '../utils/audit';
import { sanitizeSearchTerm } from '../utils/helpers';
import { categorizeExpense } from './ai.service';
import { firebaseService } from './firebase.service';

const COLLECTION = 'expenses';

// Valid status transitions mapping
const STATUS_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  draft: ['pending'],
  pending: ['manager_approved', 'rejected', 'changes_requested'],
  manager_approved: ['finance_approved', 'rejected', 'changes_requested'],
  finance_approved: ['ceo_approved', 'rejected', 'changes_requested'],
  ceo_approved: ['approved', 'rejected'],
  approved: ['reimbursed'],
  rejected: ['draft', 'pending'],
  changes_requested: ['draft', 'pending'],
  reimbursed: [],
};

/**
 * Check if a status transition is valid
 */
function isValidTransition(from: ExpenseStatus, to: ExpenseStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Build the approval chain based on company settings
 */
function buildApprovalChain(
  companySettings: {
    requireManagerApproval: boolean;
    requireFinanceApproval: boolean;
    requireCeoApproval: boolean;
    autoApprovalLimit: number;
  },
  amount: number,
  userRole: UserRole,
  departmentHeadId?: string,
  companyCeoId?: string
): ApprovalChainEntry[] {
  const chain: ApprovalChainEntry[] = [];
  let level = 1;

  // Auto-approved if under limit
  if (amount <= companySettings.autoApprovalLimit) {
    return [
      {
        level: 0,
        role: 'employee',
        action: 'approved',
        timestamp: new Date(),
      },
    ];
  }

  // Manager approval
  if (
    companySettings.requireManagerApproval &&
    userRole !== 'dept_manager' &&
    userRole !== 'ceo'
  ) {
    chain.push({
      level: level++,
      role: 'dept_manager',
      userId: departmentHeadId,
      action: 'pending',
    });
  }

  // Finance approval
  if (companySettings.requireFinanceApproval) {
    chain.push({
      level: level++,
      role: 'finance_manager',
      action: 'pending',
    });
  }

  // CEO approval
  if (companySettings.requireCeoApproval) {
    chain.push({
      level: level++,
      role: 'ceo',
      userId: companyCeoId,
      action: 'pending',
    });
  }

  return chain;
}

/**
 * Check expense against company policies
 */
async function checkPolicyViolations(
  expense: Partial<Expense>,
  companySettings: {
    maxExpenseAmount: number;
  }
): Promise<string[]> {
  const violations: string[] = [];

  if (expense.amount && expense.amount > companySettings.maxExpenseAmount) {
    violations.push(
      `Amount $${expense.amount} exceeds maximum of $${companySettings.maxExpenseAmount}`
    );
  }

  if (!expense.category || expense.category === 'Other') {
    violations.push('Expense category not properly specified');
  }

  if (!expense.vendor) {
    violations.push('Vendor information is required');
  }

  if (!expense.receiptUrl && (expense.amount ?? 0) > 25) {
    violations.push('Receipt required for expenses over $25');
  }

  return violations;
}

// ── Public API ──

/**
 * Create a new expense
 */
export async function createExpense(params: {
  expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
  companySettings: {
    requireManagerApproval: boolean;
    requireFinanceApproval: boolean;
    requireCeoApproval: boolean;
    autoApprovalLimit: number;
    maxExpenseAmount: number;
    enableAi?: boolean;
    enableOcr?: boolean;
  };
  userRole: UserRole;
  departmentHeadId?: string;
  companyCeoId?: string;
  userId: string;
  companyId: string;
}): Promise<Expense> {
  const {
    expenseData,
    companySettings,
    userRole,
    departmentHeadId,
    companyCeoId,
    userId,
    companyId,
  } = params;

  const policyViolations = await checkPolicyViolations(expenseData, companySettings);
  const approvalChain = buildApprovalChain(
    companySettings,
    expenseData.amount,
    userRole,
    departmentHeadId,
    companyCeoId
  );

  // AI categorization if enabled
  let aiCategory: string | undefined;
  let aiConfidence: number | undefined;
  if (companySettings.enableAi !== false) {
    try {
      const result = await categorizeExpense(expenseData);
      aiCategory = result.category;
      aiConfidence = result.confidence;
    } catch {
      // AI categorization failed, use whatever the user provided
    }
  }

  const docRef = collectionRef(COLLECTION).doc();
  const status: ExpenseStatus = policyViolations.length > 0 ? 'draft' : 'pending';

  const expense: Omit<Expense, 'id'> & { id: string } = {
    ...expenseData,
    id: docRef.id,
    companyId,
    userId,
    status,
    currentApprovalLevel: 1,
    approvalChain,
    policyViolations,
    aiCategory: aiCategory || expenseData.aiCategory,
    aiConfidence: aiConfidence || expenseData.aiConfidence,
    isReimbursed: false,
    tags: expenseData.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await docRef.set({
    ...expense,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Audit log
  await createAuditLog({
    companyId,
    userId,
    action: 'expense.created',
    resource: 'expenses',
    resourceId: docRef.id,
    details: { title: expenseData.title, amount: expenseData.amount },
  });

  // Update department budget spent
  if (expenseData.departmentId) {
    await updateDepartmentBudget(companyId, expenseData.departmentId, expenseData.amount);
  }

  return expense as Expense;
}

/**
 * Get expense by ID
 */
export async function getExpense(id: string): Promise<Expense | null> {
  const snapshot = await docRef(COLLECTION, id).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data()!;
  return { id: snapshot.id, ...data } as unknown as Expense;
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  updates: Partial<Expense>,
  userId: string,
  companyId: string
): Promise<void> {
  const existing = await getExpense(id);
  if (!existing) {
    throw new Error('Expense not found');
  }

  // Only allow updates on draft or changes_requested expenses
  if (existing.status !== 'draft' && existing.status !== 'changes_requested') {
    throw new Error('Can only update expenses in draft or changes_requested status');
  }

  await docRef(COLLECTION, id).update({
    ...updates,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    companyId,
    userId,
    action: 'expense.updated',
    resource: 'expenses',
    resourceId: id,
    details: { updates: Object.keys(updates) },
  });
}

/**
 * Delete an expense
 */
export async function deleteExpense(
  id: string,
  userId: string,
  companyId: string
): Promise<void> {
  const existing = await getExpense(id);
  if (!existing) {
    throw new Error('Expense not found');
  }

  if (existing.status !== 'draft') {
    throw new Error('Can only delete draft expenses');
  }

  await docRef(COLLECTION, id).delete();

  await createAuditLog({
    companyId,
    userId,
    action: 'expense.deleted',
    resource: 'expenses',
    resourceId: id,
    details: { title: existing.title },
  });
}

/**
 * List expenses with filters
 */
export async function listExpenses(
  companyId: string,
  filters: ExpenseFilters,
  userRole: UserRole,
  userId: string
): Promise<{ expenses: Expense[]; total: number }> {
  let query: FirebaseFirestore.Query = collectionRef(COLLECTION);

  // Always scope to company
  query = query.where('companyId', '==', companyId);

  // Role-based scoping
  if (userRole === 'employee') {
    query = query.where('userId', '==', userId);
  } else if (userRole === 'dept_manager') {
    // Managers see their department's expenses
    const userDoc = await docRef('users', userId).get();
    const deptId = userDoc.data()?.departmentId;
    if (deptId) {
      query = query.where('departmentId', '==', deptId);
    }
  }
  // Finance, CEO, Super Admin see all company expenses

  // Apply filters
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  if (filters.category) {
    query = query.where('category', '==', filters.category);
  }
  if (filters.departmentId) {
    query = query.where('departmentId', '==', filters.departmentId);
  }
  if (filters.userId) {
    query = query.where('userId', '==', filters.userId);
  }
  if (filters.vendor) {
    query = query.where('vendor', '==', filters.vendor);
  }

  // Date range
  if (filters.startDate) {
    query = query.where('date', '>=', new Date(filters.startDate));
  }
  if (filters.endDate) {
    query = query.where('date', '<=', new Date(filters.endDate));
  }

  // Amount range
  if (filters.minAmount !== undefined) {
    query = query.where('amount', '>=', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.where('amount', '<=', filters.maxAmount);
  }

  // Sort
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';
  query = query.orderBy(sortBy, sortOrder);

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Get total count
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Get paginated results
  query = query.limit(limit).offset(offset);
  const snapshot = await query.get();

  const expenses: Expense[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    expenses.push({
      id: doc.id,
      ...data,
      date: data.date?.toDate?.() || data.date,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Expense);
  });

  // Apply text search in-memory (Firestore doesn't support text search natively)
  if (filters.search) {
    const term = sanitizeSearchTerm(filters.search.toLowerCase());
    return {
      expenses: expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term) ||
          e.vendor?.toLowerCase().includes(term) ||
          e.category.toLowerCase().includes(term) ||
          e.tags?.some((t) => t.toLowerCase().includes(term))
      ),
      total,
    };
  }

  return { expenses, total };
}

/**
 * Process an approval action on an expense
 */
export async function processApproval(params: {
  expenseId: string;
  userId: string;
  companyId: string;
  userRole: UserRole;
  action: ApprovalAction;
  comment?: string;
}): Promise<Expense> {
  const { expenseId, userId, companyId, userRole, action, comment } = params;

  const expense = await getExpense(expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }

  // Find the current pending approval level for this user's role
  const pendingEntry = expense.approvalChain.find(
    (e) => e.role === userRole && e.action === 'pending'
  );

  if (!pendingEntry) {
    throw new Error('No pending approval found for your role');
  }

  // Update the approval chain entry
  const updatedChain = expense.approvalChain.map((entry) => {
    if (entry.level === pendingEntry.level && entry.role === userRole) {
      return {
        ...entry,
        action,
        userId,
        comment: comment || '',
        timestamp: new Date(),
      };
    }
    return entry;
  });

  let newStatus: ExpenseStatus;

  if (action === 'rejected') {
    newStatus = 'rejected';
  } else if (action === 'changes_requested') {
    newStatus = 'changes_requested';
  } else {
    // Approved — move to next level or final approve
    const nextPending = updatedChain.find((e) => e.action === 'pending');
    if (nextPending) {
      newStatus = expense.status; // Keep current status
      // Map role to status
      if (userRole === 'dept_manager') newStatus = 'manager_approved';
      else if (userRole === 'finance_manager') newStatus = 'finance_approved';
      else if (userRole === 'ceo') newStatus = 'ceo_approved';
    } else {
      newStatus = 'approved';
    }
  }

  await docRef(COLLECTION, expenseId).update({
    status: newStatus,
    approvalChain: updatedChain,
    currentApprovalLevel: pendingEntry.level + 1,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    companyId,
    userId,
    action: `expense.${action}`,
    resource: 'expenses',
    resourceId: expenseId,
    details: { previousStatus: expense.status, newStatus, comment },
  });

  // Re-fetch and return updated expense
  const updated = await getExpense(expenseId);
  if (!updated) throw new Error('Failed to fetch updated expense');
  return updated;
}

/**
 * Upload receipt for an expense
 */
export async function uploadReceipt(
  expenseId: string,
  receiptUrl: string,
  userId: string,
  companyId: string
): Promise<void> {
  const expense = await getExpense(expenseId);
  if (!expense) {
    throw new Error('Expense not found');
  }

  await docRef(COLLECTION, expenseId).update({
    receiptUrl,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog({
    companyId,
    userId,
    action: 'expense.receipt_uploaded',
    resource: 'expenses',
    resourceId: expenseId,
    details: { receiptUrl },
  });
}

/**
 * Update department budget spent amount
 */
async function updateDepartmentBudget(
  companyId: string,
  departmentId: string,
  amount: number
): Promise<void> {
  try {
    const deptRef = docRef('departments', departmentId);
    const deptDoc = await deptRef.get();

    if (deptDoc.exists) {
      const deptData = deptDoc.data()!;
      const newSpent = (deptData.budgetSpent || 0) + amount;
      await deptRef.update({
        budgetSpent: newSpent,
        budgetRemaining: (deptData.budget || 0) - newSpent,
        updatedAt: serverTimestamp(),
      });

      // Also update budgets collection
      const budgetSnapshot = await collectionRef('budgets')
        .where('companyId', '==', companyId)
        .where('departmentId', '==', departmentId)
        .where('status', '==', 'active')
        .get();

      budgetSnapshot.forEach(async (budgetDoc) => {
        const budgetData = budgetDoc.data();
        const newTotalSpent = (budgetData.totalSpent || 0) + amount;
        await budgetDoc.ref.update({
          totalSpent: newTotalSpent,
          totalRemaining: (budgetData.totalAllocated || 0) - newTotalSpent,
          updatedAt: serverTimestamp(),
        });
      });
    }
  } catch (error) {
    console.error('Failed to update department budget:', error);
    // Non-critical — don't throw
  }
}

/**
 * Get expense statistics for a company
 */
export async function getExpenseStats(
  companyId: string,
  filters?: {
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  total: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  averageAmount: number;
}> {
  let query: FirebaseFirestore.Query = collectionRef(COLLECTION)
    .where('companyId', '==', companyId);

  if (filters?.departmentId) {
    query = query.where('departmentId', '==', filters.departmentId);
  }
  if (filters?.startDate) {
    query = query.where('date', '>=', new Date(filters.startDate));
  }
  if (filters?.endDate) {
    query = query.where('date', '<=', new Date(filters.endDate));
  }

  const snapshot = await query.get();

  const byStatus: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalAmount = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const amount = data.amount || 0;
    totalAmount += amount;

    byStatus[data.status] = (byStatus[data.status] || 0) + amount;
    byCategory[data.category] = (byCategory[data.category] || 0) + amount;
  });

  return {
    total: snapshot.size,
    totalAmount,
    byStatus,
    byCategory,
    averageAmount: snapshot.size > 0 ? totalAmount / snapshot.size : 0,
  };
}
