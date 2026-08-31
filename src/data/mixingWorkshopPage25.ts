import type { MixingWorkshopPage24Frequency } from "./mixingWorkshopPage24";

export type MixingWorkshopPage25Checks = Record<string, MixingWorkshopPage24Frequency | null>;
export type MixingWorkshopPage25Remarks = Record<string, string>;

export type MixingWorkshopPage25Row = {
  key: string;
  label: string;
  centerTop: number;
};

export const mixingWorkshopPage25Groups: Array<{
  title: string;
  rows: MixingWorkshopPage25Row[];
}> = [
  {
    title: "1. ระบบไฟฟ้าแรงสูง",
    rows: [
      { key: "1.1", label: "1.1 สายอากาศ", centerTop: 228.09 },
      { key: "1.2", label: "1.2 สายใต้ดิน", centerTop: 255.69 }
    ]
  },
  {
    title: "2. หม้อแปลงไฟฟ้า",
    rows: [
      { key: "2", label: "หม้อแปลงไฟฟ้า", centerTop: 283.28 }
    ]
  },
  {
    title: "3. ระบบไฟฟ้าแรงต่ำ",
    rows: [
      { key: "3.1", label: "3.1 แรงต่ำภายนอกอาคาร", centerTop: 338.52 },
      { key: "3.2", label: "3.2 แผงสวิตช์นอกอาคาร", centerTop: 366.12 },
      { key: "3.3", label: "3.3 แรงต่ำภายในอาคาร", centerTop: 393.72 },
      { key: "3.4", label: "3.4 แผงสวิตช์เมน", centerTop: 421.32 },
      { key: "3.5", label: "3.5 สายป้อน", centerTop: 448.91 },
      { key: "3.6", label: "3.6 แผงสวิตช์ย่อย", centerTop: 476.54 },
      { key: "3.7", label: "3.7 วงจรย่อยและอุปกรณ์ไฟฟ้า", centerTop: 504.14 },
      { key: "3.8", label: "3.8 สายป้อนสำหรับระบบประกอบอาคาร", centerTop: 531.74 }
    ]
  },
  {
    title: "ระบบไฟฟ้าและอุปกรณ์อื่น",
    rows: [
      { key: "4", label: "4. เครื่องกำเนิดไฟฟ้า", centerTop: 574.94 },
      { key: "5", label: "5. ระบบไฟฟ้าแสงสว่างฉุกเฉิน", centerTop: 602.53 },
      { key: "6", label: "6. ป้ายทางออกฉุกเฉิน", centerTop: 630.16 },
      { key: "7", label: "7. ระบบสัญญาณแจ้งเหตุเพลิงไหม้", centerTop: 657.76 },
      { key: "8", label: "8. ระบบป้องกันอันตรายจากฟ้าผ่า", centerTop: 693.76 }
    ]
  }
];

export const mixingWorkshopPage25Rows = mixingWorkshopPage25Groups.flatMap((group) => group.rows);

const threeMonthKeys = new Set(["3.4", "3.5", "3.6", "3.7", "3.8", "4", "5", "6", "7"]);

export const defaultMixingWorkshopPage25Checks: MixingWorkshopPage25Checks = Object.fromEntries(
  mixingWorkshopPage25Rows.map((row) => [row.key, threeMonthKeys.has(row.key) ? "three_month" : "six_month"])
);

export const defaultMixingWorkshopPage25Remarks: MixingWorkshopPage25Remarks = Object.fromEntries(
  mixingWorkshopPage25Rows.map((row) => [row.key, ""])
);

export const mixingWorkshopPage25ChoiceColumns: Record<
  MixingWorkshopPage24Frequency,
  readonly [number, number]
> = {
  two_week: [228.75, 273.75],
  one_month: [273.75, 320.25],
  three_month: [320.25, 369],
  six_month: [369, 411],
  annual: [411, 456.75]
};
