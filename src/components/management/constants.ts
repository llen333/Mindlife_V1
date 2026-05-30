/**
 * Constantes pour le module Gestion Financière
 */

import type { Category, ExpenseCategory, IncomeCategory, Transaction, RecurringBill, ShoppingList, SavingsGoal, WasteDetection, AIInsight } from './types';

// ============ COULEURS THÈME ============

export const THEME_COLORS = {
  primary: 'amber', // Couleur principale de la page Gestion
  gradient: 'from-amber-500 to-orange-500',
  gradientSubtle: 'from-amber-500/10 to-orange-500/10',
  glow: 'rgba(251, 191, 36, 0.15)',
  border: 'rgba(251, 191, 36, 0.2)',
} as const;

// ============ CATÉGORIES DE DÉPENSES ============

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'alimentation', name: 'Alimentation', icon: '🛒', color: '#10b981', budget: 400 },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6', budget: 150 },
  { id: 'logement', name: 'Logement', icon: '🏠', color: '#8b5cf6', budget: 800 },
  { id: 'energie', name: 'Énergie', icon: '⚡', color: '#f59e0b', budget: 100 },
  { id: 'sante', name: 'Santé', icon: '💊', color: '#ef4444', budget: 50 },
  { id: 'loisirs', name: 'Loisirs', icon: '🎮', color: '#ec4899', budget: 100 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#06b6d4', budget: 75 },
  { id: 'abonnements', name: 'Abonnements', icon: '📱', color: '#6366f1', budget: 50 },
  { id: 'sorties', name: 'Sorties', icon: '🎉', color: '#f97316', budget: 100 },
  { id: 'voyages', name: 'Voyages', icon: '✈️', color: '#14b8a6', budget: 200 },
  { id: 'education', name: 'Éducation', icon: '📚', color: '#a855f7', budget: 50 },
  { id: 'epargne', name: 'Épargne', icon: '🏦', color: '#22c55e', budget: 300 },
  { id: 'divers', name: 'Divers', icon: '📦', color: '#64748b', budget: 50 },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salaire', name: 'Salaire', icon: '💼', color: '#22c55e' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6' },
  { id: 'investissements', name: 'Investissements', icon: '📈', color: '#f59e0b' },
  { id: 'aides', name: 'Aides', icon: '🏛️', color: '#8b5cf6' },
  { id: 'ventes', name: 'Ventes', icon: '🏷️', color: '#ec4899' },
  { id: 'autre', name: 'Autre', icon: '💰', color: '#64748b' },
];

// ============ MAP POUR ACCÈS RAPIDE ============

export const EXPENSE_CATEGORY_MAP = EXPENSE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<ExpenseCategory, Category>);

export const INCOME_CATEGORY_MAP = INCOME_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<IncomeCategory, Category>);

// ============ DONNÉES PAR DÉFAUT ============

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    userId: 'default',
    amount: -45.50,
    type: 'expense',
    category: 'alimentation',
    description: 'Courses semaine',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    merchant: 'Carrefour',
  },
  {
    id: '2',
    userId: 'default',
    amount: -12.99,
    type: 'expense',
    category: 'abonnements',
    description: 'Netflix',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isRecurring: true,
  },
  {
    id: '3',
    userId: 'default',
    amount: -35.00,
    type: 'expense',
    category: 'transport',
    description: 'Essence',
    date: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    merchant: 'TotalEnergies',
  },
  {
    id: '4',
    userId: 'default',
    amount: 2500,
    type: 'income',
    category: 'salaire',
    description: 'Salaire mensuel',
    date: new Date(Date.now() - 86400000 * 2),
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    isRecurring: true,
  },
];

