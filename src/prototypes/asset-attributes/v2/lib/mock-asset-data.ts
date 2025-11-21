/**
 * Mock asset data for testing the edit asset page
 */

import { mockAssetList, type AssetListItem } from "./mock-asset-list-data";

export interface MockAsset {
  id: string;
  categoryId: string;
  photos?: string[]; // Array of image URLs (main + thumbnails)
  createdBy?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  [key: string]: unknown; // Dynamic form fields
}

/**
 * Normalize a string to a lowercase slug format (e.g., "Ubiquiti" → "ubiquiti", "ecoTEC Plus" → "ecotec-plus")
 */
function normalizeToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get category-specific attributes based on category ID
 */
function getCategorySpecificAttributes(categoryId: string): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};

  switch (categoryId) {
    case "cctv-camera":
      attributes["resolution"] = "1080p";
      attributes["night-vision-range"] = "10";
      attributes["ptz-capability"] = false;
      break;
    case "boiler":
      attributes["flue-type"] = "Balanced Flue";
      attributes["gas-pressure"] = 20;
      attributes["capacity"] = 30;
      break;
    case "generator":
      attributes["rated-power"] = 50;
      attributes["fuel-type"] = "Diesel";
      attributes["phase"] = "Three Phase";
      break;
    case "ev-charger":
      attributes["charging-power"] = 7.4;
      attributes["connector-type"] = "Type 2";
      attributes["phase"] = "Single Phase";
      break;
    // fire-alarm-panel has no predefined attributes, so no category-specific attributes
    default:
      break;
  }

  return attributes;
}

/**
 * Simple deterministic random number generator using seed
 * Returns a value between 0 and 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Get product images based on manufacturer and model
 * Returns an array of image URLs (main image + thumbnails)
 * Randomly determines if images exist and how many (0-5 images)
 * Uses Picsum Photos with specific seeds for consistent, realistic product images
 */
function getProductImages(
  manufacturer: string,
  model: string,
  categoryId: string,
  assetId: string
): string[] {
  const normalizedManufacturer = normalizeToSlug(manufacturer);
  const normalizedModel = normalizeToSlug(model);

  // Create a deterministic seed from assetId for consistent randomness
  const assetSeed = parseInt(assetId.replace(/\D/g, "")) || 0;
  
  // 75% chance of having images (deterministic based on assetId)
  const hasImages = seededRandom(assetSeed * 7) < 0.75;
  
  if (!hasImages) {
    return [];
  }

  // Determine base image seed based on manufacturer/model
  let baseImageSeed: number;

  if (normalizedManufacturer === "ubiquiti" && normalizedModel === "doorbell-lite") {
    // Ubiquiti Doorbell Lite - CCTV Camera (use existing image service for main image)
    const productId = "cc3293dc-3fe5-48a6-87c1-ea1ea940f33c";
    const baseImageUrl = (width: number) =>
      `https://images.svc.ui.com/?u=https%3A%2F%2Fcdn.ecomm.ui.com%2Fproducts%2F${productId}%2Fd0ccc0e4-64a3-4d4a-85f6-341cd76310ea.png&q=75&w=${width}`;
    
    // Randomly determine number of images (1-5) for this asset
    const numImages = Math.floor(seededRandom(assetSeed * 11) * 5) + 1;
    const images = [baseImageUrl(800)]; // Always have main image from existing service
    
    // Add thumbnails using Picsum Photos with different seeds to ensure they're different
    const thumbnailBaseSeed = 1000; // Base seed for thumbnails
    for (let i = 1; i < numImages; i++) {
      // Use different seeds for each thumbnail to ensure they're different
      const thumbnailSeed = thumbnailBaseSeed + (i * 100) + assetSeed;
      const thumbnailUrl = `https://picsum.photos/seed/${thumbnailSeed}/400/300`;
      images.push(thumbnailUrl);
    }
    
    return images;
  } else if (normalizedManufacturer === "vaillant" && normalizedModel === "ecotec-plus") {
    // Vaillant ecoTEC Plus - Boiler
    // TODO: Replace with actual product image URLs when available
    // Example structure (uncomment and update with real URLs):
    // const productId = "vaillant-ecotec-plus-001";
    // const baseImageUrl = (width: number) =>
    //   `https://images.svc.ui.com/?u=https%3A%2F%2Fcdn.ecomm.ui.com%2Fproducts%2F${productId}%2Fmain.png&q=75&w=${width}`;
    // const numImages = Math.floor(seededRandom(assetSeed * 11) * 5) + 1;
    // const images = [baseImageUrl(800)];
    // for (let i = 1; i < numImages; i++) {
    //   images.push(baseImageUrl(400)); // or use different image URLs for thumbnails
    // }
    // return images;
    baseImageSeed = 101;
  } else if (normalizedManufacturer === "honeywell" && normalizedModel === "galaxy") {
    // Honeywell Galaxy - Fire Alarm Panel
    baseImageSeed = 102;
  } else if (normalizedManufacturer === "grundfos" && normalizedModel === "ups-series") {
    // Grundfos UPS Series - Generator
    baseImageSeed = 103;
  } else if (normalizedManufacturer === "ubiquiti" && normalizedModel === "g4-doorbell") {
    // Ubiquiti G4 Doorbell - EV Charger
    baseImageSeed = 104;
  } else {
    // Fallback based on category
    const categorySeeds: Record<string, number> = {
      boiler: 201,
      "fire-alarm-panel": 202,
      generator: 203,
      "ev-charger": 204,
      "cctv-camera": 205,
    };
    baseImageSeed = categorySeeds[categoryId] || 300;
  }

  // Randomly determine number of images (1-5) for this asset
  const numImages = Math.floor(seededRandom(assetSeed * 13) * 5) + 1;

  // Use Picsum Photos with seed for consistent images
  // Format: https://picsum.photos/seed/{seed}/{width}/{height}
  // Note: In production, replace these with actual product image URLs from your CDN
  const getImage = (seed: number, width: number, height: number) =>
    `https://picsum.photos/seed/${seed}/${width}/${height}`;

  const images: string[] = [];
  
  // Always add main image
  images.push(getImage(baseImageSeed, 800, 600));
  
  // Add thumbnails (each with a different seed to make them different)
  // Each thumbnail uses a significantly different seed to ensure visual variety
  for (let i = 1; i < numImages; i++) {
    // Use different seeds for each thumbnail to ensure they're different
    // Multiply by large number to ensure seeds are far apart for visual variety
    const thumbnailSeed = baseImageSeed + (i * 1000) + assetSeed;
    images.push(getImage(thumbnailSeed, 400, 300));
  }

  return images;
}

