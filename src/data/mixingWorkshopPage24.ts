export type MixingWorkshopPage24Frequency =
  | "two_week"
  | "one_month"
  | "three_month"
  | "six_month"
  | "annual";

export type MixingWorkshopPage24Checks = Record<string, MixingWorkshopPage24Frequency | null>;
export type MixingWorkshopPage24Remarks = Record<string, string>;

export type MixingWorkshopPage24Row = {
  key: string;
  label: string;
  centerTop: number;
};

export const mixingWorkshopPage24FrequencyOptions: Array<{
  key: MixingWorkshopPage24Frequency;
  label: string;
}> = [
  { key: "two_week", label: "2 สัปดาห์" },
  { key: "one_month", label: "1 เดือน" },
  { key: "three_month", label: "3 เดือน" },
  { key: "six_month", label: "6 เดือน" },
  { key: "annual", label: "1 ปี" }
];

export const mixingWorkshopPage24Groups: Array<{
  title: string;
  rows: MixingWorkshopPage24Row[];
}> = [
  {
    title: "1. ระบบบันไดหนีไฟ",
    rows: [
      { key: "1.1", label: "1.1 สภาพราวจับ และราวกันตก", centerTop: 228.09 },
      { key: "1.2", label: "1.2 อุปสรรคกีดขวางตลอดเส้นทางของบันไดหนีไฟ", centerTop: 255.69 },
      { key: "1.3", label: "1.3 การปิด-เปิดประตูเข้า-ออกบันไดหนีไฟ", centerTop: 301.32 }
    ]
  },
  {
    title: "2. ทางหนีไฟ",
    rows: [
      { key: "2.1", label: "2.1 ความส่องสว่างของแสงไฟบนเส้นทางหนีไฟ", centerTop: 374.52 },
      { key: "2.2", label: "2.2 อุปสรรคกีดขวางตลอดเส้นทางจนถึงเส้นทางออกสู่ภายนอกอาคาร", centerTop: 413.37 },
      { key: "2.3", label: "2.3 การปิด-เปิดประตูตลอดเส้นทาง", centerTop: 454.63 }
    ]
  },
  {
    title: "3. เครื่องหมายและไฟป้ายทางออกฉุกเฉิน",
    rows: [
      { key: "3.1", label: "สภาพและการทำงานของเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", centerTop: 525.88 }
    ]
  },
  {
    title: "4. แบบแปลนเพื่อการดับเพลิง",
    rows: [
      { key: "4.1", label: "แบบแปลนพื้นทุกชั้นของอาคารเพื่อการดับเพลิง", centerTop: 596.25 }
    ]
  }
];

export const mixingWorkshopPage24Rows = mixingWorkshopPage24Groups.flatMap((group) => group.rows);

export const defaultMixingWorkshopPage24Checks: MixingWorkshopPage24Checks = Object.fromEntries(
  mixingWorkshopPage24Rows.map((row) => [row.key, "one_month"])
);

export const defaultMixingWorkshopPage24Remarks: MixingWorkshopPage24Remarks = Object.fromEntries(
  mixingWorkshopPage24Rows.map((row) => [row.key, ""])
);

export const mixingWorkshopPage24ChoiceColumns: Record<
  MixingWorkshopPage24Frequency,
  readonly [number, number]
> = {
  two_week: [227.25, 273.75],
  one_month: [273.75, 320.25],
  three_month: [320.25, 369],
  six_month: [369, 411],
  annual: [411, 456.75]
};

export const mixingWorkshopPage24RemarkColumn = [456.75, 522.75] as const;
