export type SignInspectionPage15Choice = "usable" | "unusable" | "fixed" | null;

export type SignInspectionPage15State = Record<string, SignInspectionPage15Choice>;

export type SignInspectionPage15Row = {
  key: string;
  number: string;
  label: string;
  centerTop: number;
};

export const signInspectionPage15Options: Array<{
  key: Exclude<SignInspectionPage15Choice, null>;
  label: string;
}> = [
  { key: "usable", label: "ใช้ได้" },
  { key: "unusable", label: "ใช้ไม่ได้" },
  { key: "fixed", label: "มีการแก้ไขแล้ว" }
];

export const signInspectionPage15ChoiceColumns = {
  usable: [219.75, 261],
  unusable: [261, 306],
  fixed: [306, 376.5]
} as const;

export const signInspectionPage15Rows: SignInspectionPage15Row[] = [
  { key: "installed_structure", number: "1", label: "สิ่งที่สร้างขึ้นสำหรับติดตั้งป้าย", centerTop: 146.4 },
  { key: "sign_panel", number: "2", label: "แผ่นป้าย", centerTop: 176.25 },
  { key: "lighting_system", number: "3", label: "ระบบไฟฟ้า แสงสว่าง", centerTop: 206.11 },
  { key: "lightning_protection", number: "4", label: "ระบบป้องกันฟ้าผ่า", centerTop: 235.97 },
  { key: "other_components", number: "5", label: "อุปกรณ์ประกอบต่าง ๆ", centerTop: 265.82 },
  { key: "other", number: "6", label: "อื่น ๆ", centerTop: 295.68 }
];

export const defaultSignInspectionPage15Choices: SignInspectionPage15State = {
  installed_structure: "usable",
  sign_panel: "usable",
  lighting_system: "usable",
  lightning_protection: "usable",
  other_components: null,
  other: null
};
