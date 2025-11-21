/**
 * Mock asset data for testing the edit asset page
 */

export interface MockAsset {
  id: string;
  categoryId: string;
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
 * Generate mock asset data based on asset ID
 * In a real app, this would fetch from an API
 */
export function getMockAsset(assetId: string): MockAsset | null {
  // Return a consistent mock asset for testing - Ubiquiti Doorbell Lite CCTV camera
  return {
    id: assetId,
    categoryId: "cctv-camera",
    createdBy: {
      name: "Adam Kendrew",
      initials: "AK",
    },
    createdAt: "2025-06-30T10:00:00Z",
    updatedAt: "2025-07-16T14:30:00Z",
    "global-asset-id": assetId,
    "global-customer-reference": "REF-001",
    "global-barcode": "BC-12345",
    "global-category": "cctv-camera",
    "global-manufacturer": "ubiquiti",
    "global-model": "doorbell-lite",
    "global-manufacturer-serial": "SN-123456789",
    "global-date-manufacture": "2023-06-15",
    "global-date-installation": "2023-07-10",
    "global-date-last-service": "2024-12-05",
    "global-end-of-life": "2030-06-15",
    "global-warranty-expiry": "2026-06-15",
    "global-status": "Active",
    "global-contact": "site-1",
    "global-location": "Front Entrance - Main Door",
    "global-condition": "Good",
    // Category-specific attributes for CCTV camera
    "resolution": "1080p",
    "night-vision-range": "10",
    "ptz-capability": false,
  };
}

