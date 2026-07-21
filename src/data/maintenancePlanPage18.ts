export type MaintenancePlanPage18Status = "usable" | "unusable" | null;

export type MaintenancePlanPage18Value = {
  status: MaintenancePlanPage18Status;
  correction: string;
  note: string;
};

export type MaintenancePlanPage18Values = Record<string, MaintenancePlanPage18Value>;

export type MaintenancePlanPage18Item = {
  key: string;
  number: string;
  label: string;
  section: string;
  centerTop: number;
};

export const maintenancePlanPage18Items: MaintenancePlanPage18Item[] = [
  { key: "structure_extension", number: "1.1", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", centerTop: 307 },
  { key: "structure_load", number: "1.2", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", centerTop: 326 },
  { key: "structure_usage", number: "1.3", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การเปลี่ยนสภาพการใช้อาคาร", centerTop: 345 },
  { key: "structure_material", number: "1.4", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", centerTop: 364 },
  { key: "structure_damage", number: "1.5", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การชำรุดสึกหรอของอาคาร", centerTop: 383 },
  { key: "structure_failure", number: "1.6", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การวิบัติของโครงสร้างอาคาร", centerTop: 402 },
  { key: "structure_settlement", number: "1.7", section: "ความมั่นคงแข็งแรงของอาคาร", label: "การทรุดตัวของฐานรากอาคาร", centerTop: 421 },
  { key: "fire_stair", number: "2.1.1", section: "ระบบบันไดหนีไฟและทางหนีไฟ", label: "ระบบบันไดหนีไฟ", centerTop: 495 },
  { key: "fire_exit", number: "2.1.2", section: "ระบบบันไดหนีไฟและทางหนีไฟ", label: "ทางหนีไฟ", centerTop: 514 },
  { key: "exit_sign", number: "2.1.3", section: "ระบบบันไดหนีไฟและทางหนีไฟ", label: "เครื่องหมายและไฟป้ายทางออกฉุกเฉิน", centerTop: 533 },
  { key: "fire_plan", number: "2.1.4", section: "ระบบบันไดหนีไฟและทางหนีไฟ", label: "แบบแปลนเพื่อการดับเพลิง", centerTop: 552 },
  { key: "high_voltage", number: "2.2.1", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "ระบบไฟฟ้าแรงสูง", centerTop: 589 },
  { key: "transformer", number: "2.2.2", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "หม้อแปลงไฟฟ้า", centerTop: 608 },
  { key: "low_voltage", number: "2.2.3", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "ระบบไฟฟ้าแรงต่ำ", centerTop: 627 },
  { key: "generator", number: "2.2.4", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "เครื่องกำเนิดไฟฟ้า", centerTop: 646 },
  { key: "emergency_lighting", number: "2.2.5", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "ระบบไฟฟ้าแสงสว่างฉุกเฉิน", centerTop: 665 },
  { key: "fire_alarm", number: "2.2.6", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "ระบบแจ้งเหตุเพลิงไหม้", centerTop: 684 },
  { key: "lightning_protection", number: "2.2.7", section: "ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", label: "ระบบป้องกันอันตรายจากฟ้าผ่า", centerTop: 703 }
];

export const defaultMaintenancePlanPage18Values: MaintenancePlanPage18Values = Object.fromEntries(
  maintenancePlanPage18Items.map((item) => [
    item.key,
    { status: null, correction: "", note: "" }
  ])
);
