import fontkit from "@pdf-lib/fontkit";
import { decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFFont, PDFName, PDFRawStream, PDFStream, PDFString, rgb } from "pdf-lib";
import {
  inspectionChecklistItems,
  inspectionFrequencyOptions,
  page13InspectionMarkPlacements
} from "../data/inspectionChecklist";
import { page14CheckboxOptions } from "../data/page14Checkboxes";
import {
  page17BuildingTypeOptions,
  resolvePage17Party
} from "../data/page17Fields";
import { page18CheckboxOptions, page18MaterialRows } from "../data/page18Fields";
import { page23ChecklistItems } from "../data/page23Fields";
import { page24ChecklistItems } from "../data/page24Fields";
import { getSection2EvidencePlacements, type Section2EvidencePlacement } from "../data/page21Evidence";
import {
  maintenancePlanFrequencyOptions,
  maintenancePlanPage7Items,
  type MaintenancePlanFrequency
} from "../data/maintenancePlanPage7";
import { maintenancePlanPage8Items } from "../data/maintenancePlanPage8";
import { maintenancePlanFrequencyPages } from "../data/maintenancePlanPages9To16";
import {
  maintenancePlanPage18Items,
  type MaintenancePlanPage18Item,
  type MaintenancePlanPage18Values
} from "../data/maintenancePlanPage18";
import { maintenancePlanPage19Items } from "../data/maintenancePlanPage19";
import { annualInspectionTemplate, imageSlots } from "../data/pdfTemplate";
import type { ReportRenderState } from "../types";
import { getCoverFitPlacement } from "./templateEditing";

const DEFAULT_HEADER_LOGO_URL = "/templates/assets/test-true-header-logo.png";
const PAGE12_FREQUENCY_HEADER_IMAGES: Record<string, string> = {
  four_month: "/templates/assets/page12-frequency-four-month.png?v=8",
  six_month: "/templates/assets/page12-frequency-six-month.png?v=8",
  annual: "/templates/assets/page12-frequency-annual.png?v=8"
};
const CHECKLIST_TABLE_PAGES = [
  { pageNumber: 12, tableTopY: 651.8815, tableHeight: 562.6, headerY: 616 },
  { pageNumber: 13, tableTopY: 734.4034, tableHeight: 580.6, headerY: 699 }
] as const;
const imageCache = new Map<string, Promise<HTMLImageElement>>();

let cachedTemplateBytes: ArrayBuffer | null = null;
let cachedFontBytes: ArrayBuffer | null = null;

async function getTemplateArrayBuffer() {
  if (!cachedTemplateBytes) {
    const response = await fetch("/templates/bangchan-building-inspection.pdf");
    cachedTemplateBytes = await response.arrayBuffer();
  }
  return cachedTemplateBytes.slice(0);
}

async function getTahomaFontBuffer() {
  if (!cachedFontBytes) {
    const response = await fetch("/fonts/tahoma.ttf");
    cachedFontBytes = await response.arrayBuffer();
  }
  return cachedFontBytes.slice(0);
}

type PdfNameMap = {
  set: (name: PDFName, value: unknown) => void;
};

function getFieldValue(state: ReportRenderState, key: string) {
  return state.fieldValues[key]?.trim() ?? "";
}

function getUnencodedStreamContents(stream: PDFStream) {
  return (stream as PDFStream & { getUnencodedContents: () => Uint8Array }).getUnencodedContents();
}

function asPdfNameMap(value: unknown): PdfNameMap | null {
  if (value && typeof value === "object" && "set" in value) return value as PdfNameMap;
  return null;
}

function bytesToLatin1(bytes: Uint8Array) {
  return new TextDecoder("latin1").decode(bytes);
}

function latin1ToBytes(text: string) {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }
  return bytes;
}

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
  const decodedContent = bytesToLatin1(content);
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

  return latin1ToBytes(updatedContent);
}

function removeExistingCoverText(content: Uint8Array) {
  let updatedContent = bytesToLatin1(content);
  const coverTextMcids = [24, 25, 26, 27, 28, 31, 32, 33];

  for (const mcid of coverTextMcids) {
    updatedContent = updatedContent.replace(
      new RegExp(`\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${mcid}\\s*>>\\s*BDC[\\s\\S]*?EMC`, "g"),
      ""
    );
  }

  return latin1ToBytes(updatedContent);
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

  return getUnencodedStreamContents(stream);
}

function replaceFirstPageContentStream(page: ReturnType<PDFDocument["getPages"]>[number], content: Uint8Array) {
  const stream = page.doc.context.flateStream(content);
  const streamRef = page.doc.context.register(stream);
  const contents = page.node.Contents();

  if (contents instanceof PDFArray) {
    contents.set(0, streamRef);
    return;
  }

  page.node.set(PDFName.of("Contents"), streamRef);
}

function replacePageContentStreams(
  page: ReturnType<PDFDocument["getPages"]>[number],
  transform: (content: Uint8Array) => Uint8Array
) {
  const contents = page.node.Contents();

  if (contents instanceof PDFArray) {
    for (let index = 0; index < contents.size(); index += 1) {
      const stream = contents.lookup(index, PDFStream);
      const decodedContent =
        stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : getUnencodedStreamContents(stream);
      const updatedContent = transform(decodedContent);
      const updatedStream = page.doc.context.flateStream(updatedContent);
      const updatedStreamRef = page.doc.context.register(updatedStream);
      contents.set(index, updatedStreamRef);
    }
    return;
  }

  const stream = page.doc.context.lookup(contents, PDFStream);
  const decodedContent =
    stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : getUnencodedStreamContents(stream);
  page.node.set(PDFName.of("Contents"), page.doc.context.register(page.doc.context.flateStream(transform(decodedContent))));
}

function appendPageContentStream(page: ReturnType<PDFDocument["getPages"]>[number], content: string) {
  const stream = page.doc.context.flateStream(latin1ToBytes(content));
  const streamRef = page.doc.context.register(stream);
  const contents = page.node.Contents();

  if (contents instanceof PDFArray) {
    contents.push(streamRef);
    return;
  }

  page.node.set(PDFName.of("Contents"), page.doc.context.obj([contents, streamRef]));
}

function patchExistingYearText(pdf: PDFDocument, coverYear: string) {
  const page = pdf.getPages()[0];
  const updatedContent = replaceYearInContentStream(getDecodedPageContentStream(page), coverYear);
  replaceFirstPageContentStream(page, updatedContent);
}

function removeCoverText(pdf: PDFDocument) {
  const page = pdf.getPages()[0];
  const updatedContent = removeExistingCoverText(getDecodedPageContentStream(page));
  replaceFirstPageContentStream(page, updatedContent);
}

function removeMarkedContentByMcids(content: Uint8Array, mcids: number[]) {
  let updatedContent = bytesToLatin1(content);

  for (const mcid of mcids) {
    updatedContent = updatedContent.replace(
      new RegExp(`\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${mcid}\\s*>>\\s*BDC[\\s\\S]*?EMC`, "g"),
      ""
    );
  }

  return latin1ToBytes(updatedContent);
}

function clearMarkedContentTextByMcids(content: Uint8Array, mcids: number[]) {
  let updatedContent = bytesToLatin1(content);

  for (const mcid of mcids) {
    updatedContent = updatedContent.replace(
      new RegExp(`(\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${mcid}\\s*>>\\s*BDC)([\\s\\S]*?)(EMC)`, "g"),
      (_match, start: string, body: string, end: string) => {
        const clearedBody = body
          .replace(/\[[\s\S]*?\]\s*TJ/g, "[]TJ")
          .replace(/<[\s\S]*?>\s*Tj/g, "<>Tj")
          .replace(/\([^)]*\)\s*Tj/g, "()Tj");
        return `${start}${clearedBody}${end}`;
      }
    );
  }

  return latin1ToBytes(updatedContent);
}

function replacePage14CheckboxGlyphs(
  content: Uint8Array,
  checks: ReportRenderState["page14Checks"],
  onReplace: () => void
) {
  let updatedContent = bytesToLatin1(content);

  for (const option of page14CheckboxOptions) {
    const markedContentPattern = new RegExp(
      `(\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${option.mcid}\\s*>>\\s*BDC)([\\s\\S]*?)(EMC)`,
      "g"
    );

    updatedContent = updatedContent.replace(
      markedContentPattern,
      (_match, start: string, body: string, end: string) => {
        const glyph = checks[option.key] ? "0035" : "0085";
        const nextBody = body.replace(
          /(\/C2_1\s+1\s+Tf[\s\S]*?<)(?:0035|0085)(>\s*Tj)/,
          (_glyphMatch, glyphStart: string, glyphEnd: string) => {
            onReplace();
            return `${glyphStart}${glyph}${glyphEnd}`;
          }
        );
        return `${start}${nextBody}${end}`;
      }
    );
  }

  return latin1ToBytes(updatedContent);
}

