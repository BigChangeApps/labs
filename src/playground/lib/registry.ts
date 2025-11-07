import type { ComponentMetadata } from "../types";

export const components: ComponentMetadata[] = [
  {
    id: "category-search",
    title: "Category Search",
    category: "forms",
    path: "/playground/category-search",
    description: "Search and filter categories",
  },
];

export function getAllComponents(): ComponentMetadata[] {
  return components;
}

export function getFirstComponent(): ComponentMetadata | undefined {
  return components[0];
}

export function getComponentById(id: string): ComponentMetadata | undefined {
  return components.find((c) => c.id === id);
}
