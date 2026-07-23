import type { InspectionFrequency } from "./data/inspectionChecklist";
import type { MaintenancePlanPage7Checks } from "./data/maintenancePlanPage7";
import type { MaintenancePlanPage8Checks } from "./data/maintenancePlanPage8";
import type { MaintenancePlanPages9To16Checks } from "./data/maintenancePlanPages9To16";
import type { MaintenancePlanPage18Values } from "./data/maintenancePlanPage18";
import type {
  MaintenancePlanPage19SignatureState,
  MaintenancePlanPage19Values
} from "./data/maintenancePlanPage19";

export type AppSection = "reports" | "my-reports" | "all-reports" | "users";

export type ReportStatus = "Draft" | "In Review" | "Ready" | "Sent";

export type Report = {
  id: string;
  customer: string;
  building: string;
  template: string;
  inspector: string;
  updatedAt: string;
  status: ReportStatus;
  progress: number;
};

export type SharedReport = {
  id: string;
  reportNo: string;
  customer: string;
  building: string;
  template: string;
  inspector: string;
  status: "draft" | "in_review" | "ready" | "sent";
  progress: number;
  recipientEmail?: string | null; 
  emailSentAt?: string | null;    
  updatedAt: string;
};

export type Template = {
  id: string;
  name: string;
  pages: number;
  version: string;
  lockedFields: number;
  lastUpdated: string;
  active: boolean;
};

export type UserRole = "admin" | "user";

export type UserStatus = "active" | "inactive";

export type UserRecord = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
};

export type TemplateFieldType = "text" | "date" | "time" | "checkbox" | "image" | "signature";

export type TemplateField = {
  key: string;
  label: string;
  page: number;
  type: TemplateFieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: true;
  sourceKey?: string;
};

export type TemplateImageSlot = TemplateField & {
  type: "image";
  recommendedSize: string;
  xObjectName?: string;
};

export type TemplateImageEdit = {
  slotKey: string;
  objectUrl: string;
  fileName: string;
};

export type MapLocationValue = {
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  mapScreenshotUrl: string;
  uploadedImageUrl: string;
  uploadedImageName: string;
  mapImageSource: "capture" | "upload" | "";
  satellite: boolean;
  placeName: string;
  address: string;
};

export type TemplateTextEdit = {
  fieldKey: string;
  value: string;
};

export type TemplatePageSize = {
  width: number;
  height: number;
};

export type Page14CheckboxKey =
  | "has_original_plan"
  | "has_no_original_plan"
  | "is_under_regulation_33"
  | "is_not_under_regulation_33"
  | "has_permit_before_regulation_33"
  | "is_not_high_rise_or_large_building"
  | "is_controlled_use_building"
  | "is_not_controlled_use_building";

export type Page14CheckboxState = Record<Page14CheckboxKey, boolean>;

export type Page17PartyFieldKey =
  | "name"
  | "house_number"
  | "moo"
  | "road"
  | "subdistrict"
  | "district"
  | "province"
  | "postal_code";

export type Page17PartyDetails = Record<Page17PartyFieldKey, string>;
export type Page17PartyOverrides = Partial<Page17PartyDetails>;

export type Page17BuildingTypeKey =
  | "high_rise"
  | "extra_large"
  | "assembly"
  | "theater"
  | "hotel_80_rooms"
  | "entertainment_venue_200_sqm"
  | "residential_2000_sqm"
  | "factory_5000_sqm"
  | "other";

export type Page17BuildingTypeState = Record<Page17BuildingTypeKey, boolean>;

export type Page18CheckboxKey =
  | "has_above_ground_floors"
  | "has_basement_floors"
  | "has_access_road"
  | "has_other_building_info"
  | "uses_permitted_purpose"
  | "uses_current_purpose"
  | "stores_flammable_material"
  | "stores_hazardous_material"
  | "stores_combustible_material"
  | "stores_fuel_oil"
  | "stores_gas"
  | "stores_chemical"
  | "stores_other_material";

export type Page18CheckboxState = Record<Page18CheckboxKey, boolean>;

export type Page18MaterialKey =
  | "flammable"
  | "hazardous"
  | "combustible"
  | "fuel_oil"
  | "gas"
  | "chemical";

export type Page18MaterialDetail = {
  type: string;
  quantity: string;
  storage: string;
};

export type Page18MaterialDetails = Record<Page18MaterialKey, Page18MaterialDetail>;

export type Page18TextState = {
  structureDescription: string;
  aboveGroundFloors: string;
  basementFloors: string;
  accessRoadWidth: string;
  otherBuildingInfo: string;
  permittedUse: string;
  currentUse: string;
  otherMaterial: string;
};

export type Page25SignatureState = {
  inspectorName: string;
  inspectorNote: string;
  inspectionDate: string;
  ownerName: string;
  ownerPosition: string;
};

export type Page23Result = "usable" | "unusable" | "unavailable" | null;
export type Page23ResultState = Record<string, Page23Result>;
export type Page23RemarkState = Record<string, string>;

export type ReportTemplateId = "annual-inspection" | "maintenance-plan";

export type ReportRenderState = {
  templateId: ReportTemplateId;
  maintenancePlanPage7Checks: MaintenancePlanPage7Checks;
  maintenancePlanPage8Checks: MaintenancePlanPage8Checks;
  maintenancePlanPages9To16Checks: MaintenancePlanPages9To16Checks;
  maintenancePlanPage18Values: MaintenancePlanPage18Values;
  maintenancePlanPage19Values: MaintenancePlanPage19Values;
  maintenancePlanPage19Signature: MaintenancePlanPage19SignatureState;
  fieldValues: Record<string, string>;
  inspectionChecks: Record<string, InspectionFrequency | null>;
  page14Checks: Page14CheckboxState;
  page17Owner: Page17PartyOverrides;
  page17Occupant: Page17PartyOverrides;
  page17BuildingTypes: Page17BuildingTypeState;
  page17OtherText: string;
  page18Checks: Page18CheckboxState;
  page18Text: Page18TextState;
  page18Materials: Page18MaterialDetails;
  page23Results: Page23ResultState;
  page23Remarks: Page23RemarkState;
  page24Results: Page23ResultState;
  page24Remarks: Page23RemarkState;
  page25Signatures: Page25SignatureState;
  imageEdits: Record<string, TemplateImageEdit>;
  mapLocation: MapLocationValue;
};

export type ReportDraft = {
  id: string;
  title: string;
  buildingName: string;
  ownerCompany: string;
  templateId: ReportTemplateId;
  createdAt: string;
  updatedAt: string;
  state: ReportRenderState;
};
