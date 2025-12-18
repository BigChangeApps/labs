/**
 * Mock asset list data for the asset management view
 * Uses shared mock data and re-exports for this prototype
 */

// Re-export shared types and data
export {
  sites as mockSites,
  assets as mockAssetList,
  getAssetCountBySite,
  getSiteName,
  type Site,
} from "@/lib/mock-data";

// Re-export Asset as AssetListItem for backwards compatibility
export type { Asset as AssetListItem } from "@/lib/mock-data";

// TODO-HANDOFF: AssetListItem should align with ReadAssetModel from docs/asset-api.md
// ReadAssetModel fields: id, siteId, categoryId, reference, location, barcode,
//   manufacturer, model, serialNumber, purchaseDate, lastServiceDate, warrantyExpiration,
//   status (Active/Inactive), condition (enum), customFields (dict), metadata

// TODO-HANDOFF: Sites are from external Sites API, not Asset Management API
// Would need: GET /v1/sites → Site[] (separate from Asset API)
// Asset API references siteId but doesn't manage sites

// TODO-HANDOFF: GET /v1/assets → ReadAssetModel[]
// Supports filtering: GET /v1/assets?siteId=...&categoryId=...&searchText=...
// Supports pagination: pageIndex, pageSize query params
// Response includes: items[], totalCount, pageIndex, pageSize

// TODO-HANDOFF: GET /v1/assets/countBySite → CountBySiteItem[]
// Schema: CountBySiteItem { siteId: number, count: number }

// TODO-HANDOFF: Site name resolution requires external Sites API
// Not covered by Asset Management API

// Legacy export for backwards compatibility
export const MOCK_SITE = {
  id: "site-1",
  name: "John Lewis & Partners",
  address: "Victoria Gate, Harewood Street, Leeds, LS2 7AR",
};
