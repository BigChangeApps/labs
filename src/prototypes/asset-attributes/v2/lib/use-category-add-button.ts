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

/**
 * Hook to check if the "Preferred" field should be shown on attributes.
 * When true: Shows "Mark as Preferred" toggle on category attributes
 * When false: Hides preferred functionality
 */
export function usePreferredField(): boolean {
  return useFeatureFlag("showPreferredField", true);
}

/**
 * Hook to check if crowdsourced (predefined) attributes should be shown.
 * When true: Shows predefined attributes from BigChange system
 * When false: Hides predefined attributes, only shows system and custom
 */
export function useCrowdsourcedAttributes(): boolean {
  return useFeatureFlag("showCrowdsourcedAttributes", true);
}

/**
 * Hook to check if Manufacturers section should be shown in settings.
 * When true: Shows Manufacturers nav item and page
 * When false: Hides Manufacturers from settings
 */
export function useManufacturers(): boolean {
  return useFeatureFlag("showManufacturers", true);
}

/**
 * Hook to check if inline attribute forms should be used.
 * When true: Uses inline add/edit cards within the list
 * When false: Uses modal/drawer approach for add/edit
 */
export function useInlineAttributeForms(): boolean {
  return useFeatureFlag("useInlineAttributeForms", true);
}

/**
 * Hook to check if sidebar should be used for adding attributes.
 * Only applies when inline forms are disabled.
 * When true: Uses sidebar (Sheet) for add
 * When false: Uses modal (ResponsiveModal) for add
 */
export function useSidebarAttributeForms(): boolean {
  return useFeatureFlag("useSidebarAttributeForms", false);
}


