'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/stores';
import { useUsers, useUserProfile } from '@/lib/hooks';
import { getPanel } from '@/lib/ui-registry';
import '@/lib/ui-manifest';
import OsSidebar from './OsSidebar';
import OsTopBar from './OsTopBar';
import OsContent from './OsContent';
import AssistantChat from '@/components/AssistantChat';

export default function OsShell() {
  const { activePanel, users: zustandUsers, setUsers, dataLoaded, loadAllData } = useStore();
  const { data: users = [] } = useUsers();
  useUserProfile();

  useEffect(() => {
    if (!dataLoaded) loadAllData();
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

  const panel = getPanel(activePanel);
  const title = panel?.label || 'Mindlife';
  const Icon = panel?.icon;

  const noSidebarPages = ['mind', 'sport'];
  const showSidebar = !noSidebarPages.includes(activePanel);

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {showSidebar && <OsSidebar />}

      <div className={showSidebar ? 'pl-[70px]' : ''}>
        <OsTopBar title={title} icon={Icon} />
        <main className="p-6">
          <OsContent activePanel={activePanel} />
        </main>
      </div>

      <AssistantChat />
    </div>
  );
}
