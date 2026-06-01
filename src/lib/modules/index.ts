export { NutritionModule } from './nutrition';
export { SportModule } from './sport';
export { bus, Orchestrator } from '@/lib/bus/orchestrator';
export { Bifrost, bifrost } from '@/lib/bifrost';

// Enregistre le module legacy (pont vers ai-tools.ts historique)
import '@/lib/bifrost/legacy';
