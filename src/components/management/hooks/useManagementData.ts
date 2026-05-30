/**
 * Hook principal pour la gestion des données financières
 * Connecté aux API pour persistance en base de données
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store';
import type {
  Transaction,
  RecurringBill,
  ShoppingList,
  SavingsGoal,
  WasteDetection,
  AIInsight,
  DashboardStats,
  TransactionFormData,
  RecurringBillFormData,
} from '../types';
import {
  DEFAULT_WASTE_DETECTIONS,
  DEFAULT_AI_INSIGHTS,
} from '../constants';

const API_BASE = '/api/management';

export function useManagementData() {
  const { currentUserId } = useStore();
  const userId = currentUserId || 'mindlife-user';
  
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [wasteDetections, setWasteDetections] = useState<WasteDetection[]>(DEFAULT_WASTE_DETECTIONS);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(DEFAULT_AI_INSIGHTS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load all data on mount
  useEffect(() => {
    loadData();
  }, [userId]);
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Charger les transactions
      const txRes = await fetch(`${API_BASE}/transactions?userId=${userId}`);
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })));
      }
      
      // Charger les factures
      const billsRes = await fetch(`${API_BASE}/bills?userId=${userId}`);
      if (billsRes.ok) {
        const billsData = await billsRes.json();
        setRecurringBills(billsData.bills.map((b: any) => ({
          ...b,
          nextDueDate: new Date(b.nextDueDate),
          lastPaidDate: b.lastPaidDate ? new Date(b.lastPaidDate) : undefined,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        })));
      }
      
      // Charger les listes de courses
      const shoppingRes = await fetch(`${API_BASE}/shopping?userId=${userId}`);
      if (shoppingRes.ok) {
        const shoppingData = await shoppingRes.json();
        setShoppingLists(shoppingData.lists.map((l: any) => ({
          ...l,
          scheduledDate: l.scheduledDate ? new Date(l.scheduledDate) : undefined,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
          items: l.items.map((i: any) => ({ ...i })),
        })));
      }
      
      // Charger les objectifs d'épargne
      const savingsRes = await fetch(`${API_BASE}/savings?userId=${userId}`);
      if (savingsRes.ok) {
        const savingsData = await savingsRes.json();
        setSavingsGoals(savingsData.goals.map((g: any) => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données gestion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // ============ COMPUTED VALUES ============
  
  const dashboardStats: DashboardStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = Math.abs(monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    
    const categoryTotals: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
      });
    
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: Math.round((amount / expenses) * 100),
      }));
    
    const upcomingBills = recurringBills
      .filter(b => b.status === 'active')
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 5)
      .map(b => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        dueDate: b.nextDueDate,
        daysUntil: Math.ceil((new Date(b.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }));
    
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    return {
      currentMonth: { income, expenses, balance, savings: balance, savingsRate },
      comparison: { incomeChange: 5, expenseChange: -3, savingsChange: 12 },
      topCategories,
      upcomingBills,
      recentTransactions,
    };
  }, [transactions, recurringBills]);
  
  // ============ TRANSACTIONS ============
  
  const addTransaction = useCallback(async (data: TransactionFormData) => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      
      if (res.ok) {
        const { transaction } = await res.json();
        setTransactions(prev => [{
          ...transaction,
          date: new Date(transaction.date),
          createdAt: new Date(transaction.createdAt),
        }, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout transaction:', error);
    }
  }, [userId]);
  
  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const { transaction } = await res.json();
        setTransactions(prev => prev.map(t => 
          t.id === id ? { ...t, ...transaction, date: new Date(transaction.date) } : t
        ));
      }
    } catch (error) {
      console.error('Erreur modification transaction:', error);
    }
  }, []);
  
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression transaction:', error);
    }
  }, []);
  
  // ============ RECURRING BILLS ============
  
  const addRecurringBill = useCallback(async (data: RecurringBillFormData) => {
    try {
      const res = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      
      if (res.ok) {
        const { bill } = await res.json();
        setRecurringBills(prev => [...prev, {
          ...bill,
          nextDueDate: new Date(bill.nextDueDate),
          createdAt: new Date(bill.createdAt),
        }]);
      }
    } catch (error) {
      console.error('Erreur ajout facture:', error);
    }
  }, [userId]);
  
  const updateRecurringBill = useCallback(async (id: string, data: Partial<RecurringBillFormData>) => {
    try {
      const res = await fetch(`${API_BASE}/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const { bill } = await res.json();
        setRecurringBills(prev => prev.map(b => 
          b.id === id ? { ...b, ...bill, nextDueDate: new Date(bill.nextDueDate) } : b
        ));
      }
    } catch (error) {
      console.error('Erreur modification facture:', error);
    }
  }, []);
  
  const deleteRecurringBill = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/bills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecurringBills(prev => prev.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression facture:', error);
    }
  }, []);
  
  const toggleBillPause = useCallback(async (id: string) => {
    const bill = recurringBills.find(b => b.id === id);
    if (!bill) return;
    
    const newStatus = bill.status === 'active' ? 'paused' : 'active';
    await updateRecurringBill(id, { status: newStatus } as any);
  }, [recurringBills, updateRecurringBill]);
  
  // ============ SHOPPING ============
  
  const toggleShoppingItem = useCallback(async (listId: string, itemId: string) => {
    try {
      const list = shoppingLists.find(l => l.id === listId);
      const item = list?.items.find(i => i.id === itemId);
      if (!item) return;
      
      const res = await fetch(`${API_BASE}/shopping/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChecked: !item.isChecked }),
      });
      
      if (res.ok) {
        setShoppingLists(prev => prev.map(list => {
          if (list.id !== listId) return list;
          return {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
            ),
            updatedAt: new Date(),
          };
        }));
      }
    } catch (error) {
      console.error('Erreur toggle item:', error);
    }
  }, [shoppingLists]);
  
  const updateShoppingItem = useCallback(async (itemId: string, data: { actualPrice?: number; isChecked?: boolean }) => {
    try {
      const res = await fetch(`${API_BASE}/shopping/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        // Recharger les listes
        loadData();
      }
    } catch (error) {
      console.error('Erreur mise à jour item:', error);
    }
  }, [loadData]);
  
  const addShoppingList = useCallback(async (data: { name: string; budget: number; items: any[] }) => {
    try {
      const res = await fetch(`${API_BASE}/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      
      if (res.ok) {
        const { list } = await res.json();
        setShoppingLists(prev => [{
          ...list,
          createdAt: new Date(list.createdAt),
          items: list.items || [],
        }, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout liste courses:', error);
    }
  }, [userId]);
  
  // Ajouter un item à une liste existante
  const addShoppingItem = useCallback(async (listId: string, item: { name: string; quantity?: number; estimatedPrice?: number; category?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/shopping/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (res.ok) {
        const { item: newItem } = await res.json();
        setShoppingLists(prev => prev.map(list => {
          if (list.id !== listId) return list;
          return {
            ...list,
            items: [...list.items, newItem],
            updatedAt: new Date(),
          };
        }));
      }
    } catch (error) {
      console.error('Erreur ajout article:', error);
    }
  }, []);
  
  // ============ SAVINGS ============
  
  const addSavingsGoal = useCallback(async (data: { name: string; targetAmount: number; deadline?: string; icon: string; color: string }) => {
    try {
      const res = await fetch(`${API_BASE}/savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      
      if (res.ok) {
        const { goal } = await res.json();
        setSavingsGoals(prev => [{
          ...goal,
          deadline: goal.deadline ? new Date(goal.deadline) : undefined,
          createdAt: new Date(goal.createdAt),
        }, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout objectif épargne:', error);
    }
  }, [userId]);
  
  const updateSavingsGoal = useCallback(async (id: string, data: Partial<{ name: string; targetAmount: number; currentAmount: number; deadline?: string; icon: string; color: string }>) => {
    try {
      const res = await fetch(`${API_BASE}/savings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        const { goal } = await res.json();
        setSavingsGoals(prev => prev.map(g => 
          g.id === id ? { ...g, ...goal, deadline: goal.deadline ? new Date(goal.deadline) : undefined } : g
        ));
      }
    } catch (error) {
      console.error('Erreur modification objectif:', error);
    }
  }, []);
  
  const deleteSavingsGoal = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/savings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavingsGoals(prev => prev.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression objectif:', error);
    }
  }, []);
  
  const addFundsToGoal = useCallback(async (id: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;
    
    const newAmount = goal.currentAmount + amount;
    await updateSavingsGoal(id, { currentAmount: newAmount });
  }, [savingsGoals, updateSavingsGoal]);
  
  // ============ AI / WASTE ============
  
  const markInsightRead = useCallback((id: string) => {
    setAiInsights(prev => prev.map(insight =>
      insight.id === id ? { ...insight, isRead: true } : insight
    ));
  }, []);
  
  const resolveWaste = useCallback((id: string) => {
    setWasteDetections(prev => prev.map(waste =>
      waste.id === id ? { ...waste, isResolved: true } : waste
    ));
  }, []);
  
  return {
    // Data
    transactions,
    recurringBills,
    shoppingLists,
    savingsGoals,
    wasteDetections,
    aiInsights,
    dashboardStats,
    
    // State
    isLoading,
    
    // Actions - Transactions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Actions - Bills
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    toggleBillPause,
    
    // Actions - Shopping
    toggleShoppingItem,
    updateShoppingItem,
    addShoppingList,
    addShoppingItem,
    
    // Actions - Savings
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToGoal,
    
    // Actions - AI
    markInsightRead,
    resolveWaste,
    
    // Reload
    loadData,
  };
}
