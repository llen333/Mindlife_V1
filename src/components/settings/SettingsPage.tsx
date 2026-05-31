'use client';

import { useState } from 'react';
import {
  LayoutDashboard, User, Bot, Zap,
  Settings, Link2, FileText, Logs,
  Globe, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AgentsDashboard from '../agents/AgentsDashboard';
import AIConfigPanel from '../AIConfigPanel';
import { useSettingsData } from './hooks';
import {
  IdentiteSection, CorpusSection,
  NutritionSection, ApplicationSection, UsersSection,
} from './components';
import { NewUserModal } from './modals';
import DashboardPanel from './panels/DashboardPanel';
import IntegrationsPanel from './panels/IntegrationsPanel';
import LogsPanel from './panels/LogsPanel';
import ProvidersPanel from './panels/ProvidersPanel';

const BLUE = '#3b82f6';
const CYAN = '#06b6d4';

interface TabItem {
  id: string;
  label: string;
  icon: any;
  accent: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: '#3b82f6' },
  { id: 'profil', label: 'Profil', icon: User, accent: '#f97316' },
  { id: 'agents', label: 'Agents', icon: Bot, accent: '#3b82f6' },
  { id: 'providers', label: 'Providers', icon: Zap, accent: '#8b5cf6' },
  { id: 'integrations', label: 'Intégrations', icon: Link2, accent: '#06b6d4' },
  { id: 'application', label: 'App', icon: Settings, accent: '#8b5cf6' },
  { id: 'users', label: 'Users', icon: Users, accent: '#22c55e' },
  { id: 'logs', label: 'Journaux', icon: Logs, accent: '#94a3b8' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const {
    formData, setFormData, calculatedMetrics,
    users, isAdmin,
    currentUserId, setCurrentUserId,
    createUserMutation, toggleArrayItem, refetchUsers,
  } = useSettingsData();

  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const handleCreateUser = async () => {
    if (newUserName.trim()) {
      createUserMutation.mutate(
        { name: newUserName.trim() },
        { onSuccess: () => { setShowNewUserModal(false); setNewUserName(''); refetchUsers(); } }
      );
    }
  };

  const renderPanel = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardPanel />;
      case 'profil':
        return (
          <GlassSection accent={BLUE}>
            <ProfilePanel formData={formData} setFormData={setFormData} calculatedMetrics={calculatedMetrics} toggleArrayItem={toggleArrayItem} />
          </GlassSection>
        );
      case 'agents':
        return (
          <GlassSection accent={BLUE}>
            <AgentsDashboard />
          </GlassSection>
        );
      case 'providers':
        return (
          <GlassSection accent="#8b5cf6">
            <ProvidersPanel />
          </GlassSection>
        );
      case 'integrations': return <IntegrationsPanel />;
      case 'application':
        return (
          <GlassSection accent="#8b5cf6">
            <ApplicationSection formData={formData} setFormData={setFormData} expanded={true} />
          </GlassSection>
        );
      case 'users':
        return (
          <GlassSection accent="#22c55e">
            <UsersSection
              isAdmin={isAdmin} users={users} currentUserId={currentUserId}
              setCurrentUserId={setCurrentUserId} currentUserProfile={null}
              expanded={true} onShowNewUserModal={() => setShowNewUserModal(true)} refetchUsers={refetchUsers}
            />
          </GlassSection>
        );
      case 'logs': return <LogsPanel />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative bg-[#0B0D14]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30"
          style={{ background: `radial-gradient(circle, ${BLUE}22, transparent 70%)` }}
        />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20"
          style={{ background: `radial-gradient(circle, ${CYAN}1A, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 pl-[70px]">
        <div className="border-b border-white/[0.04] backdrop-blur-xl sticky top-0 z-20"
          style={{ background: 'rgba(11, 13, 20, 0.8)' }}
        >
          <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
              {TABS.map(tab => {
                const active = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-medium transition-all duration-300 whitespace-nowrap"
                    style={{
                      color: active ? tab.accent : 'rgba(148, 163, 184, 0.7)',
                      background: active ? `${tab.accent}0D` : 'transparent',
                      boxShadow: active ? `inset 0 0 0 1px ${tab.accent}22` : 'none',
                    }}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-[0.06em] font-mono">{tab.label}</span>
                    {active && (
                      <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{
                          background: tab.accent,
                          boxShadow: `0 0 8px ${tab.accent}88`,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
              <Globe className="w-3 h-3 text-slate-500" />
              <span className="text-[9px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-7xl mx-auto">
          <div className="animate-fade-in">
            {renderPanel()}
          </div>
        </div>
      </div>

      <NewUserModal
        show={showNewUserModal} onClose={() => setShowNewUserModal(false)}
        userName={newUserName} setUserName={setNewUserName}
        onCreate={handleCreateUser} isLoading={createUserMutation.isPending}
      />
    </div>
  );
}

function GlassSection({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[24px] border border-white/[0.06] p-8 transition-all duration-500 hover:border-blue-500/20"
      style={{
        background: 'rgba(18, 18, 23, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), 0 0 40px ${BLUE}11`,
      }}
    >
      {children}
    </div>
  );
}

function ProfilePanel({ formData, setFormData, calculatedMetrics, toggleArrayItem }: {
  formData: any; setFormData: any; calculatedMetrics: any; toggleArrayItem: any;
}) {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 tracking-tight"
            style={{ textShadow: `0 0 40px ${BLUE}44` }}>Profil</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">Identité, corps, nutrition et objectifs</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <User className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{formData.name || 'Utilisateur'}</span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'IMC', value: calculatedMetrics.imc ?? '—' },
          { label: 'BMR', value: calculatedMetrics.bmr ? `${calculatedMetrics.bmr} kcal` : '—' },
          { label: 'TDEE', value: calculatedMetrics.tdee ? `${calculatedMetrics.tdee} kcal` : '—' },
        ].map(m => (
          <div key={m.label}
            className="p-5 rounded-[20px] border border-white/[0.06]"
            style={{ background: 'rgba(18, 18, 23, 0.4)', backdropFilter: 'blur(20px)' }}
          >
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono mb-1">{m.label}</div>
            <div className="text-xl font-mono text-white font-medium">{m.value}</div>
          </div>
        ))}
      </div>

      <IdentiteSection formData={formData} setFormData={setFormData} expanded={true} />
      <CorpusSection formData={formData} setFormData={setFormData} calculatedMetrics={calculatedMetrics} expanded={true} />
      <NutritionSection formData={formData} setFormData={setFormData} calculatedMetrics={calculatedMetrics} toggleArrayItem={toggleArrayItem} expanded={true} />
    </div>
  );
}
