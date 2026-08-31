import { useMemo } from "react";

export const PRINT_PREVIEW_STORAGE_KEY = "service-report:print-preview-html";

function extractPrintableParts(html) {
  const value = String(html || "");
  const styleMatch = value.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const bodyMatch = value.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  return {
    styles: styleMatch?.[1] || "",
    body: bodyMatch?.[1] || value,
  };
}

export default function PrintPreviewPage({ onBack }) {
  const printableHtml = sessionStorage.getItem(PRINT_PREVIEW_STORAGE_KEY) || "";
  const { styles, body } = useMemo(
    () => extractPrintableParts(printableHtml),
    [printableHtml],
  );

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    onBack?.();
  };

  if (!printableHtml) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5 text-center">
        <div className="max-w-sm rounded-3xl bg-white p-6 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">ไม่พบเอกสาร PDF</h1>
          <p className="mt-2 text-sm text-slate-600">
            กรุณากลับไปที่ฟอร์ม แล้วกดพิมพ์รายงานใหม่อีกครั้ง
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            กลับไปหน้าฟอร์ม
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        ${styles}

        @media screen {
          html,
          body {
            width: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #e2e8f0 !important;
          }

          body {
            overflow-x: auto;
          }

          .print-preview-page {
            min-height: 100vh;
            padding: 96px 10px 24px;
          }

          .print-preview-toolbar {
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
            padding: 12px;
            padding-top: calc(12px + env(safe-area-inset-top));
            background: rgba(248, 250, 252, 0.96);
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
            backdrop-filter: blur(10px);
          }

          .print-preview-toolbar button {
            border: 0;
            border-radius: 14px;
            padding: 12px 14px;
            font-size: 15px;
            font-weight: 800;
            color: #fff;
          }

          .print-preview-print-button {
            background: #2563eb;
            flex: 1;
            max-width: 240px;
          }

          .print-preview-back-button {
            background: #64748b;
          }

          .print-preview-sheet {
            width: 210mm;
            max-width: 100%;
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
            overflow: hidden;
          }
        }

        @media print {
          .print-preview-toolbar {
            display: none !important;
          }

          .print-preview-page,
          .print-preview-sheet {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }
        }
      `}</style>

      <main className="print-preview-page">
        <div className="print-preview-toolbar">
          <button
            type="button"
            className="print-preview-back-button"
            onClick={handleBack}
          >
            กลับ
          </button>
          <button
            type="button"
            className="print-preview-print-button"
            onClick={handlePrint}
          >
            บันทึกเป็น PDF
          </button>
        </div>

        <section
          className="print-preview-sheet"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </main>
    </>
  );
}
