import { useEffect, useState } from "react";
import type { ReportRenderState } from "../types";
import { createReportPdf } from "../utils/reportRenderer";

type ReportPdfPreviewProps = {
  page: number;
  renderState: ReportRenderState;
};

export function ReportPdfPreview({ page, renderState }: ReportPdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    let isCurrent = true;
    let nextUrl = "";

    async function renderPdf() {
      const pdfBytes = await createReportPdf(renderState);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      nextUrl = URL.createObjectURL(blob);
      if (!isCurrent) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      setPdfUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
    }

    void renderPdf();

    return () => {
      isCurrent = false;
    };
  }, [renderState]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl]
  );

  if (!pdfUrl) {
    return <div className="pdf-preview-loading">กำลังสร้างตัวอย่าง PDF</div>;
  }

  return (
    <iframe
      className="pdf-template-frame"
      key={`${pdfUrl}-${page}`}
      src={`${pdfUrl}#page=${page}&toolbar=0&navpanes=0&pagemode=none&view=Fit&zoom=page-fit`}
      title={`PDF template page ${page}`}
    />
  );
}
