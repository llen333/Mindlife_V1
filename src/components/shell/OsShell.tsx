'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/stores';
import { useUsers, useUserProfile } from '@/lib/hooks';
import OsSidebar from './OsSidebar';
import OsTopBar from './OsTopBar';
import OsContent from './OsContent';
import AssistantChat from '@/components/AssistantChat';

const panelTitles: Record<string, string> = {
  dashboard: 'Tableau de Bord',
  calendar: 'Calendrier',
  tasks: 'Tâches',
  goals: 'Objectifs',
  management: 'Gestion',
  'hub-alimentaire': 'Hub Alimentaire',
  nutrition: 'Alimentation',
  mind: 'Esprit',
  culture: 'Culture',
  growth: 'Croissance',
  health: 'Santé',
  sport: 'Sport',
  'ai-synthesis': 'Synthèse AI',
  kernel: 'Kernel',
  store: 'Module Store',
  sleep: 'Sommeil',
  settings: 'Paramètres',
};

export default function OsShell() {
  const { activePanel, users: zustandUsers, setUsers, dataLoaded, loadAllData } = useStore();
  const { data: users = [] } = useUsers();
  useUserProfile();
  const lastLoadedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!dataLoaded) {
      loadAllData();
    }
  }, [dataLoaded, loadAllData]);

  useEffect(() => {
    if (users.length > 0) {
      const zustandIds = zustandUsers.map(u => u.id).sort().join(',');
      const queryIds = users.map(u => u.id).sort().join(',');
      if (zustandIds !== queryIds) {
        setUsers(users.map(u => ({ id: u.id, name: u.name, avatar: u.avatar })));
      }
    }
  }, [users, zustandUsers, setUsers]);

  const noSidebarPages = ['mind', 'sport'];
  const showSidebar = !noSidebarPages.includes(activePanel);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {showSidebar && <OsSidebar />}

      <div className={showSidebar ? 'pl-[70px]' : ''}>
        <OsTopBar title={panelTitles[activePanel] || 'Mindlife'} />
        <main className="p-6">
          <OsContent activePanel={activePanel} />
        </main>
      </div>

      <AssistantChat />
    </div>
  );
}
