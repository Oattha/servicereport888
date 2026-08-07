import type { MaintenancePlanFrequency } from "./maintenancePlanPage7";

export const maintenancePlanPage8Items = [
  { key: "fire_stair_rail", label: "สภาพราวจับ และราวกันตก" },
  { key: "fire_stair_obstruction", label: "อุปสรรคกีดขวางตลอดเส้นทางของบันไดหนีไฟ" },
  { key: "fire_stair_door", label: "การปิด-เปิดประตูเข้า-ออกบันไดหนีไฟ" },
  { key: "escape_route_lighting", label: "ความส่องสว่างของแสงไฟบนเส้นทางหนีไฟ" },
  { key: "escape_route_obstruction", label: "อุปสรรคกีดขวางตลอดเส้นทางจนถึงเส้นทางออกสู่ภายนอกอาคาร" },
  { key: "escape_route_door", label: "การปิด-เปิดประตูตลอดเส้นทาง" },
  { key: "emergency_exit_sign", label: "สภาพและการทำงานของเครื่องหมายและไฟป้ายทางออกฉุกเฉิน" },
  { key: "fire_plan", label: "แบบแปลนพื้นทุกชั้นของอาคารเพื่อการดับเพลิง" }
] as const;

export type MaintenancePlanPage8ItemKey = (typeof maintenancePlanPage8Items)[number]["key"];
export type MaintenancePlanPage8Checks = Record<MaintenancePlanPage8ItemKey, MaintenancePlanFrequency>;

export const defaultMaintenancePlanPage8Checks: MaintenancePlanPage8Checks = {
  fire_stair_rail: "one_month",
  fire_stair_obstruction: "one_month",
  fire_stair_door: "one_month",
  escape_route_lighting: "one_month",
  escape_route_obstruction: "one_month",
  escape_route_door: "one_month",
  emergency_exit_sign: "one_month",
  fire_plan: "one_month"
};
