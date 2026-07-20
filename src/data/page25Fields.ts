import type { Page25SignatureState, TemplateImageSlot } from "../types";

export const defaultPage25Signatures: Page25SignatureState = {
  inspectorName: "",
  inspectorNote: "",
  inspectionDate: "",
  ownerName: "",
  ownerPosition: ""
};

export const page25SignatureSlots: TemplateImageSlot[] = [
  {
    key: "page25_inspector_signature",
    label: "ลายเซ็นผู้ตรวจสอบอาคาร",
    page: 26,
    type: "image",
    x: 132,
    y: 414,
    width: 178,
    height: 28,
    recommendedSize: "PNG พื้นหลังโปร่งใส หรือ JPG",
    locked: true
  },
  {
    key: "page25_owner_signature",
    label: "ลายเซ็นเจ้าของอาคาร / ผู้จัดการนิติบุคคล",
    page: 26,
    type: "image",
    x: 112,
    y: 105,
    width: 181,
    height: 30,
    recommendedSize: "PNG พื้นหลังโปร่งใส หรือ JPG",
    locked: true
  }
];
