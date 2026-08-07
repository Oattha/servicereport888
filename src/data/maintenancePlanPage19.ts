import type {
  MaintenancePlanPage18Item,
  MaintenancePlanPage18Values
} from "./maintenancePlanPage18";
import type { TemplateImageSlot } from "../types";

export type MaintenancePlanPage19Values = MaintenancePlanPage18Values;

export type MaintenancePlanPage19SignatureState = {
  typedSignature: string;
  signerName: string;
};

export const defaultMaintenancePlanPage19Signature: MaintenancePlanPage19SignatureState = {
  typedSignature: "",
  signerName: ""
};

export const maintenancePlanPage19SignatureSlot: TemplateImageSlot = {
  key: "maintenance_page19_signature",
  label: "รูปลายเซ็นหน้า 19",
  page: 19,
  type: "image",
  x: 132,
  y: 640,
  width: 181,
  height: 20,
  locked: true,
  recommendedSize: "PNG พื้นหลังโปร่งใส หรือ JPG แนวนอน"
};

export const maintenancePlanPage19Items: MaintenancePlanPage18Item[] = [
  { key: "mechanical_central_air", number: "2.3.1", section: "ระบบเครื่องกลของอาคาร", label: "ระบบปรับอากาศแบบรวมศูนย์", centerTop: 157 },
  { key: "mechanical_split_air", number: "2.3.2", section: "ระบบเครื่องกลของอาคาร", label: "ระบบปรับอากาศแบบแยกส่วน", centerTop: 172 },
  { key: "mechanical_ventilation", number: "2.3.3", section: "ระบบเครื่องกลของอาคาร", label: "ระบบระบายอากาศ", centerTop: 190 },
  { key: "mechanical_elevator", number: "2.3.4", section: "ระบบเครื่องกลของอาคาร", label: "ระบบลิฟต์", centerTop: 208 },
  { key: "mechanical_escalator", number: "2.3.5", section: "ระบบเครื่องกลของอาคาร", label: "ระบบบันไดเลื่อน", centerTop: 229 },
  { key: "sanitary_water_supply", number: "2.4.1", section: "ระบบสุขาภิบาลของอาคาร", label: "ระบบประปา", centerTop: 262 },
  { key: "sanitary_interior_drainage", number: "2.4.2", section: "ระบบสุขาภิบาลของอาคาร", label: "ระบบระบายน้ำในอาคาร", centerTop: 280 },
  { key: "sanitary_exterior_drainage", number: "2.4.3", section: "ระบบสุขาภิบาลของอาคาร", label: "ระบบระบายน้ำภายนอกอาคาร", centerTop: 298 },
  { key: "sanitary_wastewater", number: "2.4.4", section: "ระบบสุขาภิบาลของอาคาร", label: "บ่อบำบัดน้ำเสีย", centerTop: 316 },
  { key: "sanitary_solid_waste", number: "2.4.5", section: "ระบบสุขาภิบาลของอาคาร", label: "ระบบจัดการมูลฝอย", centerTop: 334 },
  { key: "sanitary_fire_suppression", number: "2.4.6", section: "ระบบสุขาภิบาลของอาคาร", label: "ระบบดับเพลิง", centerTop: 352 },
  { key: "performance_fire_escape", number: "3.1", section: "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ", label: "สมรรถนะบันไดหนีไฟและทางหนีไฟ", centerTop: 398 },
  { key: "performance_exit_sign", number: "3.2", section: "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ", label: "สมรรถนะเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", centerTop: 416 },
  { key: "performance_fire_alarm", number: "3.3", section: "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ", label: "สมรรถนะระบบแจ้งสัญญาณเหตุเพลิงไหม้", centerTop: 434 },
  { key: "performance_generator", number: "3.4", section: "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ", label: "สมรรถนะระบบเครื่องกำเนิดไฟฟ้าสำรอง", centerTop: 452 },
  { key: "performance_automatic_fire", number: "3.5", section: "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ", label: "สมรรถนะระบบดับเพลิงอัตโนมัติ", centerTop: 470 },
  { key: "management_fire_plan", number: "4.1", section: "การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร", label: "แผนการป้องกันและระงับอัคคีภัยในอาคาร", centerTop: 533 },
  { key: "management_evacuation", number: "4.2", section: "การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร", label: "แผนการซ้อมอพยพผู้ใช้อาคาร", centerTop: 551 },
  { key: "management_building_safety", number: "4.3", section: "การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร", label: "แผนการบริหารจัดการเกี่ยวกับความปลอดภัยในอาคาร", centerTop: 569 },
  { key: "management_inspector", number: "4.4", section: "การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร", label: "แผนบริหารจัดการของผู้ตรวจสอบอาคาร", centerTop: 587 }
];

export const defaultMaintenancePlanPage19Values: MaintenancePlanPage19Values = Object.fromEntries(
  maintenancePlanPage19Items.map((item) => [
    item.key,
    { status: null, correction: "", note: "" }
  ])
);
