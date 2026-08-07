import type { TemplateImageEdit } from "../types";

export type CoverFitPlacement = {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
  scale: number;
};

export function ReplaceImage(
  edits: Record<string, TemplateImageEdit>,
  slotKey: string,
  file: File
): Record<string, TemplateImageEdit> {
  const previousEdit = edits[slotKey];
  if (previousEdit?.objectUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previousEdit.objectUrl);
  }

  return {
    ...edits,
    [slotKey]: {
      slotKey,
      objectUrl: URL.createObjectURL(file),
      fileName: file.name
    }
  };
}

export function getCoverFitPlacement(
  slotWidth: number,
  slotHeight: number,
  imageWidth: number,
  imageHeight: number
): CoverFitPlacement {
  const scale = Math.max(slotWidth / imageWidth, slotHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  return {
    drawWidth,
    drawHeight,
    offsetX: (slotWidth - drawWidth) / 2,
    offsetY: (slotHeight - drawHeight) / 2,
    scale
  };
}
