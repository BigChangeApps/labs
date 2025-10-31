export type DeviceType = "desktop" | "mobile" | "tablet";

export interface PrototypeMetadata {
  id: string;
  title: string;
  description: string;
  author: string;
  authorInitials: string;
  tags: string[];
  thumbnail: string;
  path: string;
  createdAt: string;
  status?: "active" | "archived" | "draft";
  deviceType?: DeviceType; // Defaults to "desktop" if not specified
}

export const prototypes: PrototypeMetadata[] = [
  {
    id: "asset-attributes",
    title: "Asset Attributes Management",
    description:
      "Category-based attribute configuration with drag-and-drop reordering, system vs custom attributes, and manufacturer management.",
    author: "Design Team",
    authorInitials: "DT",
    tags: ["admin", "configuration", "attributes", "categories"],
    thumbnail: "/thumbnails/asset-attributes.png",
    path: "/asset-attributes",
    createdAt: "2025-01-15",
    status: "active",
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
      prototype.description.toLowerCase().includes(lowerQuery) ||
      prototype.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      prototype.author.toLowerCase().includes(lowerQuery)
  );
}

export function filterByTag(
  tag: string,
  allPrototypes: PrototypeMetadata[] = prototypes
): PrototypeMetadata[] {
  return allPrototypes.filter((prototype) =>
    prototype.tags.includes(tag.toLowerCase())
  );
}

export function getAllTags(
  allPrototypes: PrototypeMetadata[] = prototypes
): string[] {
  const tagSet = new Set<string>();
  allPrototypes.forEach((prototype) => {
    prototype.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
