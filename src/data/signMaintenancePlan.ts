import type { MaintenancePlanFrequency } from "./maintenancePlanPage7";

export type SignMaintenanceResultChoice = "usable" | "unusable" | "fixed";
export type SignMaintenanceChoice = MaintenancePlanFrequency | SignMaintenanceResultChoice | null;
export type SignMaintenanceRemarkKind = "check" | "none" | "text" | null;

export type SignMaintenanceRemark = {
  kind: SignMaintenanceRemarkKind;
  text: string;
};

export type SignMaintenanceFormState = {
  choices: Record<string, SignMaintenanceChoice>;
  remarks: Record<string, SignMaintenanceRemark>;
};

export type SignMaintenanceRow = {
  key: string;
  page: 5 | 6 | 7;
  section: string;
  label: string;
  kind: "frequency" | "result";
  centerTop: number;
};

export const signMaintenanceFrequencyOptions: Array<{ key: MaintenancePlanFrequency; label: string }> = [
  { key: "two_week", label: "2 สัปดาห์" },
  { key: "one_month", label: "1 เดือน" },
  { key: "three_month", label: "3 เดือน" },
  { key: "six_month", label: "6 เดือน" },
  { key: "annual", label: "1 ปี" }
];

export const signMaintenanceResultOptions: Array<{ key: SignMaintenanceResultChoice; label: string }> = [
  { key: "usable", label: "ใช้ได้" },
  { key: "unusable", label: "ใช้ไม่ได้" },
  { key: "fixed", label: "แก้ไขแล้ว" }
];

export const signMaintenanceChoiceColumns = {
  frequency: {
    two_week: [227.0, 273.5],
    one_month: [273.5, 319.5],
    three_month: [319.5, 365.0],
    six_month: [365.0, 411.0],
    annual: [411.0, 456.5]
  },
  result: {
    usable: [347.0, 371.0],
    unusable: [371.0, 397.5],
    fixed: [397.5, 457.0]
  },
  remark: [457.0, 523.0]
} as const;

