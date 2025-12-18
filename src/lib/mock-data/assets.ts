/**
 * Shared mock assets data used across all prototypes
 * Represents various equipment types across retail sites
 */

export interface Asset {
  id: string;
  name: string;
  reference: string;
  categoryId: string;
  categoryName: string;
  status: "Active" | "Inactive";
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  location: string;
  manufacturer: string;
  model: string;
  lastService?: string;
  warrantyExpiry?: string;
  siteId: string;
}

export const assets: Asset[] = [
  // Site 1 - John Lewis & Partners (Leeds)
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
    manufacturer: "Pod Point",
    model: "Solo 3",
    lastService: "2024-11-08",
    warrantyExpiry: "2028-01-15",
    siteId: "site-1",
  },
  // Site 2 - Manchester Store
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
    name: "Fire Extinguisher Bank A",
    reference: "REF-007",
    categoryId: "fire-extinguisher",
    categoryName: "Fire Extinguisher",
    status: "Active",
    condition: "Good",
    location: "Ground Floor - Main Entrance",
    manufacturer: "Chubb",
    model: "CO2 5kg",
    lastService: "2024-10-01",
    warrantyExpiry: "2025-10-01",
    siteId: "site-2",
  },
  {
    id: "0008",
    name: "Emergency Lighting System",
    reference: "REF-008",
    categoryId: "emergency-light",
    categoryName: "Emergency Light",
    status: "Active",
    condition: "Good",
    location: "All Floors",
    manufacturer: "Eaton",
    model: "STAR LED",
    lastService: "2024-10-20",
    warrantyExpiry: "2026-10-20",
    siteId: "site-2",
  },
  // Site 3 - Birmingham Bullring
  {
    id: "0009",
    name: "Security Camera System",
    reference: "REF-009",
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
    id: "0010",
    name: "Escalator System 1",
    reference: "REF-010",
    categoryId: "escalator",
    categoryName: "Escalator",
    status: "Active",
    condition: "Good",
    location: "Ground to First Floor",
    manufacturer: "Otis",
    model: "Gen2",
    lastService: "2024-11-15",
    warrantyExpiry: "2027-11-15",
    siteId: "site-3",
  },
  // Site 4 - London Oxford Street
  {
    id: "0011",
    name: "Main Fire Alarm Panel",
    reference: "REF-011",
    categoryId: "fire-alarm-panel",
    categoryName: "Fire Alarm Control Panel",
    status: "Active",
    condition: "Excellent",
    location: "Ground Floor - Security Office",
    manufacturer: "Honeywell",
    model: "Notifier NFS2-3030",
    lastService: "2024-11-20",
    warrantyExpiry: "2027-06-10",
    siteId: "site-4",
  },
  {
    id: "0012",
    name: "Lift System A",
    reference: "REF-012",
    categoryId: "lift",
    categoryName: "Lift",
    status: "Active",
    condition: "Good",
    location: "Central Atrium",
    manufacturer: "Schindler",
    model: "5500",
    lastService: "2024-12-01",
    warrantyExpiry: "2028-01-01",
    siteId: "site-4",
  },
  // Site 5 - Edinburgh Princes Street
  {
    id: "0013",
    name: "Heating Boiler",
    reference: "REF-013",
    categoryId: "boiler",
    categoryName: "Boiler",
    status: "Active",
    condition: "Good",
    location: "Basement - Plant Room",
    manufacturer: "Worcester Bosch",
    model: "GB162",
    lastService: "2024-09-20",
    warrantyExpiry: "2026-09-20",
    siteId: "site-5",
  },
  {
    id: "0014",
    name: "Fire Extinguisher Set",
    reference: "REF-014",
    categoryId: "fire-extinguisher",
    categoryName: "Fire Extinguisher",
    status: "Active",
    condition: "Good",
    location: "All Floors - Stairwells",
    manufacturer: "Chubb",
    model: "Powder 6kg",
    lastService: "2024-10-15",
    warrantyExpiry: "2025-10-15",
    siteId: "site-5",
  },
  // Site 6 - Bristol Cribbs Causeway
  {
    id: "0015",
    name: "Air Conditioning Unit",
    reference: "REF-015",
    categoryId: "hvac",
    categoryName: "HVAC",
    status: "Active",
    condition: "Fair",
    location: "Roof - AC Plant",
    manufacturer: "Daikin",
    model: "VRV IV",
    lastService: "2024-08-10",
    warrantyExpiry: "2025-08-10",
    siteId: "site-6",
  },
  // Site 7 - Liverpool One
  {
    id: "0016",
    name: "Security CCTV Array",
    reference: "REF-016",
    categoryId: "cctv-camera",
    categoryName: "CCTV Camera",
    status: "Active",
    condition: "Excellent",
    location: "All Entry Points",
    manufacturer: "Axis",
    model: "P3245-V",
    lastService: "2024-11-25",
    warrantyExpiry: "2027-05-25",
    siteId: "site-7",
  },
  {
    id: "0017",
    name: "Emergency Generator",
    reference: "REF-017",
    categoryId: "generator",
    categoryName: "Generator (Diesel / Gas)",
    status: "Active",
    condition: "Good",
    location: "Basement - Generator Room",
    manufacturer: "Caterpillar",
    model: "DE220",
    lastService: "2024-10-30",
    warrantyExpiry: "2026-10-30",
    siteId: "site-7",
  },
];

// Helper function to get asset count per site
export function getAssetCountBySite(siteId: string): number {
  return assets.filter((asset) => asset.siteId === siteId).length;
}

// Helper function to get assets by site
export function getAssetsBySite(siteId: string): Asset[] {
  return assets.filter((asset) => asset.siteId === siteId);
}

// Helper function to get asset by ID
export function getAssetById(assetId: string): Asset | undefined {
  return assets.find((a) => a.id === assetId);
}
