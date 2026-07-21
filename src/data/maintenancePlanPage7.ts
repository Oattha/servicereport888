export type MaintenancePlanFrequency =
  | "two_week"
  | "one_month"
  | "three_month"
  | "six_month"
  | "annual";

export const maintenancePlanFrequencyOptions: Array<{
  key: MaintenancePlanFrequency;
  label: string;
}> = [
  { key: "two_week", label: "ทุก 2 สัปดาห์" },
  { key: "one_month", label: "ทุก 1 เดือน" },
  { key: "three_month", label: "ทุก 3 เดือน" },
  { key: "six_month", label: "ทุก 6 เดือน" },
  { key: "annual", label: "ทุก 1 ปี" }
];

export const maintenancePlanPage7Items = [
  { key: "building_addition", label: "การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร" },
  { key: "floor_load_change", label: "การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร" },
  { key: "building_usage_change", label: "การเปลี่ยนแปลงสภาพการใช้อาคาร" },
  { key: "material_change", label: "การเปลี่ยนแปลงวัสดุก่อสร้าง หรือวัสดุตกแต่งอาคาร" },
  { key: "building_deterioration", label: "การชำรุดสึกหรอของอาคาร" },
  { key: "structural_failure", label: "การวิบัติของโครงสร้างอาคาร" },
  { key: "foundation_settlement", label: "การทรุดตัวของฐานรากอาคาร" }
] as const;

export type MaintenancePlanPage7ItemKey = (typeof maintenancePlanPage7Items)[number]["key"];
export type MaintenancePlanPage7Checks = Record<MaintenancePlanPage7ItemKey, MaintenancePlanFrequency>;

export const defaultMaintenancePlanPage7Checks: MaintenancePlanPage7Checks = {
  building_addition: "six_month",
  floor_load_change: "three_month",
  building_usage_change: "three_month",
  material_change: "six_month",
  building_deterioration: "three_month",
  structural_failure: "three_month",
  foundation_settlement: "three_month"
};
