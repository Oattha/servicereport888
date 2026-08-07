import type { Page14CheckboxKey, Page14CheckboxState } from "../types";

export type Page14CheckboxGroup = {
  key: string;
  label: string;
  selection: "single" | "multiple";
  options: Array<{
    key: Page14CheckboxKey;
    label: string;
    mcid: number;
    defaultChecked: boolean;
  }>;
};

export const page14CheckboxGroups: Page14CheckboxGroup[] = [
  {
    key: "original_plan",
    label: "แบบแปลนเดิม",
    selection: "single",
    options: [
      { key: "has_original_plan", label: "มี แบบแปลนเดิม", mcid: 8, defaultChecked: true },
      { key: "has_no_original_plan", label: "ไม่มี แบบแปลนเดิม", mcid: 10, defaultChecked: false }
    ]
  },
  {
    key: "regulation_33",
    label: "การบังคับตามกฎกระทรวง ฉบับที่ 33",
    selection: "single",
    options: [
      {
        key: "is_under_regulation_33",
        label: "อยู่ในบังคับตามกฎกระทรวง ฉบับที่ 33",
        mcid: 15,
        defaultChecked: false
      },
      {
        key: "is_not_under_regulation_33",
        label: "ไม่อยู่ในบังคับตามกฎกระทรวง ฉบับที่ 33",
        mcid: 69,
        defaultChecked: true
      }
    ]
  },
  {
    key: "regulation_33_reasons",
    label: "เหตุผลประกอบ",
    selection: "multiple",
    options: [
      {
        key: "has_permit_before_regulation_33",
        label: "ได้รับใบอนุญาตก่อสร้างอาคารก่อนกฎกระทรวง ฉบับที่ 33 มีผลบังคับใช้",
        mcid: 33,
        defaultChecked: false
      },
      {
        key: "is_not_high_rise_or_large_building",
        label: "ไม่เป็นอาคารสูง หรืออาคารขนาดใหญ่พิเศษ",
        mcid: 36,
        defaultChecked: true
      }
    ]
  },
  {
    key: "controlled_use",
    label: "อาคารประเภทควบคุมการใช้",
    selection: "single",
    options: [
      {
        key: "is_controlled_use_building",
        label: "เป็นอาคารประเภทควบคุมการใช้",
        mcid: 133,
        defaultChecked: true
      },
      {
        key: "is_not_controlled_use_building",
        label: "ไม่เป็นอาคารประเภทควบคุมการใช้",
        mcid: 144,
        defaultChecked: false
      }
    ]
  }
];

export const page14CheckboxOptions = page14CheckboxGroups.flatMap((group) =>
  group.options.map((option) => ({ ...option, groupKey: group.key, selection: group.selection }))
);

export const defaultPage14Checkboxes = Object.fromEntries(
  page14CheckboxOptions.map((option) => [option.key, option.defaultChecked])
) as Page14CheckboxState;