/**
 * Generate mock asset data based on asset ID
 * In a real app, this would fetch from an API
 */
export function getMockAsset(
  assetId: string,
  assetListItem?: AssetListItem,
  manufacturers?: Array<{ id: string; name: string; models: Array<{ id: string; name: string }> }>
): MockAsset | null {
  // Use provided assetListItem or find the asset in the mock asset list
  const item = assetListItem || mockAssetList.find((asset) => asset.id === assetId);

  if (!item) {
    return null;
  }

  // Try to find manufacturer and model IDs from names if manufacturers are provided
  let manufacturerId: string | undefined;
  let modelId: string | undefined;
  
  if (manufacturers) {
    const manufacturer = manufacturers.find((m) => m.name === item.manufacturer);
    if (manufacturer) {
      manufacturerId = manufacturer.id;
      const model = manufacturer.models.find((m) => m.name === item.model);
      if (model) {
        modelId = model.id;
      }
    }
  }
  
  // Fall back to normalized slugs if IDs not found
  const normalizedManufacturer = manufacturerId || normalizeToSlug(item.manufacturer);
  const normalizedModel = modelId || normalizeToSlug(item.model);

  // Calculate dates (use lastService for installation date, warrantyExpiry for end of life)
  const installationDate = item.lastService
    ? new Date(item.lastService)
    : null;
  const manufactureDate = installationDate
    ? new Date(installationDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days before installation
    : null;
  const endOfLifeDate = item.warrantyExpiry
    ? new Date(
        new Date(item.warrantyExpiry).getTime() +
          4 * 365 * 24 * 60 * 60 * 1000
      ) // 4 years after warranty expiry
    : null;

  // Get product images based on manufacturer and model
  const photos = getProductImages(
    item.manufacturer,
    item.model,
    item.categoryId,
    item.id
  );

  // Build the base mock asset
  const mockAsset: MockAsset = {
    id: item.id,
    categoryId: item.categoryId,
    photos,
    createdBy: {
      name: "Adam Kendrew",
      initials: "AK",
    },
    createdAt: "2025-06-30T10:00:00Z",
    updatedAt: "2025-07-16T14:30:00Z",
    "global-asset-id": item.id,
    "global-customer-reference": item.reference,
    "global-barcode": `BC-${item.id.padStart(5, "0")}`,
    "global-category": item.categoryId,
    "global-manufacturer": normalizedManufacturer,
    "global-model": normalizedModel,
    "global-manufacturer-serial": `SN-${item.id.padStart(9, "0")}`,
    "global-date-manufacture": manufactureDate
      ? manufactureDate.toISOString().split("T")[0]
      : "2023-06-15",
    "global-date-installation": installationDate
      ? installationDate.toISOString().split("T")[0]
      : "2023-07-10",
    "global-date-last-service": item.lastService || "2024-12-05",
    "global-end-of-life": endOfLifeDate
      ? endOfLifeDate.toISOString().split("T")[0]
      : "2030-06-15",
    "global-warranty-expiry": item.warrantyExpiry || "2026-06-15",
    "global-status": item.status,
    "global-contact": item.siteId || "site-1", // Use the asset's siteId, fallback to site-1
    "global-location": item.location,
    "global-condition": item.condition,
  };

  // Add category-specific attributes
  const categoryAttributes = getCategorySpecificAttributes(item.categoryId);
  Object.assign(mockAsset, categoryAttributes);

  return mockAsset;
}

