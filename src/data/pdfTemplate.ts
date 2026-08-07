import type { TemplateField, TemplateImageSlot } from "../types";

export const annualInspectionTemplate = {
  id: "TMP-ANNUAL-2568",
  name: "รายงานตรวจสอบอาคาร (ประจำปี)",
  version: "1.0",
  pages: 26,
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
    key: "cover_year",
    label: "ปีรายงาน",
    page: 1,
    type: "text",
    x: 615,
    y: 274,
    width: 335,
    height: 118,
    locked: true
  },
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
    key: "building_address",
    label: "ที่อยู่อาคาร",
    page: 1,
    type: "text",
    x: 108,
    y: 920,
    width: 864,
    height: 28,
    locked: true
  },
  {
    key: "building_description",
    label: "ลักษณะ / ประเภทอาคาร",
    page: 1,
    type: "text",
    x: 270,
    y: 72,
    width: 420,
    height: 20,
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
  },
  {
    key: "general_owner_company",
    label: "ชื่อบริษัท / เจ้าของอาคาร",
    page: 14,
    type: "text",
    x: 83,
    y: 541,
    width: 410,
    height: 13,
    locked: true,
    sourceKey: "owner_company"
  },
  {
    key: "general_building_name",
    label: "ชื่ออาคาร",
    page: 14,
    type: "text",
    x: 83,
    y: 541,
    width: 410,
    height: 13,
    locked: true,
    sourceKey: "building_name"
  },
  {
    key: "general_building_address",
    label: "ที่อยู่อาคาร",
    page: 14,
    type: "text",
    x: 83,
    y: 525,
    width: 410,
    height: 39,
    locked: true,
    sourceKey: "building_address"
  }
];

export const defaultTemplateFieldValues: Record<string, string> = {
  cover_year: "2568",
  owner_company: "บริษัท บางชันเยนเนอเรลเซชเมนส์ จำกัด",
  building_name: "อาคาร WS",
  building_address:
    "ตั้งอยู่เลขที่ 335/12 หมู่ที่ 9 ซอยเทศา - ถนนบางนา-ตราด กม.19 ตำบล/แขวง บางโฉลง อำเภอ/เขต บางพลี จังหวัด สมุทรปราการ รหัสไปรษณีย์ 10540 โทรศัพท์ - โทรสาร -",
  building_description: "อาคารโรงงานสูงมากกว่า 1 ชั้น",
  building_permit_date: "2017-12-27",
  controlled_use_permit_date: "2018-09-28",
  inspection_date: "",
  inspection_time: ""
};

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
    page: 15,
    type: "image",
    x: 115,
    y: 405,
    width: 853,
    height: 652,
    recommendedSize: "ประมาณ 1400 x 400 px",
    locked: true
  },
  {
    key: "page16_image_1",
    label: "Page 16 Image 1",
    page: 16,
    type: "image",
    x: 235.636,
    y: 306.159,
    width: 566.929,
    height: 425.197,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im2",
    locked: true
  },
  {
    key: "page16_image_2",
    label: "Page 16 Image 2",
    page: 16,
    type: "image",
    x: 235.636,
    y: 828.645,
    width: 566.929,
    height: 425.197,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im3",
    locked: true
  },
  {
    key: "page19_image_1",
    label: "Page 19 Image 1",
    page: 19,
    type: "image",
    x: 135.441,
    y: 413.436,
    width: 368.504,
    height: 276.378,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im2",
    locked: true
  },
  {
    key: "page19_image_2",
    label: "Page 19 Image 2",
    page: 19,
    type: "image",
    x: 567.034,
    y: 413.436,
    width: 368.504,
    height: 276.378,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im3",
    locked: true
  },
  {
    key: "page19_image_3",
    label: "Page 19 Image 3",
    page: 19,
    type: "image",
    x: 135.441,
    y: 780,
    width: 368.504,
    height: 276.378,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im5",
    locked: true
  },
  {
    key: "page19_image_4",
    label: "Page 19 Image 4",
    page: 19,
    type: "image",
    x: 566.328,
    y: 780,
    width: 368.504,
    height: 276.378,
    recommendedSize: "4:3 เช่น 1600 x 1200 px",
    xObjectName: "Im4",
    locked: true
  }
];
