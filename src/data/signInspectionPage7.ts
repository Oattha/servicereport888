export type SignInspectionPage7TypeKey = "ground" | "rooftop" | "roof" | "buildingPart" | "other";

export type SignInspectionPage7Contact = {
  name: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
};

export type SignInspectionPage7Group = {
  productText: string;
  signOwner: SignInspectionPage7Contact;
  buildingOwner: SignInspectionPage7Contact;
  engineerName: string;
  engineerLicense: string;
};

export type SignInspectionPage7State = {
  signTypes: Record<SignInspectionPage7TypeKey, boolean>;
  otherTypeText: string;
  ground: SignInspectionPage7Group;
  building: SignInspectionPage7Group;
};

export const signInspectionPage7TypeOptions: Array<{
  key: SignInspectionPage7TypeKey;
  label: string;
  centerX: number;
  centerTop: number;
}> = [
  { key: "ground", label: "ป้ายที่ติดตั้งบนพื้นดิน", centerX: 143.65, centerTop: 78.45 },
  { key: "rooftop", label: "ป้ายบนดาดฟ้าอาคาร", centerX: 143.05, centerTop: 95.25 },
  { key: "roof", label: "ป้ายบนหลังคา", centerX: 142.45, centerTop: 112.05 },
  { key: "buildingPart", label: "ป้ายบนส่วนหนึ่งส่วนใดของอาคาร", centerX: 142.45, centerTop: 128.85 },
  { key: "other", label: "อื่น ๆ (ระบุ)", centerX: 142.45, centerTop: 145.65 }
];

export const signInspectionPage7GroupCheckboxes = {
  ground: { centerX: 236.45, centerTop: 206.75 },
  building: { centerX: 151.95, centerTop: 429.95 }
} as const;

function createEmptyContact(): SignInspectionPage7Contact {
  return { name: "", address: "", phone: "", fax: "", email: "" };
}

function createEmptyGroup(): SignInspectionPage7Group {
  return {
    productText: "",
    signOwner: createEmptyContact(),
    buildingOwner: createEmptyContact(),
    engineerName: "",
    engineerLicense: ""
  };
}

export const defaultSignInspectionPage7State: SignInspectionPage7State = {
  signTypes: {
    ground: false,
    rooftop: false,
    roof: false,
    buildingPart: false,
    other: false
  },
  otherTypeText: "",
  ground: createEmptyGroup(),
  building: createEmptyGroup()
};

export function hasBuildingMountedSign(state: SignInspectionPage7State) {
  return state.signTypes.rooftop
    || state.signTypes.roof
    || state.signTypes.buildingPart
    || state.signTypes.other;
}
