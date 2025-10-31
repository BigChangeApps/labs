export type DeviceType = "desktop" | "mobile" | "tablet";

export interface PrototypeMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  path: string;
  createdAt: string;
  deviceType?: DeviceType;
}

export const prototypes: PrototypeMetadata[] = [
  {
    id: "asset-attributes",
    title: "Asset Attributes Management",
    description:
      "Category-based attribute configuration with drag-and-drop reordering, system vs custom attributes, and manufacturer management.",
    thumbnail: "/thumbnails/asset-attributes.png",
    path: "/asset-attributes",
    createdAt: "2025-01-15",
    deviceType: "desktop",
  },
  // Add more prototypes here as they are created
];

export function searchPrototypes(
  query: string,
  allPrototypes: PrototypeMetadata[] = prototypes
): PrototypeMetadata[] {
  const lowerQuery = query.toLowerCase();
  return allPrototypes.filter(
    (prototype) =>
      prototype.title.toLowerCase().includes(lowerQuery) ||
      prototype.description.toLowerCase().includes(lowerQuery)
  );
}
