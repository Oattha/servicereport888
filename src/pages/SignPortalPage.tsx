import { useEffect, useState } from "react";
import { CheckCircle2, FileUp, Loader2, AlertCircle, Eye, RefreshCw, Send, FileText } from "lucide-react";
import { requestJson } from "../lib/http";

export function SignPortalPage() {
  const [token, setToken] = useState("");
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // State สำหรับการตรวจทานไฟล์และข้อความก่อนส่ง
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    setToken(t);

    if (!t) {
      setError("ไม่พบรหัสเอกสาร กรุณาเข้าผ่านลิงก์ที่ได้รับทางอีเมล");
      setIsLoading(false);
      return;
    }

    requestJson<any>(`/api/portal/reports/${encodeURIComponent(t)}`)
      .then((data) => {
        setReport(data);
        if (data.signedPdfUrl) setUploadSuccess(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "ไม่พบเอกสารหรือลิงก์ไม่ถูกต้อง"))
      .finally(() => setIsLoading(false));
  }, []);

  // เมื่อเลือกไฟล์: สร้าง Blob URL สำหรับพรีวิว แต่ยังไม่อัปโหลด
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }

    setSelectedFile(file);
    setPreviewBlobUrl(URL.createObjectURL(file));
    setError("");
  }

  function handleResetFile() {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setSelectedFile(null);
    setPreviewBlobUrl(null);
  }

  function handleOpenPreview() {
    if (previewBlobUrl) {
      window.open(previewBlobUrl, "_blank");
    }
  }

  async function handleConfirmSubmit() {
    if (!selectedFile || !token) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (remarks.trim()) {
      formData.append("remarks", remarks.trim());
    }

    try {
      await requestJson<{ ok: true; fileUrl: string }>(
        `/api/portal/reports/${encodeURIComponent(token)}/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      setUploadSuccess(true);
      handleResetFile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
        <Loader2 className="animate-spin" size={32} color="#2563eb" />
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem 1rem", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "2rem", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
        <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", color: "#1e293b", margin: "0 0 0.5rem" }}>ระบบรับรองและส่งคืนรายงาน</h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>TEST TRUE Service Report Portal</p>
        </header>

        {error ? (
          <div style={{ padding: "1rem", backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: "8px", display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.25rem" }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : null}

        {report ? (
          <div>
            <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              <div style={{ marginBottom: "0.4rem" }}><strong>เลขที่รายงาน:</strong> {report.reportNo}</div>
              <div style={{ marginBottom: "0.4rem" }}><strong>อาคาร:</strong> {report.building}</div>
              <div><strong>ลูกค้า / บริษัท:</strong> {report.customer}</div>
            </div>

            {uploadSuccess ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", backgroundColor: "#f0fdf4", borderRadius: "8px", color: "#166534" }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 0.75rem" }} />
                <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>อัปโหลดเอกสารที่เซ็นแล้วสำเร็จ!</h2>
                <p style={{ fontSize: "0.875rem", color: "#15803d", margin: 0 }}>ระบบได้บันทึกเอกสารของท่านเรียบร้อยแล้ว ทีมงานจะดำเนินการในขั้นตอนถัดไป</p>
              </div>
            ) : !selectedFile ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "1.5rem", lineHeight: "1.5" }}>
                  เมื่อท่านตรวจสอบและเซ็นรับรองในเอกสารรายงานเรียบร้อยแล้ว กรุณาอัปโหลดไฟล์ PDF หรือรูปถ่ายเอกสารที่เซ็นผ่านปุ่มด้านล่างนี้
                </p>

                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  <FileUp size={18} />
                  เลือกไฟล์ PDF หรือรูปภาพที่เซ็นแล้ว
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            ) : (
              /* หน้าจอตรวจทานไฟล์ + กรอกข้อความ + ยืนยันการส่ง */
              <div style={{ display: "grid", gap: "1.25rem" }}>
                <div style={{ border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ fontSize: "0.825rem", color: "#1e40af", fontWeight: 600, marginBottom: "0.5rem" }}>
                    เอกสารที่เลือก (กรุณาตรวจสอบความถูกต้อง)
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <FileText size={20} color="#2563eb" />
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", wordBreak: "break-all" }}>
                      {selectedFile.name}
                      <span style={{ fontSize: "0.775rem", color: "#64748b", fontWeight: 400, marginLeft: "0.5rem" }}>
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      style={{
                        padding: "0.4rem 0.75rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid #93c5fd",
                        borderRadius: "6px",
                        color: "#1d4ed8",
                        fontSize: "0.825rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <Eye size={15} />
                      เปิดดูตัวอย่างไฟล์
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFile}
                      disabled={isUploading}
                      style={{
                        padding: "0.4rem 0.75rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        color: "#475569",
                        fontSize: "0.825rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <RefreshCw size={14} />
                      เปลี่ยนไฟล์ใหม่
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#334155", marginBottom: "0.35rem" }}>
                    ข้อความเพิ่มเติมถึงทีมงาน (ไม่บังคับ)
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="ระบุข้อความ รายละเอียดเพิ่มเติม หรือหมายเหตุที่ต้องการแจ้ง..."
                    disabled={isUploading}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={isUploading}
                    style={{
                      flex: 1,
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      cursor: isUploading ? "not-allowed" : "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        กำลังส่งข้อมูล...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        ยืนยันและส่งเอกสาร
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFile}
                    disabled={isUploading}
                    style={{
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                      fontWeight: 500
                    }}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}