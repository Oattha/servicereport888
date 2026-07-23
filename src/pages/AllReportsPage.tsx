import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  RefreshCw,
  Send,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { getReports, sendReportEmail } from "../lib/api";
import type { SharedReport } from "../types";

function formatUpdatedAt(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AllReportsPage() {
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null);

  // State สำหรับฟอร์มส่งอีเมลใน Modal
  const [resendEmail, setResendEmail] = useState("");
  const [resendCc, setResendCc] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
  }

  function handleCloseModal() {
    setSelectedReport(null);
    setShowForm(false);
    setSendSuccess(false);
    setSendError("");
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
      const dummyPdfBase64 = "JVBERi0xLjQKJSCi4P...==";

      await sendReportEmail(selectedReport.id, {
        recipientEmail: normalizedEmail,
        ccEmail: normalizedCc || undefined,
        fileName: pdfFileName,
        pdfBase64: dummyPdfBase64
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
      {/* แทรก Style เฉพาะของ Hover แถวตาราง */}
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
        {!error && isLoading ? (
          <div className="empty-state">กำลังโหลดรายงาน...</div>
        ) : null}
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
                      {report.status === "sent" ? (
                        <span
                          className="completed-report-status"
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

      {/* Pop-up / Modal แสดงประวัติ + ปุ่มส่งอีเมล */}
      {selectedReport ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="user-modal"
            style={{ maxWidth: "520px", width: "100%" }}
            role="dialog"
            aria-labelledby="report-history-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="report-history-title">รายละเอียดและส่งอีเมล</h2>
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

            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {/* ข้อมูลอาคาร */}
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "0.875rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb"
                }}
              >
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>ข้อมูลอาคาร/ลูกค้า</div>
                <strong style={{ fontSize: "1.05rem", color: "#111827", display: "block" }}>
                  {selectedReport.building}
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#374151" }}>
                  {selectedReport.customer}
                </span>
              </div>

              {/* แจ้งเตือนเมื่อส่งสำเร็จ */}
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

              {/* กล่องประวัติการส่งเดิม */}
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

              {/* ฟอร์มกรอกอีเมลสำหรับส่งใหม่/ส่งซ้ำ */}
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

            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                className="secondary-action"
                type="button"
                onClick={handleCloseModal}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}