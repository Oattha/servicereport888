export type SignInspectionPage9ChangeChoice = "none" | "changed" | null;
export type SignInspectionPage9Opinion = "usable" | "unusable" | null;

export type SignInspectionPage9SectionState = {
  changeChoice: SignInspectionPage9ChangeChoice;
  changeDetails: string;
  opinion: SignInspectionPage9Opinion;
  opinionDetails: string;
  otherEnabled: boolean;
  otherText: string;
};

export type SignInspectionPage9State = Record<string, SignInspectionPage9SectionState>;

type CheckboxPlacement = { centerX: number; centerTop: number };
type TextPlacement = { x: number; top: number; width: number; height: number };

export type SignInspectionPage9Section = {
  key: string;
  page: 9 | 10 | 11;
  title: string;
  noneLabel: string;
  changedLabel: string;
  changeCheckboxes: Record<"none" | "changed", CheckboxPlacement>;
  changeDetailsBox: TextPlacement;
  opinionCheckboxes: Record<"usable" | "unusable", CheckboxPlacement>;
  opinionDetailsBox: TextPlacement;
  otherCheckbox: CheckboxPlacement;
  otherTextBox: TextPlacement;
};

export const signInspectionPage9Sections: SignInspectionPage9Section[] = [
  {
    key: "sign_size",
    page: 9,
    title: "1. การตรวจสอบการต่อเติม ดัดแปลง หรือปรับปรุงขนาดของป้าย",
    noneLabel: "ไม่มีการต่อเติม ดัดแปลง หรือปรับปรุงขนาดของป้าย",
    changedLabel: "มีการต่อเติม ดัดแปลง หรือปรับปรุงขนาดของป้าย",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 231.2 },
      changed: { centerX: 233.55, centerTop: 231.2 }
    },
    changeDetailsBox: { x: 248, top: 251.5, width: 190, height: 44 },
    opinionCheckboxes: {
      usable: { centerX: 346.85, centerTop: 303.2 },
      unusable: { centerX: 381.85, centerTop: 303.2 }
    },
    opinionDetailsBox: { x: 248, top: 310.5, width: 190, height: 43 },
    otherCheckbox: { centerX: 233.55, centerTop: 379.8 },
    otherTextBox: { x: 248, top: 386.5, width: 190, height: 58 }
  },
  {
    key: "sign_weight",
    page: 9,
    title: "2. การตรวจสอบการเปลี่ยนแปลงน้ำหนักของแผ่นป้าย",
    noneLabel: "ไม่มีการเปลี่ยนแปลงน้ำหนักของแผ่นป้าย",
    changedLabel: "มีการเปลี่ยนแปลงน้ำหนักของแผ่นป้าย",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 493.1 },
      changed: { centerX: 233.55, centerTop: 493.1 }
    },
    changeDetailsBox: { x: 248, top: 513.5, width: 190, height: 44 },
    opinionCheckboxes: {
      usable: { centerX: 346.85, centerTop: 565.1 },
      unusable: { centerX: 381.85, centerTop: 565.1 }
    },
    opinionDetailsBox: { x: 248, top: 572.5, width: 190, height: 43 },
    otherCheckbox: { centerX: 233.55, centerTop: 641.9 },
    otherTextBox: { x: 248, top: 648.5, width: 190, height: 58 }
  },
  {
    key: "sign_material",
    page: 10,
    title: "3. การเปลี่ยนแปลงวัสดุของป้าย",
    noneLabel: "ไม่มีการเปลี่ยนแปลงวัสดุของป้าย",
    changedLabel: "มีการเปลี่ยนแปลงวัสดุของป้าย",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 103.1 },
      changed: { centerX: 233.55, centerTop: 103.1 }
    },
    changeDetailsBox: { x: 248, top: 123.5, width: 190, height: 59 },
    opinionCheckboxes: {
      usable: { centerX: 346.85, centerTop: 189.5 },
      unusable: { centerX: 381.85, centerTop: 189.5 }
    },
    opinionDetailsBox: { x: 248, top: 196.5, width: 190, height: 58 },
    otherCheckbox: { centerX: 233.55, centerTop: 280.7 },
    otherTextBox: { x: 248, top: 287.5, width: 190, height: 72 }
  },
  {
    key: "sign_deterioration",
    page: 10,
    title: "4. การชำรุดสึกหรอของป้าย",
    noneLabel: "ไม่มีการชำรุดสึกหรอ",
    changedLabel: "มีการชำรุดสึกหรอ",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 411.7 },
      changed: { centerX: 233.55, centerTop: 411.7 }
    },
    changeDetailsBox: { x: 248, top: 432.5, width: 190, height: 58 },
    opinionCheckboxes: {
      usable: { centerX: 342.55, centerTop: 498.1 },
      unusable: { centerX: 381.85, centerTop: 498.1 }
    },
    opinionDetailsBox: { x: 248, top: 505, width: 190, height: 58 },
    otherCheckbox: { centerX: 233.55, centerTop: 589.3 },
    otherTextBox: { x: 248, top: 596, width: 190, height: 115 }
  },
  {
    key: "sign_support_failure",
    page: 11,
    title: "5. การวิบัติของสิ่งที่สร้างขึ้นสำหรับติดหรือตั้งป้าย",
    noneLabel: "ไม่มีการวิบัติ",
    changedLabel: "มีการวิบัติ",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 97.6 },
      changed: { centerX: 233.55, centerTop: 97.6 }
    },
    changeDetailsBox: { x: 248, top: 118.5, width: 190, height: 58 },
    opinionCheckboxes: {
      usable: { centerX: 342.55, centerTop: 193.7 },
      unusable: { centerX: 381.85, centerTop: 193.7 }
    },
    opinionDetailsBox: { x: 248, top: 200.5, width: 190, height: 58 },
    otherCheckbox: { centerX: 233.55, centerTop: 299.3 },
    otherTextBox: { x: 248, top: 306.5, width: 190, height: 72 }
  },
  {
    key: "sign_foundation_settlement",
    page: 11,
    title: "6. การทรุดตัวของฐานรากของสิ่งที่สร้างขึ้นสำหรับติดหรือตั้งป้าย",
    noneLabel: "ไม่มีการทรุดตัว",
    changedLabel: "มีการทรุดตัว",
    changeCheckboxes: {
      none: { centerX: 70.45, centerTop: 428.9 },
      changed: { centerX: 233.55, centerTop: 428.9 }
    },
    changeDetailsBox: { x: 248, top: 449.5, width: 190, height: 58 },
    opinionCheckboxes: {
      usable: { centerX: 342.55, centerTop: 515.3 },
      unusable: { centerX: 379.85, centerTop: 515.3 }
    },
    opinionDetailsBox: { x: 248, top: 522.5, width: 190, height: 58 },
    otherCheckbox: { centerX: 233.55, centerTop: 611.3 },
    otherTextBox: { x: 248, top: 618.5, width: 190, height: 86 }
  }
];

export function getSignInspectionChangeSectionsForPage(page: number) {
  return signInspectionPage9Sections.filter((section) => section.page === page);
}

export const defaultSignInspectionPage9State: SignInspectionPage9State = Object.fromEntries(
  signInspectionPage9Sections.map((section) => [
    section.key,
    {
      changeChoice: null,
      changeDetails: "",
      opinion: null,
      opinionDetails: "",
      otherEnabled: false,
      otherText: ""
    }
  ])
);
