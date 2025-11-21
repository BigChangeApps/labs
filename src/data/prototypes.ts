export type DeviceType = "desktop" | "mobile" | "tablet";
export type PrototypeVisibility = "public" | "internal";

export interface PrototypeVersion {
  id: string; // "v1", "v2"
  title: string; // "Version 1", "Version 2"
  description: string;
  path: string; // "/asset-attributes/v1"
  createdAt: string;
}

export interface PrototypeMetadata {
  id: string; // "asset-attributes"
  title: string; // "Asset Attributes Management"
  description: string; // General description
  thumbnail: string;
  deviceType?: DeviceType;
  visibility: PrototypeVisibility;
  versions: PrototypeVersion[];
}

export const prototypes: PrototypeMetadata[] = [
  {
    id: "asset-attributes",
    title: "Asset Attributes Management",
    description:
      "Comprehensive asset attribute configuration system with category management, drag-and-drop reordering, and manufacturer management.",
    thumbnail: "/thumbnails/asset-attributes-v2.png", // Use latest version thumbnail
    deviceType: "desktop",
    visibility: "public",
    versions: [
      {
        id: "v1",
        title: "Version 1",
        description:
          "Category-based attribute configuration with drag-and-drop reordering, system vs custom attributes, and manufacturer management.",
        path: "/asset-attributes/v1",
        createdAt: "2025-01-15",
      },
      {
        id: "v2",
        title: "Version 2",
        description:
          "Enhanced version with global attributes, category hierarchy, attribute inheritance, and full asset creation/editing workflows.",
        path: "/asset-attributes/v2",
        createdAt: "2025-01-16",
      },
    ],
  },
  // Add more prototypes here as they are created
];

/**
 * Get the latest version of a prototype based on createdAt date
 */
export function getLatestVersion(prototype: PrototypeMetadata): PrototypeVersion {
  return prototype.versions.reduce((latest, current) => {
    return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
  });
}

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
 * Accepts both base prototype IDs (e.g., "asset-attributes") and version IDs (e.g., "asset-attributes-v1")
 */
export function isPrototypeVisible(prototypeId: string): boolean {
  const showInternal = import.meta.env.VITE_SHOW_INTERNAL !== "false";

  if (showInternal) {
    return true;
  }

  // Check if it's a version ID (e.g., "asset-attributes-v1")
  const versionMatch = prototypeId.match(/^(.+?)-v\d+$/);
  const baseId = versionMatch ? versionMatch[1] : prototypeId;

  const prototype = prototypes.find((p) => p.id === baseId);
  return prototype ? prototype.visibility === "public" : false;
}

/**
 * Get all version paths for DevBar to recognize versioned prototypes
 */
export function getAllVersionPaths(): { path: string; baseId: string; versionId: string }[] {
  return prototypes.flatMap((prototype) =>
    prototype.versions.map((version) => ({
      path: version.path,
      baseId: prototype.id,
      versionId: version.id,
    }))
  );
}

/**
 * Get all versions for a given base prototype ID
 */
export function getPrototypeVersions(baseId: string): PrototypeVersion[] {
  const prototype = prototypes.find((p) => p.id === baseId);
  return prototype ? prototype.versions : [];
}

export function searchPrototypes(
  query: string,
  allPrototypes: PrototypeMetadata[] = getVisiblePrototypes()
): PrototypeMetadata[] {
  const lowerQuery = query.toLowerCase();
  return allPrototypes.filter(
    (prototype) =>
      prototype.title.toLowerCase().includes(lowerQuery) ||
      prototype.description.toLowerCase().includes(lowerQuery) ||
      // Also search in version descriptions
      prototype.versions.some(
        (version) =>
          version.title.toLowerCase().includes(lowerQuery) ||
          version.description.toLowerCase().includes(lowerQuery)
      )
  );
}