function replacePage14Checkboxes(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[13];
  let replacementCount = 0;

  replacePageContentStreams(page, (content) =>
    replacePage14CheckboxGlyphs(content, state.page14Checks, () => {
      replacementCount += 1;
    })
  );

  if (replacementCount !== page14CheckboxOptions.length) {
    throw new Error(`Cannot update every page 14 checkbox (${replacementCount}/${page14CheckboxOptions.length})`);
  }
}

function replacePage17BuildingTypeGlyphs(
  content: Uint8Array,
  checks: ReportRenderState["page17BuildingTypes"],
  onReplace: () => void
) {
  let updatedContent = bytesToLatin1(content);

  for (const option of page17BuildingTypeOptions) {
    const markedContentPattern = new RegExp(
      `(\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${option.mcid}\\s*>>\\s*BDC)([\\s\\S]*?)(EMC)`,
      "g"
    );

    updatedContent = updatedContent.replace(
      markedContentPattern,
      (_match, start: string, body: string, end: string) => {
        const glyph = checks[option.key] ? "0035" : "0085";
        const nextBody = body.replace(
          /(\/C2_2\s+1\s+Tf[\s\S]*?<)(?:0035|0085)(>\s*Tj)/,
          (_glyphMatch, glyphStart: string, glyphEnd: string) => {
            onReplace();
            return `${glyphStart}${glyph}${glyphEnd}`;
          }
        );
        return `${start}${nextBody}${end}`;
      }
    );
  }

  return latin1ToBytes(updatedContent);
}

function replacePage17BuildingTypeCheckboxes(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[16];
  let replacementCount = 0;

  replacePageContentStreams(page, (content) =>
    replacePage17BuildingTypeGlyphs(content, state.page17BuildingTypes, () => {
      replacementCount += 1;
    })
  );

  if (replacementCount !== page17BuildingTypeOptions.length) {
    throw new Error(`Cannot update every page 17 checkbox (${replacementCount}/${page17BuildingTypeOptions.length})`);
  }
}

function replacePage18CheckboxGlyphs(
  content: Uint8Array,
  checks: ReportRenderState["page18Checks"],
  onReplace: () => void
) {
  let updatedContent = bytesToLatin1(content);

  for (const option of page18CheckboxOptions) {
    const markedContentPattern = new RegExp(
      `(\\/(?:P|Span)\\s*<<\\s*\\/MCID\\s+${option.mcid}\\s*>>\\s*BDC)([\\s\\S]*?)(EMC)`,
      "g"
    );
    updatedContent = updatedContent.replace(
      markedContentPattern,
      (_match, start: string, body: string, end: string) => {
        const glyph = checks[option.key] ? "0035" : "0085";
        const nextBody = body.replace(
          /(\/C2_2\s+1\s+Tf[\s\S]*?<)(?:0035|0085)(>\s*Tj)/,
          (_glyphMatch, glyphStart: string, glyphEnd: string) => {
            onReplace();
            return `${glyphStart}${glyph}${glyphEnd}`;
          }
        );
        return `${start}${nextBody}${end}`;
      }
    );
  }

  return latin1ToBytes(updatedContent);
}

function replacePage18Checkboxes(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[17];
  let replacementCount = 0;
  replacePageContentStreams(page, (content) =>
    replacePage18CheckboxGlyphs(content, state.page18Checks, () => {
      replacementCount += 1;
    })
  );
  if (replacementCount !== page18CheckboxOptions.length) {
    throw new Error(`Cannot update every page 18 checkbox (${replacementCount}/${page18CheckboxOptions.length})`);
  }
}

function removeChecklistRemarkColumnContent(content: Uint8Array, tableTopY: number, tableHeight: number) {
  let updatedContent = bytesToLatin1(removeMarkedContentByMcids(content, [20, 26, 32, 38, 153]));
  const escapedTopY = String(tableTopY).replace(".", "\\.");
  const escapedHeight = String(tableHeight).replace(".", "\\.");

  updatedContent = updatedContent
    .replace(
      new RegExp(`q 1 0 0 1 522\\.7502 ${escapedTopY} cm\\s*0 0 m\\s*0 -${escapedHeight} l\\s*S\\s*Q\\s*`, "g"),
      ""
    )
    .replace(
      new RegExp(`q 1 0 0 1 298\\.8837 ${escapedTopY} cm\\s*0 0 m\\s*0 -${escapedHeight} l\\s*S\\s*Q`, "g"),
      `q 1 0 0 1 288.7502 ${tableTopY} cm\n0 0 m\n0 -${tableHeight} l\nS\nQ`
    )
    .replace(
      new RegExp(`q 1 0 0 1 358\\.3256 ${escapedTopY} cm\\s*0 0 m\\s*0 -${escapedHeight} l\\s*S\\s*Q`, "g"),
      `q 1 0 0 1 366.7502 ${tableTopY} cm\n0 0 m\n0 -${tableHeight} l\nS\nQ`
    )
    .replace(
      new RegExp(`q 1 0 0 1 414\\.4186 ${escapedTopY} cm\\s*0 0 m\\s*0 -${escapedHeight} l\\s*S\\s*Q`, "g"),
      `q 1 0 0 1 444.7502 ${tableTopY} cm\n0 0 m\n0 -${tableHeight} l\nS\nQ`
    )
    .replace(
      new RegExp(`q 1 0 0 1 468 ${escapedTopY} cm\\s*0 0 m\\s*0 -${escapedHeight} l\\s*S\\s*Q`, "g"),
      `q 1 0 0 1 522.7502 ${tableTopY} cm\n0 0 m\n0 -${tableHeight} l\nS\nQ`
    );

  return latin1ToBytes(updatedContent);
}

function removeDefaultChecklistMarks(pdf: PDFDocument) {
  const defaultMarkMcids = [
    111, 113, 115, 117, 119, 121, 123, 125, 127, 129, 131, 133, 135, 137, 139, 141, 143, 145, 147, 149, 151, 153
  ];

  for (const tablePage of CHECKLIST_TABLE_PAGES) {
    const page = pdf.getPages()[tablePage.pageNumber - 1];
    replacePageContentStreams(page, (content) =>
      removeChecklistRemarkColumnContent(
        removeMarkedContentByMcids(content, defaultMarkMcids),
        tablePage.tableTopY,
        tablePage.tableHeight
      )
    );
  }
}

function removePage13ChecklistText(pdf: PDFDocument) {
  const page = pdf.getPages()[12];
  const page13ChecklistTextMcids = [
    53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 86, 87, 89, 90, 91, 93, 94, 95, 97,
    99, 101, 103, 105, 107, 159
  ];

  replacePageContentStreams(page, (content) => removeMarkedContentByMcids(content, page13ChecklistTextMcids));
}

