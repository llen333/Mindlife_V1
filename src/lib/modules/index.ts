export { NutritionModule } from './nutrition';
export { SportModule } from './sport';
export { OrganisationModule } from './organisation';
export { RechercheModule } from './recherche';
export { DonneesModule } from './donnees';
export { bus, Orchestrator } from '@/lib/bus/orchestrator';
export { bifrost } from '@/lib/bifrost';

// Enregistre les modules legacy (pont vers ai-tools.ts historique)
import '@/lib/bifrost/legacy';
