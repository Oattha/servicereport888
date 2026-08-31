export type MixingWorkshopPage14Frequency = "four_month" | "six_month" | "annual";

export type MixingWorkshopPage14Checks = Record<string, MixingWorkshopPage14Frequency | null>;

export type MixingWorkshopPage14Row = {
  key: string;
  label: string;
  centerTop: number;
};

export const mixingWorkshopPage14FrequencyOptions: Array<{
  key: MixingWorkshopPage14Frequency;
  label: string;
}> = [
  { key: "four_month", label: "ทุก 4 เดือน" },
  { key: "six_month", label: "ทุก 6 เดือน" },
  { key: "annual", label: "ประจำปี" }
];

export const mixingWorkshopPage14Groups: Array<{
  title: string;
  rows: MixingWorkshopPage14Row[];
}> = [
  {
    title: "1. การตรวจสอบความมั่นคงแข็งแรงของอาคาร",
    rows: [
      { key: "1.1", label: "1.1 การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", centerTop: 217.5 },
      { key: "1.2", label: "1.2 การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", centerTop: 235.5 },
      { key: "1.3", label: "1.3 การเปลี่ยนสภาพการใช้งาน", centerTop: 253.51 },
      { key: "1.4", label: "1.4 การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", centerTop: 271.54 },
      { key: "1.5", label: "1.5 การชำรุดสึกหรอของอาคาร", centerTop: 307.54 },
      { key: "1.6", label: "1.6 การวิบัติของโครงสร้างอาคาร", centerTop: 325.54 },
      { key: "1.7", label: "1.7 การทรุดตัวของฐานรากอาคาร", centerTop: 343.54 }
    ]
  },
  {
    title: "2.1 ระบบบริการและอำนวยความสะดวก",
    rows: [
      { key: "2.1.1", label: "2.1.1 ระบบลิฟต์", centerTop: 433.57 },
      { key: "2.1.2", label: "2.1.2 ระบบบันไดเลื่อน", centerTop: 451.57 },
      { key: "2.1.3", label: "2.1.3 ระบบไฟฟ้า", centerTop: 469.57 },
      { key: "2.1.4", label: "2.1.4 ระบบปรับอากาศ", centerTop: 487.57 }
    ]
  },
  {
    title: "2.2 ระบบสุขอนามัยและสิ่งแวดล้อม",
    rows: [
      { key: "2.2.1", label: "2.2.1 ระบบประปา", centerTop: 523.57 },
      { key: "2.2.2", label: "2.2.2 ระบบระบายน้ำเสียและระบบบำบัด", centerTop: 541.57 },
      { key: "2.2.3", label: "2.2.3 ระบบระบายน้ำฝน", centerTop: 559.56 },
      { key: "2.2.4", label: "2.2.4 ระบบจัดการมูลฝอย", centerTop: 577.59 },
      { key: "2.2.5", label: "2.2.5 ระบบระบายอากาศ", centerTop: 595.59 },
      { key: "2.2.6", label: "2.2.6 ระบบควบคุมมลพิษทางอากาศและเสียง", centerTop: 613.59 }
    ]
  },
  {
    title: "2.3 ระบบป้องกันและระงับอัคคีภัย",
    rows: [
      { key: "2.3.1", label: "2.3.1 บันไดหนีไฟและทางหนีไฟ", centerTop: 649.59 },
      { key: "2.3.2", label: "2.3.2 เครื่องหมายและไฟป้ายบอกทางออกฉุกเฉิน", centerTop: 667.59 },
      { key: "2.3.3", label: "2.3.3 ระบบระบายควันและควบคุมการแพร่กระจายควัน", centerTop: 685.59 }
    ]
  }
];

export const mixingWorkshopPage14Rows = mixingWorkshopPage14Groups.flatMap((group) => group.rows);

export const defaultMixingWorkshopPage14Checks: MixingWorkshopPage14Checks = Object.fromEntries(
  mixingWorkshopPage14Rows.map((row) => [
    row.key,
    row.key === "2.1.1" || row.key === "2.1.2" ? "six_month" : "four_month"
  ])
);

