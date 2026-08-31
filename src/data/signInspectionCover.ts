import type { TemplateImageSlot } from "../types";

export const signInspectionCoverFieldKeys = {
  yearSuffix: "sign_inspection_cover_year_suffix",
  description: "sign_inspection_cover_description",
  companyName: "sign_inspection_cover_company_name"
} as const;

export const defaultSignInspectionCoverFields: Record<string, string> = {
  [signInspectionCoverFieldKeys.yearSuffix]: "69",
  [signInspectionCoverFieldKeys.description]: "ป้ายที่ติดตั้งบนพื้นดินที่มีความสูงตั้งแต่ 15 เมตรขึ้นไป\nหรือมีพื้นที่ตั้งแต่ 50 ตารางเมตรขึ้นไป",
  [signInspectionCoverFieldKeys.companyName]: "บริษัท เฌอร่า จำกัด (มหาชน)"
};

export const signInspectionCoverImageSlot: TemplateImageSlot = {
  key: "sign_inspection_cover_photo",
  label: "รูปภาพหน้าปกรายงานตรวจสอบป้าย",
  page: 2,
  type: "image",
  x: 30,
  y: 257.49,
  width: 480,
  height: 360,
  locked: true,
  recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
  xObjectName: "Image28"
};
