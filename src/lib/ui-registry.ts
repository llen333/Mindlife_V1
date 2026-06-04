import type { ComponentType } from 'react';

export interface PanelModule {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  section: string;
  placeholder?: boolean;
}

const modules = new Map<string, PanelModule>();

export function registerPanel(mod: PanelModule) {
  modules.set(mod.id, mod);
}

export function getPanel(id: string): PanelModule | undefined {
  return modules.get(id);
}

export function listPanels(section?: string): PanelModule[] {
  const all = Array.from(modules.values());
  return section ? all.filter(m => m.section === section) : all;
}

export function listSections(): string[] {
  const sections = new Set<string>();
  for (const m of modules.values()) sections.add(m.section);
  return Array.from(sections);
}

export function getPanelsBySection(): Map<string, PanelModule[]> {
  const map = new Map<string, PanelModule[]>();
  for (const m of modules.values()) {
    const list = map.get(m.section) || [];
    list.push(m);
    map.set(m.section, list);
  }
  return map;
}
