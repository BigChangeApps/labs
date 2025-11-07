export type ComponentCategory =
  | "forms"
  | "navigation"
  | "data-display"
  | "feedback";

export interface ComponentMetadata {
  id: string;
  title: string;
  category: ComponentCategory;
  path: string;
  description?: string;
}
