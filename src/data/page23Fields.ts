import type { Page23RemarkState, Page23ResultState } from "../types";

export const page23ChecklistItems = [
  { key: "item_1_1", label: "1.1 การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", centerTop: 153.36, defaultResult: "usable" },
  { key: "item_1_2", label: "1.2 การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", centerTop: 171.36, defaultResult: "usable" },
  { key: "item_1_3", label: "1.3 การเปลี่ยนสภาพการใช้อาคาร", centerTop: 207.36, defaultResult: "usable" },
  { key: "item_1_4", label: "1.4 การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", centerTop: 225.36, defaultResult: "usable" },
  { key: "item_1_5", label: "1.5 การชำรุดสึกหรอของอาคาร", centerTop: 261.36, defaultResult: "usable" },
  { key: "item_1_6", label: "1.6 การวิบัติของโครงสร้างอาคาร", centerTop: 279.36, defaultResult: "usable" },
  { key: "item_1_7", label: "1.7 การทรุดตัวของฐานรากอาคาร", centerTop: 297.36, defaultResult: "usable" },
  { key: "item_2_1_1", label: "2.1.1 ระบบลิฟต์", centerTop: 387.36, defaultResult: "usable" },
  { key: "item_2_1_2", label: "2.1.2 ระบบบันไดเลื่อน - ไม่มี", centerTop: 409.36, defaultResult: "unavailable" },
  { key: "item_2_1_3", label: "2.1.3 ระบบไฟฟ้า", centerTop: 423.36, defaultResult: "usable" },
  { key: "item_2_1_4", label: "2.1.4 ระบบปรับอากาศ", centerTop: 441.36, defaultResult: "usable" },
  { key: "item_2_2_1", label: "2.2.1 ระบบประปา", centerTop: 477.36, defaultResult: "usable" },
  { key: "item_2_2_2", label: "2.2.2 ระบบระบายน้ำเสียและระบบบำบัดน้ำเสีย", centerTop: 495.36, defaultResult: "usable" },
  { key: "item_2_2_3", label: "2.2.3 ระบบระบายน้ำฝน", centerTop: 531.36, defaultResult: "usable" },
  { key: "item_2_2_4", label: "2.2.4 ระบบจัดการมูลฝอย", centerTop: 549.36, defaultResult: "usable" },
  { key: "item_2_2_5", label: "2.2.5 ระบบระบายอากาศ", centerTop: 567.36, defaultResult: "usable" },
  { key: "item_2_2_6", label: "2.2.6 ระบบควบคุมมลพิษทางอากาศและเสียง", centerTop: 585.36, defaultResult: "usable" },
  { key: "item_2_3_1", label: "2.3.1 บันไดหนีไฟและทางหนีไฟ", centerTop: 639.36, defaultResult: "usable" },
  { key: "item_2_3_2", label: "2.3.2 เครื่องหมายและไฟป้ายบอกทางออกฉุกเฉิน", centerTop: 657.36, defaultResult: "usable" }
] as const;

export const defaultPage23Results = Object.fromEntries(
  page23ChecklistItems.map((item) => [item.key, item.defaultResult])
) as Page23ResultState;

export const defaultPage23Remarks = Object.fromEntries(
  page23ChecklistItems.map((item) => [item.key, ""])
) as Page23RemarkState;
