export type MixingWorkshopSummaryPage = 34 | 35;
export type MixingWorkshopSummaryChoice = "yes" | "no" | "fixed" | null;
export type MixingWorkshopSummaryChoices = Record<MixingWorkshopSummaryPage, Record<string, MixingWorkshopSummaryChoice>>;
export type MixingWorkshopSummaryRemarks = Record<MixingWorkshopSummaryPage, Record<string, string>>;

type SummaryRow = {
  key: string;
  label: string;
  centerTop: number;
  defaultChoice: MixingWorkshopSummaryChoice;
  defaultRemark?: string;
};
type SummaryGroup = { title: string; rows: SummaryRow[] };
export type MixingWorkshopSummaryDefinition = { page: MixingWorkshopSummaryPage; title: string; groups: SummaryGroup[] };

const group = (title: string, rows: Array<[string, string, number, MixingWorkshopSummaryChoice, string?]>): SummaryGroup => ({
  title,
  rows: rows.map(([key, label, centerTop, defaultChoice, defaultRemark]) => ({ key, label, centerTop, defaultChoice, defaultRemark }))
});

export const mixingWorkshopSummaryOptions: Array<{ key: Exclude<MixingWorkshopSummaryChoice, null>; label: string }> = [
  { key: "yes", label: "ใช่" },
  { key: "no", label: "ไม่ใช่" },
  { key: "fixed", label: "มีการแก้ไขแล้ว" }
];

export const mixingWorkshopPages34To35Definitions: MixingWorkshopSummaryDefinition[] = [
  { page: 34, title: "สรุปผลการตรวจสอบบำรุงรักษาอาคาร", groups: [
    group("1. ความมั่นคงแข็งแรงของอาคาร", [
      ["1.1", "1.1 การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", 334.9, "yes"],
      ["1.2", "1.2 การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", 352.9, "yes"],
      ["1.3", "1.3 การเปลี่ยนสภาพการใช้อาคาร", 370.9, "yes"],
      ["1.4", "1.4 การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", 388.9, "yes"],
      ["1.5", "1.5 การชำรุดสึกหรอของอาคาร", 406.9, "yes"],
      ["1.6", "1.6 การวิบัติของโครงสร้างอาคาร", 424.9, "yes"],
      ["1.7", "1.7 การทรุดตัวของฐานรากอาคาร", 442.9, "yes"]
    ]),
    group("2.1 ระบบบันไดหนีไฟและทางหนีไฟ", [
      ["2.1a", "ระบบบันไดหนีไฟ", 524.6, "yes"], ["2.1b", "ทางหนีไฟ", 542.6, "yes"],
      ["2.1c", "เครื่องหมายและไฟป้ายทางออกฉุกเฉิน", 560.6, "yes"], ["2.1d", "แบบแปลนเพื่อการดับเพลิง", 578.6, "yes"]
    ]),
    group("2.2 ระบบไฟฟ้าและระบบสัญญาณแจ้งเหตุเพลิงไหม้", [
      ["2.2a", "ระบบไฟฟ้าแรงสูง", 614.6, "yes"], ["2.2b", "หม้อแปลงไฟฟ้า", 632.5, "yes"],
      ["2.2c", "ระบบไฟฟ้าแรงต่ำ", 650.6, "yes"], ["2.2d", "เครื่องกำเนิดไฟฟ้า", 668.5, null, "-ไม่มี"],
      ["2.2e", "ระบบไฟฟ้าแสงสว่างฉุกเฉิน", 686.6, "yes"], ["2.2f", "ระบบแจ้งเหตุเพลิงไหม้", 704.6, "yes"],
      ["2.2g", "ระบบป้องกันอันตรายจากฟ้าผ่า", 722.6, "yes"]
    ])
  ]},
  { page: 35, title: "สรุปผลระบบประกอบและความปลอดภัย", groups: [
    group("2.3 ระบบเครื่องกลของอาคาร", [
      ["2.3a", "ระบบปรับอากาศแบบรวมศูนย์", 171.7, null, "-ไม่มี"], ["2.3b", "ระบบปรับอากาศแบบแยกส่วน", 189.9, "yes"],
      ["2.3c", "ระบบระบายอากาศ", 207.9, "yes"], ["2.3d", "ระบบลิฟต์", 225.9, "yes", "-ลิฟต์ขนของ"],
      ["2.3e", "ระบบบันไดเลื่อน", 243.8, null, "-ไม่มี"]
    ]),
    group("2.4 ระบบสุขาภิบาลของอาคาร", [
      ["2.4a", "ระบบประปา", 279.9, "yes"], ["2.4b", "ระบบระบายน้ำในอาคาร", 297.9, "yes"],
      ["2.4c", "ระบบระบายน้ำภายนอกอาคาร", 315.9, "yes"], ["2.4d", "บ่อบำบัดน้ำเสีย", 333.9, "yes"],
      ["2.4e", "ระบบจัดการมูลฝอย", 351.9, "yes"], ["2.4f", "ระบบดับเพลิง", 369.9, "yes"]
    ]),
    group("3. การตรวจสอบสมรรถนะของระบบและอุปกรณ์", [
      ["3.1", "3.1 สมรรถนะบันไดหนีไฟและทางหนีไฟ", 415.5, "yes"],
      ["3.2", "3.2 สมรรถนะเครื่องหมายและไฟป้ายทางออกฉุกเฉิน", 433.5, "yes"],
      ["3.3", "3.3 สมรรถนะระบบแจ้งสัญญาณเหตุเพลิงไหม้", 451.5, "yes"],
      ["3.4", "3.4 สมรรถนะระบบเครื่องกำเนิดไฟฟ้าสำรอง", 469.4, null, "-ไม่มี"],
      ["3.5", "3.5 สมรรถนะระบบดับเพลิงอัตโนมัติ", 487.5, "yes"]
    ]),
    group("4. ระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร", [
      ["4.1", "แผนการป้องกันและระงับอัคคีภัยในอาคาร", 551.1, "yes"],
      ["4.2", "แผนการซ้อมอพยพผู้ใช้อาคาร", 569.1, "yes"],
      ["4.3", "แผนการบริหารจัดการเกี่ยวกับความปลอดภัยในอาคาร", 587.1, "yes"],
      ["4.4", "แผนบริหารจัดการของผู้ตรวจสอบอาคาร", 605.1, "yes"]
    ])
  ]}
];

export const mixingWorkshopSummaryChoiceColumns: Record<Exclude<MixingWorkshopSummaryChoice, null>, readonly [number, number]> = {
  yes: [347.44, 370.88], no: [370.88, 397.67], fixed: [397.67, 457.55]
};
export const mixingWorkshopSummaryRemarkColumn = [457.55, 523.74] as const;

export const defaultMixingWorkshopPages34To35Choices = Object.fromEntries(
  mixingWorkshopPages34To35Definitions.map(({ page, groups }) => [page, Object.fromEntries(groups.flatMap((g) => g.rows).map((r) => [r.key, r.defaultChoice]))])
) as MixingWorkshopSummaryChoices;
export const defaultMixingWorkshopPages34To35Remarks = Object.fromEntries(
  mixingWorkshopPages34To35Definitions.map(({ page, groups }) => [page, Object.fromEntries(groups.flatMap((g) => g.rows).map((r) => [r.key, r.defaultRemark ?? ""]))])
) as MixingWorkshopSummaryRemarks;

export function getMixingWorkshopSummaryDefinition(page: number) {
  return mixingWorkshopPages34To35Definitions.find((definition) => definition.page === page);
}