export const DEFAULT_RECURRING_BILLS: RecurringBill[] = [
  {
    id: '1',
    userId: 'default',
    name: 'Netflix',
    amount: 12.99,
    category: 'abonnements',
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 5 * 86400000),
    status: 'active',
    provider: 'Netflix',
    autoPayEnabled: true,
    reminderDays: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'default',
    name: 'Spotify Premium',
    amount: 9.99,
    category: 'abonnements',
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 12 * 86400000),
    status: 'active',
    provider: 'Spotify',
    autoPayEnabled: true,
    reminderDays: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'default',
    name: 'Électricité',
    amount: 85.00,
    category: 'energie',
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 8 * 86400000),
    status: 'active',
    provider: 'EDF',
    autoPayEnabled: false,
    reminderDays: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    userId: 'default',
    name: 'Internet',
    amount: 39.99,
    category: 'abonnements',
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 15 * 86400000),
    status: 'active',
    provider: 'Orange',
    autoPayEnabled: true,
    reminderDays: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    userId: 'default',
    name: 'Assurance Auto',
    amount: 45.00,
    category: 'transport',
    frequency: 'monthly',
    nextDueDate: new Date(Date.now() + 20 * 86400000),
    status: 'active',
    provider: 'MAAF',
    autoPayEnabled: true,
    reminderDays: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: '1',
    userId: 'default',
    name: 'Courses semaine',
    items: [
      { id: '1', name: 'Lait', quantity: 2, unit: 'L', estimatedPrice: 2.50, category: 'Produits laitiers', isChecked: false },
      { id: '2', name: 'Pain', quantity: 1, unit: 'baguette', estimatedPrice: 1.20, category: 'Boulangerie', isChecked: true },
      { id: '3', name: 'Œufs', quantity: 12, unit: 'unités', estimatedPrice: 4.50, category: 'Produits laitiers', isChecked: false },
      { id: '4', name: 'Pommes', quantity: 1, unit: 'kg', estimatedPrice: 3.00, category: 'Fruits & Légumes', isChecked: false },
      { id: '5', name: 'Poulet', quantity: 500, unit: 'g', estimatedPrice: 6.00, category: 'Viandes', isChecked: false },
    ],
    budget: 50,
    actualSpent: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: '1',
    userId: 'default',
    name: 'Vacances été',
    targetAmount: 1500,
    currentAmount: 650,
    deadline: new Date(Date.now() + 180 * 86400000),
    icon: '🏖️',
    color: '#3b82f6',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'default',
    name: 'Nouveau PC',
    targetAmount: 1200,
    currentAmount: 400,
    deadline: new Date(Date.now() + 300 * 86400000),
    icon: '💻',
    color: '#8b5cf6',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'default',
    name: 'Fonds d\'urgence',
    targetAmount: 3000,
    currentAmount: 1200,
    icon: '🛡️',
    color: '#22c55e',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_WASTE_DETECTIONS: WasteDetection[] = [
  {
    id: '1',
    type: 'subscription_unused',
    title: 'Abonnement peu utilisé',
    description: 'Votre abonnement Disney+ n\'a pas été utilisé depuis 2 mois',
    amount: 8.99,
    severity: 'medium',
    category: 'abonnements',
    suggestion: 'Envisagez de suspendre ou annuler cet abonnement',
    detectedAt: new Date(),
    isResolved: false,
  },
  {
    id: '2',
    type: 'overspending',
    title: 'Dépassement budget sorties',
    description: 'Vous avez dépassé votre budget sorties de 45€ ce mois-ci',
    amount: 45,
    severity: 'high',
    category: 'sorties',
    suggestion: 'Réduisez les sorties le mois prochain pour compenser',
    detectedAt: new Date(),
    isResolved: false,
  },
  {
    id: '3',
    type: 'unusual_pattern',
    title: 'Dépense inhabituelle',
    description: 'Transaction de 156€ chez "Amazon" - plus élevée que d\'habitude',
    amount: 156,
    severity: 'low',
    category: 'shopping',
    suggestion: 'Vérifiez si cette dépense était prévue',
    detectedAt: new Date(),
    isResolved: false,
  },
];

export const DEFAULT_AI_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'tip',
    title: 'Optimisez vos courses',
    message: 'Faire vos courses le mardi peut vous faire économiser 15% en moyenne',
    category: 'alimentation',
    impact: 60,
    createdAt: new Date(),
    isRead: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Facture à venir',
    message: 'Votre facture d\'électricité arrive dans 5 jours (85€)',
    category: 'energie',
    impact: 85,
    createdAt: new Date(),
    isRead: false,
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Épargne potentielle',
    message: 'Vous pourriez épargner 50€ de plus ce mois en réduisant les sorties',
    category: 'epargne',
    impact: 50,
    createdAt: new Date(),
    isRead: false,
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Objectif atteint !',
    message: 'Vous avez économisé 20% de plus que le mois dernier !',
    impact: 100,
    createdAt: new Date(),
    isRead: false,
  },
];

// ============ DONNÉES BUDGET MENSUEL ============

export const DEFAULT_BUDGET_DATA = {
  totalIncome: 2500,
  totalExpenses: 1850,
  balance: 650,
  savingsRate: 26,
  categoriesSpending: [
    { category: 'logement' as ExpenseCategory, amount: 800, percentage: 43 },
    { category: 'alimentation' as ExpenseCategory, amount: 380, percentage: 21 },
    { category: 'transport' as ExpenseCategory, amount: 150, percentage: 8 },
    { category: 'abonnements' as ExpenseCategory, amount: 97, percentage: 5 },
    { category: 'loisirs' as ExpenseCategory, amount: 120, percentage: 6 },
    { category: 'energie' as ExpenseCategory, amount: 85, percentage: 5 },
    { category: 'sante' as ExpenseCategory, amount: 40, percentage: 2 },
    { category: 'divers' as ExpenseCategory, amount: 178, percentage: 10 },
  ],
};

// ============ PÉRIODES DE FILTRE ============

export const PERIOD_OPTIONS = [
  { id: 'today', label: "Aujourd'hui", days: 1 },
  { id: 'week', label: 'Cette semaine', days: 7 },
  { id: 'month', label: 'Ce mois', days: 30 },
  { id: 'quarter', label: 'Ce trimestre', days: 90 },
  { id: 'year', label: 'Cette année', days: 365 },
] as const;

// ============ FRÉQUENCES ============

export const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

// ============ GRAPHIQUES ============

export const CHART_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#22c55e', // green
  '#ef4444', // red
  '#6366f1', // indigo
];
