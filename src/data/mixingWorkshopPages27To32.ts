import type { MixingWorkshopPage24Frequency } from "./mixingWorkshopPage24";

export type MixingWorkshopExtendedPage = 27 | 28 | 29 | 30 | 31 | 32;
export type MixingWorkshopExtendedChecks = Record<MixingWorkshopExtendedPage, Record<string, MixingWorkshopPage24Frequency | null>>;
export type MixingWorkshopExtendedRemarks = Record<MixingWorkshopExtendedPage, Record<string, string>>;

type Row = { key: string; label: string; centerTop: number; defaultFrequency: MixingWorkshopPage24Frequency };
type Group = { title: string; rows: Row[] };
export type MixingWorkshopExtendedPageDefinition = {
  page: MixingWorkshopExtendedPage;
  title: string;
  groups: Group[];
};

const group = (title: string, rows: Array<[string, string, number, MixingWorkshopPage24Frequency]>): Group => ({
  title,
  rows: rows.map(([key, label, centerTop, defaultFrequency]) => ({ key, label, centerTop, defaultFrequency }))
});

export const mixingWorkshopPages27To32Definitions: MixingWorkshopExtendedPageDefinition[] = [
  { page: 27, title: "ระบบลิฟต์ บันไดเลื่อน และระบบประปา", groups: [
    group("4. ระบบลิฟต์และลิฟต์ดับเพลิง", [
      ["4.1", "4.1 การทำงานของลิฟต์และลิฟต์ดับเพลิง", 197.5, "six_month"],
      ["4.2", "4.2 อุปกรณ์ด้านความปลอดภัย", 238.3, "one_month"],
      ["4.3", "4.3 อุปกรณ์การให้ความช่วยเหลือ", 265.9, "one_month"],
      ["4.4", "4.4 ระบบอัดอากาศโถงหน้าลิฟต์ดับเพลิง", 293.5, "one_month"]
    ]),
    group("5. ระบบบันไดเลื่อน", [
      ["5.1", "5.1 การทำงานของบันไดเลื่อน", 363.7, "three_month"],
      ["5.2", "5.2 อุปกรณ์ด้านความปลอดภัย", 391.3, "three_month"],
      ["5.3", "5.3 ระบบไฟฟ้าของบันไดเลื่อน", 418.9, "three_month"]
    ]),
    group("1.1 ถังเก็บน้ำใต้ดิน/บนดิน/บนดาดฟ้า", [
      ["1.1a", "สภาพถังและฝาเปิด-ปิดถังเก็บน้ำ", 628.3, "one_month"],
      ["1.1b", "สภาพท่อน้ำเข้า-ออกจากถังเก็บน้ำ", 655.9, "one_month"],
      ["1.1c", "สภาพประตูน้ำเข้า-ออกจากถังเก็บน้ำ", 700.3, "one_month"]
    ])
  ]},
  { page: 28, title: "ระบบประปาและระบบระบายน้ำ", groups: [
    group("1. ระบบประปา", [
      ["1.1d", "การป้องกันหนูและแมลงสาบเข้าถังเก็บน้ำ", 169.9, "one_month"],
      ["1.2a", "สภาพความสะอาดในห้องเครื่องสูบน้ำ", 239.6, "one_month"],
      ["1.2b", "การทำงานของเครื่องสูบน้ำ", 281.9, "one_month"],
      ["1.2c", "การทำงานระบบควบคุมเครื่องสูบน้ำ", 325.4, "one_month"],
      ["1.2d", "ระบบไฟฟ้าของเครื่องสูบน้ำ", 368.0, "one_month"],
      ["1.2e", "สภาพท่อส่งจ่ายน้ำ", 395.6, "one_month"],
      ["1.2f", "อุปกรณ์ประกอบเครื่องสูบน้ำ", 423.2, "one_month"],
      ["1.3a", "การรั่วซึมของท่อประปา", 494.8, "one_month"],
      ["1.3b", "สภาพประตูน้ำของระบบประปา", 522.4, "one_month"]
    ]),
    group("2.1 ท่อระบายน้ำเสีย", [
      ["2.1a", "สภาพท่อและการยึดแขวนท่อ", 605.2, "one_month"],
      ["2.1b", "การรั่วซึมของท่อ", 632.8, "one_month"],
      ["2.1c", "การอุดตันในท่อ", 660.4, "one_month"],
      ["2.1d", "สภาพอุปกรณ์ประกอบการระบายน้ำ", 688.0, "one_month"],
      ["2.1e", "ที่ดักกลิ่น", 724.0, "one_month"]
    ])
  ]},
  { page: 29, title: "ระบบระบายน้ำในอาคาร", groups: [
    group("2.1 ท่อระบายน้ำเสีย (ต่อ)", [
      ["2.1f", "ช่องรับน้ำ (FD.)", 169.9, "one_month"], ["2.1g", "ช่องเปิดล้างท่อ (CO.)", 197.5, "one_month"],
      ["2.1h", "สภาพช่องท่อ", 225.1, "one_month"], ["2.1i", "กลิ่นและความอับชื้น", 252.7, "one_month"],
      ["2.1j", "ป้องกันหรือกำจัดหนูและแมลงสาบในช่องท่อ", 280.3, "one_month"], ["2.1k", "ป้องกันควันและไฟลามในช่องท่อ", 322.9, "one_month"]
    ]),
    group("2.2 ท่อระบายน้ำฝน", [
      ["2.2a", "สภาพท่อและการยึดแขวนท่อ", 395.6, "one_month"], ["2.2b", "การอุดตันในท่อ", 423.2, "one_month"],
      ["2.2c", "การรั่วซึมของท่อ", 450.9, "one_month"], ["2.2d", "สภาพอุปกรณ์ประกอบ", 478.5, "one_month"],
      ["2.2e", "ช่องรับน้ำ (RD.)", 506.1, "one_month"]
    ]),
    group("2.3 เครื่องสูบน้ำเสียและบ่อสูบ (ถ้ามี)", [
      ["2.3a", "สภาพบ่อสูบ", 561.3, "one_month"], ["2.3b", "สภาพการทำงานของเครื่องสูบน้ำเสีย", 588.9, "one_month"],
      ["2.3c", "การทำงานของระบบควบคุม", 635.2, "one_month"], ["2.3d", "ระบบไฟฟ้าของเครื่องสูบ", 662.8, "one_month"]
    ])
  ]},
  { page: 30, title: "ระบบป้องกันอัคคีภัย", groups: [
    group("1. ระบบแจ้งเหตุเพลิงไหม้", [
      ["1.1", "1.1 อุปกรณ์แจ้งสัญญาณเสียง ลำโพง หรือแสง", 228.1, "six_month"],
      ["1.2a", "1.2 ทดสอบเครื่องประจุแบตเตอรี่", 301.9, "six_month"],
      ["1.2b", "แบตเตอรี่น้ำกรด: ทดสอบการคลายประจุ 30 นาที", 357.1, "six_month"],
      ["1.2c", "แบตเตอรี่น้ำกรด: ทดสอบแรงดันไฟฟ้าขณะมีโหลด", 384.7, "six_month"],
      ["1.2d", "ทดสอบความถ่วงจำเพาะน้ำกรด", 412.3, "six_month"],
      ["1.2e", "แบตเตอรี่นิเกิล-แคดเมียม: ทดสอบการคลายประจุ", 467.5, "six_month"],
      ["1.2f", "แบตเตอรี่นิเกิล-แคดเมียม: ทดสอบแรงดันไฟฟ้า", 495.1, "six_month"],
      ["1.3", "1.3 บริภัณฑ์ควบคุม (Control Panel or Devices)", 522.7, "six_month"],
      ["1.3a", "แบบมีการตรวจคุม", 621.2, "six_month"], ["1.3b", "แบบไม่มีการตรวจคุม", 648.8, "six_month"],
      ["1.4", "1.4 การแสดงผลสัญญาณขัดข้อง", 676.4, "six_month"]
    ])
  ]},
  { page: 31, title: "ระบบแจ้งเหตุและดับเพลิง", groups: [
    group("1. ระบบแจ้งเหตุเพลิงไหม้ (ต่อ)", [
      ["1.5", "1.5 อุปกรณ์เริ่มสัญญาณ", 169.9, "six_month"], ["1.5a", "Smoke/Heat/Gas Detector และอุปกรณ์แจ้งเหตุ", 197.5, "six_month"],
      ["1.5b", "Water Flow / Pressure / Supervisory / Tamper Switch", 273.4, "six_month"],
      ["1.6", "1.6 การแสดงผลเพลิงไหม้", 334.1, "six_month"], ["1.7", "1.7 บริภัณฑ์ไฟฟ้าในบริเวณอันตราย", 376.7, "six_month"]
    ]),
    group("2. ระบบดับเพลิง", [
      ["2.1", "2.1 ถังดับเพลิง", 481.2, "three_month"], ["2.2a", "2.2 เครื่องสูบน้ำดับเพลิง", 536.4, "one_month"],
      ["2.2b", "เครื่องสูบน้ำขับด้วยเครื่องยนต์", 564.0, "one_month"], ["2.2c", "เครื่องสูบน้ำขับด้วยมอเตอร์ไฟฟ้า", 606.0, "one_month"],
      ["2.3", "2.3 หัวรับน้ำดับเพลิง", 633.6, "three_month"], ["2.4a", "2.4 หัวดับเพลิง: ตรวจสอบสภาพ", 705.6, "three_month"],
      ["2.4b", "2.4 หัวดับเพลิง: เปิดฝาใส่สารหล่อลื่น", 733.2, "three_month"]
    ])
  ]},
  { page: 32, title: "ระบบดับเพลิงและทางออกฉุกเฉิน", groups: [
    group("2. ระบบดับเพลิง (ต่อ)", [
      ["2.4c", "ทดสอบเปิด-ปิดวาล์ว", 169.9, "three_month"], ["2.5a", "2.5 ถังน้ำดับเพลิง: ระดับน้ำ", 225.1, "one_month"],
      ["2.5b", "2.5 ถังน้ำดับเพลิง: สภาพถังน้ำ", 252.7, "one_month"], ["2.6a", "2.6 สายฉีดน้ำดับเพลิงและตู้เก็บสายฉีด", 280.3, "three_month"],
      ["2.6b", "สายฉีดน้ำ วาล์ว และอุปกรณ์", 326.3, "three_month"], ["2.7a", "2.7 ระบบหัวกระจายน้ำดับเพลิง: Main Drain", 395.2, "three_month"],
      ["2.7b", "Water Flow Switch", 422.8, "three_month"], ["2.7c", "Supervisory Switch", 450.4, "three_month"],
      ["2.7d", "สภาพ Control Valves", 478.0, "three_month"], ["2.7e", "เปิด-ปิด Control Valves", 505.6, "three_month"]
    ]),
    group("3. ระบบไฟแสงสว่างฉุกเฉิน", [
      ["3.1", "จำลองการจ่ายไฟล้มเหลวอย่างน้อย 30 นาที", 560.8, "three_month"],
      ["3.2", "จำลองการจ่ายไฟล้มเหลวอย่างน้อย 60 นาที", 599.1, "six_month"]
    ]),
    group("4. ป้ายบอกทางออกฉุกเฉินหรือป้ายทางหนีไฟ", [
      ["4.1", "จำลองการจ่ายไฟล้มเหลวอย่างน้อย 30 นาที", 677.9, "three_month"],
      ["4.2", "จำลองการจ่ายไฟล้มเหลวอย่างน้อย 60 นาที", 713.9, "six_month"]
    ])
  ]}
];

export const mixingWorkshopExtendedChoiceColumns: Record<MixingWorkshopPage24Frequency, readonly [number, number]> = {
  two_week: [228.75, 273.75], one_month: [273.75, 320.25], three_month: [320.25, 369],
  six_month: [369, 411], annual: [411, 456.75]
};
export const mixingWorkshopExtendedRemarkColumn = [456.75, 522.75] as const;

export const defaultMixingWorkshopPages27To32Checks = Object.fromEntries(
  mixingWorkshopPages27To32Definitions.map(({ page, groups }) => [page, Object.fromEntries(groups.flatMap((g) => g.rows).map((r) => [r.key, r.defaultFrequency]))])
) as MixingWorkshopExtendedChecks;
export const defaultMixingWorkshopPages27To32Remarks = Object.fromEntries(
  mixingWorkshopPages27To32Definitions.map(({ page, groups }) => [page, Object.fromEntries(groups.flatMap((g) => g.rows).map((r) => [r.key, ""]))])
) as MixingWorkshopExtendedRemarks;

export function getMixingWorkshopExtendedDefinition(page: number) {
  return mixingWorkshopPages27To32Definitions.find((definition) => definition.page === page);
}
