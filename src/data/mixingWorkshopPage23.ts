import type { MixingWorkshopPage24Frequency } from "./mixingWorkshopPage24";

export type MixingWorkshopPage23Checks = Record<string, MixingWorkshopPage24Frequency | null>;
export type MixingWorkshopPage23Remarks = Record<string, string>;

export const mixingWorkshopPage23Groups = [{
  title: "1. ความมั่นคงแข็งแรงของอาคาร",
  rows: [
    { key: "1", label: "1 การต่อเติม ดัดแปลง ปรับปรุงตัวอาคาร", centerTop: 267.38, defaultFrequency: "six_month" as const },
    { key: "2", label: "2 การเปลี่ยนแปลงน้ำหนักบรรทุกบนพื้นอาคาร", centerTop: 315.38, defaultFrequency: "three_month" as const },
    { key: "3", label: "3 การเปลี่ยนแปลงสภาพการใช้อาคาร", centerTop: 363.38, defaultFrequency: "three_month" as const },
    { key: "4", label: "4 การเปลี่ยนแปลงวัสดุก่อสร้างหรือวัสดุตกแต่งอาคาร", centerTop: 409, defaultFrequency: "six_month" as const },
    { key: "5", label: "5 การชำรุดสึกหรอของอาคาร", centerTop: 454.59, defaultFrequency: "three_month" as const },
    { key: "6", label: "6 การวิบัติของโครงสร้างอาคาร", centerTop: 482.19, defaultFrequency: "three_month" as const },
    { key: "7", label: "7 การทรุดตัวของฐานรากอาคาร", centerTop: 509.8, defaultFrequency: "three_month" as const }
  ]
}];

export const mixingWorkshopPage23Rows = mixingWorkshopPage23Groups.flatMap((group) => group.rows);
export const defaultMixingWorkshopPage23Checks: MixingWorkshopPage23Checks = Object.fromEntries(
  mixingWorkshopPage23Rows.map((row) => [row.key, row.defaultFrequency])
);
export const defaultMixingWorkshopPage23Remarks: MixingWorkshopPage23Remarks = Object.fromEntries(
  mixingWorkshopPage23Rows.map((row) => [row.key, ""])
);
export const mixingWorkshopPage23ChoiceColumns: Record<MixingWorkshopPage24Frequency, readonly [number, number]> = {
  two_week: [227.25, 273.75], one_month: [273.75, 320.25], three_month: [320.25, 369],
  six_month: [369, 411], annual: [411, 456.75]
};
