/**
 * Mock asset list data for the asset management view
 * Represents a collection of assets at a fixed site
 */

export interface AssetListItem {
  id: string;
  name: string;
  reference: string;
  categoryId: string;
  categoryName: string;
  status: string;
  condition: string;
  location: string;
  manufacturer: string;
  model: string;
  lastService?: string;
  warrantyExpiry?: string;
  siteId?: string; // Optional site ID for grouping
}

export interface Site {
  id: string;
  name: string;
  address: string;
}

export const MOCK_SITE = {
  id: "site-1",
  name: "John Lewis, Manchester",
  address: "1 St Mary's Gate, Manchester M1 1PX",
};

export const mockSites: Site[] = [
  {
    id: "site-1",
    name: "John Lewis & Partners",
    address: "Victoria Gate, Harewood Street, Leeds, LS2 7AR",
  },
  {
    id: "site-2",
    name: "Manchester Store",
    address: "123 High Street, Manchester, M1 1AA",
  },
  {
    id: "site-3",
    name: "Birmingham Bullring",
    address: "Bullring Shopping Centre, Birmingham, B5 4BU",
  },
  {
    id: "site-4",
    name: "London Oxford Street",
    address: "300 Oxford Street, London, W1C 1DX",
  },
  {
    id: "site-5",
    name: "Edinburgh Princes Street",
    address: "48 Princes Street, Edinburgh, EH2 2YJ",
  },
  {
    id: "site-6",
    name: "Bristol Cribbs Causeway",
    address: "Cribbs Causeway, Bristol, BS34 5DG",
  },
  {
    id: "site-7",
    name: "Liverpool One",
    address: "Liverpool One Shopping Centre, Liverpool, L1 8JQ",
  },
];

export const mockAssetList: AssetListItem[] = [
  {
    id: "0001",
    name: "Front Entrance Doorbell",
    reference: "REF-001",
    categoryId: "cctv-camera",
    categoryName: "CCTV Camera",
    status: "Active",
    condition: "Good",
    location: "Front Entrance - Main Door",
    manufacturer: "Ubiquiti",
    model: "Doorbell Lite",
    lastService: "2024-12-05",
    warrantyExpiry: "2026-06-15",
    siteId: "site-1",
  },
  {
    id: "0002",
    name: "Main Boiler Unit",
    reference: "REF-002",
    categoryId: "boiler",
    categoryName: "Boiler",
    status: "Active",
    condition: "Excellent",
    location: "Basement - Plant Room A",
    manufacturer: "Vaillant",
    model: "ecoTEC Plus",
    lastService: "2024-10-15",
    warrantyExpiry: "2027-03-20",
    siteId: "site-1",
  },
  {
    id: "0003",
    name: "Fire Alarm Panel",
    reference: "REF-003",
    categoryId: "fire-alarm-panel",
    categoryName: "Fire Alarm Control Panel",
    status: "Active",
    condition: "Good",
    location: "Ground Floor - Reception",
    manufacturer: "Honeywell",
    model: "Galaxy",
    lastService: "2024-11-20",
    warrantyExpiry: "2026-08-10",
    siteId: "site-1",
  },
  {
    id: "0004",
    name: "Backup Generator",
    reference: "REF-004",
    categoryId: "generator",
    categoryName: "Generator (Diesel / Gas)",
    status: "Active",
    condition: "Fair",
    location: "Exterior - North Side",
    manufacturer: "Grundfos",
    model: "UPS Series",
    lastService: "2024-09-12",
    warrantyExpiry: "2025-12-01",
    siteId: "site-1",
  },
  {
    id: "0005",
    name: "EV Charging Station 1",
    reference: "REF-005",
    categoryId: "ev-charger",
    categoryName: "EV Charger",
    status: "Active",
    condition: "Excellent",
    location: "Car Park - Bay 12",
    manufacturer: "Ubiquiti",
    model: "G4 Doorbell",
    lastService: "2024-11-08",
    warrantyExpiry: "2028-01-15",
    siteId: "site-1",
  },
  {
    id: "0006",
    name: "HVAC System",
    reference: "REF-006",
    categoryId: "boiler",
    categoryName: "Boiler",
    status: "Active",
    condition: "Good",
    location: "Ground Floor - HVAC Room",
    manufacturer: "Vaillant",
    model: "ecoTEC Pro",
    lastService: "2024-11-10",
    warrantyExpiry: "2027-05-15",
    siteId: "site-2",
  },
  {
    id: "0007",
    name: "Security Camera System",
    reference: "REF-007",
    categoryId: "cctv-camera",
    categoryName: "CCTV Camera",
    status: "Active",
    condition: "Excellent",
    location: "Main Entrance",
    manufacturer: "Hikvision",
    model: "DS-2CD",
    lastService: "2024-12-01",
    warrantyExpiry: "2026-12-01",
    siteId: "site-3",
  },
  {
    id: "0008",
    name: "Emergency Lighting",
    reference: "REF-008",
    categoryId: "fire-alarm-panel",
    categoryName: "Fire Alarm Control Panel",
    status: "Active",
    condition: "Good",
    location: "All Floors",
    manufacturer: "Honeywell",
    model: "Notifier",
    lastService: "2024-10-20",
    warrantyExpiry: "2026-10-20",
    siteId: "site-4",
  },
];

// Helper function to get asset count per site
export function getAssetCountBySite(siteId: string): number {
  return mockAssetList.filter((asset) => asset.siteId === siteId).length;
}

// Helper function to get site name from siteId
export function getSiteName(siteId: string): string {
  const site = mockSites.find((s) => s.id === siteId);
  return site?.name || "Unknown Site";
}
