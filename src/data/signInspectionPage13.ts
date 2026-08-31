export type SignInspectionBinaryChoice = "yes" | "no" | null;
export type SignInspectionResultChoice = "usable" | "unusable" | null;

export type SignInspectionPage13RowState = {
  presence: SignInspectionBinaryChoice;
  wear: SignInspectionBinaryChoice;
  damage: SignInspectionBinaryChoice;
  result: SignInspectionResultChoice;
};

export type SignInspectionPage13State = Record<string, SignInspectionPage13RowState>;

export type SignInspectionPage13Row = {
  key: string;
  section: string;
  label: string;
  centerTop: number;
};

export const signInspectionPage13Columns = {
  presence: { yes: [219.75, 249.75], no: [249.75, 284.25] },
  wear: { yes: [284.25, 311.25], no: [311.25, 338.25] },
  damage: { yes: [338.25, 363], no: [363, 390] },
  result: { usable: [390, 426.75], unusable: [426.75, 468.75] }
} as const;

export const signInspectionPage13Groups = [
  {
    title: "(1) ระบบไฟฟ้าแสงสว่าง",
    rows: [
      { key: "lighting_fixture", section: "lighting", label: "โคมไฟฟ้า", centerTop: 192.5 },
      { key: "lighting_conduit", section: "lighting", label: "ท่อสาย", centerTop: 219.1 },
      { key: "lighting_control", section: "lighting", label: "อุปกรณ์ควบคุม", centerTop: 245.8 },
      { key: "lighting_ground", section: "lighting", label: "การต่อลงดิน", centerTop: 272.4 },
      { key: "lighting_other", section: "lighting", label: "อื่น ๆ (โปรดระบุ)", centerTop: 299 }
    ]
  },
  {
    title: "(2) ระบบป้องกันฟ้าผ่า (ถ้ามี)",
    rows: [
      { key: "lightning_air_terminal", section: "lightning", label: "ตัวนำล่อฟ้า", centerTop: 364 },
      { key: "lightning_down_conductor", section: "lightning", label: "ตัวนำต่อลงดิน", centerTop: 390.7 },
      { key: "lightning_grounding", section: "lightning", label: "รากสายดิน", centerTop: 417.3 },
      { key: "lightning_bonding", section: "lightning", label: "จุดต่อประสานศักย์", centerTop: 444 },
      { key: "lightning_other", section: "lightning", label: "อื่น ๆ (โปรดระบุ)", centerTop: 470.6 }
    ]
  },
  {
    title: "(3) อื่น ๆ (ถ้ามี)",
    rows: [
      { key: "other", section: "other", label: "อื่น ๆ", centerTop: 535.6 }
    ]
  }
] satisfies Array<{ title: string; rows: SignInspectionPage13Row[] }>;

const usableDefault = (): SignInspectionPage13RowState => ({
  presence: "yes",
  wear: "no",
  damage: "no",
  result: "usable"
});

const absentDefault = (): SignInspectionPage13RowState => ({
  presence: "no",
  wear: null,
  damage: null,
  result: null
});

export const defaultSignInspectionPage13State: SignInspectionPage13State = {
  lighting_fixture: usableDefault(),
  lighting_conduit: usableDefault(),
  lighting_control: usableDefault(),
  lighting_ground: usableDefault(),
  lighting_other: absentDefault(),
  lightning_air_terminal: usableDefault(),
  lightning_down_conductor: usableDefault(),
  lightning_grounding: usableDefault(),
  lightning_bonding: usableDefault(),
  lightning_other: absentDefault(),
  other: absentDefault()
};

export const signInspectionPage13Rows = signInspectionPage13Groups.flatMap((group) => group.rows);
