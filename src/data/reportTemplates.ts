import type { ReportTemplateId } from "../types";

export type ReportTemplateDefinition = {
  id: ReportTemplateId;
  code: string;
  name: string;
  description: string;
  pages: number;
  pdfUrl: string;
  thumbnailDirectory: string;
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
    thumbnailDirectory: "/templates/maintenance-plan-pages",
    editable: false
  }
];

export function getReportTemplate(templateId: ReportTemplateId) {
  return reportTemplates.find((template) => template.id === templateId) ?? reportTemplates[0];
}
