import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Expand,
  FileText,
  LockKeyhole,
  Save
} from "lucide-react";
import { ImageSlot } from "../components/ImageSlot";
import { MapLocationField } from "../components/MapLocationField";
import { ReportPdfPreview } from "../components/ReportPdfPreview";
import {
  defaultInspectionChecks,
  inspectionChecklistGroups,
  inspectionFrequencyOptions,
  type InspectionFrequency
} from "../data/inspectionChecklist";
import { annualInspectionTemplate, defaultTemplateFieldValues, imageSlots, templateFields } from "../data/pdfTemplate";
import {
  defaultPage14Checkboxes,
  page14CheckboxGroups,
  page14CheckboxOptions
} from "../data/page14Checkboxes";
import {
  defaultPage17BuildingTypes,
  getPage17CoverDefaults,
  page17BuildingTypeOptions,
  page17PartyFields
} from "../data/page17Fields";
import {
  defaultPage18Checks,
  defaultPage18Materials,
  defaultPage18Text,
  page18CheckboxGroups,
  page18MaterialRows
} from "../data/page18Fields";
import { defaultPage25Signatures, page25SignatureSlots } from "../data/page25Fields";
import { defaultPage23Remarks, defaultPage23Results, page23ChecklistItems } from "../data/page23Fields";
import { defaultPage24Remarks, defaultPage24Results, page24ChecklistItems } from "../data/page24Fields";
import { getSection2EvidencePlacements, toSection2EvidenceSlot } from "../data/page21Evidence";
import { getReportTemplate, reportTemplates } from "../data/reportTemplates";
import type {
  MapLocationValue,
  Page17PartyFieldKey,
  Page17PartyOverrides,
  Page18MaterialKey,
  Page18TextState,
  Page23RemarkState,
  Page23Result,
  Page25SignatureState,
  ReportDraft,
  ReportRenderState,
  ReportTemplateId,
  TemplateImageEdit
} from "../types";
import { createReportPdf } from "../utils/reportRenderer";
import { ReplaceImage } from "../utils/templateEditing";
import { saveReportDraft } from "../lib/reportDrafts";
import { deleteReportDraft } from "../lib/reportDrafts";
import { completeReport } from "../lib/api";

const buildingTypes = [
  "อาคารสูง",
  "อาคารขนาดใหญ่พิเศษ",
  "อาคารชุมนุมคน",
  "โรงงาน",
  "อาคารชุด",
  "อาคารอยู่อาศัยรวม",
  "อื่นๆ (ระบุ)"
];

const defaultMapLocation: MapLocationValue = {
  latitude: "",
  longitude: "",
  googleMapsUrl: "",
  mapScreenshotUrl: "",
  uploadedImageUrl: "",
  uploadedImageName: "",
  mapImageSource: "",
  satellite: false,
  placeName: "",
  address: ""
};

function getTemplatePageImage(templateId: ReportTemplateId, page: number) {
  const template = getReportTemplate(templateId);
  const sourcePage = templateId === "annual-inspection" && page === 23
    ? 22
    : templateId === "annual-inspection" && page >= 24
      ? page - 1
      : page;
  return `${template.thumbnailDirectory}/page-${String(sourcePage).padStart(2, "0")}.png`;
}

type ReportsPageProps = {
  initialDraft?: ReportDraft | null;
  onDraftSaved?: (draft: ReportDraft) => void;
  onReportCompleted?: () => void;
};

