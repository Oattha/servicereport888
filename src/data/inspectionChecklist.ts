export type InspectionFrequency = "four_month" | "six_month" | "annual";

export type InspectionChecklistItem = {
  key: string;
  label: string;
  y: number;
  page?: number;
};

export type InspectionChecklistGroup = {
  title: string;
  items: InspectionChecklistItem[];
};

export const page13InspectionMarkPlacements: Record<string, { page: 13; y: number }> = {
  system_smoke_control: { page: 13, y: 670 },
  system_emergency_power: { page: 13, y: 634 },
  system_fire_lift: { page: 13, y: 616 },
  system_fire_alarm: { page: 13, y: 598 },
  system_extinguisher: { page: 13, y: 580 },
  system_fire_water: { page: 13, y: 562 },
  system_auto_fire: { page: 13, y: 526 },
  system_lightning: { page: 13, y: 508 },
  system_fire_plan: { page: 13, y: 490 },
  performance_fire_stairs: { page: 13, y: 436 },
  performance_exit_sign: { page: 13, y: 418 },
  performance_fire_alarm: { page: 13, y: 382 },
  performance_auto_fire: { page: 13, y: 364 },
  performance_fire_pump: { page: 13, y: 346 },
  performance_generator: { page: 13, y: 328 },
  safety_fire_plan: { page: 13, y: 256 },
  safety_evacuation_plan: { page: 13, y: 238 },
  safety_management_plan: { page: 13, y: 220 },
  safety_inspector_plan: { page: 13, y: 184 }
};

export const inspectionFrequencyOptions: Array<{
  key: InspectionFrequency;
  label: string;
  x: number;
}> = [
  { key: "four_month", label: "ทุก 4 เดือน", x: 327.75 },
  { key: "six_month", label: "ทุก 6 เดือน", x: 405.75 },
  { key: "annual", label: "ประจำปี", x: 483.75 }
];

