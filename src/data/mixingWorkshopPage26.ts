import type { MixingWorkshopPage24Frequency } from "./mixingWorkshopPage24";

export type MixingWorkshopPage26Checks = Record<string, MixingWorkshopPage24Frequency | null>;
export type MixingWorkshopPage26Remarks = Record<string, string>;

export type MixingWorkshopPage26Row = {
  key: string;
  label: string;
  centerTop: number;
};

export const mixingWorkshopPage26Groups: Array<{
  title: string;
  rows: MixingWorkshopPage26Row[];
}> = [
  {
    title: "1. ระบบปรับอากาศแบบรวมศูนย์",
    rows: [
      { key: "1.1", label: "1.1 เครื่องทำน้ำเย็น", centerTop: 228.09 },
      { key: "1.2", label: "1.2 ระบบควบคุมระบบปรับอากาศ", centerTop: 255.69 },
      { key: "1.3", label: "1.3 ระบบไฟฟ้าของระบบปรับอากาศ", centerTop: 283.28 },
      { key: "1.4", label: "1.4 หอผึ่งน้ำ (Cooling Tower)", centerTop: 310.92 },
      { key: "1.5", label: "1.5 เครื่องส่งลมเย็น แผงกรองอากาศ", centerTop: 338.52 },
      { key: "1.6", label: "1.6 ท่อส่งลมเย็นและอุปกรณ์ระบบ", centerTop: 366.12 },
      { key: "1.7", label: "1.7 ปั๊มน้ำเย็นและปั๊มน้ำระบายความร้อน", centerTop: 393.72 },
      { key: "1.8", label: "1.8 ระบบท่อน้ำเย็นและท่อน้ำระบายความร้อนพร้อมอุปกรณ์ประกอบ", centerTop: 437.68 }
    ]
  },
  {
    title: "2. ระบบปรับอากาศแบบแยกส่วน",
    rows: [
      { key: "2.1", label: "2.1 การทำงานและการจับยึดของชุด Condensing Unit", centerTop: 509.54 },
      { key: "2.2", label: "2.2 การทำงานและการจับยึดของชุด Fan coil Unit และแผงกรองอากาศ", centerTop: 549.45 },
      { key: "2.3", label: "2.3 ระบบไฟฟ้าของระบบปรับอากาศ", centerTop: 587.71 }
    ]
  },
  {
    title: "3. ระบบระบายอากาศ",
    rows: [
      { key: "3.1", label: "3.1 พัดลมระบายอากาศ", centerTop: 642.91 },
      { key: "3.2", label: "3.2 ระบบไฟฟ้าของระบบระบายอากาศ", centerTop: 670.51 },
      { key: "3.3", label: "3.3 การทำงานของระบบอัดอากาศบันไดหนีไฟ", centerTop: 698.1 }
    ]
  }
];

export const mixingWorkshopPage26Rows = mixingWorkshopPage26Groups.flatMap((group) => group.rows);

const oneMonthKeys = new Set(["1.4", "1.5", "2.2"]);
const sixMonthKeys = new Set(["1.1", "1.6"]);

export const defaultMixingWorkshopPage26Checks: MixingWorkshopPage26Checks = Object.fromEntries(
  mixingWorkshopPage26Rows.map((row) => [
    row.key,
    oneMonthKeys.has(row.key) ? "one_month" : sixMonthKeys.has(row.key) ? "six_month" : "three_month"
  ])
);

export const defaultMixingWorkshopPage26Remarks: MixingWorkshopPage26Remarks = Object.fromEntries(
  mixingWorkshopPage26Rows.map((row) => [row.key, ""])
);

export const mixingWorkshopPage26ChoiceColumns: Record<
  MixingWorkshopPage24Frequency,
  readonly [number, number]
> = {
  two_week: [228.75, 273.75],
  one_month: [273.75, 320.25],
  three_month: [320.25, 369],
  six_month: [369, 411],
  annual: [411, 456.75]
};
