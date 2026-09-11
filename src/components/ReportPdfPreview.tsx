import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { ReportRenderState } from "../types";
import { createReportPdf } from "../utils/reportRenderer";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

type ReportPdfPreviewProps = {
  page: number;
  renderState: ReportRenderState;
  zoom: number;
};

export function ReportPdfPreview({ page, renderState, zoom }: ReportPdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocumentCacheRef = useRef<{
    renderState: ReportRenderState;
    page: number; 
    documentTask: ReturnType<typeof pdfjs.getDocument> | null;
    promise: Promise<PDFDocumentProxy>;
  } | null>(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // เพิ่ม State และ Ref สำหรับระบบคลิกลากเลื่อนกระดาษ (Pan)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement?.parentElement;
    if (!container) return;

    const updateWidth = () => {
      const nextWidth = Math.round(container.getBoundingClientRect().width);
      setPreviewWidth((current) => Math.abs(current - nextWidth) >= 2 ? nextWidth : current);
    };
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let isCurrent = true;
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    async function renderPdf() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        if (
          pdfDocumentCacheRef.current?.renderState !== renderState ||
          pdfDocumentCacheRef.current?.page !== page
        ) {
          const previousEntry = pdfDocumentCacheRef.current;
          if (previousEntry) {
            void previousEntry.promise
              .then((document) => document.destroy())
              .catch(() => previousEntry.documentTask?.destroy());
          }

          const nextEntry = {
            renderState,
            page, 
            documentTask: null as ReturnType<typeof pdfjs.getDocument> | null,
            promise: Promise.resolve(null as never as PDFDocumentProxy)
          };
          nextEntry.promise = (async () => {
            const pdfBytes = await createReportPdf(renderState, page);
            nextEntry.documentTask = pdfjs.getDocument({ data: pdfBytes.slice() });
            return nextEntry.documentTask.promise;
          })();
          pdfDocumentCacheRef.current = nextEntry;
        }
        const pdfDocument = await pdfDocumentCacheRef.current.promise;
        if (!isCurrent) return;
        const pageToRender = pdfDocument.numPages === 1 ? 1 : page;
        const pdfPage = await pdfDocument.getPage(pageToRender);
        const canvas = canvasRef.current;
        if (!canvas || !isCurrent) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const containerWidth = previewWidth || canvas.parentElement?.clientWidth || canvas.clientWidth || baseViewport.width;
        const displayWidth = containerWidth * (zoom / 100);
        const deviceScale = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
        const fittedScale = (displayWidth / baseViewport.width) * deviceScale;
        const renderScale = Math.min(Math.max(fittedScale, 1.2), 1.5);
        const viewport = pdfPage.getViewport({ scale: renderScale });

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        renderTask = pdfPage.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (!isCurrent) return;
        canvas.dataset.renderedPage = String(page);
        canvas.dataset.renderedScale = renderScale.toFixed(2);
        canvas.dataset.renderedYear = renderState.fieldValues.cover_year ?? "";
        canvas.dataset.renderedOwnerCompany = renderState.fieldValues.owner_company ?? "";
        canvas.dataset.renderedBuildingName = renderState.fieldValues.building_name ?? "";
        setIsLoading(false);
      } catch (error) {
        const isExpectedCancellation =
          error instanceof Error && (error.name === "RenderingCancelledException" || error.message?.includes("cancelled"));
        if (!isCurrent || isExpectedCancellation) return;
        console.error("[PDF preview render failed]", error);
        setErrorMessage(error instanceof Error ? error.message : "Cannot render PDF preview");
        setIsLoading(false);
      }
    }

    const isPageChanged = pdfDocumentCacheRef.current?.page !== page;

    const renderTimer = window.setTimeout(
      () => {
        void renderPdf();
      },
      isPageChanged
        || renderState.templateId === "sign-maintenance-plan"
        || (renderState.templateId === "mixing-workshop-maintenance-plan"
          && (page === 14 || page === 15 || (page >= 23 && page <= 32) || page === 34 || page === 35))
        ? 0
        : 300
    );

    return () => {
      isCurrent = false;
      window.clearTimeout(renderTimer);
      try {
        renderTask?.cancel();
      } catch {
        // ป้องกัน Error กรณี task ถูกทำลายไปก่อนหน้า
      }
    };
  }, [page, previewWidth, renderState, zoom]);

  useEffect(() => () => {
    const cacheEntry = pdfDocumentCacheRef.current;
    pdfDocumentCacheRef.current = null;
    if (!cacheEntry) return;
    void cacheEntry.promise
      .then((document) => document.destroy())
      .catch(() => cacheEntry.documentTask?.destroy());
  }, []);

  return (
    <>
      {isLoading ? <div className="pdf-preview-loading">กำลังสร้างตัวอย่าง PDF</div> : null}
      {errorMessage ? <div className="pdf-preview-loading">Preview error: {errorMessage}</div> : null}
      <div
        ref={containerRef}
        className="pdf-preview-canvas-stack"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          height: `${zoom}%`,
          maxHeight: zoom === 100 ? "100%" : "none",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "auto",
          userSelect: "none"
        }}
      >
        <canvas
          aria-label={`PDF template page ${page}`}
          className={isLoading ? "pdf-template-frame loading" : "pdf-template-frame"}
          ref={canvasRef}
          style={{ height: "100%", width: "100%", pointerEvents: isDragging ? "none" : "auto" }}
        />
      </div>
    </>
  );
}