export const inspectionChecklistGroups: InspectionChecklistGroup[] = [
  {
    title: "1. การตรวจสอบความมั่นคงแข็งแรงของอาคาร",
    items: [
      { key: "structure_addition", label: "1.1 การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", y: 568 },
      { key: "structure_load", label: "1.2 การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", y: 550 },
      { key: "structure_usage", label: "1.3 การเปลี่ยนสภาพการใช้งาน", y: 532 },
      { key: "structure_damage", label: "1.4 การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", y: 514 },
      { key: "structure_subsidence", label: "1.5 การชำรุดสึกหรอของอาคาร", y: 478 },
      { key: "structure_settlement", label: "1.6 การวิบัติของโครงสร้างอาคาร", y: 460 },
      { key: "structure_foundation", label: "1.7 การทรุดตัวของฐานรากอาคาร", y: 442 }
    ]
  },
  {
    title: "2. ระบบและอุปกรณ์ประกอบต่างๆ ของอาคาร",
    items: [
      { key: "system_service", label: "2.1 ระบบบริการและอำนวยความสะดวก", y: 370 },
      { key: "system_lift", label: "2.1.1 ระบบลิฟต์", y: 352 },
      { key: "system_escalator", label: "2.1.2 ระบบบันไดเลื่อน", y: 334 },
      { key: "system_electrical", label: "2.1.3 ระบบไฟฟ้า", y: 316 },
      { key: "system_ac", label: "2.1.4 ระบบปรับอากาศ", y: 298 },
      { key: "system_sanitary", label: "2.2 ระบบสุขอนามัยและสิ่งแวดล้อม", y: 280 },
      { key: "system_water", label: "2.2.1 ระบบประปา", y: 262 },
      { key: "system_drainage", label: "2.2.2 ระบบระบายน้ำเสียและระบบบำบัด", y: 244 },
      { key: "system_waste", label: "2.2.3 ระบบแยกขยะในฝัน", y: 226 },
      { key: "system_ventilation", label: "2.2.4 ระบบระบายอากาศมูลฝอย", y: 208 },
      { key: "system_air", label: "2.2.5 ระบบระบายอากาศ", y: 190 },
      { key: "system_noise", label: "2.2.6 ระบบควบคุมมลพิษทางอากาศและเสียง", y: 172 },
      { key: "system_fire", label: "2.3 ระบบป้องกันและระงับอัคคีภัย", y: 154 },
      { key: "system_fire_stairs", label: "2.3.1 บันไดหนีไฟและทางหนีไฟ", y: 136 },
      { key: "system_exit_sign", label: "2.3.2 เครื่องหมายและไฟป้ายทางออกฉุกเฉิน", y: 118 }
    ]
  },
  {
    title: "2. ระบบและอุปกรณ์ประกอบต่างๆ ของอาคาร (ต่อ)",
    items: [
      { key: "system_smoke_control", label: "2.3.3 ระบบระบายควันและควบคุมการแพร่กระจายควัน", page: 13, y: 670 },
      { key: "system_emergency_power", label: "2.3.4 ระบบไฟฟ้าสำรองฉุกเฉิน", page: 13, y: 634 },
      { key: "system_fire_lift", label: "2.3.5 ระบบลิฟต์ดับเพลิง", page: 13, y: 616 },
      { key: "system_fire_alarm", label: "2.3.6 ระบบสัญญาณแจ้งเหตุเพลิงไหม้", page: 13, y: 598 },
      { key: "system_extinguisher", label: "2.3.7 ระบบการติดตั้งอุปกรณ์ดับเพลิง", page: 13, y: 580 },
      { key: "system_fire_water", label: "2.3.8 ระบบการจ่ายน้ำดับเพลิง เครื่องสูบน้ำดับเพลิง และหัวฉีดน้ำดับเพลิง", page: 13, y: 562 },
      { key: "system_auto_fire", label: "2.3.9 ระบบดับเพลิงอัตโนมัติ", page: 13, y: 526 },
      { key: "system_lightning", label: "2.3.10 ระบบป้องกันฟ้าผ่า", page: 13, y: 508 },
      { key: "system_fire_plan", label: "2.3.11 แบบแปลนเพื่อการดับเพลิง", page: 13, y: 490 }
    ]
  },
  {
    title: "3. การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่างๆ",
    items: [
      { key: "performance_fire_stairs", label: "3.1 สมรรถนะบันไดหนีไฟและทางหนีไฟ", page: 13, y: 436 },
      { key: "performance_exit_sign", label: "3.2 สมรรถนะเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", page: 13, y: 418 },
      { key: "performance_fire_alarm", label: "3.3 สมรรถนะสัญญาณแจ้งเหตุเพลิงไหม้", page: 13, y: 382 },
      { key: "performance_auto_fire", label: "3.4 สมรรถนะระบบดับเพลิงอัตโนมัติ", page: 13, y: 364 },
      { key: "performance_fire_pump", label: "3.5 สมรรถนะระบบเครื่องสูบน้ำดับเพลิง", page: 13, y: 346 },
      { key: "performance_generator", label: "3.6 สมรรถนะเครื่องกำเนิดไฟฟ้าสำรอง", page: 13, y: 328 }
    ]
  },
  {
    title: "4. การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร",
    items: [
      { key: "safety_fire_plan", label: "4.1 แผนการป้องกันและระงับอัคคีภัยในอาคาร", page: 13, y: 256 },
      { key: "safety_evacuation_plan", label: "4.2 แผนการซ้อมอพยพผู้ใช้อาคาร", page: 13, y: 238 },
      { key: "safety_management_plan", label: "4.3 แผนการบริหารจัดการเกี่ยวกับความปลอดภัยในอาคาร", page: 13, y: 220 },
      { key: "safety_inspector_plan", label: "4.4 แผนการบริหารจัดการของผู้ตรวจสอบอาคาร", page: 13, y: 184 }
    ]
  }
];

export const inspectionChecklistItems: InspectionChecklistItem[] = inspectionChecklistGroups.flatMap(
  (group) => group.items
);

export const defaultInspectionChecks: Record<string, InspectionFrequency | null> = Object.fromEntries(
  inspectionChecklistItems.map((item) => [item.key, null])
);
