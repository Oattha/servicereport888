export type AppSection = "dashboard" | "reports" | "templates" | "settings";

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

export type Template = {
  id: string;
  name: string;
  pages: number;
  version: string;
  lockedFields: number;
  lastUpdated: string;
  active: boolean;
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

export type TemplateTextEdit = {
  fieldKey: string;
  value: string;
};

export type TemplatePageSize = {
  width: number;
  height: number;
};

export type ReportRenderState = {
  coverYear: string;
  ownerCompany: string;
  imageEdits: Record<string, TemplateImageEdit>;
};
