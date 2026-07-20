import type { ReportDraft, ReportRenderState, TemplateImageEdit } from "../types";

const databaseName = "test-true-service-reports";
const databaseVersion = 1;
const draftStoreName = "report-drafts";

function openDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(draftStoreName)) {
        database.createObjectStore(draftStoreName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("ไม่สามารถเปิดพื้นที่เก็บรายงานชั่วคราวได้"));
  });
}

async function persistUrl(url: string) {
  if (!url.startsWith("blob:")) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error("ไม่สามารถอ่านรูปภาพสำหรับบันทึกชั่วคราวได้");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("ไม่สามารถแปลงรูปภาพสำหรับบันทึกได้"));
    reader.readAsDataURL(blob);
  });
}

async function persistImageEdits(imageEdits: Record<string, TemplateImageEdit>) {
  const entries = await Promise.all(
    Object.entries(imageEdits).map(async ([key, edit]) => [
      key,
      { ...edit, objectUrl: await persistUrl(edit.objectUrl) }
    ] as const)
  );
  return Object.fromEntries(entries);
}

async function prepareStateForStorage(state: ReportRenderState): Promise<ReportRenderState> {
  return {
    ...state,
    fieldValues: { ...state.fieldValues },
    inspectionChecks: { ...state.inspectionChecks },
    page14Checks: { ...state.page14Checks },
    page17Owner: { ...state.page17Owner },
    page17Occupant: { ...state.page17Occupant },
    page17BuildingTypes: { ...state.page17BuildingTypes },
    page18Checks: { ...state.page18Checks },
    page18Text: { ...state.page18Text },
    page18Materials: structuredClone(state.page18Materials),
    page23Results: { ...state.page23Results },
    page23Remarks: { ...state.page23Remarks },
    page24Results: { ...state.page24Results },
    page24Remarks: { ...state.page24Remarks },
    page25Signatures: { ...state.page25Signatures },
    imageEdits: await persistImageEdits(state.imageEdits),
    mapLocation: {
      ...state.mapLocation,
      mapScreenshotUrl: await persistUrl(state.mapLocation.mapScreenshotUrl),
      uploadedImageUrl: await persistUrl(state.mapLocation.uploadedImageUrl)
    }
  };
}

export async function saveReportDraft(state: ReportRenderState, existingDraft?: ReportDraft | null) {
  const now = new Date().toISOString();
  const persistentState = await prepareStateForStorage(state);
  const buildingName = state.fieldValues.building_name?.trim() || "ยังไม่ระบุชื่ออาคาร";
  const ownerCompany = state.fieldValues.owner_company?.trim() || "ยังไม่ระบุเจ้าของอาคาร";
  const draft: ReportDraft = {
    id: existingDraft?.id ?? crypto.randomUUID(),
    title: `${buildingName} - ${state.templateId === "maintenance-plan" ? "แผนบำรุงรักษา" : "รายงานตรวจสอบอาคาร"}`,
    buildingName,
    ownerCompany,
    templateId: state.templateId,
    createdAt: existingDraft?.createdAt ?? now,
    updatedAt: now,
    state: persistentState
  };

  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(draftStoreName, "readwrite");
    transaction.objectStore(draftStoreName).put(draft);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("บันทึกรายงานชั่วคราวไม่สำเร็จ"));
  });
  database.close();
  return draft;
}

export async function getReportDrafts() {
  const database = await openDraftDatabase();
  const drafts = await new Promise<ReportDraft[]>((resolve, reject) => {
    const request = database.transaction(draftStoreName, "readonly").objectStore(draftStoreName).getAll();
    request.onsuccess = () => resolve(request.result as ReportDraft[]);
    request.onerror = () => reject(request.error ?? new Error("โหลดรายงานชั่วคราวไม่สำเร็จ"));
  });
  database.close();
  return drafts.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function deleteReportDraft(id: string) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(draftStoreName, "readwrite");
    transaction.objectStore(draftStoreName).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("ลบรายงานชั่วคราวไม่สำเร็จ"));
  });
  database.close();
}
