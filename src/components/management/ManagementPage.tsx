/**
 * ManagementPage - Page principale de gestion financière
 * Style glassmorphisme avec animations GSAP
 * Modales style GoalModal - transparentes, click outside pour fermer
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, ChevronRight, Plus, Receipt, ShoppingCart, 
  PiggyBank, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import MindLifeHeader from '../MindLifeHeader';
import { useManagementData } from './hooks';
import {
  BudgetOverview,
  RecurringBills,
  ShoppingTracker,
  DailyExpenses,
  WasteDetector,
  AIProjections,
  SavingsGoals,
} from './components';
import {
  AddTransactionModal,
  AddBillModal,
  AddShoppingListModal,
  AddSavingsGoalModal,
} from './modals';
import type { Transaction, RecurringBill, SavingsGoal } from './types';

// Onglets disponibles
const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
  { id: 'expenses', label: 'Dépenses', icon: '💸' },
  { id: 'bills', label: 'Factures', icon: '📄' },
  { id: 'shopping', label: 'Courses', icon: '🛒' },
  { id: 'savings', label: 'Épargne', icon: '🏦' },
  { id: 'ai', label: 'AI', icon: '🤖' },
];

// Actions rapides
const QUICK_ACTIONS = [
  { id: 'transaction', label: 'Dépense/Recette', icon: ArrowDownRight, color: 'rose' },
  { id: 'bill', label: 'Facture', icon: Receipt, color: 'amber' },
  { id: 'shopping', label: 'Courses', icon: ShoppingCart, color: 'cyan' },
  { id: 'savings', label: 'Épargne', icon: PiggyBank, color: 'emerald' },
] as const;

// Styles CSS globaux
const globalStyles = `
  .glass-panel {
    background: rgba(10, 20, 15, 0.65);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(251, 191, 36, 0.15);
    box-shadow: 0 15px 50px -15px rgba(0, 0, 0, 0.8);
  }
  .bg-gradient-mesh {
    background-image: 
      radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.08) 0, transparent 40%),
      radial-gradient(at 100% 100%, rgba(251, 191, 36, 0.05) 0, transparent 40%),
      radial-gradient(at 50% 50%, rgba(10, 15, 12, 1) 0, transparent 100%);
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(251, 191, 36, 0.3);
    border-radius: 10px;
  }
`;

export default function ManagementPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);
  
  // Modal states
  const [modalState, setModalState] = useState<{
    transaction: boolean;
    bill: boolean;
    shopping: boolean;
    savings: boolean;
  }>({
    transaction: false,
    bill: false,
    shopping: false,
    savings: false,
  });
  
  // Selected item for editing
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedBill, setSelectedBill] = useState<RecurringBill | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  
  const openModal = (id: string) => {
    setModalState(prev => ({ ...prev, [id]: true }));
    setShowActions(false);
  };
  
  const closeModal = (id: string) => {
    setModalState(prev => ({ ...prev, [id]: false }));
    // Reset selected items
    if (id === 'transaction') setSelectedTransaction(null);
    if (id === 'bill') setSelectedBill(null);
    if (id === 'savings') setSelectedGoal(null);
  };
  
  const {
    transactions,
    recurringBills,
    shoppingLists,
    savingsGoals,
    wasteDetections,
    aiInsights,
    dashboardStats,
    isLoading,
    
    // Transactions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Bills
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    toggleBillPause,
    
    // Shopping
    toggleShoppingItem,
    updateShoppingItem,
    addShoppingList,
    addShoppingItem,
    
    // Savings
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addFundsToGoal,
    
    // AI
    markInsightRead,
    resolveWaste,
  } = useManagementData();
  
  // Animation d'entrée
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);
  
  // Animation des onglets
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [activeTab]);
  
  // Badge pour l'onglet AI
  const aiBadge = aiInsights.filter(i => !i.isRead).length + wasteDetections.filter(w => !w.isResolved).length;
  
  // Handlers pour édition
  const handleEditTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setSelectedTransaction(tx);
      setModalState(prev => ({ ...prev, transaction: true }));
    }
  };
  
  const handleEditBill = (id: string) => {
    const bill = recurringBills.find(b => b.id === id);
    if (bill) {
      setSelectedBill(bill);
      setModalState(prev => ({ ...prev, bill: true }));
    }
  };
  
  const handleEditGoal = (id: string) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (goal) {
      setSelectedGoal(goal);
      setModalState(prev => ({ ...prev, savings: true }));
    }
  };
  
  // Action buttons component pour le header
  const ActionButtons = (
    <div className="relative flex items-center gap-2">
      {/* Quick Actions Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
        
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => openModal(action.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    action.color === 'rose' ? 'bg-rose-500/20 text-rose-400' :
                    action.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    action.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-white">{action.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
  
  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-slate-200 pl-[70px] pt-16">
      <style jsx global>{globalStyles}</style>
      
      {/* Background gradient mesh */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <MindLifeHeader
          title="Gestion"
          subtitle="Finances & Ressources du Foyer"
          icon={Briefcase}
          theme="amber"
          showBackButton={true}
          rightContent={ActionButtons}
        />
        
        <div className="p-4 lg:p-6 pb-32 max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/50 border border-white/5 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'ai' && aiBadge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                    {aiBadge}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div ref={contentRef}>
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <BudgetOverview stats={dashboardStats} />
                  
                  {/* Quick Access Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('bills')}
                      className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-white/5 p-4 hover:border-amber-500/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Factures à venir</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {dashboardStats.upcomingBills.length}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <span className="text-2xl">📄</span>
                        </div>
                      </div>
                      <ChevronRight className="absolute right-3 bottom-3 w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('savings')}
                      className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-white/5 p-4 hover:border-amber-500/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Objectifs d'épargne</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {savingsGoals.filter(g => g.status === 'active').length}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <span className="text-2xl">🏦</span>
                        </div>
                      </div>
                      <ChevronRight className="absolute right-3 bottom-3 w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('ai')}
                      className="group relative overflow-hidden rounded-xl bg-slate-800/30 border border-white/5 p-4 hover:border-amber-500/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Alertes AI</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {aiBadge}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                      </div>
                      <ChevronRight className="absolute right-3 bottom-3 w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </button>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-white/5 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Transactions récentes</h3>
                      <div className="space-y-3">
                        {dashboardStats.recentTransactions.slice(0, 5).map((tx) => (
                          <div 
                            key={tx.id} 
                            className="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0 cursor-pointer hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
                            onClick={() => handleEditTransaction(tx.id)}
                          >
                            <div>
                              <p className="text-sm text-white">{tx.description}</p>
                              <p className="text-xs text-slate-400">
                                {new Date(tx.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <span className={`font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)}€
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Upcoming Bills */}
                    <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-white/5 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Prochaines factures</h3>
                      <div className="space-y-3">
                        {dashboardStats.upcomingBills.slice(0, 5).map((bill) => (
                          <div 
                            key={bill.id}
                            className="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0 cursor-pointer hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
                            onClick={() => handleEditBill(bill.id)}
                          >
                            <div>
                              <p className="text-sm text-white">{bill.name}</p>
                              <p className="text-xs text-slate-400">
                                {bill.daysUntil <= 0 
                                  ? "En retard"
                                  : bill.daysUntil === 1 
                                    ? "Demain"
                                    : `Dans ${bill.daysUntil} jours`
                                }
                              </p>
                            </div>
                            <span className="font-medium text-white">{bill.amount.toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'expenses' && (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DailyExpenses 
                    transactions={transactions} 
                    onAddExpense={() => openModal('transaction')}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={deleteTransaction}
                  />
                </motion.div>
              )}
              
              {activeTab === 'bills' && (
                <motion.div
                  key="bills"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RecurringBills 
                    bills={recurringBills}
                    onAddBill={() => openModal('bill')}
                    onEditBill={handleEditBill}
                    onDeleteBill={deleteRecurringBill}
                    onTogglePause={toggleBillPause}
                  />
                </motion.div>
              )}
              
              {activeTab === 'shopping' && (
                <motion.div
                  key="shopping"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShoppingTracker 
                    lists={shoppingLists} 
                    onToggleItem={toggleShoppingItem}
                    onAddList={() => openModal('shopping')}
                    onAddItem={addShoppingItem as any}
                  />
                </motion.div>
              )}
              
              {activeTab === 'savings' && (
                <motion.div
                  key="savings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SavingsGoals 
                    goals={savingsGoals}
                    onAddGoal={() => openModal('savings')}
                    onEditGoal={handleEditGoal}
                  />
                </motion.div>
              )}
              
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <WasteDetector detections={wasteDetections} onResolve={resolveWaste} />
                  <AIProjections {...{ insights: aiInsights, onMarkRead: markInsightRead } as any} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AddTransactionModal
        isOpen={modalState.transaction}
        onClose={() => closeModal('transaction')}
        onSubmit={addTransaction}
        onUpdate={updateTransaction}
        onDelete={deleteTransaction}
        transaction={selectedTransaction}
      />
      
      <AddBillModal
        isOpen={modalState.bill}
        onClose={() => closeModal('bill')}
        onSubmit={addRecurringBill}
        onUpdate={updateRecurringBill}
        onDelete={deleteRecurringBill}
        onTogglePause={toggleBillPause}
        bill={selectedBill}
      />
      
      <AddShoppingListModal
        isOpen={modalState.shopping}
        onClose={() => closeModal('shopping')}
        onSubmit={addShoppingList}
      />
      
      <AddSavingsGoalModal
        isOpen={modalState.savings}
        onClose={() => closeModal('savings')}
        onSubmit={addSavingsGoal}
        onUpdate={updateSavingsGoal}
        onDelete={deleteSavingsGoal}
        onAddFunds={addFundsToGoal}
        goal={selectedGoal}
      />
    </div>
  );
}