export function ReportsPage({ initialDraft = null, onDraftSaved, onReportCompleted }: ReportsPageProps) {
  const initialState = initialDraft?.state;
  const [activeDraft, setActiveDraft] = useState<ReportDraft | null>(initialDraft);
  const [draftSaveStatus, setDraftSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [completeSaveStatus, setCompleteSaveStatus] = useState<"idle" | "saving" | "error">("idle");
  const [selectedTemplateId, setSelectedTemplateId] = useState<ReportTemplateId>(
    initialState?.templateId ?? "annual-inspection"
  );
  const [currentTemplatePage, setCurrentTemplatePage] = useState(1);
  const [imageEdits, setImageEdits] = useState<Record<string, TemplateImageEdit>>(initialState?.imageEdits ?? {});
  const [imageRevision, setImageRevision] = useState(0);
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    ...defaultTemplateFieldValues,
    ...initialState?.fieldValues
  });
  const [mapLocation, setMapLocation] = useState<MapLocationValue>({
    ...defaultMapLocation,
    ...initialState?.mapLocation
  });
  const [mapLocationRevision, setMapLocationRevision] = useState(0);
  const [inspectionChecks, setInspectionChecks] = useState<Record<string, InspectionFrequency | null>>(
    { ...defaultInspectionChecks, ...initialState?.inspectionChecks }
  );
  const [page14Checks, setPage14Checks] = useState({ ...defaultPage14Checkboxes, ...initialState?.page14Checks });
  const [page17Owner, setPage17Owner] = useState<Page17PartyOverrides>(initialState?.page17Owner ?? {});
  const [page17Occupant, setPage17Occupant] = useState<Page17PartyOverrides>(initialState?.page17Occupant ?? {});
  const [page17BuildingTypes, setPage17BuildingTypes] = useState({
    ...defaultPage17BuildingTypes,
    ...initialState?.page17BuildingTypes
  });
  const [page17OtherText, setPage17OtherText] = useState(
    initialState?.page17OtherText ?? "อาคารโรงงาน พื้นที่ 3,580 ตารางเมตร"
  );
  const [page18Checks, setPage18Checks] = useState({ ...defaultPage18Checks, ...initialState?.page18Checks });
  const [page18Text, setPage18Text] = useState({ ...defaultPage18Text, ...initialState?.page18Text });
  const [page18Materials, setPage18Materials] = useState(initialState?.page18Materials ?? defaultPage18Materials);
  const [page23Results, setPage23Results] = useState({ ...defaultPage23Results, ...initialState?.page23Results });
  const [page23Remarks, setPage23Remarks] = useState({ ...defaultPage23Remarks, ...initialState?.page23Remarks });
  const [page24Results, setPage24Results] = useState({ ...defaultPage24Results, ...initialState?.page24Results });
  const [page24Remarks, setPage24Remarks] = useState({ ...defaultPage24Remarks, ...initialState?.page24Remarks });
  const [page25Signatures, setPage25Signatures] = useState({
    ...defaultPage25Signatures,
    ...initialState?.page25Signatures
  });
  const imageEditsRef = useRef(imageEdits);
  imageEditsRef.current = imageEdits;

  useEffect(() => () => {
    Object.values(imageEditsRef.current).forEach((edit) => {
      if (edit.objectUrl.startsWith("blob:")) URL.revokeObjectURL(edit.objectUrl);
    });
  }, []);

  const selectedTemplate = useMemo(() => getReportTemplate(selectedTemplateId), [selectedTemplateId]);
  const previewPages = useMemo(
    () => Array.from({ length: selectedTemplate.pages }, (_, index) => index + 1),
    [selectedTemplate.pages]
  );

  function selectTemplate(templateId: ReportTemplateId) {
    setSelectedTemplateId(templateId);
    setCurrentTemplatePage(1);
  }

  const lockedFieldSummary = useMemo(() => {
    const textFields = templateFields.filter((field) => field.type !== "signature").length;
    return `${textFields} ช่องข้อมูล, ${imageSlots.length} ช่องรูปภาพ, ${annualInspectionTemplate.pages} หน้า`;
  }, []);

  const currentPageImageSlots = useMemo(
    () => imageSlots.filter((slot) => slot.page === currentTemplatePage),
    [currentTemplatePage]
  );
  const section2EvidencePlacements = useMemo(
    () => getSection2EvidencePlacements(page23Results, page24Results),
    [page23Results, page24Results]
  );
  const currentEvidenceSlots = useMemo(
    () => section2EvidencePlacements
      .filter((placement) => placement.page === currentTemplatePage)
      .map(toSection2EvidenceSlot),
    [currentTemplatePage, section2EvidencePlacements]
  );
  const currentPageTextFields = useMemo(
    () =>
      templateFields.filter(
        (field) =>
          field.page === currentTemplatePage &&
          field.type !== "image" &&
          field.type !== "signature" &&
          ["cover_year", "owner_company", "building_name", "building_address", "building_description"].includes(
            field.sourceKey ?? field.key
          )
      ),
    [currentTemplatePage]
  );
  const isChecklistTemplatePage = currentTemplatePage === 12 || currentTemplatePage === 13;
  const currentChecklistGroups = useMemo(
    () =>
      inspectionChecklistGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => (item.page ?? 12) === currentTemplatePage)
        }))
        .filter((group) => group.items.length > 0),
    [currentTemplatePage]
  );

  function handleReplaceImage(slotKey: string, file: File) {
    setImageEdits((current) => ReplaceImage(current, slotKey, file));
    setImageRevision((current) => current + 1);
  }

  function getFieldValue(fieldKey: string) {
    return fieldValues[fieldKey] ?? "";
  }

  function updateFieldValue(fieldKey: string, value: string) {
    setFieldValues((current) => ({
      ...current,
      [fieldKey]: value
    }));
  }

  function updateMapLocation(value: MapLocationValue) {
    setMapLocation(value);
    setMapLocationRevision((current) => current + 1);
  }

  const coverYearText = getFieldValue("cover_year");
  const coverYearSuffix = coverYearText.replace(/\D/g, "").slice(-2);
  const page17CoverDefaults = useMemo(() => getPage17CoverDefaults(fieldValues), [fieldValues]);
  const renderState: ReportRenderState = useMemo(
    () => ({
      templateId: selectedTemplateId,
      fieldValues,
      inspectionChecks,
      page14Checks,
      page17Owner,
      page17Occupant,
      page17BuildingTypes,
      page17OtherText,
      page18Checks,
      page18Text,
      page18Materials,
      page23Results,
      page23Remarks,
      page24Results,
      page24Remarks,
      page25Signatures,
      imageEdits,
      mapLocation
    }),
    [
      selectedTemplateId,
      fieldValues,
      imageEdits,
      inspectionChecks,
      mapLocation,
      page14Checks,
      page17BuildingTypes,
      page17Occupant,
      page17OtherText,
      page17Owner,
      page18Checks,
      page18Materials,
      page18Text,
      page23Results,
      page23Remarks,
      page24Results,
      page24Remarks,
      page25Signatures
    ]
  );

  useEffect(() => {
    setDraftSaveStatus((current) => current === "saved" ? "idle" : current);
  }, [renderState]);

  function toggleInspectionCheck(key: string, frequency: InspectionFrequency) {
    setInspectionChecks((current) => ({
      ...current,
      [key]: current[key] === frequency ? null : frequency
    }));
  }

  function togglePage14Check(key: (typeof page14CheckboxOptions)[number]["key"]) {
    const selectedOption = page14CheckboxOptions.find((option) => option.key === key);
    if (!selectedOption) return;

    setPage14Checks((current) => {
      if (selectedOption.selection === "multiple") {
        return { ...current, [key]: !current[key] };
      }

      const next = { ...current };
      page14CheckboxOptions
        .filter((option) => option.groupKey === selectedOption.groupKey)
        .forEach((option) => {
          next[option.key] = option.key === key;
        });
      return next;
    });
  }

  function updatePage17Party(
    setter: React.Dispatch<React.SetStateAction<Page17PartyOverrides>>,
    key: Page17PartyFieldKey,
    value: string
  ) {
    setter((current) => ({ ...current, [key]: value }));
  }

  function togglePage17BuildingType(key: (typeof page17BuildingTypeOptions)[number]["key"]) {
    setPage17BuildingTypes((current) => ({ ...current, [key]: !current[key] }));
  }

  function updatePage18Text(key: keyof Page18TextState, value: string) {
    setPage18Text((current) => ({ ...current, [key]: value }));
  }

  function updatePage18Material(
    key: Page18MaterialKey,
    field: "type" | "quantity" | "storage",
    value: string
  ) {
    setPage18Materials((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value }
    }));
  }

  function updatePage25SignatureField(key: keyof Page25SignatureState, value: string) {
    setPage25Signatures((current) => ({ ...current, [key]: value }));
  }

  function updatePage23Result(key: string, result: Page23Result) {
    setPage23Results((current) => ({ ...current, [key]: result }));
  }

  function updatePage24Result(key: string, result: Page23Result) {
    setPage24Results((current) => ({ ...current, [key]: result }));
  }

  function updatePageRemark(
    setter: React.Dispatch<React.SetStateAction<Page23RemarkState>>,
    key: string,
    value: string
  ) {
    setter((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveDraft() {
    if (draftSaveStatus === "saving") return;
    setDraftSaveStatus("saving");
    try {
      const savedDraft = await saveReportDraft(renderState, activeDraft);
      setActiveDraft(savedDraft);
      setDraftSaveStatus("saved");
      onDraftSaved?.(savedDraft);
    } catch (error) {
      console.error("[Save report draft failed]", error);
      setDraftSaveStatus("error");
    }
  }

  async function handleDownloadPdf() {
    const pdfBytes = await createReportPdf(renderState);
    const blobPart = new ArrayBuffer(pdfBytes.byteLength);
    new Uint8Array(blobPart).set(pdfBytes);
    const blob = new Blob([blobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedTemplateId === "maintenance-plan"
      ? "building-maintenance-plan.pdf"
      : `TEST-TRUE-${coverYearText}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCompleteReport() {
    if (completeSaveStatus === "saving") return;
    setCompleteSaveStatus("saving");
    try {
      await completeReport({
        ownerCompany: getFieldValue("owner_company"),
        buildingName: getFieldValue("building_name"),
        buildingAddress: getFieldValue("building_address"),
        templateCode: selectedTemplate.code,
        templateName: selectedTemplate.name,
        templatePages: selectedTemplate.pages,
        inspectionDate: getFieldValue("inspection_date")
      });
      if (activeDraft) {
        try {
          await deleteReportDraft(activeDraft.id);
        } catch (draftError) {
          console.warn("[Completed report saved, but draft cleanup failed]", draftError);
        }
      }
      onReportCompleted?.();
    } catch (error) {
      console.error("[Complete report failed]", error);
      setCompleteSaveStatus("error");
    }
  }

  return (
    <section className={isPreviewFullScreen ? "report-builder preview-fullscreen" : "report-builder"}>
      <div className="builder-main">
        <div className="stepper">
          {["ข้อมูลอาคาร", "รูปภาพ", "ผลการตรวจสอบ", "สรุปและสร้าง PDF"].map((step, index) => (
            <div className={index === 0 ? "step active" : "step"} key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
              {index < 3 ? <ArrowRight size={17} aria-hidden="true" /> : null}
            </div>
          ))}
        </div>

        <section className="template-selector" aria-label="เลือกแบบ PDF">
          <strong>เลือกแบบ PDF</strong>
          <div className="template-selector-options">
            {reportTemplates.map((template) => (
              <button
                aria-pressed={selectedTemplateId === template.id}
                className={selectedTemplateId === template.id ? "template-option active" : "template-option"}
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                type="button"
              >
                <FileText size={18} aria-hidden="true" />
                <span>
                  <strong>{template.name}</strong>
                  <small>{template.pages} หน้า</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="template-lock-card">
          <div>
            <span className="template-chip">
              <LockKeyhole size={15} aria-hidden="true" />
              Locked PDF Template
            </span>
            <h2>{selectedTemplate.name}</h2>
            <p>{selectedTemplate.description}</p>
          </div>
          <div className="template-lock-meta">
            <strong>{selectedTemplate.code}</strong>
            <span>{selectedTemplate.editable ? lockedFieldSummary : `${selectedTemplate.pages} หน้า, PDF ต้นฉบับ`}</span>
          </div>
        </section>

        {selectedTemplate.editable ? (
        <>
        {currentTemplatePage === 1 ? (
        <section className="builder-card cover-edit-card">
          <h2>แก้ข้อมูลหน้าแรกของเทมเพลต</h2>
          <div className="form-grid">
            <label className="field">
              <span>ปีรายงาน</span>
              <div className="year-input">
                <strong>25</strong>
                <input
                  maxLength={2}
                  value={coverYearSuffix}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(0, 2);
                    updateFieldValue("cover_year", `25${value}`);
                  }}
                  placeholder="__"
                />
              </div>
            </label>
            <label className="field full">
              <span>ชื่อบริษัทด้านล่างหน้าปก</span>
              <input
                value={getFieldValue("owner_company")}
                onChange={(event) => updateFieldValue("owner_company", event.target.value)}
              />
            </label>
            {currentPageTextFields
              .filter(
                (field) =>
                  field.key !== "cover_year" &&
                  field.key !== "owner_company"
              )
              .map((field) => {
                const valueKey = field.sourceKey ?? field.key;
                return (
                  <label className="field full" key={field.key}>
                    <span>{field.label}</span>
                    <input
                      type={field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
                      value={getFieldValue(valueKey)}
                      onChange={(event) => updateFieldValue(valueKey, event.target.value)}
                    />
                  </label>
                );
              })}
          </div>
        </section>
        ) : null}

        {currentTemplatePage === 14 ? (
          <section className="builder-card general-building-card">
            <span className="page-kicker">หน้า 14</span>
            <h2>5.1 ข้อมูลทั่วไปของอาคาร</h2>
            <p>ชื่อบริษัท ชื่ออาคาร และที่อยู่ ดึงจากข้อมูลที่กรอกในหน้า 1 โดยอัตโนมัติ</p>
            <div className="form-grid">
              <label className="field full">
                <span>วันที่ใบอนุญาตก่อสร้าง</span>
                <input
                  type="date"
                  value={getFieldValue("building_permit_date")}
                  onChange={(event) => updateFieldValue("building_permit_date", event.target.value)}
                />
              </label>
              <label className="field full">
                <span>วันที่ได้รับใบอนุญาตเปิดใช้อาคาร</span>
                <input
                  type="date"
                  value={getFieldValue("controlled_use_permit_date")}
                  onChange={(event) => updateFieldValue("controlled_use_permit_date", event.target.value)}
                />
              </label>
            </div>
            <div className="page14-checkbox-groups">
              {page14CheckboxGroups.map((group) => (
                <fieldset className="page14-checkbox-group" key={group.key}>
                  <legend>{group.label}</legend>
                  {group.options.map((option) => (
                    <label className="page14-checkbox-option" key={option.key}>
                      <input
                        type="checkbox"
                        checked={page14Checks[option.key]}
                        onChange={() => togglePage14Check(option.key)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </section>
        ) : null}

        {currentTemplatePage === 15 ? (
          <section className="builder-card">
            <MapLocationField value={mapLocation} onChange={updateMapLocation} />
          </section>
        ) : null}

        {currentTemplatePage === 17 ? (
          <section className="builder-card page17-edit-card">
            <span className="page-kicker">หน้า 17</span>
            <h2>เจ้าของ ผู้ครอบครอง และประเภทอาคาร</h2>
            <p>ข้อมูลที่ยังไม่ได้แก้จะดึงจากหน้า 1 อัตโนมัติ การแก้ไขส่วนนี้มีผลเฉพาะหน้า 17</p>
            <div className="page17-party-sections">
              {[
                { key: "owner", title: "2.1 เจ้าของอาคาร", values: page17Owner, setter: setPage17Owner },
                { key: "occupant", title: "2.2 ผู้ครอบครองอาคาร", values: page17Occupant, setter: setPage17Occupant }
              ].map((party) => (
                <fieldset className="page17-party-section" key={party.key}>
                  <legend>{party.title}</legend>
                  <div className="form-grid">
                    {page17PartyFields.map((field) => (
                      <label className="field" key={field.key}>
                        <span>{field.label}</span>
                        <input
                          maxLength={field.maxLength}
                          value={party.values[field.key] ?? page17CoverDefaults[field.key]}
                          onChange={(event) => updatePage17Party(party.setter, field.key, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <fieldset className="page17-building-types">
              <legend>3.1 ประเภทของอาคาร (เลือกได้มากกว่า 1 ข้อ)</legend>
              {page17BuildingTypeOptions.map((option) => (
                <div className="page17-building-type-row" key={option.key}>
                  <label className="page17-building-type-option">
                    <input
                      type="checkbox"
                      checked={page17BuildingTypes[option.key]}
                      onChange={() => togglePage17BuildingType(option.key)}
                    />
                    <span>{option.label}</span>
                  </label>
                  {option.key === "other" ? (
                    <input
                      className="page17-other-input"
                      disabled={!page17BuildingTypes.other}
                      maxLength={100}
                      placeholder="ระบุประเภทอาคารอื่น ๆ"
                      value={page17OtherText}
                      onChange={(event) => setPage17OtherText(event.target.value)}
                    />
                  ) : null}
                </div>
              ))}
            </fieldset>
          </section>
        ) : null}

        {currentTemplatePage === 18 ? (
          <section className="builder-card page18-edit-card">
            <span className="page-kicker">หน้า 18</span>
            <h2>รายละเอียดอาคาร การใช้งาน และวัตถุอันตราย</h2>
            <p>แก้ไขข้อมูลด้านล่างได้เฉพาะหน้า 18 โดย Preview และ PDF ใช้ค่าชุดเดียวกัน</p>

            <fieldset className="page18-section">
              <legend>3.2 ประเภทอาคารตามลักษณะโครงสร้าง</legend>
              <label className="field">
                <span>รายละเอียดบนเส้นประ</span>
                <textarea
                  maxLength={450}
                  rows={4}
                  value={page18Text.structureDescription}
                  onChange={(event) => updatePage18Text("structureDescription", event.target.value)}
                />
              </label>
            </fieldset>

            <fieldset className="page18-section">
              <legend>{page18CheckboxGroups[0].label}</legend>
              <div className="page18-simple-rows">
                {[
                  { option: page18CheckboxGroups[0].options[0], field: "aboveGroundFloors", suffix: "ชั้น" },
                  { option: page18CheckboxGroups[0].options[1], field: "basementFloors", suffix: "ชั้น" },
                  { option: page18CheckboxGroups[0].options[2], field: "accessRoadWidth", suffix: "เมตร" }
                ].map(({ option, field, suffix }) => (
                  <div className="page18-inline-row" key={option.key}>
                    <label className="page18-checkbox-option">
                      <input
                        type="checkbox"
                        checked={page18Checks[option.key]}
                        onChange={() => setPage18Checks((current) => ({ ...current, [option.key]: !current[option.key] }))}
                      />
                      <span>{option.label}</span>
                    </label>
                    <input
                      aria-label={option.label}
                      maxLength={20}
                      value={page18Text[field as keyof Page18TextState]}
                      onChange={(event) => updatePage18Text(field as keyof Page18TextState, event.target.value)}
                    />
                    <span>{suffix}</span>
                  </div>
                ))}
                <div className="page18-inline-row page18-other-row">
                  <label className="page18-checkbox-option">
                    <input
                      type="checkbox"
                      checked={page18Checks.has_other_building_info}
                      onChange={() => setPage18Checks((current) => ({
                        ...current,
                        has_other_building_info: !current.has_other_building_info
                      }))}
                    />
                    <span>อื่น ๆ (ระบุ)</span>
                  </label>
                  <textarea
                    maxLength={300}
                    rows={3}
                    value={page18Text.otherBuildingInfo}
                    onChange={(event) => updatePage18Text("otherBuildingInfo", event.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="page18-section">
              <legend>{page18CheckboxGroups[1].label}</legend>
              {[
                { option: page18CheckboxGroups[1].options[0], field: "permittedUse" },
                { option: page18CheckboxGroups[1].options[1], field: "currentUse" }
              ].map(({ option, field }) => (
                <div className="page18-inline-row page18-use-row" key={option.key}>
                  <label className="page18-checkbox-option">
                    <input
                      type="checkbox"
                      checked={page18Checks[option.key]}
                      onChange={() => setPage18Checks((current) => ({ ...current, [option.key]: !current[option.key] }))}
                    />
                    <span>{option.label}</span>
                  </label>
                  <input
                    maxLength={100}
                    value={page18Text[field as keyof Page18TextState]}
                    onChange={(event) => updatePage18Text(field as keyof Page18TextState, event.target.value)}
                  />
                </div>
              ))}
            </fieldset>

            <fieldset className="page18-section">
              <legend>{page18CheckboxGroups[2].label}</legend>
              <div className="page18-material-head" aria-hidden="true">
                <span>รายการ</span><span>ประเภท</span><span>ปริมาณ</span><span>สถานที่เก็บ</span>
              </div>
              {page18MaterialRows.map((row) => (
                <div className="page18-material-row" key={row.key}>
                  <label className="page18-checkbox-option">
                    <input
                      type="checkbox"
                      checked={page18Checks[row.checkboxKey]}
                      onChange={() => setPage18Checks((current) => ({
                        ...current,
                        [row.checkboxKey]: !current[row.checkboxKey]
                      }))}
                    />
                    <span>{row.label}</span>
                  </label>
                  {(["type", "quantity", "storage"] as const).map((field) => (
                    <input
                      aria-label={`${row.label} ${field}`}
                      key={field}
                      maxLength={60}
                      value={page18Materials[row.key][field]}
                      onChange={(event) => updatePage18Material(row.key, field, event.target.value)}
                    />
                  ))}
                </div>
              ))}
              <div className="page18-inline-row page18-other-row">
                <label className="page18-checkbox-option">
                  <input
                    type="checkbox"
                    checked={page18Checks.stores_other_material}
                    onChange={() => setPage18Checks((current) => ({
                      ...current,
                      stores_other_material: !current.stores_other_material
                    }))}
                  />
                  <span>อื่น ๆ (ระบุ)</span>
                </label>
                <input
                  maxLength={150}
                  value={page18Text.otherMaterial}
                  onChange={(event) => updatePage18Text("otherMaterial", event.target.value)}
                />
              </div>
            </fieldset>
          </section>
        ) : null}

        {currentTemplatePage === 26 ? (
          <section className="builder-card page25-edit-card">
            <span className="page-kicker">หน้า 26</span>
            <h2>ลายเซ็นและวันที่</h2>
            <p>หากเว้นว่าง ระบบจะคงข้อความเดิมจาก Template ไว้</p>

            <fieldset className="page25-signature-section">
              <legend>ผู้ตรวจสอบอาคาร</legend>
              <div className="form-grid">
                <label className="field">
                  <span>ชื่อผู้ตรวจสอบ</span>
                  <input
                    maxLength={80}
                    placeholder="ใช้ชื่อเดิมจาก Template"
                    value={page25Signatures.inspectorName}
                    onChange={(event) => updatePage25SignatureField("inspectorName", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>ข้อมูลเพิ่มเติมในวงเล็บ (ถ้ามี)</span>
                  <input
                    maxLength={80}
                    value={page25Signatures.inspectorNote}
                    onChange={(event) => updatePage25SignatureField("inspectorNote", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>วันที่ลงนาม</span>
                  <input
                    type="date"
                    value={page25Signatures.inspectionDate}
                    onChange={(event) => updatePage25SignatureField("inspectionDate", event.target.value)}
                  />
                </label>
              </div>
              <ImageSlot
                edit={imageEdits.page25_inspector_signature}
                onReplace={handleReplaceImage}
                slot={page25SignatureSlots[0]}
              />
            </fieldset>

            <fieldset className="page25-signature-section">
              <legend>เจ้าของอาคาร / ผู้จัดการนิติบุคคล</legend>
              <div className="form-grid">
                <label className="field">
                  <span>ชื่อ</span>
                  <input
                    maxLength={80}
                    value={page25Signatures.ownerName}
                    onChange={(event) => updatePage25SignatureField("ownerName", event.target.value)}
                  />
                </label>
                <label className="field">
                  <span>ตำแหน่งหรือข้อมูลในวงเล็บ</span>
                  <input
                    maxLength={80}
                    value={page25Signatures.ownerPosition}
                    onChange={(event) => updatePage25SignatureField("ownerPosition", event.target.value)}
                  />
                </label>
              </div>
              <ImageSlot
                edit={imageEdits.page25_owner_signature}
                onReplace={handleReplaceImage}
                slot={page25SignatureSlots[1]}
              />
            </fieldset>
          </section>
        ) : null}

        {currentTemplatePage === 24 ? (
          <section className="builder-card page23-edit-card">
            <span className="page-kicker">หน้า 24</span>
            <h2>ผลการตรวจสอบ</h2>
            <p>แต่ละรายการเลือกได้เพียง “ใช้ได้”, “ไม่ได้” หรือ “ไม่มี” หนึ่งค่า และกรอกหมายเหตุได้ตลอดเวลา</p>
            <div className="page23-result-head" aria-hidden="true">
              <span>รายการตรวจสอบ</span>
              <span>ใช้ได้</span>
              <span>ไม่ได้</span>
              <span>ไม่มี</span>
              <span>หมายเหตุ</span>
            </div>
            <div className="page23-result-list">
              {page23ChecklistItems.map((item) => (
                <div className="page23-result-row" key={item.key}>
                  <span>{item.label}</span>
                  {(["usable", "unusable", "unavailable"] as const).map((result) => (
                    <label className="page23-radio-option" key={result}>
                      <input
                        type="radio"
                        name={`page23-${item.key}`}
                        checked={page23Results[item.key] === result}
                        onChange={() => updatePage23Result(item.key, result)}
                      />
                      <span>{result === "usable" ? "ใช้ได้" : result === "unusable" ? "ไม่ได้" : "ไม่มี"}</span>
                    </label>
                  ))}
                  <input
                    className="page23-remark-input"
                    aria-label={`หมายเหตุ ${item.label}`}
                    maxLength={60}
                    placeholder="หมายเหตุ"
                    value={page23Remarks[item.key]}
                    onChange={(event) => updatePageRemark(setPage23Remarks, item.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {currentTemplatePage === 25 ? (
          <section className="builder-card page23-edit-card">
            <span className="page-kicker">หน้า 25</span>
            <h2>ผลการตรวจสอบ</h2>
            <p>แต่ละรายการเลือกได้เพียง “ใช้ได้”, “ไม่ได้” หรือ “ไม่มี” หนึ่งค่า และกรอกหมายเหตุได้ตลอดเวลา</p>
            <div className="page23-result-head" aria-hidden="true">
              <span>รายการตรวจสอบ</span>
              <span>ใช้ได้</span>
              <span>ไม่ได้</span>
              <span>ไม่มี</span>
              <span>หมายเหตุ</span>
            </div>
            <div className="page23-result-list">
              {page24ChecklistItems.map((item) => (
                <div className="page23-result-row" key={item.key}>
                  <span>{item.label}</span>
                  {(["usable", "unusable", "unavailable"] as const).map((result) => (
                    <label className="page23-radio-option" key={result}>
                      <input
                        type="radio"
                        name={`page24-${item.key}`}
                        checked={page24Results[item.key] === result}
                        onChange={() => updatePage24Result(item.key, result)}
                      />
                      <span>{result === "usable" ? "ใช้ได้" : result === "unusable" ? "ไม่ได้" : "ไม่มี"}</span>
                    </label>
                  ))}
                  <input
                    className="page23-remark-input"
                    aria-label={`หมายเหตุ ${item.label}`}
                    maxLength={60}
                    placeholder="หมายเหตุ"
                    value={page24Remarks[item.key]}
                    onChange={(event) => updatePageRemark(setPage24Remarks, item.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {isChecklistTemplatePage ? (
          <section className="builder-card checklist-card">
            <div className="checklist-header">
              <span>หน้า {currentTemplatePage}</span>
              <h2>รายการตรวจสอบตาม PDF</h2>
              <p>เลือกคอลัมน์ความถี่ที่ต้องการให้แสดงใน PDF ระบบจะลบเครื่องหมายถูกเดิมและช่องหมายเหตุเดิมออกก่อน</p>
            </div>
            <div className="checklist-frequency-head">
              <span />
              {inspectionFrequencyOptions.map((option) => (
                <strong key={option.key}>{option.label}</strong>
              ))}
            </div>
            <div className="checklist-groups">
              {currentChecklistGroups.map((group) => (
                <div className="checklist-group" key={group.title}>
                  <strong>{group.title}</strong>
                  {group.items.map((item) => (
                    <div className="checklist-item" key={item.key}>
                      <span>{item.label}</span>
                      {inspectionFrequencyOptions.map((option) => (
                        <label className="frequency-check" key={option.key}>
                          <input
                            type="checkbox"
                            checked={inspectionChecks[item.key] === option.key}
                            onChange={() => toggleInspectionCheck(item.key, option.key)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {currentTemplatePage >= 2 && currentTemplatePage <= 11 ? (
          <section className="builder-card page-edit-empty">
            <span>หน้า {currentTemplatePage}</span>
            <h2>ไม่มีช่องให้เปลี่ยน</h2>
            <p>หน้านี้เป็นเนื้อหาคงที่ของ Template จึงไม่มีช่องกรอกหรือรูปภาพให้แก้ไข</p>
          </section>
        ) : null}

        {currentTemplatePage >= 21 && currentTemplatePage <= 23 ? (
          <section className="builder-card section2-evidence-card">
            <span className="page-kicker">หน้า {currentTemplatePage}</span>
            <h2>รูปหลักฐานของข้อ 2 และข้อ 3</h2>
            <p>
              แสดงเฉพาะรายการที่เลือก “ใช้ได้” หรือ “ไม่ได้” ในหน้าตารางสรุป
              รายการที่เลือก “ไม่มี” จะไม่ปรากฏในหน้านี้
            </p>
            {currentEvidenceSlots.length > 0 ? (
              <div className="upload-grid section2-evidence-upload-grid">
                {currentEvidenceSlots.map((slot) => (
                  <ImageSlot
                    edit={imageEdits[slot.key]}
                    hasDefaultImage={false}
                    key={slot.key}
                    onReplace={handleReplaceImage}
                    slot={slot}
                  />
                ))}
              </div>
            ) : (
              <div className="page-edit-empty">
                <h2>ไม่มีรายการที่ต้องแนบรูป</h2>
                <p>เลือกรายการเป็น “ใช้ได้” หรือ “ไม่ได้” ที่หน้าตารางสรุปเพื่อเปิดช่องอัปโหลด</p>
              </div>
            )}
          </section>
        ) : null}

        {currentPageImageSlots.length > 0 ? (
        <section className="builder-card">
          <div className="image-upload-header">
            <div>
              <h2>รูปภาพสำหรับเทมเพลต</h2>
              <p>เปลี่ยนรูปใน slot เดิมของ Template โดยตำแหน่งและขนาดล็อกไว้ทั้งหมด</p>
            </div>
          </div>

          <div className="upload-grid">
            {currentPageImageSlots.map((slot) => (
              <ImageSlot
                edit={imageEdits[slot.key]}
                key={slot.key}
                onReplace={handleReplaceImage}
                slot={slot}
              />
            ))}
          </div>
        </section>
        ) : null}
        </>
        ) : (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h2>แผนปฏิบัติการการตรวจบำรุงรักษาอาคาร</h2>
              <p>เลือกหน้าจากแถบด้านขวาเพื่อดูเอกสาร และกด “สร้าง PDF” เพื่อดาวน์โหลดไฟล์ฉบับนี้</p>
            </div>
          </section>
        )}
      </div>

      <aside className="preview-panel">
        <div className="preview-header">
          <strong>ตัวอย่างรายงาน (Preview)</strong>
          <div>
            <button
              className="secondary-action small-action"
              type="button"
              onClick={() => setIsPreviewFullScreen((current) => !current)}
            >
              <Expand size={16} aria-hidden="true" />
              {isPreviewFullScreen ? "กลับหน้าฟอร์ม" : "ดูเต็มจอ"}
            </button>
            <button className="primary-action small-action" type="button" onClick={handleDownloadPdf}><FileText size={16} aria-hidden="true" />สร้าง PDF</button>
          </div>
        </div>
        <div className="preview-body">
          <div className="pdf-page pdf-template-page">
            <div className="pdf-template-canvas" data-existing-year-edit={coverYearText}>
              {selectedTemplateId === "annual-inspection" && currentTemplatePage === 14
                ? null
                : <div className="locked-overlay">LOCKED TEMPLATE</div>}
              <ReportPdfPreview
                key={`${selectedTemplateId}-${currentTemplatePage}-${JSON.stringify(fieldValues)}-${mapLocationRevision}-${imageRevision}`}
                page={currentTemplatePage}
                renderState={renderState}
              />
            </div>
          </div>
          <div className="thumb-strip">
            <span>หน้าที่ {currentTemplatePage} / {selectedTemplate.pages}</span>
            {previewPages.map((page) => (
              <button
                className={page === currentTemplatePage ? "thumb active image-thumb" : "thumb image-thumb"}
                key={page}
                type="button"
                onClick={() => setCurrentTemplatePage(page)}
              >
                <img alt={`PDF template page ${page}`} src={getTemplatePageImage(selectedTemplateId, page)} />
                <span>{page}</span>
              </button>
            ))}
            <div className="zoom-row">
              <button type="button">-</button><span>100%</span><button type="button">+</button>
            </div>
            <button className="secondary-action small-action" type="button" onClick={handleDownloadPdf}><Download size={16} aria-hidden="true" />ดาวน์โหลดร่าง</button>
          </div>
        </div>
      </aside>

      <div className="builder-footer">
        <div className="autosave">
          <Check size={19} aria-hidden="true" />
          <span>
            {draftSaveStatus === "saving"
              ? "กำลังบันทึกรายงานชั่วคราว..."
              : draftSaveStatus === "saved"
                ? "บันทึกรายงานชั่วคราวแล้ว"
                : draftSaveStatus === "error"
                  ? "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง"
                  : activeDraft
                    ? "กำลังแก้ไขรายงานชั่วคราว"
                    : "ข้อมูลจะถูกเก็บเมื่อกดบันทึกชั่วคราว"}
          </span>
        </div>
        <div className="footer-actions">
          <button
            className="secondary-action"
            disabled={draftSaveStatus === "saving"}
            type="button"
            onClick={handleSaveDraft}
          >
            <Save size={17} aria-hidden="true" />
            {draftSaveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกชั่วคราว"}
          </button>
          <button
            className="primary-action"
            disabled={completeSaveStatus === "saving"}
            type="button"
            onClick={handleCompleteReport}
          >
            <Check size={18} aria-hidden="true" />
            {completeSaveStatus === "saving" ? "กำลังบันทึก..." : "บันทึกเสร็จแล้ว"}
          </button>
          {completeSaveStatus === "error" ? <span className="footer-error">บันทึกรายงานไม่สำเร็จ</span> : null}
        </div>
      </div>
    </section>
  );
}
