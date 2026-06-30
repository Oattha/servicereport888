import { decodePDFRawStream, PDFArray, PDFDocument, PDFName, PDFRawStream, PDFStream } from "pdf-lib";
import { imageSlots } from "../data/pdfTemplate";
import type { ReportRenderState } from "../types";
import { getCoverFitPlacement } from "./templateEditing";

const DEFAULT_HEADER_LOGO_URL = "/templates/assets/test-true-header-logo.png";
const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cachedImage = imageCache.get(src);
  if (cachedImage) return cachedImage;

  const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Cannot load image: ${src}`));
    image.src = src;
  });

  imageCache.set(src, imagePromise);
  return imagePromise;
}

function replaceYearInContentStream(content: Uint8Array, coverYear: string) {
  const normalizedYear = coverYear.replace(/\D/g, "").padEnd(4, "_").slice(0, 4);
  const decodedContent = new TextDecoder("latin1").decode(content);
  const firstHalf = normalizedYear.slice(0, 2);
  const secondHalf = normalizedYear.slice(2);
  let yearPartIndex = 0;
  const updatedContent = decodedContent
    .replace(
      "/TT0 1 Tf\n140.04 -0 0 140.04 306.6782 563.7623 Tm",
      "/TT1 1 Tf\n140.04 -0 0 140.04 306.6782 563.7623 Tm"
    )
    .replace(/\[\(\d\)0\.8 \(\d\)\]TJ/g, (match) => {
      yearPartIndex += 1;
      if (yearPartIndex === 1) return `[(${firstHalf[0]})0.8 (${firstHalf[1]})]TJ`;
      if (yearPartIndex === 2) return `[(${secondHalf[0]})0.8 (${secondHalf[1]})]TJ`;
      return match;
    });

  return new TextEncoder().encode(updatedContent);
}

function getDecodedPageContentStream(page: ReturnType<PDFDocument["getPages"]>[number]) {
  const contents = page.node.Contents();
  const stream =
    contents instanceof PDFArray
      ? contents.lookup(0, PDFStream)
      : page.doc.context.lookup(contents, PDFStream);

  if (stream instanceof PDFRawStream) {
    return decodePDFRawStream(stream).decode();
  }

  return stream.getUnencodedContents();
}

function patchExistingYearText(pdf: PDFDocument, coverYear: string) {
  const page = pdf.getPages()[0];
  const updatedContent = replaceYearInContentStream(getDecodedPageContentStream(page), coverYear);
  const stream = pdf.context.flateStream(updatedContent);
  const streamRef = pdf.context.register(stream);
  page.node.set(PDFName.of("Contents"), streamRef);
}

async function imageUrlToCoverPngBytes(imageUrl: string, targetWidth: number, targetHeight: number) {
  const image = await loadImage(imageUrl);
  const placement = getCoverFitPlacement(targetWidth, targetHeight, image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare replacement image");

  context.drawImage(image, placement.offsetX, placement.offsetY, placement.drawWidth, placement.drawHeight);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode replacement image"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function imageUrlToContainPngBytes(imageUrl: string, targetWidth: number, targetHeight: number) {
  const image = await loadImage(imageUrl);
  const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare header logo");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, (targetWidth - drawWidth) / 2, (targetHeight - drawHeight) / 2, drawWidth, drawHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode header logo"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function replaceDefaultHeaderLogos(pdf: PDFDocument, state: ReportRenderState) {
  const logoUrl = state.imageEdits.cover_logo?.objectUrl ?? DEFAULT_HEADER_LOGO_URL;
  const coverLogoBytes = await imageUrlToContainPngBytes(logoUrl, 401, 95);
  const headerLogoBytes = await imageUrlToContainPngBytes(logoUrl, 401, 95);
  const coverLogo = await pdf.embedPng(coverLogoBytes);
  const headerLogo = await pdf.embedPng(headerLogoBytes);

  pdf.getPages().forEach((page, index) => {
    const resources = page.node.Resources();
    const xObjects = resources?.lookup(PDFName.of("XObject"));
    if (!xObjects || typeof xObjects !== "object" || !("set" in xObjects)) return;

    xObjects.set(PDFName.of(index === 0 ? "Im1" : "Im0"), index === 0 ? coverLogo.ref : headerLogo.ref);
  });
}

async function replacePdfImageXObjects(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[0];
  const resources = page.node.Resources();
  const xObjects = resources?.lookup(PDFName.of("XObject"));
  if (!xObjects || typeof xObjects !== "object" || !("set" in xObjects)) return;

  for (const slot of imageSlots) {
    if (slot.key === "cover_logo") continue;
    if (!slot.xObjectName) continue;
    const edit = state.imageEdits[slot.key];
    if (!edit) continue;

    const imageBytes = await imageUrlToCoverPngBytes(edit.objectUrl, Math.round(slot.width), Math.round(slot.height));
    const image = await pdf.embedPng(imageBytes);
    xObjects.set(PDFName.of(slot.xObjectName), image.ref);
  }
}

export async function createReportPdf(state: ReportRenderState) {
  const templateBytes = await fetch("/templates/bangchan-building-inspection.pdf").then((response) =>
    response.arrayBuffer()
  );
  const pdf = await PDFDocument.load(templateBytes);

  patchExistingYearText(pdf, state.coverYear);
  await replaceDefaultHeaderLogos(pdf, state);
  await replacePdfImageXObjects(pdf, state);

  return pdf.save();
}
