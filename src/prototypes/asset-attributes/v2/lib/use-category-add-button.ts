import { useFeatureFlag } from "@/components/FeatureFlagsPopover";

/**
 * Hook to check if the "Add Category" button should be shown.
 * Uses the centralized feature flags system.
 */
export function useCategoryAddButton(): boolean {
  return useFeatureFlag("showCategoryAddButton", true);
}

/**
 * Hook to check if parent category inheritance should be shown.
 * When true: Shows "All [Category]" rows with inherited attributes
 * When false: Shows flat category list without inheritance
 */
export function useParentInheritance(): boolean {
  return useFeatureFlag("showParentInheritance", true);
}


