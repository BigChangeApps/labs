export type DeviceType = "desktop" | "mobile" | "tablet";
export type PrototypeVisibility = "public" | "internal";

export interface PrototypeMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  path: string;
  createdAt: string;
  deviceType?: DeviceType;
  visibility: PrototypeVisibility;
}

export const prototypes: PrototypeMetadata[] = [
  {
    id: "asset-attributes-v1",
    title: "Asset Attributes Management v1",
    description:
      "Category-based attribute configuration with drag-and-drop reordering, system vs custom attributes, and manufacturer management.",
    thumbnail: "/thumbnails/asset-attributes-v1.png",
    path: "/asset-attributes/v1",
    createdAt: "2025-01-15",
    deviceType: "desktop",
    visibility: "public",
  },
  {
    id: "asset-attributes-v2",
    title: "Asset Attributes Management v2",
    description:
      "Enhanced version with global attributes, category hierarchy, attribute inheritance, and full asset creation/editing workflows.",
    thumbnail: "/thumbnails/asset-attributes-v2.png",
    path: "/asset-attributes/v2",
    createdAt: "2025-01-16",
    deviceType: "desktop",
    visibility: "public",
  },
  // Add more prototypes here as they are created
];

/**
 * Get prototypes filtered by visibility based on environment configuration.
 * By default, shows all prototypes in development.
 * Set VITE_SHOW_INTERNAL=false to hide internal prototypes (e.g., for customer-facing deployments).
 */
export function getVisiblePrototypes(): PrototypeMetadata[] {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  if (showInternal) {
    return prototypes;
  }

  return prototypes.filter((prototype) => prototype.visibility === "public");
}

/**
 * Check if a prototype with the given ID is visible based on environment configuration.
 */
export function isPrototypeVisible(prototypeId: string): boolean {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  if (showInternal) {
    return true;
  }

  const prototype = prototypes.find((p) => p.id === prototypeId);
  return prototype ? prototype.visibility === "public" : false;
}

export function searchPrototypes(
  query: string,
  allPrototypes: PrototypeMetadata[] = getVisiblePrototypes()
): PrototypeMetadata[] {
  const lowerQuery = query.toLowerCase();
  return allPrototypes.filter(
    (prototype) =>
      prototype.title.toLowerCase().includes(lowerQuery) ||
      prototype.description.toLowerCase().includes(lowerQuery)
  );
}
