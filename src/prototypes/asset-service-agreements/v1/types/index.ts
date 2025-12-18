// Re-export shared types
export type { Site } from "@/lib/mock-data";

// Local Asset type simplified for service agreements view
export interface Asset {
  id: string;
  name: string;
  category: string;
  siteId: string;
  siteName: string;
}

export type AgreementStatus = "draft" | "active" | "ended";

// Service plan within a category
export interface ServicePlan {
  id: string;
  name: string;
  frequency: string; // e.g., "Annual", "Quarterly", "Monthly"
  coverage: "all" | "selected"; // All items in category or selected items
  selectedAssetIds?: string[]; // Only if coverage is "selected"
}

// Category group within an agreement
export interface AgreementCategory {
  id: string;
  categoryId: string; // Reference to asset category
  categoryName: string;
  servicePlans: ServicePlan[];
}

export interface ServiceAgreement {
  id: string;
  name: string;
  reference?: string; // Customer-defined reference
  status: AgreementStatus;
  billingContact: string; // Who the agreement is applicable to
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  siteIds: string[];
  categories: AgreementCategory[]; // Categories with their service plans
  assetIds: string[]; // Legacy - all assets covered (derived from categories)
}