export type MixingWorkshopPage15Checks = MixingWorkshopPage14Checks;
export type MixingWorkshopRemarks = Record<string, string>;

export const mixingWorkshopPage15Groups: Array<{
  title: string;
  rows: MixingWorkshopPage14Row[];
}> = [
  {
    title: "2.3 ระบบป้องกันและระงับอัคคีภัย (ต่อ)",
    rows: [
      { key: "2.3.4", label: "2.3.4 ระบบไฟฟ้าสำรองฉุกเฉิน", centerTop: 132.16 },
      { key: "2.3.5", label: "2.3.5 ระบบลิฟต์ดับเพลิง", centerTop: 150.16 },
      { key: "2.3.6", label: "2.3.6 ระบบสัญญาณแจ้งเหตุเพลิงไหม้", centerTop: 168.2 },
      { key: "2.3.7", label: "2.3.7 ระบบการติดตั้งอุปกรณ์ดับเพลิง", centerTop: 186.2 },
      { key: "2.3.8", label: "2.3.8 ระบบการจ่ายน้ำดับเพลิง เครื่องสูบน้ำดับเพลิง และหัวฉีดน้ำดับเพลิง", centerTop: 204.2 },
      { key: "2.3.9", label: "2.3.9 ระบบดับเพลิงอัตโนมัติ", centerTop: 240.2 },
      { key: "2.3.10", label: "2.3.10 ระบบป้องกันฟ้าผ่า", centerTop: 258.2 },
      { key: "2.3.11", label: "2.3.11 แบบแปลนเพื่อการดับเพลิง", centerTop: 276.2 }
    ]
  },
  {
    title: "3. การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่าง ๆ",
    rows: [
      { key: "3.1", label: "3.1 สมรรถนะบันไดหนีไฟและทางหนีไฟ", centerTop: 330.22 },
      { key: "3.2", label: "3.2 สมรรถนะเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", centerTop: 348.22 },
      { key: "3.3", label: "3.3 สมรรถนะสัญญาณแจ้งเหตุเพลิงไหม้", centerTop: 384.22 },
      { key: "3.4", label: "3.4 สมรรถนะระบบดับเพลิงอัตโนมัติ", centerTop: 402.22 },
      { key: "3.5", label: "3.5 สมรรถนะระบบเครื่องสูบน้ำดับเพลิง", centerTop: 420.22 },
      { key: "3.6", label: "3.6 สมรรถนะเครื่องกำเนิดไฟฟ้าสำรอง", centerTop: 438.22 }
    ]
  },
  {
    title: "4. การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร",
    rows: [
      { key: "4.1", label: "4.1 แผนการป้องกันและระงับอัคคีภัยในอาคาร", centerTop: 510.25 },
      { key: "4.2", label: "4.2 แผนการซ้อมอพยพผู้ใช้อาคาร", centerTop: 528.25 },
      { key: "4.3", label: "4.3 แผนการบริหารจัดการเกี่ยวกับความปลอดภัยในอาคาร", centerTop: 546.25 },
      { key: "4.4", label: "4.4 แผนการบริหารจัดการของผู้ตรวจสอบอาคาร", centerTop: 582.25 }
    ]
  }
];

export const mixingWorkshopPage15Rows = mixingWorkshopPage15Groups.flatMap((group) => group.rows);

export const defaultMixingWorkshopPage15Checks: MixingWorkshopPage15Checks = Object.fromEntries(
  mixingWorkshopPage15Rows.map((row) => [
    row.key,
    row.key.startsWith("2.3.") ? "four_month" : "six_month"
  ])
);

export const defaultMixingWorkshopRemarks: MixingWorkshopRemarks = Object.fromEntries(
  [...mixingWorkshopPage14Rows, ...mixingWorkshopPage15Rows].map((row) => [row.key, ""])
);

export const mixingWorkshopPage14ChoiceColumns: Record<
  MixingWorkshopPage14Frequency,
  readonly [number, number]
> = {
  four_month: [298.88, 358.33],
  six_month: [358.33, 414.42],
  annual: [414.42, 468]
};
