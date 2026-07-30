// ──────────────────────────────────────────────
// Analytics Service
// ──────────────────────────────────────────────

import { collectionRef } from '../config/firebase';
import type {
  DashboardMetrics,
  Expense,
  Budget,
  UserRole,
} from '../types';

const EXPENSES_COLLECTION = 'expenses';
const BUDGETS_COLLECTION = 'budgets';

/**
 * Get dashboard metrics for a user based on their role
 */
export async function getDashboardMetrics(
  companyId: string,
  userId: string,
  userRole: UserRole
): Promise<DashboardMetrics> {
  // Build expense query based on role
  let expenseQuery: FirebaseFirestore.Query = collectionRef(EXPENSES_COLLECTION)
    .where('companyId', '==', companyId);

  if (userRole === 'employee') {
    expenseQuery = expenseQuery.where('userId', '==', userId);
  } else if (userRole === 'dept_manager') {
    const userDoc = await collectionRef('users').doc(userId).get();
    const deptId = userDoc.data()?.departmentId;
    if (deptId) {
      expenseQuery = expenseQuery.where('departmentId', '==', deptId);
    }
  }

  const expenseSnapshot = await expenseQuery.get();
  const expenses: Expense[] = [];

  expenseSnapshot.forEach((doc) => {
    const data = doc.data();
    expenses.push({
      id: doc.id,
      ...data,
      date: data.date?.toDate?.() || data.date,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Expense);
  });

  // Get budgets
  const budgetData = await getCompanyBudgets(companyId);

  // Calculate metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Monthly expenses
  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Pending approvals
  const pendingApprovals = expenses.filter(
    (e) => e.status === 'pending' || e.status === 'manager_approved' || e.status === 'finance_approved'
  );

  // Approved amount
  const approvedExpenses = expenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed');
  const approvedAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Rejected amount
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');
  const rejectedAmount = rejectedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Monthly spend
  const monthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Budget utilization
  const totalAllocated = budgetData.reduce((sum, b) => sum + b.totalAllocated, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.totalSpent, 0);
  const budgetUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Department comparison
  const deptMap = new Map<string, number>();
  for (const exp of expenses) {
    if (exp.departmentId) {
      deptMap.set(exp.departmentId, (deptMap.get(exp.departmentId) || 0) + exp.amount);
    }
  }
  const departmentComparison = Array.from(deptMap.entries()).map(([name, amount]) => ({
    name,
    amount,
  }));

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const exp of expenses) {
    categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount);
  }
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0,
  }));

  // Monthly trend (last 12 months)
  const monthlyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthExpenses = expenses.filter((e) => {
      const ed = new Date(e.date);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    });
    monthlyTrend.push({
      month: monthStr,
      amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    });
  }

  // Recent expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Average expense
  const averageExpense =
    expenses.length > 0
      ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length
      : 0;

  // Top vendors
  const vendorMap = new Map<string, { total: number; count: number }>();
  for (const exp of expenses) {
    if (exp.vendor) {
      const current = vendorMap.get(exp.vendor) || { total: 0, count: 0 };
      current.total += exp.amount;
      current.count += 1;
      vendorMap.set(exp.vendor, current);
    }
  }
  const topVendors = Array.from(vendorMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    totalExpenses: expenses.length,
    pendingApprovals: pendingApprovals.length,
    approvedAmount,
    rejectedAmount,
    monthlySpend,
    budgetUtilization: Math.round(budgetUtilization * 100) / 100,
    departmentComparison,
    categoryBreakdown,
    monthlyTrend,
    recentExpenses,
    pendingCount: pendingApprovals.length,
    budgetRemaining: totalAllocated - totalSpent,
    averageExpense: Math.round(averageExpense * 100) / 100,
    topVendors,
  };
}

/**
 * Get department-level analytics
 */
export async function getDepartmentAnalytics(
  companyId: string,
  departmentId: string
): Promise<{
  totalExpenses: number;
  totalAmount: number;
  budgetUtilization: number;
  averageExpense: number;
  byCategory: Array<{ name: string; amount: number; count: number }>;
  monthlyTrend: Array<{ month: string; amount: number }>;
  topEmployees: Array<{ id: string; name: string; total: number; count: number }>;
}> {
  const expenses = await getDepartmentExpenses(companyId, departmentId);
  const budgets = await getDepartmentBudgets(companyId, departmentId);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.totalAllocated, 0);

  // By category
  const catMap = new Map<string, { amount: number; count: number }>();
  for (const exp of expenses) {
    const current = catMap.get(exp.category) || { amount: 0, count: 0 };
    current.amount += exp.amount;
    current.count += 1;
    catMap.set(exp.category, current);
  }
  const byCategory = Array.from(catMap.entries()).map(([name, stats]) => ({ name, ...stats }));

  // Monthly trend
  const now = new Date();
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthExpenses = expenses.filter((e) => {
      const ed = new Date(e.date);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    });
    monthlyTrend.push({
      month: monthStr,
      amount: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    });
  }

  // Top employees
  const empMap = new Map<string, { total: number; count: number }>();
  for (const exp of expenses) {
    const current = empMap.get(exp.userId) || { total: 0, count: 0 };
    current.total += exp.amount;
    current.count += 1;
    empMap.set(exp.userId, current);
  }

  const topEmployees = [];
  for (const [userId, stats] of empMap) {
    try {
      const userDoc = await collectionRef('users').doc(userId).get();
      const userName = userDoc.data()?.displayName || userId;
      topEmployees.push({ id: userId, name: userName, ...stats });
    } catch {
      topEmployees.push({ id: userId, name: userId, ...stats });
    }
  }
  topEmployees.sort((a, b) => b.total - a.total);

  return {
    totalExpenses: expenses.length,
    totalAmount,
    budgetUtilization: totalAllocated > 0 ? (totalAmount / totalAllocated) * 100 : 0,
    averageExpense: expenses.length > 0 ? totalAmount / expenses.length : 0,
    byCategory,
    monthlyTrend,
    topEmployees: topEmployees.slice(0, 10),
  };
}

