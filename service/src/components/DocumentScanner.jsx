import { useRef, useState } from "react";
import { scanDocument } from "../services/scanDocumentApi";
import { compressImageForOcr } from "../utils/imageCompression";

const allowedTypes = ["image/jpeg", "image/png"];

export default function DocumentScanner({ authToken, onScanComplete }) {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      showToast("error", "รองรับเฉพาะไฟล์ jpg, jpeg, png เท่านั้น");
      return;
    }

    setIsScanning(true);
    setToast({ type: "loading", message: "Scanning document..." });

    try {
      const uploadFile = await compressImageForOcr(file);
      const result = await scanDocument(uploadFile, authToken);
      const fields = result.data || {};
      const filledCount = Object.values(fields).filter(Boolean).length;
      if (!filledCount) {
        throw new Error("Cannot detect information");
      }
      onScanComplete?.(fields);
      showToast("success", `AI Fill Success (${filledCount} fields)`);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Cannot detect information";
      showToast("error", message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 px-5 py-4 shadow-sm print:hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">
            OCR.Space Auto Fill
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            📷 Scan Document
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            ถ่ายรูปหรืออัปโหลดรูปภาพ แล้วระบบจะอ่านเอกสารและเติมข้อมูลโครงการอัตโนมัติ
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={isScanning}
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            เปิด Camera
          </button>
          <button
            type="button"
            disabled={isScanning}
            onClick={() => uploadInputRef.current?.click()}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            อัปโหลดรูปภาพ
          </button>
        </div>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFile}
      />

      {toast && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}
