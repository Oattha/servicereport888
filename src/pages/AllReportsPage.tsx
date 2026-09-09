import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  RefreshCw,
  Send,
  X,
  Eye
  
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getReports, sendReportEmail } from "../lib/api";
import { createReportPdf } from "../utils/reportRenderer";
import { defaultTemplateFieldValues } from "../data/pdfTemplate";
import { defaultInspectionChecks } from "../data/inspectionChecklist";
import { defaultMaintenancePlanPage7Checks } from "../data/maintenancePlanPage7";
import { defaultMaintenancePlanPage8Checks } from "../data/maintenancePlanPage8";
import { defaultMaintenancePlanPages9To16Checks } from "../data/maintenancePlanPages9To16";
import { defaultMaintenancePlanPage18Values } from "../data/maintenancePlanPage18";
import { defaultMaintenancePlanPage19Values, defaultMaintenancePlanPage19Signature } from "../data/maintenancePlanPage19";
import { defaultSignMaintenanceFormState } from "../data/signMaintenancePlan";
import {
  defaultMixingWorkshopPage14Checks,
  defaultMixingWorkshopPage15Checks,
  defaultMixingWorkshopRemarks
} from "../data/mixingWorkshopPage14";
import {
  defaultMixingWorkshopPage23Checks,
  defaultMixingWorkshopPage23Remarks
} from "../data/mixingWorkshopPage23";
import {
  defaultMixingWorkshopPage24Checks,
  defaultMixingWorkshopPage24Remarks
} from "../data/mixingWorkshopPage24";
import {
  defaultMixingWorkshopPage25Checks,
  defaultMixingWorkshopPage25Remarks
} from "../data/mixingWorkshopPage25";
import {
  defaultMixingWorkshopPage26Checks,
  defaultMixingWorkshopPage26Remarks
} from "../data/mixingWorkshopPage26";
import {
  defaultMixingWorkshopPages27To32Checks,
  defaultMixingWorkshopPages27To32Remarks
} from "../data/mixingWorkshopPages27To32";
import {
  defaultMixingWorkshopPages34To35Choices,
  defaultMixingWorkshopPages34To35Remarks
} from "../data/mixingWorkshopPages34To35";
import { defaultPage14Checkboxes } from "../data/page14Checkboxes";
import { defaultPage18Checks, defaultPage18Materials, defaultPage18Text } from "../data/page18Fields";
import { defaultPage23Remarks, defaultPage23Results } from "../data/page23Fields";
import { defaultPage24Remarks, defaultPage24Results } from "../data/page24Fields";
import { defaultPage25Signatures } from "../data/page25Fields";
import type { SharedReport, ReportRenderState } from "../types";
import { defaultSignInspectionPage7State } from "../data/signInspectionPage7";
import { defaultSignInspectionPage8State } from "../data/signInspectionPage8";

function formatUpdatedAt(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function pdfBytesToBase64(pdfBytes: Uint8Array) {
  const blobPart = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(blobPart).set(pdfBytes);
  const blob = new Blob([blobPart], { type: "application/pdf" });
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("ไม่สามารถอ่านไฟล์ PDF ได้"));
    reader.readAsDataURL(blob);
  });
}

