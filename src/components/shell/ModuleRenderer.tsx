'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getPanel } from '@/lib/ui-registry';

export default function ModuleRenderer({ panelId }: { panelId: string }) {
  const mod = getPanel(panelId);

  let Panel: React.ComponentType;
  if (mod) {
    Panel = mod.component;
  } else {
    Panel = () => (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p>Module &laquo;{panelId}&raquo; inconnu</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panelId}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.12 }}
      >
        <Panel />
      </motion.div>
    </AnimatePresence>
  );
}
