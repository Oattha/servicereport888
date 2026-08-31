import type { TemplateImageSlot } from "../types";

export const signInspectionPages5To6ImageSlots: TemplateImageSlot[] = [
  {
    key: "sign_inspection_page5_photo_1",
    label: "รูปภาพป้ายที่ตรวจสอบ - รูปที่ 1",
    page: 5,
    type: "image",
    x: 113.2,
    y: 154.26,
    width: 313.6,
    height: 235.2,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image56"
  },
  {
    key: "sign_inspection_page5_photo_2",
    label: "รูปภาพป้ายที่ตรวจสอบ - รูปที่ 2",
    page: 5,
    type: "image",
    x: 113.2,
    y: 452.27,
    width: 313.6,
    height: 235.2,
    locked: true,
    recommendedSize: "อัตราส่วน 4:3 เช่น 1600 x 1200 px",
    xObjectName: "Image57"
  },
  {
    key: "sign_inspection_page6_photo_1",
    label: "รูปภาพป้ายที่ตรวจสอบ - รูปที่ 1",
    page: 6,
    type: "image",
    x: 47.55,
    y: 235.84,
    width: 444.89,
    height: 314.52,
    locked: true,
    recommendedSize: "อัตราส่วนประมาณ 1.42:1 เช่น 1600 x 1131 px",
    xObjectName: "Image60"
  }
];

export function getSignInspectionImageSlotsForPage(page: number) {
  return signInspectionPages5To6ImageSlots.filter((slot) => slot.page === page);
}