export function AllReportsPage() {
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null);

  const [resendEmail, setResendEmail] = useState("");
  const [resendCc, setResendCc] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  //  State สำหรับควบคุมการแสดงตัวอย่าง PDF
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  async function loadReports() {
    setIsLoading(true);
    setError("");
    try {
      setReports(await getReports());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "โหลดรายการรายงานไม่สำเร็จ"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  function handleSelectReport(report: SharedReport) {
    setSelectedReport(report);
    setResendEmail(report.recipientEmail ?? "");
    setResendCc("");
    setSendError("");
    setSendSuccess(false);
    setShowForm(!report.recipientEmail);
    setIsPreviewingPdf(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }

  function handleCloseModal() {
    setSelectedReport(null);
    setShowForm(false);
    setSendSuccess(false);
    setSendError("");
    setIsPreviewingPdf(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }

  // ฟังก์ชันดึง RenderState จากรายงานจริง หรือใช้ Fallback
  function getReportRenderState(report: SharedReport & { data?: ReportRenderState }): ReportRenderState {
    if (report.data) {
      return report.data;
    }

    return {
      templateId: "annual-inspection",
      annualAssessmentResult: null,
      signInspectionPage15Choices: {},
      signInspectionPage13State: {},
      signInspectionPage12State: {},
      signInspectionPage9State: {},
      signInspectionPage7State: structuredClone(defaultSignInspectionPage7State),
      signInspectionPage8State: structuredClone(defaultSignInspectionPage8State),
      signInspectionPage4State: {
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
        mapLocation: {
          latitude: "",
          longitude: "",
          googleMapsUrl: "",
          mapScreenshotUrl: "",
          uploadedImageUrl: "",
          uploadedImageName: "",
          mapImageSource: "",
          satellite: false,
          placeName: "",
          address: ""
        }
      },
      maintenancePlanPage7Checks: defaultMaintenancePlanPage7Checks,
      maintenancePlanPage8Checks: defaultMaintenancePlanPage8Checks,
      maintenancePlanPages9To16Checks: defaultMaintenancePlanPages9To16Checks,
      maintenancePlanPage18Values: defaultMaintenancePlanPage18Values,
      maintenancePlanPage19Values: defaultMaintenancePlanPage19Values,
      maintenancePlanPage19Signature: defaultMaintenancePlanPage19Signature,
      signMaintenanceForm: structuredClone(defaultSignMaintenanceFormState),
      mixingWorkshopPage14Checks: { ...defaultMixingWorkshopPage14Checks },
      mixingWorkshopPage15Checks: { ...defaultMixingWorkshopPage15Checks },
      mixingWorkshopRemarks: { ...defaultMixingWorkshopRemarks },
      mixingWorkshopPage23Checks: { ...defaultMixingWorkshopPage23Checks },
      mixingWorkshopPage23Remarks: { ...defaultMixingWorkshopPage23Remarks },
      mixingWorkshopPage24Checks: { ...defaultMixingWorkshopPage24Checks },
      mixingWorkshopPage24Remarks: { ...defaultMixingWorkshopPage24Remarks },
      mixingWorkshopPage25Checks: { ...defaultMixingWorkshopPage25Checks },
      mixingWorkshopPage25Remarks: { ...defaultMixingWorkshopPage25Remarks },
      mixingWorkshopPage26Checks: { ...defaultMixingWorkshopPage26Checks },
      mixingWorkshopPage26Remarks: { ...defaultMixingWorkshopPage26Remarks },
      mixingWorkshopPages27To32Checks: structuredClone(defaultMixingWorkshopPages27To32Checks),
      mixingWorkshopPages27To32Remarks: structuredClone(defaultMixingWorkshopPages27To32Remarks),
      mixingWorkshopPages34To35Choices: structuredClone(defaultMixingWorkshopPages34To35Choices),
      mixingWorkshopPages34To35Remarks: structuredClone(defaultMixingWorkshopPages34To35Remarks),
      fieldValues: {
        ...defaultTemplateFieldValues,
        owner_company: report.customer,
        building_name: report.building,
        customer_email: resendEmail || "customer@example.com"
      },
      inspectionChecks: defaultInspectionChecks,
      page14Checks: defaultPage14Checkboxes,
      page17Owner: {},
      page17Occupant: {},
      page17BuildingTypes: {
        high_rise: false,
        extra_large: false,
        assembly: false,
        theater: false,
        hotel_80_rooms: false,
        entertainment_venue_200_sqm: false,
        residential_2000_sqm: false,
        factory_5000_sqm: false,
        other: false
      },
      page17OtherText: "",
      page18Checks: defaultPage18Checks,
      page18Text: defaultPage18Text,
      page18Materials: defaultPage18Materials,
      page23Results: defaultPage23Results,
      page23Remarks: defaultPage23Remarks,
      page24Results: defaultPage24Results,
      page24Remarks: defaultPage24Remarks,
      page25Signatures: defaultPage25Signatures,
      imageEdits: {},
      mapLocation: {
        latitude: "",
        longitude: "",
        googleMapsUrl: "",
        mapScreenshotUrl: "",
        uploadedImageUrl: "",
        uploadedImageName: "",
        mapImageSource: "",
        satellite: false,
        placeName: "",
        address: ""
      }
    };
  }

  async function handleViewSignedPdf() {
    const signedUrl = (selectedReport as any)?.signedPdfUrl;
    if (!signedUrl) return;

    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write("<h3 style='font-family: sans-serif; padding: 2rem;'>กำลังโหลดเอกสารที่เซ็นแล้ว...</h3>");
    }

    try {
      // ดึงไฟล์จาก Cloudinary มาแปลงประเภทให้ถูกต้อง
      const response = await fetch(signedUrl);
      const blobData = await response.blob();
      const pdfBlob = new Blob([blobData], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      if (previewWindow) previewWindow.close();
      alert("ไม่สามารถเปิดเอกสารได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  async function handlePreviewPdf() {
    if (!selectedReport) return;

    // เปิดแท็บใหม่ก่อนเพื่อกัน Browser บล็อก Pop-up
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write("<h3 style='font-family: sans-serif; padding: 2rem;'>กำลังสร้างเอกสาร PDF กรุณารอสักครู่...</h3>");
    }

    setIsGeneratingPreview(true);
    try {
      const renderState = getReportRenderState(selectedReport as SharedReport & { data?: ReportRenderState });

      const pdfBytes = await createReportPdf(renderState);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      if (previewWindow) {
        previewWindow.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } catch (err) {
      if (previewWindow) previewWindow.close();
      alert(err instanceof Error ? err.message : "ไม่สามารถสร้างตัวอย่าง PDF ได้");
    } finally {
      setIsGeneratingPreview(false);
    }
  }

  async function handleSendEmail() {
    if (!selectedReport) return;
    const normalizedEmail = resendEmail.trim();
    const normalizedCc = resendCc.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSendError("กรุณากรอกอีเมลผู้รับให้ถูกต้อง");
      return;
    }

    if (normalizedCc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCc)) {
      setSendError("กรุณากรอกอีเมล CC ให้ถูกต้อง");
      return;
    }

    setIsSending(true);
    setSendError("");
    setSendSuccess(false);

    try {
      const pdfFileName = `รายงานตรวจสอบอาคาร-${selectedReport.building}.pdf`;
      const renderState = getReportRenderState(selectedReport as SharedReport & { data?: ReportRenderState });

      const pdfBytes = await createReportPdf(renderState);
      const pdfBase64 = await pdfBytesToBase64(pdfBytes);

      await sendReportEmail(selectedReport.id, {
        recipientEmail: normalizedEmail,
        ccEmail: normalizedCc || undefined,
        fileName: pdfFileName,
        pdfBase64
      });

      setSendSuccess(true);
      setShowForm(false);
      await loadReports();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "ส่งอีเมลไม่สำเร็จ");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="page-stack">
      <style>{`
        .report-row-hover {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .report-row-hover:hover {
          background-color: #f1f5f9 !important;
          transform: translateY(-1px);
        }
        .report-row-hover:hover .action-link {
          color: #2563eb !important;
          text-decoration: underline;
        }
        .report-row-hover:hover .action-icon {
          transform: translateX(3px);
          color: #2563eb !important;
        }
      `}</style>

      <PageHeader
        eyebrow="ALL REPORTS"
        title="รายงานทั้งหมด"
        description="รายงานฉบับเสร็จจากผู้ใช้งานทุกคนในระบบ กดที่แถวเพื่อดูประวัติหรือส่งอีเมล"
        action={
          <button
            className="secondary-action all-reports-refresh"
            type="button"
            onClick={loadReports}
            disabled={isLoading}
          >
            <RefreshCw size={17} aria-hidden="true" />
            รีเฟรช
          </button>
        }
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>รายการรายงานฉบับเสร็จ</h2>
            <p>คลิกที่แถวรายงานเพื่อดูประวัติการส่ง หรือส่งอีเมลหาลูกค้า</p>
          </div>
        </div>
        {error ? <div className="empty-state">{error}</div> : null}
        {!error && isLoading ? <LoadingSpinner /> : null}
        {!error && !isLoading && reports.length === 0 ? (
          <div className="empty-state empty-panel">
            ยังไม่มีรายงานที่บันทึกเป็นฉบับเสร็จ
          </div>
        ) : null}
        {!error && !isLoading && reports.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>เลขที่รายงาน</th>
                  <th>อาคาร</th>
                  <th>เจ้าของอาคาร</th>
                  <th>Template</th>
                  <th>ผู้บันทึก</th>
                  <th>สถานะส่งอีเมล</th>
                  <th>บันทึกล่าสุด</th>
                  <th style={{ textAlign: "right" }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className="report-row-hover"
                    title="คลิกเพื่อดูประวัติการส่งอีเมล หรือส่งอีเมลใหม่"
                  >
                    <td>
                      <div className="draft-report-title">
                        <FileText size={18} aria-hidden="true" />
                        <strong>{report.reportNo}</strong>
                      </div>
                    </td>
                    <td>{report.building}</td>
                    <td>{report.customer}</td>
                    <td>{report.template}</td>
                    <td>{report.inspector}</td>
                      <td>
                      {report.status === "signed" || (report as any).signedPdfUrl ? (
                        <span
                          style={{
                            backgroundColor: "#e0e7ff",
                            color: "#3730a3",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "1rem",
                            fontSize: "0.8rem",
                            fontWeight: 500
                          }}
                        >
                          <CheckCircle2 size={13} />
                          เซ็นรับรองแล้ว
                        </span>
                      ) : report.status === "sent" ? (
                        <span
                          style={{
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "1rem",
                            fontSize: "0.8rem",
                            fontWeight: 500
                          }}
                        >
                          <CheckCircle2 size={13} />
                          ส่งเรียบร้อย
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "1rem",
                            fontSize: "0.8rem",
                            fontWeight: 500
                          }}
                        >
                          <Clock size={13} />
                          ยังไม่ส่ง
                        </span>
                      )}
                    </td>

                    <td>{formatUpdatedAt(report.updatedAt)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          fontSize: "0.825rem",
                          color: "#64748b",
                          fontWeight: 500
                        }}
                      >
                        <span className="action-link">ดูรายละเอียด</span>
                        <ChevronRight
                          size={16}
                          className="action-icon"
                          style={{ transition: "transform 0.2s, color 0.2s" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* Pop-up / Modal แสดงประวัติ + ปุ่มดูตัวอย่าง PDF + ปุ่มส่งอีเมล */}
      {selectedReport ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="user-modal"
            style={{ maxWidth: isPreviewingPdf ? "900px" : "520px", width: "100%", transition: "max-width 0.3s ease" }}
            role="dialog"
            aria-labelledby="report-history-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="report-history-title">
                  {isPreviewingPdf ? "ตัวอย่างไฟล์ PDF รายงาน" : "รายละเอียดและส่งอีเมล"}
                </h2>
                <p>{selectedReport.reportNo}</p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="ปิด"
                onClick={handleCloseModal}
              >
                <X size={18} />
              </button>
            </div>

            {/*  ส่วนแสดงผลตัวอย่าง PDF แบบฝังหน้าจอ (Iframe) */}
            {isPreviewingPdf ? (
              <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
                {/*  เปลี่ยนจาก iframe มาใช้ object + embed เพื่อให้มือถือเลื่อนนิ้วสไลด์ได้ปกติ */}
                <div style={{ 
                  width: "100%", 
                  height: "480px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: "0.5rem", 
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  backgroundColor: "#ffffff" 
                }}>
                  {pdfPreviewUrl ? (
                    <object
                      data={`${pdfPreviewUrl}#view=FitH`}
                      type="application/pdf"
                      style={{ width: "100%", height: "100%", display: "block" }}
                    >
                      <embed 
                        src={`${pdfPreviewUrl}#view=FitH`} 
                        type="application/pdf" 
                        style={{ width: "100%", height: "100%" }} 
                      />
                    </object>
                  ) : null}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {pdfPreviewUrl ? (
                    <a
                      href={pdfPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-action small-action"
                      style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                    >
                      <FileText size={16} />
                      เปิดอ่านไฟล์ PDF แบบเต็มจอ
                    </a>
                  ) : <span />}

                  <button
                    className="secondary-action"
                    type="button"
                    onClick={() => setIsPreviewingPdf(false)}
                  >
                    กลับสู่เมนูรายละเอียด
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {/* 1. กล่องข้อมูลอาคาร/ลูกค้า + ปุ่มดูตัวอย่าง PDF ฉบับร่าง (ก่อนส่ง) */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "0.875rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>ข้อมูลอาคาร/ลูกค้า</div>
                    <strong style={{ fontSize: "1.05rem", color: "#111827", display: "block" }}>
                      {selectedReport.building}
                    </strong>
                    <span style={{ fontSize: "0.9rem", color: "#374151" }}>
                      {selectedReport.customer}
                    </span>
                  </div>

                  <button
                    className="secondary-action small-action"
                    type="button"
                    disabled={isGeneratingPreview}
                    onClick={() => void handlePreviewPdf()}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", borderColor: "#3b82f6", color: "#2563eb" }}
                  >
                    <Eye size={16} />
                    {isGeneratingPreview ? "กำลังโหลด..." : "ดูต้นฉบับร่าง (ก่อนส่ง)"}
                  </button>
                </div>

                {/* 2. กล่องแสดงสถานะการเซ็นเอกสาร + ปุ่มเปิดดูไฟล์ที่ลูกค้าอัปโหลดมา (ฉบับส่งคืน) */}
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                    backgroundColor: (selectedReport as any).signedPdfUrl ? "#f0fdf4" : "#f8fafc",
                    display: "grid",
                    gap: "0.5rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>สถานะการรับรองเอกสาร</span>
                      <strong style={{ fontSize: "0.95rem", color: (selectedReport as any).signedPdfUrl ? "#166534" : "#475569" }}>
                        {(selectedReport as any).signedPdfUrl ? "✓ ลูกค้าเซ็นรับรองและส่งคืนแล้ว" : "รอการเซ็นรับรองจากลูกค้า"}
                      </strong>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {(selectedReport as any).signedPdfUrl ? (
                        <button
                          type="button"
                          className="primary-action small-action"
                          onClick={() => void handleViewSignedPdf()}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", backgroundColor: "#16a34a", border: "none", cursor: "pointer" }}
                        >
                          <FileText size={15} />
                          ดูไฟล์ที่เซ็นแล้ว (ฉบับส่งคืน)
                        </button>
                      ) : null}

                      {(selectedReport as any).signToken ? (
                        <button
                          type="button"
                          className="secondary-action small-action"
                          style={{ fontSize: "0.775rem" }}
                          onClick={() => {
                            const link = `https://servicereport.pages.dev/sign-portal?token=${(selectedReport as any).signToken}`;
                            navigator.clipboard.writeText(link);
                            alert("คัดลอกลิงก์ Portal สำหรับส่งให้ลูกค้าเรียบร้อยแล้ว");
                          }}
                        >
                          คัดลอกลิงก์ Portal
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* แสดงข้อความที่ลูกค้าพิมพ์ส่งกลับมา (ถ้ามี) */}
                  {(selectedReport as any).customerRemarks ? (
                    <div style={{ marginTop: "0.35rem", padding: "0.6rem 0.75rem", backgroundColor: "#ffffff", border: "1px dashed #86efac", borderRadius: "6px", fontSize: "0.85rem" }}>
                      <span style={{ fontWeight: 600, color: "#166534", display: "block", marginBottom: "0.2rem" }}>
                        ข้อความจากลูกค้า:
                      </span>
                      <span style={{ color: "#334155", whiteSpace: "pre-wrap" }}>
                        {(selectedReport as any).customerRemarks}
                      </span>
                    </div>
                  ) : null}
                </div>

                {sendSuccess ? (
                  <div
                    style={{
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                      padding: "0.875rem",
                      borderRadius: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem"
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>ส่งอีเมลรายงานเรียบร้อยแล้ว!</span>
                  </div>
                ) : null}

                {selectedReport.recipientEmail && !showForm ? (
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f0fdf4"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontWeight: 600,
                          color: "#166534"
                        }}
                      >
                        <Mail size={18} />
                        <span>ประวัติการส่งอีเมลล่าสุด</span>
                      </div>
                      <button
                        type="button"
                        className="secondary-action small-action"
                        onClick={() => setShowForm(true)}
                        style={{ fontSize: "0.775rem", padding: "0.25rem 0.6rem" }}
                      >
                        ส่งซ้ำ / เปลี่ยนอีเมล
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.9rem" }}>
                      <div>
                        <span style={{ color: "#6b7280" }}>ส่งไปยัง: </span>
                        <strong style={{ color: "#111827" }}>{selectedReport.recipientEmail}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>เวลาที่ส่ง: </span>
                        <strong style={{ color: "#111827" }}>
                          {formatUpdatedAt(selectedReport.emailSentAt)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : null}

                {showForm ? (
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #3b82f6",
                      backgroundColor: "#eff6ff",
                      display: "grid",
                      gap: "0.75rem"
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#1e40af", fontSize: "0.95rem" }}>
                      {selectedReport.recipientEmail ? "ส่งอีเมลรายงานซ้ำ" : "ส่งอีเมลรายงานให้ลูกค้า"}
                    </div>

                    <label className="field full" style={{ margin: 0 }}>
                      <span style={{ fontSize: "0.825rem" }}>อีเมลผู้รับ</span>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="customer@example.com"
                        style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
                      />
                    </label>

                    <label className="field full" style={{ margin: 0 }}>
                      <span style={{ fontSize: "0.825rem" }}>สำเนาถึง (CC)</span>
                      <input
                        type="email"
                        value={resendCc}
                        onChange={(e) => setResendCc(e.target.value)}
                        placeholder="cc@example.com"
                        style={{ width: "100%", padding: "0.4rem 0.6rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1" }}
                      />
                    </label>

                    {sendError ? (
                      <span style={{ color: "#dc2626", fontSize: "0.825rem" }}>{sendError}</span>
                    ) : null}

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <button
                        className="primary-action"
                        type="button"
                        disabled={isSending}
                        onClick={() => void handleSendEmail()}
                        style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                      >
                        <Send size={16} />
                        {isSending ? "กำลังส่ง..." : "ส่งรายงานทางอีเมล"}
                      </button>
                      {selectedReport.recipientEmail ? (
                        <button
                          className="secondary-action"
                          type="button"
                          onClick={() => setShowForm(false)}
                        >
                          ยกเลิก
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    fontSize: "0.825rem",
                    color: "#6b7280",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <span>ผู้บันทึก: {selectedReport.inspector}</span>
                  <span>อัปเดตล่าสุด: {formatUpdatedAt(selectedReport.updatedAt)}</span>
                </div>
              </div>
            )}

            {!isPreviewingPdf ? (
              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  className="secondary-action"
                  type="button"
                  onClick={handleCloseModal}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}