/**
 * Get spending trends
 */
export async function getSpendingTrends(
  companyId: string,
  options: {
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  } = {}
): Promise<{
  trend: Array<{ label: string; amount: number; count: number }>;
  comparisons: { periodOverPeriod: number; average: number };
}> {
  const expenses = await getCompanyExpenses(companyId, options);
  const period = options.period || 'monthly';

  const groupedData = new Map<string, { amount: number; count: number }>();

  for (const exp of expenses) {
    const d = new Date(exp.date);
    let label: string;

    switch (period) {
      case 'daily':
        label = d.toISOString().split('T')[0];
        break;
      case 'weekly': {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        label = startOfWeek.toISOString().split('T')[0];
        break;
      }
      case 'quarterly': {
        const q = Math.floor(d.getMonth() / 3) + 1;
        label = `Q${q} ${d.getFullYear()}`;
        break;
      }
      case 'monthly':
      default:
        label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        break;
    }

    const current = groupedData.get(label) || { amount: 0, count: 0 };
    current.amount += exp.amount;
    current.count += 1;
    groupedData.set(label, current);
  }

  const trend = Array.from(groupedData.entries()).map(([label, stats]) => ({
    label,
    ...stats,
  }));

  // Calculate period-over-period comparison
  const amounts = trend.map((t) => t.amount);
  const totalAmount = amounts.reduce((s, a) => s + a, 0);
  const average = amounts.length > 0 ? totalAmount / amounts.length : 0;
  const periodOverPeriod =
    trend.length >= 2
      ? ((trend[trend.length - 1].amount - trend[0].amount) / trend[0].amount) * 100
      : 0;

  return {
    trend,
    comparisons: {
      periodOverPeriod: Math.round(periodOverPeriod * 100) / 100,
      average: Math.round(average * 100) / 100,
    },
  };
}

/**
 * Get category breakdown analytics
 */
export async function getCategoryAnalytics(
  companyId: string,
  options: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  } = {}
): Promise<{
  categories: Array<{
    name: string;
    total: number;
    count: number;
    percentage: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  totalAmount: number;
}> {
  const expenses = await getCompanyExpenses(companyId, options);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const catMap = new Map<
    string,
    { total: number; count: number; amounts: number[] }
  >();

  for (const exp of expenses) {
    const current = catMap.get(exp.category) || { total: 0, count: 0, amounts: [] };
    current.total += exp.amount;
    current.count += 1;
    current.amounts.push(exp.amount);
    catMap.set(exp.category, current);
  }

  const categories = Array.from(catMap.entries()).map(([name, stats]) => {
    const avg = stats.amounts.reduce((s, a) => s + a, 0) / stats.amounts.length;
    const recentAvg = stats.amounts.slice(-3).reduce((s, a) => s + a, 0) / Math.min(3, stats.amounts.length);
    const trend: 'up' | 'down' | 'stable' =
      recentAvg > avg * 1.1 ? 'up' : recentAvg < avg * 0.9 ? 'down' : 'stable';

    return {
      name,
      total: stats.total,
      count: stats.count,
      percentage: totalAmount > 0 ? (stats.total / totalAmount) * 100 : 0,
      average: Math.round(avg * 100) / 100,
      trend,
    };
  });

  return {
    categories: categories.sort((a, b) => b.total - a.total),
    totalAmount,
  };
}

// ── Helpers ──

async function getCompanyExpenses(
  companyId: string,
  options: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  } = {}
): Promise<Expense[]> {
  let query: FirebaseFirestore.Query = collectionRef(EXPENSES_COLLECTION)
    .where('companyId', '==', companyId);

  if (options.departmentId) {
    query = query.where('departmentId', '==', options.departmentId);
  }
  if (options.startDate) {
    query = query.where('date', '>=', new Date(options.startDate));
  }
  if (options.endDate) {
    query = query.where('date', '<=', new Date(options.endDate));
  }

  const snapshot = await query.get();
  const expenses: Expense[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    expenses.push({ id: doc.id, ...data } as Expense);
  });
  return expenses;
}

async function getDepartmentExpenses(
  companyId: string,
  departmentId: string
): Promise<Expense[]> {
  return getCompanyExpenses(companyId, { departmentId });
}

async function getCompanyBudgets(
  companyId: string
): Promise<Budget[]> {
  const snapshot = await collectionRef(BUDGETS_COLLECTION)
    .where('companyId', '==', companyId)
    .where('status', '==', 'active')
    .get();

  const budgets: Budget[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    budgets.push({ id: doc.id, ...data } as Budget);
  });
  return budgets;
}

async function getDepartmentBudgets(
  companyId: string,
  departmentId: string
): Promise<Budget[]> {
  const snapshot = await collectionRef(BUDGETS_COLLECTION)
    .where('companyId', '==', companyId)
    .where('departmentId', '==', departmentId)
    .where('status', '==', 'active')
    .get();

  const budgets: Budget[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    budgets.push({ id: doc.id, ...data } as Budget);
  });
  return budgets;
}
