import type { ReportTemplateId } from "../types";

export type ReportTemplateDefinition = {
  id: ReportTemplateId;
  code: string;
  name: string;
  description: string;
  pages: number;
  pdfUrl: string;
  downloadFileName: string;
  thumbnailDirectory: string;
  assetVersion?: string;
  editable: boolean;
};

export const reportTemplates: ReportTemplateDefinition[] = [
  {
    id: "annual-inspection",
    code: "TMP-ANNUAL-2568",
    name: "รายงานตรวจสอบอาคาร (ประจำปี)",
    description: "แบบรายงานตรวจสอบอาคารที่สามารถกรอกข้อมูลและเปลี่ยนรูปตามตำแหน่งที่กำหนดได้",
    pages: 26,
    pdfUrl: "/templates/bangchan-building-inspection.pdf",
    downloadFileName: "building-inspection-report.pdf",
    thumbnailDirectory: "/templates/bangchan-report-pages",
    editable: true
  },
  {
    id: "maintenance-plan",
    code: "TMP-MAINTENANCE-PLAN",
    name: "แผนปฏิบัติการการตรวจบำรุงรักษาอาคาร",
    description: "แผนปฏิบัติการการตรวจบำรุงรักษาอาคารและอุปกรณ์ประกอบของอาคาร จำนวน 19 หน้า",
    pages: 19,
    pdfUrl: "/templates/building-maintenance-plan.pdf",
    downloadFileName: "building-maintenance-plan.pdf",
    thumbnailDirectory: "/templates/maintenance-plan-pages",
    editable: false
  },
  {
    id: "sign-inspection-report",
    code: "TMP-SIGN-INSPECTION-2568",
    name: "รายงานตรวจสอบป้าย บริษัท เฌอร่า จำกัด (มหาชัย)",
    description: "รายงานผลการตรวจสอบป้ายประจำปี พร้อมรายละเอียดการตรวจและภาพประกอบ จำนวน 15 หน้า",
    pages: 15,
    pdfUrl: "/templates/sign-inspection-report.pdf?v=20260826-9",
    downloadFileName: "sign-inspection-report-shera-mahachai.pdf",
    thumbnailDirectory: "/templates/sign-inspection-report-pages",
    assetVersion: "20260826-9",
    editable: false
  },
  {
    id: "sign-maintenance-plan",
    code: "TMP-SIGN-MAINTENANCE-PLAN",
    name: "แผนปฏิบัติการการตรวจบำรุงรักษาป้าย",
    description: "แผนปฏิบัติการตรวจบำรุงรักษาป้ายและอุปกรณ์ประกอบ จำนวน 7 หน้า",
    pages: 7,
    pdfUrl: "/templates/sign-maintenance-plan.pdf?v=20260826-1",
    downloadFileName: "sign-maintenance-plan.pdf",
    thumbnailDirectory: "/templates/sign-maintenance-plan-pages",
    assetVersion: "20260826-1",
    editable: false
  },
  {
    id: "mixing-workshop-maintenance-plan",
    code: "TMP-MIXING-WORKSHOP-2568",
    name: "แผนปฏิบัติการอาคาร Mixing Work Shop ปี 68",
    description: "แผนปฏิบัติการตรวจบำรุงรักษาอาคารและอุปกรณ์ประกอบของอาคาร Mixing Work Shop จำนวน 35 หน้า",
    pages: 35,
    pdfUrl: "/templates/mixing-workshop-maintenance-plan.pdf?v=20260826-2",
    downloadFileName: "mixing-workshop-maintenance-plan-2568.pdf",
    thumbnailDirectory: "/templates/mixing-workshop-maintenance-pages",
    assetVersion: "20260826-2",
    editable: false
  }
];

export function getReportTemplate(templateId: ReportTemplateId) {
  return reportTemplates.find((template) => template.id === templateId) ?? reportTemplates[0];
}
