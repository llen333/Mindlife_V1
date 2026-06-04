'use client';

import ModuleRenderer from './ModuleRenderer';

export default function OsContent({ activePanel }: { activePanel: string }) {
  return <ModuleRenderer panelId={activePanel} />;
}
