import type { ComponentMetadata } from "../types";

// Playground demos - for exploring component combinations and interactions
// (Individual component showcases are at /components)
export const components: ComponentMetadata[] = [
  {
    id: "button-variants",
    title: "Button Variants",
    category: "data-display",
    path: "/playground/button-variants",
    description: "Explore all button variants and sizes",
  },
  {
    id: "card",
    title: "Card",
    category: "data-display",
    path: "/playground/card",
    description: "Card component examples with different layouts",
  },
  {
    id: "category-search",
    title: "Category Search",
    category: "forms",
    path: "/playground/category-search",
    description: "Search and filter categories",
  },
  {
    id: "navigation",
    title: "Navigation",
    category: "navigation",
    path: "/playground/navigation",
    description: "Demo of the navigation built with shadcn.",
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
