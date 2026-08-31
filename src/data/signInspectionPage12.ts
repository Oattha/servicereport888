import type { SignInspectionPage13RowState } from "./signInspectionPage13";

export type SignInspectionPage12State = Record<string, SignInspectionPage13RowState>;

export type SignInspectionPage12Row = {
  key: string;
  label: string;
  centerTop: number;
};

export const signInspectionPage12Groups: Array<{
  title: string;
  rows: SignInspectionPage12Row[];
}> = [
  {
    title: "(1) สิ่งที่สร้างขึ้นสำหรับติดตั้งป้าย",
    rows: [
      { key: "foundation", label: "รากฐาน", centerTop: 214 },
      { key: "structure_connection", label: "การเชื่อมยึดสิ่งที่สร้างขึ้นสำหรับติดตั้งป้ายกับฐานรากหรืออาคาร", centerTop: 238 },
      { key: "components", label: "ชิ้นส่วน", centerTop: 290.8 },
      { key: "joint_bolt", label: "รอยต่อ - สลักเกลียว", centerTop: 329.2 },
      { key: "joint_weld", label: "รอยต่อ - การเชื่อม", centerTop: 343.6 },
      { key: "joint_other", label: "รอยต่อ - อื่น ๆ", centerTop: 358 },
      { key: "guy_wire", label: "สลิงหรือสายยึด", centerTop: 396.5 },
      { key: "maintenance_ladder", label: "บันไดสำหรับการซ่อมบำรุง", centerTop: 420.5 },
      { key: "catwalk", label: "CATWALK", centerTop: 444.5 },
      { key: "structure_other", label: "อื่น ๆ (โปรดระบุ)", centerTop: 468.5 }
    ]
  },
  {
    title: "(2) แผ่นป้าย",
    rows: [
      { key: "sign_condition", label: "สภาพของแผ่นป้าย", centerTop: 530.9 },
      { key: "sign_attachment", label: "สภาพการยึดติดกับโครงสร้างรับป้าย", centerTop: 554.9 },
      { key: "sign_other", label: "อื่น ๆ (โปรดระบุ)", centerTop: 593.3 }
    ]
  }
];

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

const emptyDefault = (): SignInspectionPage13RowState => ({
  presence: null,
  wear: null,
  damage: null,
  result: null
});

export const defaultSignInspectionPage12State: SignInspectionPage12State = {
  foundation: usableDefault(),
  structure_connection: usableDefault(),
  components: usableDefault(),
  joint_bolt: usableDefault(),
  joint_weld: usableDefault(),
  joint_other: emptyDefault(),
  guy_wire: absentDefault(),
  maintenance_ladder: usableDefault(),
  catwalk: absentDefault(),
  structure_other: absentDefault(),
  sign_condition: usableDefault(),
  sign_attachment: usableDefault(),
  sign_other: absentDefault()
};

export const signInspectionPage12Rows = signInspectionPage12Groups.flatMap((group) => group.rows);
