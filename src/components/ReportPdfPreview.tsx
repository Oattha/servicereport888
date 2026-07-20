import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { ReportRenderState } from "../types";
import { createReportPdf } from "../utils/reportRenderer";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type ReportPdfPreviewProps = {
  page: number;
  renderState: ReportRenderState;
};

export function ReportPdfPreview({ page, renderState }: ReportPdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function renderPdf() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const pdfBytes = await createReportPdf(renderState);
        const documentTask = pdfjs.getDocument({ data: pdfBytes.slice() });
        const pdfDocument = await documentTask.promise;
        const pdfPage = await pdfDocument.getPage(page);
        const viewport = pdfPage.getViewport({ scale: 2 });
        const canvas = canvasRef.current;
        if (!canvas || !isCurrent) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pdfPage.render({ canvasContext: context, viewport }).promise;
        if (!isCurrent) return;
        canvas.dataset.renderedPage = String(page);
        canvas.dataset.renderedYear = renderState.fieldValues.cover_year ?? "";
        canvas.dataset.renderedOwnerCompany = renderState.fieldValues.owner_company ?? "";
        canvas.dataset.renderedBuildingName = renderState.fieldValues.building_name ?? "";
        setIsLoading(false);
      } catch (error) {
        console.error("[PDF preview render failed]", error);
        if (!isCurrent) return;
        setErrorMessage(error instanceof Error ? error.message : "Cannot render PDF preview");
        setIsLoading(false);
      }
    }

    void renderPdf();

    return () => {
      isCurrent = false;
    };
  }, [page, renderState]);

  return (
    <>
      {isLoading ? <div className="pdf-preview-loading">กำลังสร้างตัวอย่าง PDF</div> : null}
      {errorMessage ? <div className="pdf-preview-loading">Preview error: {errorMessage}</div> : null}
      <canvas
        aria-label={`PDF template page ${page}`}
        className={isLoading ? "pdf-template-frame loading" : "pdf-template-frame"}
        ref={canvasRef}
      />
    </>
  );
}
