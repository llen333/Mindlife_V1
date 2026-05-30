/**
 * NutritionPage - Wrapper
 * Ce fichier redirige vers le nouveau module nutrition découpé
 * 
 * Anciennement: 2,548 lignes
 * Nouveau: 14 fichiers modulaires (~2,300 lignes total)
 * 
 * Structure:
 * - nutrition/types.ts (types TypeScript)
 * - nutrition/constants.ts (données statiques)
 * - nutrition/hooks/ (useNutritionData, useNutritionModals, useTTS)
 * - nutrition/components/ (MealCard, MealGrid, NutritionStats, etc.)
 * - nutrition/modals/ (RecipeModal, AudioDrawer)
 * - nutrition/NutritionPage.tsx (page principale ~280 lignes)
 */

export { NutritionPage as default } from './nutrition';
