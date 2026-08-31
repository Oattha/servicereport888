import type { TemplateImageSlot } from "../types";

export type SignInspectionPage8MaterialKey =
  | "structuralSteel"
  | "wood"
  | "stainlessSteel"
  | "reinforcedConcrete"
  | "other";

export type SignInspectionPage8State = {
  materials: Record<SignInspectionPage8MaterialKey, boolean>;
  otherMaterialText: string;
  signMaterialEnabled: boolean;
  signMaterialText: string;
  sideCountEnabled: boolean;
  sideCount: string;
  openingEnabled: boolean;
  openingChoice: "yes" | "no" | null;
  otherUsageEnabled: boolean;
  otherUsageText: string;
};

export const signInspectionPage8MaterialOptions: Array<{
  key: SignInspectionPage8MaterialKey;
  label: string;
  centerX: number;
  centerTop: number;
}> = [
  { key: "structuralSteel", label: "เหล็กโครงสร้างรูปพรรณ", centerX: 129.84, centerTop: 142.07 },
  { key: "wood", label: "ไม้", centerX: 129.84, centerTop: 158.87 },
  { key: "stainlessSteel", label: "สแตนเลส", centerX: 129.84, centerTop: 175.66 },
  { key: "reinforcedConcrete", label: "คอนกรีตเสริมเหล็ก", centerX: 129.84, centerTop: 192.49 },
  { key: "other", label: "อื่น ๆ (ระบุ)", centerX: 129.84, centerTop: 209.29 }
];

export const signInspectionPage8UsageCheckboxes = {
  signMaterial: { centerX: 129.84, centerTop: 259.69 },
  sideCount: { centerX: 129.84, centerTop: 276.49 },
  opening: { centerX: 129.84, centerTop: 293.29 },
  openingYes: { centerX: 172.2, centerTop: 310.09 },
  openingNo: { centerX: 203.28, centerTop: 310.09 },
  other: { centerX: 129.84, centerTop: 326.89 }
} as const;

export const defaultSignInspectionPage8State: SignInspectionPage8State = {
  materials: {
    structuralSteel: false,
    wood: false,
    stainlessSteel: false,
    reinforcedConcrete: false,
    other: false
  },
  otherMaterialText: "",
  signMaterialEnabled: false,
  signMaterialText: "",
  sideCountEnabled: false,
  sideCount: "",
  openingEnabled: false,
  openingChoice: null,
  otherUsageEnabled: false,
  otherUsageText: ""
};

export const signInspectionPage8ImageSlots: TemplateImageSlot[] = [
  {
    key: "sign_inspection_page8_photo_1",
    label: "วัสดุของสิ่งที่สร้างขึ้นสำหรับติดหรือตั้งป้าย - รูปที่ 1",
    page: 8,
    type: "image",
    x: 70.75,
    y: 364.5,
    width: 160,
    height: 120,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image68"
  },
  {
    key: "sign_inspection_page8_photo_2",
    label: "วัสดุของสิ่งที่สร้างขึ้นสำหรับติดหรือตั้งป้าย - รูปที่ 2",
    page: 8,
    type: "image",
    x: 317.41,
    y: 364.5,
    width: 160,
    height: 120,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image65"
  },
  {
    key: "sign_inspection_page8_photo_3",
    label: "วัสดุของป้าย - รูปที่ 1",
    page: 8,
    type: "image",
    x: 65.59,
    y: 555.78,
    width: 160,
    height: 120,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image66"
  },
  {
    key: "sign_inspection_page8_photo_4",
    label: "วัสดุของป้าย - รูปที่ 2",
    page: 8,
    type: "image",
    x: 317.41,
    y: 555.78,
    width: 160,
    height: 120,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image67"
  }
];
