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
}

export const MOCK_SITE = {
  id: "site-1",
  name: "John Lewis, Manchester",
  address: "1 St Mary's Gate, Manchester M1 1PX",
};

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
  },
];
