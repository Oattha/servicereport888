import type { TemplateField, TemplateImageSlot } from "../types";

export const annualInspectionTemplate = {
  id: "TMP-ANNUAL-2568",
  name: "รายงานตรวจสอบอาคาร (ประจำปี)",
  version: "1.0",
  pages: 25,
  fontFamily: "Noto Sans Thai",
  mode: "locked-layout",
  designSize: {
    width: 1080,
    height: 1560
  }
};

export const coverTextSlots = {
  reportYear: {
    x: 615,
    y: 274,
    width: 335,
    height: 118
  },
  ownerCompany: {
    x: 124,
    y: 1198,
    width: 832,
    height: 72
  }
};

export const templateFields: TemplateField[] = [
  {
    key: "owner_company",
    label: "ชื่อบริษัท / เจ้าของอาคาร",
    page: 1,
    type: "text",
    x: 102,
    y: 642,
    width: 390,
    height: 28,
    locked: true
  },
  {
    key: "building_name",
    label: "ชื่ออาคาร",
    page: 1,
    type: "text",
    x: 493,
    y: 642,
    width: 120,
    height: 28,
    locked: true
  },
  {
    key: "inspection_date",
    label: "วันที่ตรวจสอบ",
    page: 1,
    type: "date",
    x: 706,
    y: 756,
    width: 116,
    height: 24,
    locked: true
  },
  {
    key: "inspection_time",
    label: "เวลา",
    page: 1,
    type: "time",
    x: 706,
    y: 812,
    width: 140,
    height: 24,
    locked: true
  },
  {
    key: "inspector_signature",
    label: "ลายเซ็นผู้ตรวจสอบ",
    page: 1,
    type: "signature",
    x: 118,
    y: 790,
    width: 146,
    height: 42,
    locked: true
  }
];

export const imageSlots: TemplateImageSlot[] = [
  {
    key: "cover_building_photo",
    label: "รูปหน้าอาคารบนหน้าปก",
    page: 1,
    type: "image",
    x: 106,
    y: 452,
    width: 860,
    height: 525,
    recommendedSize: "16:7 หรือ 1600 x 700 px",
    xObjectName: "Im0",
    locked: true
  },
  {
    key: "cover_line_qr",
    label: "QR / ID LINE บนหน้าปก",
    page: 1,
    type: "image",
    x: 810,
    y: 865,
    width: 145,
    height: 145,
    recommendedSize: "สี่เหลี่ยมจัตุรัส เช่น 600 x 600 px",
    xObjectName: "Im3",
    locked: true
  },
  {
    key: "map_image",
    label: "รูปแผนที่อาคาร",
    page: 1,
    type: "image",
    x: 108,
    y: 920,
    width: 864,
    height: 180,
    recommendedSize: "ประมาณ 1400 x 400 px",
    locked: true
  }
];
