// ============================================
// INDEX - Central export for all React Query hooks
// ============================================

// User management
export {
  useUsers,
  useUserById,
  useUpdateProfile,
  useCreateUser,
  useDeleteUser,
  useSwitchUser,
  userKeys,
  type UserListItem,
  type UserFullProfile,
  type UpdateProfileData,
  type CreateUserData,
} from './use-user-queries';

// React Query hook for profile (renamed to avoid conflict)
export { useUserProfile as useUserProfileQuery } from './use-user-queries';

// Profile sync hook (syncs Zustand store with API) - use this for components
export { useUserProfile } from './useUserProfile';

// Nutrition
export {
  useGenerateRecipe,
  useNutritionStats,
  useUpdateFoodBudget,
  useNutritionCalculations,
  useInvalidateNutritionCache,
  nutritionKeys,
  type GeneratedRecipe,
  type GenerateRecipeParams,
  type NutritionStats,
} from './use-nutrition-queries';

// Sport
export {
  useWeeklyProgram,
  useTodaySession,
  useSessionsHistory,
  useBiometrics,
  useAtlasRecommendation,
  useStartSession,
  useUpdateSession,
  useToggleExerciseComplete,
  useUpdateBiometrics,
  useInvalidateSportCache,
  sportKeys,
  type Exercise,
  type WorkoutSession,
  type Biometrics,
  type WeeklyProgram,
  type ProgramDay,
  type AtlasRecommendation,
} from './use-sport-queries';