async function createPage13Item235TextBytes() {
  const scale = 4;
  const width = 190;
  const height = 16;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 13 item 2.3.5 text");
  const itemFont = new FontFace("Page13Item235CordiaNew", 'local("Cordia New")');
  await itemFont.load();
  document.fonts.add(itemFont);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15 * scale}px "Page13Item235CordiaNew"`;
  context.fillText("2.3.5 ระบบลิฟต์ดับเพลิง", 0, 13.8 * scale);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 13 item 2.3.5 text"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage13Item235Text(pdf: PDFDocument) {
  const page = pdf.getPages()[12];
  page.drawRectangle({
    x: 82.5,
    y: 607,
    width: 426,
    height: 20,
    color: rgb(1, 1, 1)
  });
  const textBytes = await createPage13Item235TextBytes();
  const textImage = await pdf.embedPng(textBytes);
  page.drawImage(textImage, { x: 83.45, y: 613.25, width: 190, height: 16 });
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

async function imageUrlToContainPngBytes(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  horizontalAlign: "left" | "center" = "center"
) {
  const image = await loadImage(imageUrl);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) throw new Error("Cannot read header logo");
  sourceContext.drawImage(image, 0, 0);
  const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  let minX = sourceCanvas.width;
  let minY = sourceCanvas.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < sourceCanvas.height; y += 1) {
    for (let x = 0; x < sourceCanvas.width; x += 1) {
      const offset = (y * sourceCanvas.width + x) * 4;
      const alpha = pixels.data[offset + 3];
      const red = pixels.data[offset];
      const green = pixels.data[offset + 1];
      const blue = pixels.data[offset + 2];
      const isWhite = red > 245 && green > 245 && blue > 245;
      if (alpha > 10 && !isWhite) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const sourceX = minX < maxX ? minX : 0;
  const sourceY = minY < maxX ? minY : 0;
  const sourceWidth = minX < maxX ? maxX - minX + 1 : image.naturalWidth;
  const sourceHeight = minY < maxY ? maxY - minY + 1 : image.naturalHeight;

  const renderScale = 4;
  const canvasWidth = targetWidth * renderScale;
  const canvasHeight = targetHeight * renderScale;

  const scale = Math.min(canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare header logo");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  const drawX = horizontalAlign === "left" ? 0 : (canvasWidth - drawWidth) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    drawX,
    (canvasHeight - drawHeight) / 2,
    drawWidth,
    drawHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode header logo"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function fetchBytes(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cannot load asset: ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function replaceMapImageSlot(pdf: PDFDocument, state: ReportRenderState) {
  const mapImageUrl = state.mapLocation.mapImageSource === "capture"
    ? state.mapLocation.mapScreenshotUrl
    : state.mapLocation.uploadedImageUrl || state.mapLocation.mapScreenshotUrl;
  if (!mapImageUrl) return;

  const slot = imageSlots.find((nextSlot) => nextSlot.key === "map_image");
  if (!slot) return;

  const page = pdf.getPages()[slot.page - 1];
  if (!page) return;

  const pageSize = page.getSize();
  const scaleX = pageSize.width / annualInspectionTemplate.designSize.width;
  const scaleY = pageSize.height / annualInspectionTemplate.designSize.height;
  const slotX = slot.x * scaleX;
  const slotY = pageSize.height - (slot.y + slot.height) * scaleY;
  const slotWidth = slot.width * scaleX;
  const slotHeight = slot.height * scaleY;
  const mapImageBytes = await imageUrlToContainPngBytes(
    mapImageUrl,
    Math.round(slot.width),
    Math.round(slot.height)
  );
  const mapImage = await pdf.embedPng(mapImageBytes);

  page.drawRectangle({ x: slotX, y: slotY, width: slotWidth, height: slotHeight, color: rgb(1, 1, 1) });
  page.drawImage(mapImage, {
    x: slotX,
    y: slotY,
    width: slotWidth,
    height: slotHeight
  });
}

async function replaceMapLocationText(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[14];
  if (!page) return;

  pdf.registerFontkit(fontkit);
  const fontBytes = await getTahomaFontBuffer();
  const thaiFont = await pdf.embedFont(fontBytes, { subset: true });
  const googleMapsUrl = state.mapLocation.googleMapsUrl.trim();
  const latitude = Number(state.mapLocation.latitude);
  const longitude = Number(state.mapLocation.longitude);
  const coordinatesAreValid =
    state.mapLocation.latitude.trim() !== "" &&
    state.mapLocation.longitude.trim() !== "" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;
  const annotations = page.node.Annots();
  if (annotations) {
    for (let index = annotations.size() - 1; index >= 0; index -= 1) {
      const annotation = pdf.context.lookup(annotations.get(index), PDFDict);
      const action = annotation?.lookup(PDFName.of("A"), PDFDict);
      if (action?.get(PDFName.of("S"))?.toString() === "/URI") {
        annotations.remove(index);
      }
    }
  }

  page.drawRectangle({ x: 48, y: 594, width: 445, height: 30, color: rgb(1, 1, 1) });

  if (googleMapsUrl) {
    const preferredSize = 11;
    const widthAtPreferredSize = thaiFont.widthOfTextAtSize(googleMapsUrl, preferredSize);
    const fontSize = Math.max(4, Math.min(preferredSize, preferredSize * (440 / widthAtPreferredSize)));
    page.drawText(googleMapsUrl, {
      x: 49.5,
      y: 612.3,
      size: fontSize,
      font: thaiFont,
      color: rgb(0.05, 0.45, 0.82)
    });
    const underlineWidth = Math.min(440, thaiFont.widthOfTextAtSize(googleMapsUrl, fontSize));
    page.drawLine({
      start: { x: 49.5, y: 611.2 },
      end: { x: 49.5 + underlineWidth, y: 611.2 },
      thickness: 0.35,
      color: rgb(0.05, 0.45, 0.82)
    });
    try {
      const parsedUrl = new URL(googleMapsUrl);
      if (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:") {
        const linkAnnotation = pdf.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [49.5, 610.5, 49.5 + underlineWidth, 624],
          Border: [0, 0, 0],
          A: {
            Type: "Action",
            S: "URI",
            URI: PDFString.of(googleMapsUrl)
          }
        });
        page.node.addAnnot(pdf.context.register(linkAnnotation));
      }
    } catch {
      // The typed value remains visible in the PDF, but invalid URLs are not made clickable.
    }
  }

  if (coordinatesAreValid) {
    page.drawText(`GPS พิกัด ${state.mapLocation.latitude}, ${state.mapLocation.longitude}`, {
      x: 49.5,
      y: 599.1,
      size: 11,
      font: thaiFont,
      color: rgb(0.18, 0.18, 0.18)
    });
  }
}

async function drawChecklistFrequencyHeaders(pdf: PDFDocument) {
  const headerDebug = inspectionFrequencyOptions.map((option) => ({
    key: option.key,
    x: option.x,
    asset: PAGE12_FREQUENCY_HEADER_IMAGES[option.key]
  }));
  console.info("[PDF checklist frequency headers]", JSON.stringify(headerDebug));

  for (const tablePage of CHECKLIST_TABLE_PAGES) {
    const page = pdf.getPages()[tablePage.pageNumber - 1];
    const resources = page.node.Resources();
    const xObjects = asPdfNameMap(resources?.lookup(PDFName.of("XObject")));
    if (!xObjects) continue;
    const drawCommands: string[] = [];

    for (const option of inspectionFrequencyOptions) {
      const labelBytes = await fetchBytes(PAGE12_FREQUENCY_HEADER_IMAGES[option.key]);
      const labelImage = await pdf.embedPng(labelBytes);
      const imageNameText = `ChecklistHeaderP${tablePage.pageNumber}${option.key}`;
      const imageName = PDFName.of(imageNameText);
      xObjects.set(imageName, labelImage.ref);
      drawCommands.push(`q\n78 0 0 24 ${option.x - 39} ${tablePage.headerY} cm\n/${imageNameText} Do\nQ`);
    }

    appendPageContentStream(page, `${drawCommands.join("\n")}\n`);
  }
}

async function replaceDefaultHeaderLogos(pdf: PDFDocument, state: ReportRenderState) {
  const logoUrl = DEFAULT_HEADER_LOGO_URL;
  const coverLogoBytes = await imageUrlToContainPngBytes(logoUrl, 240, 55, "left");
  const headerLogoBytes = await imageUrlToContainPngBytes(logoUrl, 210, 42, "left");
  const coverLogo = await pdf.embedPng(coverLogoBytes);
  const headerLogo = await pdf.embedPng(headerLogoBytes);

  pdf.getPages().forEach((page, index) => {
    const resources = page.node.Resources();
    const xObjects = asPdfNameMap(resources?.lookup(PDFName.of("XObject")));
    if (!xObjects) return;

    xObjects.set(PDFName.of(index === 0 ? "Im1" : "Im0"), index === 0 ? coverLogo.ref : headerLogo.ref);

    if (index === 0) {
      page.drawRectangle({ x: 25, y: 700, width: 230, height: 75, color: rgb(1, 1, 1) });
      page.drawImage(coverLogo, { x: 28, y: 708, width: 210, height: 50 });
      return;
    }

    page.drawRectangle({ x: 32, y: 860, width: 167, height: 38, color: rgb(1, 1, 1) });
    
    page.drawImage(headerLogo, { x: 32, y: 745.7, width: 167, height: 34 });
  });
}

function fitFontSize(font: PDFFont, text: string, maxWidth: number, preferredSize: number) {
  let fontSize = preferredSize;
  while (fontSize > 8 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 0.5;
  }
  return fontSize;
}

function drawCenteredText(
  page: ReturnType<PDFDocument["getPages"]>[number],
  font: PDFFont,
  text: string,
  centerX: number,
  baselineY: number,
  maxWidth: number,
  preferredSize: number
) {
  const safeText = text.trim() || " ";
  const fontSize = fitFontSize(font, safeText, maxWidth, preferredSize);
  const textWidth = font.widthOfTextAtSize(safeText, fontSize);
  page.drawText(safeText, {
    x: centerX - textWidth / 2,
    y: baselineY,
    size: fontSize,
    font,
    color: rgb(0.231, 0.22, 0.22)
  });
}

function wrapText(font: PDFFont, text: string, maxWidth: number, fontSize: number) {
  const words = text.includes(" ") ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = `${currentLine}${word}`;
    if (currentLine && font.widthOfTextAtSize(nextLine, fontSize) > maxWidth) {
      lines.push(currentLine.trimEnd());
      currentLine = word.trimStart();
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) lines.push(currentLine.trimEnd());
  return lines;
}

function drawWrappedText(
  page: ReturnType<PDFDocument["getPages"]>[number],
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize = 10.5,
  lineHeight = 13.5
) {
  const lines = wrapText(font, text, maxWidth, fontSize);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size: fontSize,
      font,
      color: rgb(0, 0, 0)
    });
  });
  return lines.length;
}

function appendRawText(
  page: ReturnType<PDFDocument["getPages"]>[number],
  font: PDFFont,
  fontName: string,
  text: string,
  x: number,
  y: number,
  size: number
) {
  const resources = page.node.Resources();
  const fonts = asPdfNameMap(resources?.lookup(PDFName.of("Font")));
  if (fonts) {
    fonts.set(PDFName.of(fontName), font.ref);
  }

  const encodedText = (font as unknown as { encodeText: (value: string) => { toString: () => string } }).encodeText(
    text
  );
  appendPageContentStream(
    page,
    `q\nBT\n/${fontName} ${size} Tf\n0 g\n1 0 0 1 ${x} ${y} Tm\n${encodedText.toString()} Tj\nET\nQ\n`
  );
}

function appendRawWrappedText(
  page: ReturnType<PDFDocument["getPages"]>[number],
  font: PDFFont,
  fontName: string,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  lineHeight: number
) {
  const lines = wrapText(font, text, maxWidth, size);
  lines.forEach((line, index) => appendRawText(page, font, fontName, line, x, y - index * lineHeight, size));
  return lines.length;
}

async function replaceGeneralBuildingInfo(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[13];
  const overlayBytes = await createGeneralBuildingInfoImageBytes(state);
  const overlay = await pdf.embedPng(overlayBytes);

  page.drawImage(overlay, { x: 38, y: 432, width: 464, height: 80 });
}

const THAI_MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม"
] as const;

function formatThaiPermitDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!THAI_MONTH_NAMES[monthIndex] || day < 1 || day > 31) return null;

  return {
    day: String(day),
    month: THAI_MONTH_NAMES[monthIndex],
    buddhistYear: String(year + 543)
  };
}

async function createPage14PermitTextImageBytes(state: ReportRenderState) {
  const permitDate = formatThaiPermitDate(getFieldValue(state, "building_permit_date"));
  const dateText = permitDate
    ? `${permitDate.day} เดือน ${permitDate.month} พ.ศ. ${permitDate.buddhistYear}`
    : "- เดือน - พ.ศ. -";
  const permitText = `ได้รับใบอนุญาตก่อสร้างจากเจ้าพนักงานท้องถิ่น เมื่อวันที่ ${dateText}`;
  const scale = 4;
  const pdfWidth = 464;
  const pdfHeight = 20;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 14 permit text overlay");

  const permitFont = new FontFace("Page14PermitCordiaNew", 'local("Cordia New")');
  await permitFont.load();
  document.fonts.add(permitFont);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page14PermitCordiaNew"`;

  const textX = 1.42 * scale;
  const maxWidth = 460 * scale;
  if (context.measureText(permitText).width > maxWidth) {
    throw new Error("วันที่ใบอนุญาตก่อสร้างยาวเกินพื้นที่ข้อความเดิมของหน้า 14");
  }
  context.fillText(permitText, textX, 10.33 * scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 14 permit text overlay"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage14PermitText(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[13];
  const overlayBytes = await createPage14PermitTextImageBytes(state);
  const overlay = await pdf.embedPng(overlayBytes);
  page.drawImage(overlay, { x: 38, y: 414, width: 464, height: 20 });
}

