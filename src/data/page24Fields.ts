import type { Page23RemarkState, Page23ResultState } from "../types";

export const page24ChecklistItems = [
  { key: "item_2_3_3", label: "2.3.3 ระบบระบายควันและควบคุมการแพร่กระจายควัน", centerTop: 104.48, defaultResult: "usable" },
  { key: "item_2_3_4", label: "2.3.4 ระบบไฟฟ้าสำรองฉุกเฉิน", centerTop: 140.48, defaultResult: "usable" },
  { key: "item_2_3_5", label: "2.3.5 ระบบลิฟต์ดับเพลิง - ไม่มี", centerTop: 161.8, defaultResult: "unavailable" },
  { key: "item_2_3_6", label: "2.3.6 ระบบสัญญาณแจ้งเหตุเพลิงไหม้", centerTop: 176.48, defaultResult: "usable" },
  { key: "item_2_3_7", label: "2.3.7 ระบบการติดตั้งอุปกรณ์ดับเพลิง", centerTop: 194.48, defaultResult: "usable" },
  { key: "item_2_3_8", label: "2.3.8 ระบบการจ่ายน้ำดับเพลิง เครื่องสูบน้ำดับเพลิงและหัวฉีดน้ำดับเพลิง", centerTop: 212.48, defaultResult: "usable" },
  { key: "item_2_3_9", label: "2.3.9 ระบบดับเพลิงอัตโนมัติ", centerTop: 248.48, defaultResult: "usable" },
  { key: "item_2_3_10", label: "2.3.10 ระบบป้องกันฟ้าผ่า", centerTop: 266.48, defaultResult: "usable" },
  { key: "item_2_3_11", label: "2.3.11 แบบแปลนเพื่อการดับเพลิง", centerTop: 284.48, defaultResult: "usable" },
  { key: "item_3_1", label: "3.1 สมรรถนะบันไดหนีไฟและทางหนีไฟ", centerTop: 338.48, defaultResult: "usable" },
  { key: "item_3_2", label: "3.2 สมรรถนะเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", centerTop: 356.48, defaultResult: "usable" },
  { key: "item_3_3", label: "3.3 สมรรถนะระบบแจ้งสัญญาณเหตุเพลิงไหม้", centerTop: 392.48, defaultResult: "usable" },
  { key: "item_4_1", label: "4.1 แผนการป้องกันและระงับอัคคีภัยในอาคาร", centerTop: 482.48, defaultResult: "usable" },
  { key: "item_4_2", label: "4.2 แผนการซ้อมอพยพผู้ใช้อาคาร", centerTop: 536.48, defaultResult: "usable" },
  { key: "item_4_3", label: "4.3 แผนการบริหารจัดการเกี่ยวกับความปลอดภัยในอาคาร", centerTop: 554.48, defaultResult: "usable" },
  { key: "item_4_4", label: "4.4 แผนการบริหารจัดการของผู้ตรวจสอบอาคาร", centerTop: 590.48, defaultResult: "usable" }
] as const;

export const defaultPage24Results = Object.fromEntries(
  page24ChecklistItems.map((item) => [item.key, item.defaultResult])
) as Page23ResultState;

export const defaultPage24Remarks = Object.fromEntries(
  page24ChecklistItems.map((item) => [item.key, ""])
) as Page23RemarkState;