export const signMaintenanceRows: SignMaintenanceRow[] = [
  { key: "p5_structure_1", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "1 การต่อเติม ดัดแปลง ปรับปรุงขนาดของป้าย", kind: "frequency", centerTop: 206.1 },
  { key: "p5_structure_2", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "2 การเปลี่ยนแปลงน้ำหนักของแผ่นป้าย", kind: "frequency", centerTop: 230.1 },
  { key: "p5_structure_3", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "3 การเปลี่ยนแปลงสภาพการใช้งานของป้าย", kind: "frequency", centerTop: 254.1 },
  { key: "p5_structure_4", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "4 การเปลี่ยนแปลงวัสดุของป้าย", kind: "frequency", centerTop: 278.1 },
  { key: "p5_structure_5", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "5 การชำรุดสึกหรอของป้าย", kind: "frequency", centerTop: 302.1 },
  { key: "p5_structure_6", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "6 การวิบัติของสิ่งที่สร้างขึ้นสำหรับติดตั้งป้าย", kind: "frequency", centerTop: 326.1 },
  { key: "p5_structure_7", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "7 การทรุดตัวของฐานราก", kind: "frequency", centerTop: 364.5 },
  { key: "p5_structure_8", page: 5, section: "ความมั่นคงแข็งแรงของป้าย", label: "8 การเชื่อมยึดระหว่างแผ่นป้ายกับสิ่งที่สร้างขึ้น", kind: "frequency", centerTop: 417.3 },
  { key: "p5_electrical_11", page: 5, section: "ระบบไฟฟ้าแสงสว่าง", label: "1.1 สภาพสายไฟฟ้า", kind: "frequency", centerTop: 645.2 },
  { key: "p5_electrical_12", page: 5, section: "ระบบไฟฟ้าแสงสว่าง", label: "1.2 สภาพท่อร้อยสาย รางเดินสาย และรางเคเบิล", kind: "frequency", centerTop: 669.2 },

  { key: "p6_electrical_13", page: 6, section: "ระบบไฟฟ้าแสงสว่าง", label: "1.3 สภาพเครื่องป้องกันกระแสเกิน", kind: "frequency", centerTop: 146.0 },
  { key: "p6_electrical_14", page: 6, section: "ระบบไฟฟ้าแสงสว่าง", label: "1.4 สภาพเครื่องตัดไฟรั่ว", kind: "frequency", centerTop: 170.0 },
  { key: "p6_electrical_15", page: 6, section: "ระบบไฟฟ้าแสงสว่าง", label: "1.5 การต่อลงดินของบริภัณฑ์และท่อร้อยสาย", kind: "frequency", centerTop: 194.0 },
  { key: "p6_lightning_21", page: 6, section: "ระบบป้องกันอันตรายจากฟ้าผ่า", label: "2.1 ตรวจสอบระบบตัวนำล่อฟ้าและตัวนำต่อลงดิน", kind: "frequency", centerTop: 261.2 },
  { key: "p6_lightning_22", page: 6, section: "ระบบป้องกันอันตรายจากฟ้าผ่า", label: "2.2 ตรวจสอบระบบรากสายดิน", kind: "frequency", centerTop: 290.0 },
  { key: "p6_lightning_23", page: 6, section: "ระบบป้องกันอันตรายจากฟ้าผ่า", label: "2.3 ตรวจสอบจุดต่อประสานศักย์", kind: "frequency", centerTop: 314.0 },
  { key: "p6_other_31", page: 6, section: "ระบบอุปกรณ์อื่น ๆ", label: "3.1 สภาพบันไดขึ้นลง", kind: "frequency", centerTop: 362.0 },
  { key: "p6_other_32", page: 6, section: "ระบบอุปกรณ์อื่น ๆ", label: "3.2 สภาพราวจับและราวกันตก", kind: "frequency", centerTop: 386.0 },
  { key: "p6_other_33", page: 6, section: "ระบบอุปกรณ์อื่น ๆ", label: "3.3 อุปกรณ์ประกอบอื่น ๆ ตามที่เห็นสมควร", kind: "frequency", centerTop: 410.0 },
  { key: "p6_result_11", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.1 การต่อเติม ดัดแปลง ปรับปรุงขนาดของป้าย", kind: "result", centerTop: 634.5 },
  { key: "p6_result_12", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.2 การเปลี่ยนแปลงน้ำหนักของแผ่นป้าย", kind: "result", centerTop: 648.9 },
  { key: "p6_result_13", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.3 การเปลี่ยนสภาพการใช้งานของป้าย", kind: "result", centerTop: 663.3 },
  { key: "p6_result_14", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.4 การเปลี่ยนแปลงวัสดุของป้าย", kind: "result", centerTop: 677.7 },
  { key: "p6_result_15", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.5 การชำรุดสึกหรอของป้าย", kind: "result", centerTop: 692.1 },
  { key: "p6_result_16", page: 6, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.6 การวิบัติของสิ่งที่สร้างขึ้นสำหรับติดตั้งป้าย", kind: "result", centerTop: 706.5 },

  { key: "p7_result_17", page: 7, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.7 การทรุดตัวของฐานราก", kind: "result", centerTop: 130.3 },
  { key: "p7_result_18", page: 7, section: "ผลตรวจความมั่นคงแข็งแรง", label: "1.8 การเชื่อมยึดระหว่างแผ่นป้ายกับสิ่งที่สร้างขึ้น", kind: "result", centerTop: 159.1 },
  { key: "p7_result_211", page: 7, section: "ผลตรวจระบบไฟฟ้าแสงสว่าง", label: "2.1 (1) สภาพสายไฟฟ้า", kind: "result", centerTop: 216.7 },
  { key: "p7_result_212", page: 7, section: "ผลตรวจระบบไฟฟ้าแสงสว่าง", label: "2.1 (2) สภาพท่อร้อยสาย รางเดินสาย และรางเคเบิล", kind: "result", centerTop: 231.1 },
  { key: "p7_result_213", page: 7, section: "ผลตรวจระบบไฟฟ้าแสงสว่าง", label: "2.1 (3) สภาพเครื่องป้องกันกระแสเกิน", kind: "result", centerTop: 245.5 },
  { key: "p7_result_214", page: 7, section: "ผลตรวจระบบไฟฟ้าแสงสว่าง", label: "2.1 (4) สภาพเครื่องตัดไฟรั่ว", kind: "result", centerTop: 259.9 },
  { key: "p7_result_215", page: 7, section: "ผลตรวจระบบไฟฟ้าแสงสว่าง", label: "2.1 (5) การต่อลงดินของบริภัณฑ์และท่อร้อยสาย", kind: "result", centerTop: 274.3 },
  { key: "p7_result_221", page: 7, section: "ผลตรวจระบบป้องกันฟ้าผ่า", label: "2.2 (1) ตรวจสอบระบบตัวนำล่อฟ้าและตัวนำต่อลงดิน", kind: "result", centerTop: 317.5 },
  { key: "p7_result_222", page: 7, section: "ผลตรวจระบบป้องกันฟ้าผ่า", label: "2.2 (2) ตรวจสอบระบบรากสายดิน", kind: "result", centerTop: 331.9 },
  { key: "p7_result_223", page: 7, section: "ผลตรวจระบบป้องกันฟ้าผ่า", label: "2.2 (3) ตรวจสอบจุดต่อประสานศักย์", kind: "result", centerTop: 346.3 },
  { key: "p7_result_231", page: 7, section: "ผลตรวจระบบอุปกรณ์อื่น ๆ", label: "2.3 (1) สภาพบันไดขึ้นลง", kind: "result", centerTop: 375.1 },
  { key: "p7_result_232", page: 7, section: "ผลตรวจระบบอุปกรณ์อื่น ๆ", label: "2.3 (2) สภาพราวจับและราวกันตก", kind: "result", centerTop: 389.5 },
  { key: "p7_result_233", page: 7, section: "ผลตรวจระบบอุปกรณ์อื่น ๆ", label: "2.3 (3) อุปกรณ์ประกอบอื่น ๆ ตามที่เห็นสมควร", kind: "result", centerTop: 403.9 },
  { key: "p7_summary_1", page: 7, section: "สรุปผลตามแผน", label: "1 การตรวจสอบบำรุงรักษาความมั่นคงแข็งแรงของป้าย", kind: "result", centerTop: 557.1 },
  { key: "p7_summary_2", page: 7, section: "สรุปผลตามแผน", label: "2 การตรวจสอบบำรุงรักษาระบบและอุปกรณ์ประกอบต่าง ๆ", kind: "result", centerTop: 571.5 },
  { key: "p7_summary_21", page: 7, section: "สรุปผลตามแผน", label: "2.1 ระบบไฟฟ้าแสงสว่าง", kind: "result", centerTop: 585.9 },
  { key: "p7_summary_22", page: 7, section: "สรุปผลตามแผน", label: "2.2 ระบบป้องกันอันตรายจากฟ้าผ่า", kind: "result", centerTop: 600.3 },
  { key: "p7_summary_23", page: 7, section: "สรุปผลตามแผน", label: "2.3 ระบบอุปกรณ์อื่น ๆ", kind: "result", centerTop: 614.7 }
];

export const defaultSignMaintenanceFormState: SignMaintenanceFormState = {
  choices: Object.fromEntries(signMaintenanceRows.map((row) => [row.key, null])),
  remarks: Object.fromEntries(signMaintenanceRows.map((row) => [row.key, { kind: null, text: "" }]))
};

export function getSignMaintenanceRowsForPage(page: number) {
  return signMaintenanceRows.filter((row) => row.page === page);
}
