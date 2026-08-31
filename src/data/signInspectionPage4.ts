import type { MapLocationValue, TemplateImageSlot } from "../types";

export type SignInspectionPage4State = {
  signName: string;
  address: string;
  phone: string;
  fax: string;
  permitAuthority: string;
  permitDay: string;
  permitMonth: string;
  permitYear: string;
  planChoice: "has" | "none" | null;
  permitChoice: "noData" | "age" | null;
  signAgeMonths: string;
  mapLocation: MapLocationValue;
};

export const defaultSignInspectionPage4MapLocation: MapLocationValue = {
  placeName: "",
  address: "",
  latitude: "",
  longitude: "",
  googleMapsUrl: "",
  satellite: false,
  mapScreenshotUrl: "",
  mapImageSource: "upload",
  uploadedImageUrl: "",
  uploadedImageName: ""
};

export const defaultSignInspectionPage4State: SignInspectionPage4State = {
  signName: "",
  address: "",
  phone: "",
  fax: "",
  permitAuthority: "",
  permitDay: "",
  permitMonth: "",
  permitYear: "",
  planChoice: null,
  permitChoice: null,
  signAgeMonths: "",
  mapLocation: defaultSignInspectionPage4MapLocation
};

export const signInspectionPage4Checkboxes = {
  hasPlan: { centerX: 45.24, centerTop: 299.92 },
  noPlan: { centerX: 45.23, centerTop: 316.72 },
  noPermitData: { centerX: 46.44, centerTop: 367.45 },
  signAge: { centerX: 46.44, centerTop: 384.24 }
} as const;

export const signInspectionPage4MapSlot: TemplateImageSlot = {
  key: "sign_inspection_page4_map",
  label: "รูปแผนที่ตั้งป้าย",
  page: 4,
  type: "image",
  x: 27.75,
  y: 466.88,
  width: 481.31,
  height: 216.05,
  locked: true,
  recommendedSize: "ภาพแนวนอนประมาณ 1600 x 718 px",
  xObjectName: "Image45"
};
