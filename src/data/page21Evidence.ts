import type { Page23ResultState, TemplateImageSlot } from "../types";
import { page23ChecklistItems } from "./page23Fields";
import { page24ChecklistItems } from "./page24Fields";

export type Section2EvidenceItem = {
  key: string;
  label: string;
};

export type Section2EvidencePlacement = Section2EvidenceItem & {
  page: 21 | 22 | 23;
  slotKey: string;
  x: number;
  top: number;
  width: number;
  imageHeight: number;
  cellHeight: number;
  columns: 2;
};

export const section2EvidenceItems: Section2EvidenceItem[] = [
  ...page23ChecklistItems,
  ...page24ChecklistItems
]
  .filter((item) => item.key.startsWith("item_2_") || item.key.startsWith("item_3_"))
  .map((item) => ({ ...item, label: item.label.replace(/\s*-\s*ไม่มี\s*$/, "") }));

export function getSection2EvidenceSlotKey(itemKey: string) {
  return `section2_evidence_${itemKey}`;
}

export function getActiveSection2EvidenceItems(
  page23Results: Page23ResultState,
  page24Results: Page23ResultState
) {
  const results = { ...page23Results, ...page24Results };
  return section2EvidenceItems.filter((item) => {
    const result = results[item.key];
    return result === "usable" || result === "unusable";
  });
}

function layoutEvidencePage(items: Section2EvidenceItem[], page: 21 | 22 | 23): Section2EvidencePlacement[] {
  if (items.length === 0) return [];
  const columns = 2 as const;
  const rows = 4;
  const contentLeft = 54;
  const contentTop = 45;
  const contentWidth = 432;
  const contentHeight = 675;
  const columnGap = 16;
  const rowGap = 8;
  const cellWidth = (contentWidth - columnGap * (columns - 1)) / columns;
  const cellHeight = (contentHeight - rowGap * (rows - 1)) / rows;
  const labelHeight = 30;

  return items.map((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      ...item,
      page,
      slotKey: getSection2EvidenceSlotKey(item.key),
      x: contentLeft + column * (cellWidth + columnGap),
      top: contentTop + row * (cellHeight + rowGap),
      width: cellWidth,
      imageHeight: cellHeight - labelHeight,
      cellHeight,
      columns
    };
  });
}

export function getSection2EvidencePlacements(
  page23Results: Page23ResultState,
  page24Results: Page23ResultState
) {
  const activeItems = getActiveSection2EvidenceItems(page23Results, page24Results);
  return [
    ...layoutEvidencePage(activeItems.slice(0, 8), 21),
    ...layoutEvidencePage(activeItems.slice(8, 16), 22),
    ...layoutEvidencePage(activeItems.slice(16, 24), 23)
  ];
}

export function toSection2EvidenceSlot(placement: Section2EvidencePlacement): TemplateImageSlot {
  return {
    key: placement.slotKey,
    label: placement.label,
    page: placement.page,
    type: "image",
    x: placement.x * 2,
    y: placement.top * 2,
    width: placement.width * 2,
    height: placement.imageHeight * 2,
    recommendedSize: "JPG หรือ PNG แนวนอน",
    locked: true
  };
}
