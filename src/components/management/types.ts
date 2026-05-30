/**
 * Types pour le module Gestion Financière
 * Structure complète et future-proof
 */

// ============ CATÉGORIES ============

export type ExpenseCategory = 
  | 'alimentation'
  | 'transport'
  | 'logement'
  | 'energie'
  | 'sante'
  | 'loisirs'
  | 'shopping'
  | 'abonnements'
  | 'sorties'
  | 'voyages'
  | 'education'
  | 'epargne'
  | 'divers';

export type IncomeCategory =
  | 'salaire'
  | 'freelance'
  | 'investissements'
  | 'aides'
  | 'ventes'
  | 'autre';

export type BillFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type BillStatus = 'active' | 'paused' | 'cancelled';

// ============ INTERFACES PRINCIPALES ============

export interface Category {
  id: ExpenseCategory | IncomeCategory;
  name: string;
  icon: string;
  color: string;
  budget?: number; // Budget alloué pour cette catégorie
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory | IncomeCategory;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  // Métadonnées optionnelles
  merchant?: string;
  location?: string;
  tags?: string[];
  receipt?: string; // URL de l'image du reçu
  isRecurring?: boolean;
  recurringId?: string;
}

export interface RecurringBill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: BillFrequency;
  nextDueDate: Date;
  lastPaidDate?: Date;
  status: BillStatus;
  provider?: string; // Netflix, EDF, etc.
  contractNumber?: string;
  website?: string;
  autoPayEnabled: boolean;
  reminderDays: number; // Jours avant échéance pour rappel
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  budget: number;
  actualSpent: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  estimatedPrice: number;
  actualPrice?: number;
  category: string;
  isChecked: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  totalIncome: number;
  totalExpenses: number;
  categories: BudgetCategory[];
  savingsGoal: number;
  savingsActual: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  categoryId: ExpenseCategory;
  budgeted: number;
  spent: number;
  remaining: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

// ============ ANALYTICS ============

export interface SpendingTrend {
  period: string; // 'YYYY-MM'
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface WasteDetection {
  id: string;
  type: 'subscription_unused' | 'overspending' | 'late_fees' | 'duplicate' | 'unusual_pattern';
  title: string;
  description: string;
  amount: number;
  severity: 'low' | 'medium' | 'high';
  category?: ExpenseCategory;
  suggestion: string;
  detectedAt: Date;
  isResolved: boolean;
}

export interface FinancialProjection {
  month: string; // 'YYYY-MM'
  projectedIncome: number;
  projectedExpenses: number;
  projectedSavings: number;
  confidence: number; // 0-100
  basedOn: string[]; // Historique utilisé
}

// ============ AI & INSIGHTS ============

export interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'opportunity' | 'achievement';
  title: string;
  message: string;
  category?: ExpenseCategory;
  impact: number; // Impact financier potentiel en euros
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface AIRecommendation {
  id: string;
  type: 'budget_adjustment' | 'subscription_cancel' | 'savings_increase' | 'expense_reduction';
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  steps: string[];
  createdAt: Date;
}

// ============ DASHBOARD ============

export interface DashboardStats {
  currentMonth: {
    income: number;
    expenses: number;
    balance: number;
    savings: number;
    savingsRate: number; // Pourcentage
  };
  comparison: {
    incomeChange: number; // Pourcentage vs mois précédent
    expenseChange: number;
    savingsChange: number;
  };
  topCategories: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  upcomingBills: {
    id: string;
    name: string;
    amount: number;
    dueDate: Date;
    daysUntil: number;
  }[];
  recentTransactions: Transaction[];
}

// ============ FILTRES & PAGINATION ============

export interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  categories?: (ExpenseCategory | IncomeCategory)[];
  minAmount?: number;
  maxAmount?: number;
  type?: 'expense' | 'income';
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ FORMULAIRES ============

export interface TransactionFormData {
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory | IncomeCategory;
  description: string;
  date: string;
  merchant?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: BillFrequency;
}

export interface RecurringBillFormData {
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: BillFrequency;
  nextDueDate: string;
  provider?: string;
  autoPayEnabled: boolean;
  reminderDays: number;
}

export interface BudgetFormData {
  month: number;
  year: number;
  totalIncome: number;
  savingsGoal: number;
  categories: {
    categoryId: ExpenseCategory;
    budgeted: number;
  }[];
}

// ============ EXPORT ============

export interface ExportConfig {
  format: 'csv' | 'pdf' | 'json';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCategories: (ExpenseCategory | IncomeCategory)[];
  includeRecurring: boolean;
}
