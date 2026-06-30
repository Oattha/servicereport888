import type { Report, Template } from "../types";

export const reports: Report[] = [
  {
    id: "RPT-2026-0018",
    customer: "Siam Asset Management",
    building: "Siam Tower A",
    template: "Building Inspection Standard",
    inspector: "Kawkan Nakorntum",
    updatedAt: "30 Jun 2026",
    status: "Draft",
    progress: 48
  },
  {
    id: "RPT-2026-0017",
    customer: "True Industrial Estate",
    building: "Warehouse Zone 3",
    template: "Preventive Maintenance Plan",
    inspector: "Anucha Uthong",
    updatedAt: "29 Jun 2026",
    status: "In Review",
    progress: 82
  },
  {
    id: "RPT-2026-0016",
    customer: "Bangkok Office Park",
    building: "BOP East Wing",
    template: "Building Inspection Standard",
    inspector: "Pimwipa Jaruphan",
    updatedAt: "28 Jun 2026",
    status: "Ready",
    progress: 100
  },
  {
    id: "RPT-2026-0015",
    customer: "Future Safety Co., Ltd.",
    building: "Head Office",
    template: "Safety Summary Report",
    inspector: "Jiratchaya Raksapon",
    updatedAt: "27 Jun 2026",
    status: "Sent",
    progress: 100
  }
];

export const templates: Template[] = [
  {
    id: "TMP-BI-001",
    name: "Building Inspection Standard",
    pages: 24,
    version: "1.4",
    lockedFields: 186,
    lastUpdated: "24 Jun 2026",
    active: true
  },
  {
    id: "TMP-PM-002",
    name: "Preventive Maintenance Plan",
    pages: 18,
    version: "1.2",
    lockedFields: 132,
    lastUpdated: "18 Jun 2026",
    active: true
  },
  {
    id: "TMP-SS-003",
    name: "Safety Summary Report",
    pages: 10,
    version: "1.0",
    lockedFields: 74,
    lastUpdated: "9 Jun 2026",
    active: false
  }
];