async function createPage14ControlledUseDateImageBytes(state: ReportRenderState) {
  const permitDate = formatThaiPermitDate(getFieldValue(state, "controlled_use_permit_date"));
  const dateText = permitDate
    ? `เมื่อวันที่ ${permitDate.day} เดือน ${permitDate.month} พ.ศ. ${permitDate.buddhistYear}`
    : "เมื่อวันที่ - เดือน - พ.ศ. -";
  const scale = 4;
  const pdfWidth = 200;
  const pdfHeight = 20;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 14 controlled-use date overlay");

  const dateFont = new FontFace("Page14ControlledUseCordiaNew", 'local("Cordia New")');
  await dateFont.load();
  document.fonts.add(dateFont);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page14ControlledUseCordiaNew"`;

  const maxWidth = 196 * scale;
  if (context.measureText(dateText).width > maxWidth) {
    throw new Error("วันที่ใบอนุญาตเปิดใช้อาคารยาวเกินพื้นที่ข้อความเดิมของหน้า 14");
  }
  context.fillText(dateText, 1.68 * scale, 10.44 * scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 14 controlled-use date overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage14ControlledUseDate(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[13];
  const overlayBytes = await createPage14ControlledUseDateImageBytes(state);
  const overlay = await pdf.embedPng(overlayBytes);
  page.drawImage(overlay, { x: 146, y: 146, width: 200, height: 20 });
}

async function createPage17PartyImageBytes(
  details: ReturnType<typeof resolvePage17Party>,
  pdfHeight: number,
  baselines: number[]
) {
  const scale = 4;
  const pdfWidth = 410;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 17 party overlay");

  const partyFont = new FontFace("Page17PartyCordiaNew", 'local("Cordia New")');
  await partyFont.load();
  document.fonts.add(partyFont);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page17PartyCordiaNew"`;

  const lines = [
    `ชื่อ ${details.name}`,
    `ตั้งอยู่เลขที่ ${details.house_number} หมู่ที่ ${details.moo} ถนน ${details.road}`,
    `ตำบล/แขวง ${details.subdistrict} อำเภอ/เขต ${details.district}`,
    `จังหวัด ${details.province} รหัสไปรษณีย์ ${details.postal_code}`
  ];
  const textX = 1.34 * scale;
  const maxWidth = 405 * scale;

  lines.forEach((line, index) => {
    if (context.measureText(line).width > maxWidth) {
      throw new Error(`ข้อมูลหน้า 17 ยาวเกินพื้นที่ข้อความเดิม: ${line}`);
    }
    context.fillText(line, textX, baselines[index] * scale);
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 17 party overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage17PartyDetails(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[16];
  const owner = resolvePage17Party(state.fieldValues, state.page17Owner);
  const occupant = resolvePage17Party(state.fieldValues, state.page17Occupant);
  const ownerBytes = await createPage17PartyImageBytes(owner, 88, [10.76, 29.24, 48.44, 72.8]);
  const occupantBytes = await createPage17PartyImageBytes(occupant, 80, [10.36, 28.84, 48.04, 67.24]);
  const ownerOverlay = await pdf.embedPng(ownerBytes);
  const occupantOverlay = await pdf.embedPng(occupantBytes);

  page.drawImage(ownerOverlay, { x: 80, y: 595, width: 410, height: 88 });
  page.drawImage(occupantOverlay, { x: 80, y: 473, width: 410, height: 80 });
}

async function createPage17OtherTextImageBytes(state: ReportRenderState) {
  const scale = 4;
  const pdfWidth = 372;
  const pdfHeight = 22;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 17 other text overlay");

  const otherFont = new FontFace("Page17OtherCordiaNew", 'local("Cordia New")');
  await otherFont.load();
  document.fonts.add(otherFont);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page17OtherCordiaNew"`;

  const selectedText = state.page17BuildingTypes.other ? state.page17OtherText.trim() : "";
  let line = selectedText ? `........ ${selectedText} ` : "";
  const maxWidth = 368 * scale;
  if (context.measureText(line).width > maxWidth) {
    throw new Error("ข้อความอื่น ๆ หน้า 17 ยาวเกินพื้นที่ข้อความเดิม");
  }
  while (context.measureText(`${line}.`).width <= maxWidth) line += ".";
  if (!line) line = ".";
  context.fillText(line, 2 * scale, 11.96 * scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 17 other text overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage17OtherText(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[16];
  const overlayBytes = await createPage17OtherTextImageBytes(state);
  const overlay = await pdf.embedPng(overlayBytes);
  page.drawImage(overlay, { x: 151, y: 146, width: 372, height: 22 });
}

function wrapPage18Text(
  context: CanvasRenderingContext2D,
  text: string,
  widths: number[],
  scale: number
) {
  const lines: string[] = [];
  let line = "";
  const characters = Array.from(text.replace(/\r/g, ""));
  for (const character of characters) {
    if (character === "\n") {
      lines.push(line.trim());
      line = "";
      if (lines.length === widths.length) break;
      continue;
    }
    const nextLine = line + character;
    const width = widths[Math.min(lines.length, widths.length - 1)] * scale;
    if (line && context.measureText(nextLine).width > width) {
      lines.push(line.trim());
      line = character.trimStart();
      if (lines.length === widths.length) break;
    } else {
      line = nextLine;
    }
  }
  if (lines.length < widths.length && (line || lines.length === 0)) lines.push(line.trim());
  return lines.slice(0, widths.length);
}

function drawPage18DottedValue(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  baseline: number,
  maxWidth: number,
  scale: number,
  leading = ""
) {
  let line = `${leading}${value}`;
  while (context.measureText(`${line}.`).width <= maxWidth * scale) line += ".";
  context.save();
  context.beginPath();
  context.rect(x * scale, (baseline - 17) * scale, maxWidth * scale, 21 * scale);
  context.clip();
  context.fillText(line || ".", x * scale, baseline * scale);
  context.restore();
}

async function createPage18TextOverlayBytes(state: ReportRenderState) {
  const scale = 4;
  const canvas = document.createElement("canvas");
  canvas.width = 540 * scale;
  canvas.height = 780 * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 18 text overlay");

  const page18Font = new FontFace("Page18CordiaNew", 'local("Cordia New")');
  await page18Font.load();
  document.fonts.add(page18Font);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page18CordiaNew"`;

  const erase = (_x: number, _y: number, _width: number, _height: number) => undefined;

  erase(340, 47, 188, 22);
  erase(37, 69, 490, 79);
  const structureWidths = [183, 484, 484, 484, 484];
  const structureLines = wrapPage18Text(context, state.page18Text.structureDescription, structureWidths, scale);
  [
    { x: 341, baseline: 65, width: 183, leading: "…." },
    { x: 39, baseline: 84, width: 484, leading: "" },
    { x: 39, baseline: 103, width: 484, leading: "" },
    { x: 39, baseline: 122, width: 484, leading: "" },
    { x: 39, baseline: 141, width: 484, leading: "" }
  ].forEach((line, index) =>
    drawPage18DottedValue(context, structureLines[index] ?? "", line.x, line.baseline, line.width, scale, line.leading)
  );

  const valueSlots = [
    { value: state.page18Text.aboveGroundFloors, x: 255, y: 190, width: 0, baseline: 199.5 }, 
    { value: state.page18Text.basementFloors, x: 183, y: 209, width: 0, baseline: 219 },     
    { value: state.page18Text.accessRoadWidth, x: 207, y: 228, width: 0, baseline: 238 }    
  ];
  valueSlots.forEach((slot) => {
    erase(slot.x, slot.y, slot.width, 20);
    context.fillText(slot.value, slot.x * scale, slot.baseline * scale);
  });

  erase(160, 247, 367, 20);
  erase(37, 266, 490, 60);
  const otherBuildingLines = wrapPage18Text(context, state.page18Text.otherBuildingInfo, [360, 484, 484, 484], scale);
  [
    { x: 162, baseline: 264, width: 360 },
    { x: 39, baseline: 283, width: 484 },
    { x: 39, baseline: 302, width: 484 },
    { x: 39, baseline: 321, width: 484 }
  ].forEach((line, index) =>
    drawPage18DottedValue(context, otherBuildingLines[index] ?? "", line.x, line.baseline, line.width, scale)
  );

  erase(233, 369, 278, 21);
  erase(217, 391, 295, 21);
  drawPage18DottedValue(context, state.page18Text.permittedUse, 234, 387, 273, scale, "................");
  drawPage18DottedValue(context, state.page18Text.currentUse, 218, 409, 289, scale, "....................");

  const materialBaselines = [492, 511, 530, 549, 568, 587];
  page18MaterialRows.forEach((row, index) => {
    const details = state.page18Materials[row.key];
    const top = 474 + index * 19.2;
    erase(145, top, 350, 20);
    drawPage18DottedValue(context, details.type, 151, materialBaselines[index], 102, scale, "ประเภท ");
    drawPage18DottedValue(context, details.quantity, 253, materialBaselines[index], 116, scale, "ปริมาณ ");
    drawPage18DottedValue(context, details.storage, 369, materialBaselines[index], 122, scale, "สถานที่เก็บ ");
  });
  erase(150, 589, 340, 21);
  drawPage18DottedValue(context, state.page18Text.otherMaterial, 152, 607, 334, scale);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 18 text overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage18Text(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[17];
  const eraseRegions = [
    [340, 47, 188, 22], [37, 69, 490, 79],
    [252, 190, 16, 20], [180, 209, 14, 20], [205, 228, 16, 20],
    [160, 247, 367, 20], [37, 266, 490, 60],
    [233, 369, 278, 21], [217, 391, 295, 21],
    ...page18MaterialRows.map((_row, index) => [145, 474 + index * 19.2, 350, 20]),
    [150, 589, 340, 21]
  ];
  eraseRegions.forEach(([x, top, width, height]) => {
    page.drawRectangle({ x, y: 780 - top - height, width, height, color: rgb(1, 1, 1) });
  });
  const overlayBytes = await createPage18TextOverlayBytes(state);
  const overlay = await pdf.embedPng(overlayBytes);
  page.drawImage(overlay, { x: 0, y: 0, width: 540, height: 780 });
}

async function createSection2EvidenceTextOverlayBytes(
  placements: Section2EvidencePlacement[],
  imageEdits: ReportRenderState["imageEdits"]
) {
  const scale = 3;
  const contentLeft = 54;
  const contentTop = 45;
  const contentWidth = 432;
  const contentHeight = 675;
  const canvas = document.createElement("canvas");
  canvas.width = contentWidth * scale;
  canvas.height = contentHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare section 2 evidence text overlay");
  const evidenceFont = new FontFace("Section2EvidenceCordiaNew", 'local("Cordia New")');
  await evidenceFont.load();
  document.fonts.add(evidenceFont);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.textRendering = "geometricPrecision";

  for (const placement of placements) {
    const relativeCenterX = (placement.x - contentLeft + placement.width / 2) * scale;
    const relativeImageCenterY = (placement.top - contentTop + placement.imageHeight / 2) * scale;
    const labelHeight = placement.cellHeight - placement.imageHeight;
    const relativeLabelCenterY = (
      placement.top - contentTop + placement.imageHeight + labelHeight / 2
    ) * scale;

    if (!imageEdits[placement.slotKey]) {
      context.fillStyle = "#77859a";
      context.font = `${10.5 * scale}px "Section2EvidenceCordiaNew"`;
      context.fillText("ยังไม่ได้อัปโหลดรูป", relativeCenterX, relativeImageCenterY);
    }

    let fontSize = 15;
    let lines: string[] = [];
    do {
      context.font = `700 ${fontSize * scale}px "Section2EvidenceCordiaNew"`;
      lines = wrapCanvasTextLines(context, placement.label, (placement.width - 6) * scale);
      if (lines.length <= 2 || fontSize <= 7.5) break;
      fontSize -= 0.5;
    } while (fontSize >= 7.5);
    context.fillStyle = "#000000";
    const visibleLines = lines.slice(0, 2);
    const lineHeight = fontSize * 0.92 * scale;
    const firstLineY = relativeLabelCenterY - ((visibleLines.length - 1) * lineHeight) / 2;
    visibleLines.forEach((line, index) => {
      context.fillText(line, relativeCenterX, firstLineY + index * lineHeight);
    });
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode section 2 evidence text overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replaceSection2EvidencePages(pdf: PDFDocument, state: ReportRenderState) {
  const placements = getSection2EvidencePlacements(state.page23Results, state.page24Results);
  for (const pageNumber of [21, 22, 23] as const) {
    const page = pdf.getPages()[pageNumber - 1];
    const pagePlacements = placements.filter((placement) => placement.page === pageNumber);
    page.drawRectangle({ x: 36, y: 40, width: 468, height: 698, color: rgb(1, 1, 1) });

    for (const placement of pagePlacements) {
      const imageY = 780 - placement.top - placement.imageHeight;
      page.drawRectangle({
        x: placement.x,
        y: imageY,
        width: placement.width,
        height: placement.imageHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.78, 0.82, 0.88),
        borderWidth: 0.65
      });
      const edit = state.imageEdits[placement.slotKey];
      if (!edit) continue;
      const imageBytes = await imageUrlToCoverPngBytes(
        edit.objectUrl,
        Math.max(1, Math.round(placement.width * 3)),
        Math.max(1, Math.round(placement.imageHeight * 3))
      );
      const evidenceImage = await pdf.embedPng(imageBytes);
      page.drawImage(evidenceImage, {
        x: placement.x + 0.65,
        y: imageY + 0.65,
        width: placement.width - 1.3,
        height: placement.imageHeight - 1.3
      });
    }

    if (pagePlacements.length === 0) continue;
    const textOverlayBytes = await createSection2EvidenceTextOverlayBytes(pagePlacements, state.imageEdits);
    const textOverlay = await pdf.embedPng(textOverlayBytes);
    page.drawImage(textOverlay, { x: 54, y: 60, width: 432, height: 675 });
  }
}

async function createPage23HeaderBytes() {
  const scale = 4;
  const width = 239.25;
  const height = 46.1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 23 table header");
  const headerFont = new FontFace("Page23CordiaNew", 'local("Cordia New")');
  await headerFont.load();
  document.fonts.add(headerFont);
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15 * scale}px "Page23CordiaNew"`;
  context.fillText("ใช้ได้", 22.5 * scale, 32.2 * scale);
  context.fillText("ไม่ได้", 67.5 * scale, 32.2 * scale);
  context.fillText("ไม่มี", 112.5 * scale, 32.2 * scale);
  context.fillText("หมายเหตุ", 187.125 * scale, 32.2 * scale);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 23 table header"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function createPage24Item2311TextBytes() {
  const scale = 4;
  const width = 190;
  const height = 18;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 24 item 2.3.11 text");
  const itemFont = new FontFace("Page24Item2311CordiaNew", 'local("Cordia New")');
  await itemFont.load();
  document.fonts.add(itemFont);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15 * scale}px "Page24Item2311CordiaNew"`;
  context.fillText("2.3.11 แบบแปลนเพื่อการดับเพลิง", 0, 14 * scale);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 24 item 2.3.11 text"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

type Page23TableItem = { key: string; centerTop: number };

async function createPage23RemarkOverlayBytes(
  items: readonly Page23TableItem[],
  remarks: Record<string, string>
) {
  const scale = 4;
  const width = 239.25;
  const height = 780;
  const remarkLeft = 135;
  const remarkWidth = width - remarkLeft;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 23 remark overlay");
  const remarkFont = new FontFace("Page23RemarkCordiaNew", 'local("Cordia New")');
  await remarkFont.load();
  document.fonts.add(remarkFont);
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.textRendering = "geometricPrecision";

  for (const item of items) {
    const remark = remarks[item.key]?.trim();
    if (!remark) continue;
    let fontSize = 15;
    do {
      context.font = `${fontSize * scale}px "Page23RemarkCordiaNew"`;
      if (context.measureText(remark).width <= (remarkWidth - 6) * scale || fontSize <= 6) break;
      fontSize -= 0.5;
    } while (fontSize >= 6);
    context.fillText(remark, (remarkLeft + remarkWidth / 2) * scale, item.centerTop * scale);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 23 remark overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function drawPage23CheckMark(
  page: ReturnType<PDFDocument["getPages"]>[number],
  centerX: number,
  centerY: number
) {
  page.drawLine({
    start: { x: centerX - 5.5, y: centerY },
    end: { x: centerX - 1.7, y: centerY - 4.2 },
    thickness: 1.15,
    color: rgb(0, 0, 0)
  });
  page.drawLine({
    start: { x: centerX - 1.7, y: centerY - 4.2 },
    end: { x: centerX + 5.8, y: centerY + 5.1 },
    thickness: 1.15,
    color: rgb(0, 0, 0)
  });
}

async function replacePage23Table(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[23];
  const tableLeft = 283.5;
  const tableRight = 522.75;
  const statusColumnWidth = 45;
  const columnBoundaries = [tableLeft, tableLeft + 45, tableLeft + 90, tableLeft + 135, tableRight];
  const tableTop = 703.69;
  const headerBottom = 657.59;
  const tableBottom = 89.49;

  page.drawRectangle({
    x: tableLeft + 0.3,
    y: tableBottom + 0.3,
    width: tableRight - tableLeft - 0.6,
    height: tableTop - tableBottom - 0.6,
    color: rgb(1, 1, 1)
  });
  const lineStyle = { thickness: 0.75, color: rgb(0, 0, 0) } as const;
  columnBoundaries.forEach((x) => {
    page.drawLine({ start: { x, y: tableBottom }, end: { x, y: tableTop }, ...lineStyle });
  });
  page.drawLine({ start: { x: tableLeft, y: tableTop }, end: { x: tableRight, y: tableTop }, ...lineStyle });
  page.drawLine({ start: { x: tableLeft, y: headerBottom }, end: { x: tableRight, y: headerBottom }, ...lineStyle });
  page.drawLine({ start: { x: tableLeft, y: tableBottom }, end: { x: tableRight, y: tableBottom }, ...lineStyle });

  const headerBytes = await createPage23HeaderBytes();
  const header = await pdf.embedPng(headerBytes);
  page.drawImage(header, { x: tableLeft, y: headerBottom, width: tableRight - tableLeft, height: tableTop - headerBottom });

  const resultCenters = {
    usable: tableLeft + statusColumnWidth * 0.5,
    unusable: tableLeft + statusColumnWidth * 1.5,
    unavailable: tableLeft + statusColumnWidth * 2.5
  } as const;
  page23ChecklistItems.forEach((item) => {
    const result = state.page23Results[item.key];
    if (!result) return;
    drawPage23CheckMark(page, resultCenters[result], 780 - item.centerTop);
  });

  const remarkBytes = await createPage23RemarkOverlayBytes(page23ChecklistItems, state.page23Remarks);
  const remarkOverlay = await pdf.embedPng(remarkBytes);
  page.drawImage(remarkOverlay, { x: tableLeft, y: 0, width: tableRight - tableLeft, height: 780 });
}

async function replacePage24Table(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[24];
  const tableLeft = 283.5;
  const tableRight = 522.75;
  const statusColumnWidth = 45;
  const columnBoundaries = [tableLeft, tableLeft + 45, tableLeft + 90, tableLeft + 135, tableRight];
  const tableTop = 734.56;
  const headerBottom = 688.46;
  const tableBottom = 156.36;

  page.drawRectangle({
    x: tableLeft + 0.3,
    y: tableBottom + 0.3,
    width: tableRight - tableLeft - 0.6,
    height: tableTop - tableBottom - 0.6,
    color: rgb(1, 1, 1)
  });
  const lineStyle = { thickness: 0.75, color: rgb(0, 0, 0) } as const;
  columnBoundaries.forEach((x) => {
    page.drawLine({ start: { x, y: tableBottom }, end: { x, y: tableTop }, ...lineStyle });
  });
  page.drawLine({ start: { x: tableLeft, y: tableTop }, end: { x: tableRight, y: tableTop }, ...lineStyle });
  page.drawLine({ start: { x: tableLeft, y: headerBottom }, end: { x: tableRight, y: headerBottom }, ...lineStyle });
  page.drawLine({ start: { x: tableLeft, y: tableBottom }, end: { x: tableRight, y: tableBottom }, ...lineStyle });

  const headerBytes = await createPage23HeaderBytes();
  const header = await pdf.embedPng(headerBytes);
  page.drawImage(header, { x: tableLeft, y: headerBottom, width: tableRight - tableLeft, height: tableTop - headerBottom });

  const item2311Bytes = await createPage24Item2311TextBytes();
  const item2311Text = await pdf.embedPng(item2311Bytes);
  page.drawImage(item2311Text, { x: 110, y: 486.52, width: 190, height: 18 });

  const resultCenters = {
    usable: tableLeft + statusColumnWidth * 0.5,
    unusable: tableLeft + statusColumnWidth * 1.5,
    unavailable: tableLeft + statusColumnWidth * 2.5
  } as const;
  page24ChecklistItems.forEach((item) => {
    const result = state.page24Results[item.key];
    if (!result) return;
    drawPage23CheckMark(page, resultCenters[result], 780 - item.centerTop);
  });

  const remarkBytes = await createPage23RemarkOverlayBytes(page24ChecklistItems, state.page24Remarks);
  const remarkOverlay = await pdf.embedPng(remarkBytes);
  page.drawImage(remarkOverlay, { x: tableLeft, y: 0, width: tableRight - tableLeft, height: 780 });
}

const PAGE25_THAI_MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
] as const;

function formatPage25ThaiDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const month = PAGE25_THAI_MONTH_NAMES[monthIndex];
  if (!month || day < 1 || day > 31) return null;
  return `${String(day).padStart(2, "0")} ${month} ${year + 543}`;
}

function createPage25ParentheticalLine(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  scale: number
) {
  let leadingDots = "................";
  let trailingDots = "................";
  while (context.measureText(`( ${leadingDots}${value}${trailingDots} )`).width > maxWidth * scale) {
    if (trailingDots.length > leadingDots.length && trailingDots.length > 1) trailingDots = trailingDots.slice(0, -1);
    else if (leadingDots.length > 1) leadingDots = leadingDots.slice(0, -1);
    else break;
  }
  return `( ${leadingDots}${value}${trailingDots} )`;
}

async function createPage25TextOverlayBytes(state: ReportRenderState) {
  const scale = 4;
  const canvas = document.createElement("canvas");
  canvas.width = 540 * scale;
  canvas.height = 780 * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 25 text overlay");

  const page25Font = new FontFace("Page25CordiaNew", 'local("Cordia New")');
  await page25Font.load();
  document.fonts.add(page25Font);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page25CordiaNew"`;

  const inspectorName = state.page25Signatures.inspectorName.trim();
  const inspectorNote = state.page25Signatures.inspectorNote.trim();
  if (inspectorName || inspectorNote) {
    const value = [inspectorName || "นายสายชล สิงหนารถ", inspectorNote].filter(Boolean).join(" ");
    context.fillText(createPage25ParentheticalLine(context, value, 211, scale), 106 * scale, 390 * scale);
  }

  const thaiDate = formatPage25ThaiDate(state.page25Signatures.inspectionDate);
  if (thaiDate) {
    let dateLine = `วันที่ ............${thaiDate}`;
    while (context.measureText(`${dateLine}.`).width <= 226 * scale) dateLine += ".";
    context.fillText(dateLine, 103 * scale, 429 * scale);
  }

  const ownerName = state.page25Signatures.ownerName.trim();
  const ownerPosition = state.page25Signatures.ownerPosition.trim();
  if (ownerName || ownerPosition) {
    const value = [ownerName, ownerPosition].filter(Boolean).join(" ");
    context.fillText(createPage25ParentheticalLine(context, value, 198, scale), 105 * scale, 700 * scale);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 25 text overlay"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function imageUrlToSignaturePngBytes(imageUrl: string, targetWidth: number, targetHeight: number) {
  const image = await loadImage(imageUrl);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) throw new Error("Cannot read signature image");
  sourceContext.drawImage(image, 0, 0);
  const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  let minX = sourceCanvas.width;
  let minY = sourceCanvas.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < sourceCanvas.height; y += 1) {
    for (let x = 0; x < sourceCanvas.width; x += 1) {
      const offset = (y * sourceCanvas.width + x) * 4;
      const alpha = pixels.data[offset + 3];
      const isWhite = pixels.data[offset] > 245 && pixels.data[offset + 1] > 245 && pixels.data[offset + 2] > 245;
      if (alpha > 10 && !isWhite) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const sourceX = minX < maxX ? minX : 0;
  const sourceY = minY < maxY ? minY : 0;
  const sourceWidth = minX < maxX ? maxX - minX + 1 : image.naturalWidth;
  const sourceHeight = minY < maxY ? maxY - minY + 1 : image.naturalHeight;
  const imageScale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const drawWidth = sourceWidth * imageScale;
  const drawHeight = sourceHeight * imageScale;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare signature image");
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    (targetWidth - drawWidth) / 2,
    (targetHeight - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode signature image"));
    }, "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function replacePage25Signatures(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[25];
  const hasInspectorText = Boolean(
    state.page25Signatures.inspectorName.trim() || state.page25Signatures.inspectorNote.trim()
  );
  const hasDate = Boolean(formatPage25ThaiDate(state.page25Signatures.inspectionDate));
  const hasOwnerText = Boolean(
    state.page25Signatures.ownerName.trim() || state.page25Signatures.ownerPosition.trim()
  );
  if (hasInspectorText) page.drawRectangle({ x: 104, y: 386, width: 214, height: 19, color: rgb(1, 1, 1) });
  if (hasDate) page.drawRectangle({ x: 101, y: 345, width: 230, height: 25, color: rgb(1, 1, 1) });
  if (hasOwnerText) page.drawRectangle({ x: 104, y: 77, width: 200, height: 20, color: rgb(1, 1, 1) });
  if (hasInspectorText || hasDate || hasOwnerText) {
    const overlayBytes = await createPage25TextOverlayBytes(state);
    const overlay = await pdf.embedPng(overlayBytes);
    page.drawImage(overlay, { x: 0, y: 0, width: 540, height: 780 });
  }

  const signaturePlacements = [
    { key: "page25_inspector_signature", x: 132, y: 414, width: 178, height: 28 },
    { key: "page25_owner_signature", x: 112, y: 105, width: 181, height: 30 }
  ] as const;
  for (const placement of signaturePlacements) {
    const edit = state.imageEdits[placement.key];
    if (!edit) continue;
    const signatureBytes = await imageUrlToSignaturePngBytes(
      edit.objectUrl,
      Math.round(placement.width * 4),
      Math.round(placement.height * 4)
    );
    const signature = await pdf.embedPng(signatureBytes);
    page.drawImage(signature, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height
    });
  }
}

async function replaceCoverText(pdf: PDFDocument, state: ReportRenderState) {
  const page = pdf.getPages()[0];
  pdf.registerFontkit(fontkit);
  const fontBytes = await fetch("/fonts/tahoma.ttf").then((response) => response.arrayBuffer());
  const thaiFont = await pdf.embedFont(fontBytes, { subset: true });
  const ownerCompany = getFieldValue(state, "owner_company");
  const buildingName = getFieldValue(state, "building_name");
  const buildingDescription = getFieldValue(state, "building_description");

  drawCenteredText(page, thaiFont, `${ownerCompany} (${buildingName})`, 270, 111, 470, 22);
  drawCenteredText(page, thaiFont, buildingDescription, 270, 72, 420, 20);
}

function drawCanvasWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Number.POSITIVE_INFINITY
) {
  const parts = text.includes(" ") ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
  let currentLine = "";
  let currentY = y;
  let lineCount = 0;

  for (const part of parts) {
    const nextLine = `${currentLine}${part}`;
    if (currentLine && context.measureText(nextLine).width > maxWidth) {
      if (lineCount >= maxLines) return;
      context.fillText(currentLine.trimEnd(), x, currentY);
      lineCount += 1;
      currentLine = part.trimStart();
      currentY += lineHeight;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine && lineCount < maxLines) context.fillText(currentLine.trimEnd(), x, currentY);
}

async function createPage13ChecklistTextImageBytes() {
  const labelsByKey = Object.fromEntries(inspectionChecklistItems.map((item) => [item.key, item.label]));
  const rows: Array<{ key: string; y: number }> = [
    { key: "system_smoke_control", y: 664 },
    { key: "system_emergency_power", y: 628 },
    { key: "system_fire_lift", y: 610 },
    { key: "system_fire_alarm", y: 592 },
    { key: "system_extinguisher", y: 574 },
    { key: "system_fire_water", y: 556 },
    { key: "system_auto_fire", y: 520 },
    { key: "system_lightning", y: 502 },
    { key: "system_fire_plan", y: 484 },
    { key: "performance_fire_stairs", y: 430 },
    { key: "performance_exit_sign", y: 412 },
    { key: "performance_fire_alarm", y: 376 },
    { key: "performance_auto_fire", y: 358 },
    { key: "performance_fire_pump", y: 340 },
    { key: "performance_generator", y: 322 },
    { key: "safety_fire_plan", y: 250 },
    { key: "safety_evacuation_plan", y: 232 },
    { key: "safety_management_plan", y: 214 },
    { key: "safety_inspector_plan", y: 178 }
  ];
  const scale = 4;
  const pdfWidth = 207;
  const pdfHeight = 574;
  const pdfTopY = 675;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare page 13 text overlay");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${9.5 * scale}px Tahoma, Arial, sans-serif`;

  const textX = (83.5 - 79.2) * scale;
  const maxWidth = 195 * scale;
  const lineHeight = 13.5 * scale;
  const toCanvasY = (pdfY: number) => (pdfTopY - pdfY) * scale;

  drawCanvasWrappedText(
    context,
    "การตรวจสอบสมรรถนะของระบบและอุปกรณ์ต่างๆ",
    textX,
    toCanvasY(448),
    maxWidth,
    lineHeight
  );
  drawCanvasWrappedText(
    context,
    "การตรวจสอบระบบบริหารจัดการเพื่อความปลอดภัยในอาคาร",
    textX,
    toCanvasY(286),
    maxWidth,
    lineHeight
  );

  for (const row of rows) {
    drawCanvasWrappedText(context, labelsByKey[row.key] ?? "", textX, toCanvasY(row.y), maxWidth, lineHeight);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode page 13 text overlay"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

async function redrawPage13ChecklistText(pdf: PDFDocument) {
  const page = pdf.getPages()[12];
  const resources = page.node.Resources();
  const xObjects = asPdfNameMap(resources?.lookup(PDFName.of("XObject")));
  if (!xObjects) return;
  const textOverlayBytes = await fetchBytes("/templates/assets/page13-checklist-text.png?v=2");
  const textOverlay = await pdf.embedPng(textOverlayBytes);
  const imageNameText = "Page13ChecklistText";
  xObjects.set(PDFName.of(imageNameText), textOverlay.ref);
  appendPageContentStream(page, `q\n207 0 0 574 79.2 101 cm\n/${imageNameText} Do\nQ\n`);
}

async function createGeneralBuildingInfoImageBytes(state: ReportRenderState) {
  const ownerCompany = getFieldValue(state, "owner_company");
  const buildingName = getFieldValue(state, "building_name");
  const buildingAddress = getFieldValue(state, "building_address");
  const scale = 4;
  const pdfWidth = 464;
  const pdfHeight = 80;
  const canvas = document.createElement("canvas");
  canvas.width = pdfWidth * scale;
  canvas.height = pdfHeight * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Cannot prepare general building info overlay");

  const page14Font = new FontFace("Page14CordiaNew", 'local("Cordia New")');
  await page14Font.load();
  document.fonts.add(page14Font);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.textBaseline = "alphabetic";
  context.textRendering = "geometricPrecision";
  context.font = `${15.96 * scale}px "Page14CordiaNew"`;

  const textX = 1.47 * scale;
  const maxWidth = 460 * scale;
  const firstBaselineY = 11.53 * scale;
  const lineHeight = 19.2 * scale;
  const lines = [
    ...wrapCanvasTextLines(context, `ชื่ออาคาร ${ownerCompany} (${buildingName})`, maxWidth),
    ...wrapCanvasTextLines(context, buildingAddress, maxWidth)
  ];

  if (lines.length > 4) {
    throw new Error("ข้อมูลหน้า 14 ยาวเกินพื้นที่ข้อความเดิม กรุณาย่อชื่ออาคารหรือที่อยู่");
  }

  lines.forEach((line, index) => {
    context.fillText(line, textX, firstBaselineY + index * lineHeight);
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Cannot encode general building info overlay"));
    }, "image/png");
  });

  return new Uint8Array(await blob.arrayBuffer());
}

function wrapCanvasTextLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  const pushToken = (token: string) => {
    const candidate = currentLine ? `${currentLine} ${token}` : token;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = "";
    }

    if (context.measureText(token).width <= maxWidth) {
      currentLine = token;
      return;
    }

    for (const character of Array.from(token)) {
      const nextTokenPart = `${currentLine}${character}`;
      if (currentLine && context.measureText(nextTokenPart).width > maxWidth) {
        lines.push(currentLine);
        currentLine = character;
      } else {
        currentLine = nextTokenPart;
      }
    }
  };

  tokens.forEach(pushToken);
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function replaceChecklistMarks(pdf: PDFDocument, state: ReportRenderState) {
  const selectedChecks = inspectionChecklistItems
    .map((item) => ({
      key: item.key,
      frequency: state.inspectionChecks[item.key],
      page: item.page ?? 12,
      y: item.y
    }))
    .filter((item) => item.frequency);
  console.info("[PDF checklist selected checks]", JSON.stringify(selectedChecks));

  for (const tablePage of CHECKLIST_TABLE_PAGES) {
    const page = pdf.getPages()[tablePage.pageNumber - 1];
    const drawCommands: string[] = ["q", "0 0 0 RG", "0.8 w"];

    const markPlacements = tablePage.pageNumber === 13
      ? Object.entries(page13InspectionMarkPlacements).map(([key, placement]) => ({ key, y: placement.y }))
      : inspectionChecklistItems
          .filter((item) => (item.page ?? 12) === tablePage.pageNumber)
          .map((item) => ({ key: item.key, y: item.y }));

    for (const placement of markPlacements) {
      const frequency = state.inspectionChecks[placement.key];
      const option = inspectionFrequencyOptions.find((nextOption) => nextOption.key === frequency);
      if (!option) continue;

      drawCommands.push(
        `${option.x - 5} ${placement.y + 1} m`,
        `${option.x - 1} ${placement.y - 3} l`,
        `${option.x + 7} ${placement.y + 7} l`,
        "S"
      );
    }

    drawCommands.push("Q");
    appendPageContentStream(page, `${drawCommands.join("\n")}\n`);
  }
}

async function replacePdfImageXObjects(pdf: PDFDocument, state: ReportRenderState) {
  const pages = pdf.getPages();

  for (const slot of imageSlots) {
    if (!slot.xObjectName) continue;
    const edit = state.imageEdits[slot.key];
    if (!edit) continue;
    const page = pages[slot.page - 1];
    if (!page) continue;
    const resources = page.node.Resources();
    const xObjects = asPdfNameMap(resources?.lookup(PDFName.of("XObject")));
    if (!xObjects) continue;

    const imageBytes = await imageUrlToCoverPngBytes(edit.objectUrl, Math.round(slot.width), Math.round(slot.height));
    const image = await pdf.embedPng(imageBytes);
    xObjects.set(PDFName.of(slot.xObjectName), image.ref);
  }
}

async function replaceDefaultCoverBuildingPhoto(pdf: PDFDocument, state: ReportRenderState) {
  if (state.imageEdits.cover_building_photo) return;

  const page = pdf.getPages()[0];
  if (!page) return;
  const resources = page.node.Resources();
  const xObjects = asPdfNameMap(resources?.lookup(PDFName.of("XObject")));
  if (!xObjects) return;

  const imageBytes = await fetchBytes("/templates/assets/cover-building-without-04.png");
  const image = await pdf.embedPng(imageBytes);
  xObjects.set(PDFName.of("Im0"), image.ref);
}


export async function createReportPdf(state: ReportRenderState, targetPage?: number) {
  // console.log(`[PDF Generator] เริ่มต้นสร้าง PDF | Target Page: ${targetPage ?? "ทั้งหมด"}`);

  if (state.templateId === "maintenance-plan") {
    try {
      const templateBytes = await fetch("/templates/building-maintenance-plan.pdf").then((response) => {
        if (!response.ok) throw new Error("ไม่สามารถโหลด PDF แผนปฏิบัติการได้");
        return response.arrayBuffer();
      });
      // console.log("[PDF Generator] โหลดเทมเพลตแผนปฏิบัติการสำเร็จ");
      return new Uint8Array(templateBytes);
    } catch (err) {
      // console.error("[PDF Generator Error] โหลดแผนปฏิบัติการไม่สำเร็จ:", err);
      throw err;
    }
  }

  try {
    const templateBytes = await getTemplateArrayBuffer();
    const pdf = await PDFDocument.load(templateBytes);
    pdf.insertPage(22, [540, 780]);
    // console.log(`[PDF Generator] โหลดเทมเพลตสำเร็จ (ทั้งหมด ${pdf.getPageCount()} หน้า)`);

    const executeStep = async (stepName: string, action: () => Promise<void> | void) => {
      try {
        // console.log(`[PDF Step Start] กำลังทำ: ${stepName}`);
        await action();
        // console.log(`[PDF Step Success] สำเร็จ: ${stepName}`);
      } catch (error) {
        // console.error(`[PDF Step Fail] ล้มเหลวที่: ${stepName} | สาเหตุ:`, error);
        throw error;
      }
    };

    if (!targetPage || targetPage === 14) {
      await executeStep("หน้า 14 (Checkboxes)", () => replacePage14Checkboxes(pdf, state));
    }
    if (!targetPage || targetPage === 17) {
      await executeStep("หน้า 17 (Building Type Checkboxes)", () => replacePage17BuildingTypeCheckboxes(pdf, state));
    }
    if (!targetPage || targetPage === 18) {
      await executeStep("หน้า 18 (Checkboxes)", () => replacePage18Checkboxes(pdf, state));
    }

    if (!targetPage || targetPage === 1) {
      await executeStep("หน้า 1 (Cover Year & Cover Text)", () => {
        patchExistingYearText(pdf, getFieldValue(state, "cover_year"));
        removeCoverText(pdf);
      });
    }

    await executeStep("ส่วนหัวกระดาษ (Default Header Logos)", () => replaceDefaultHeaderLogos(pdf, state));

    if (!targetPage || targetPage === 13) {
      await executeStep("หน้า 13 (Item 2.3.5 Text)", () => replacePage13Item235Text(pdf));
    }

    if (!targetPage || targetPage === 1) {
      await executeStep("หน้า 1 (Cover Building Photo)", () => replaceDefaultCoverBuildingPhoto(pdf, state));
    }

    await executeStep("รูปภาพ XObjects ทั้งหมดในเอกสาร", () => replacePdfImageXObjects(pdf, state));

    if (!targetPage || targetPage === 15) {
      await executeStep("หน้า 15 (Map Image Slot)", () => replaceMapImageSlot(pdf, state));
      await executeStep("หน้า 15 (Map Location Text)", () => replaceMapLocationText(pdf, state));
    }

    if (!targetPage || targetPage === 1) {
      await executeStep("หน้า 1 (Cover Text)", () => replaceCoverText(pdf, state));
    }

    if (!targetPage || targetPage === 14) {
      await executeStep("หน้า 14 (General Building Info)", () => replaceGeneralBuildingInfo(pdf, state));
      await executeStep("หน้า 14 (Permit Text)", () => replacePage14PermitText(pdf, state));
      await executeStep("หน้า 14 (Controlled Use Date)", () => replacePage14ControlledUseDate(pdf, state));
    }

    if (!targetPage || targetPage === 17) {
      await executeStep("หน้า 17 (Party Details)", () => replacePage17PartyDetails(pdf, state));
      await executeStep("หน้า 17 (Other Text)", () => replacePage17OtherText(pdf, state));
    }

    if (!targetPage || targetPage === 18) {
      await executeStep("หน้า 18 (Text)", () => replacePage18Text(pdf, state));
    }

    if (!targetPage || targetPage === 21 || targetPage === 22 || targetPage === 23) {
      await executeStep("หน้า 21-23 (Evidence Pages)", () => replaceSection2EvidencePages(pdf, state));
    }

    if (!targetPage || targetPage === 24) {
      await executeStep("หน้า 24 (Table)", () => replacePage23Table(pdf, state));
    }

    if (!targetPage || targetPage === 25) {
      await executeStep("หน้า 25 (Table)", () => replacePage24Table(pdf, state));
    }

    if (!targetPage || targetPage === 26) {
      await executeStep("หน้า 26 (Signatures)", () => replacePage25Signatures(pdf, state));
    }

    if (!targetPage || targetPage === 12 || targetPage === 13) {
      await executeStep("หน้า 12-13 (Checklist Marks & Headers)", async () => {
        removeDefaultChecklistMarks(pdf);
        await drawChecklistFrequencyHeaders(pdf);
        await replaceChecklistMarks(pdf, state);
      });
    }

    if (targetPage && targetPage >= 1 && targetPage <= pdf.getPageCount()) {
      // console.log(`[PDF Generator] กำลังตัดหน้าเฉพาะกิจสำหรับ Preview หน้าที่: ${targetPage}`);
      const previewPdf = await PDFDocument.create();
      const [copiedPage] = await previewPdf.copyPages(pdf, [targetPage - 1]);
      previewPdf.addPage(copiedPage);
      // console.log(`[PDF Generator Success] สร้าง Preview หน้า ${targetPage} สำเร็จ`);
      return previewPdf.save();
    }

    // console.log("[PDF Generator Success] สร้างไฟล์ PDF สมบูรณ์ทั้งหมดสำเร็จ");
    return pdf.save();

  } catch (error) {
    // console.error("[PDF Generator Fatal Error] เกิดข้อผิดพลาดระหว่างสร้าง PDF:", error);
    throw error;
  }
}