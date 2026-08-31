import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Building2,
  Database,
  Download,
  Eraser,
  Expand,
  Loader2,
  FileText,
  LockKeyhole,
  Mail,
  MessageSquare,
  Save,
  Search,
  Send,
  X
} from "lucide-react";
import { ImageSlot } from "../components/ImageSlot";
import { BusinessCardScanner } from "../components/BusinessCardScanner";
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
import {
  defaultMaintenancePlanPage7Checks,
  maintenancePlanFrequencyOptions,
  maintenancePlanPage7Items,
  type MaintenancePlanFrequency,
  type MaintenancePlanPage7ItemKey
} from "../data/maintenancePlanPage7";
import {
  defaultMaintenancePlanPage8Checks,
  maintenancePlanPage8Items,
  type MaintenancePlanPage8ItemKey
} from "../data/maintenancePlanPage8";
import {
  defaultMaintenancePlanPages9To16Checks,
  maintenancePlanFrequencyPages
} from "../data/maintenancePlanPages9To16";
import {
  defaultMaintenancePlanPage18Values,
  maintenancePlanPage18Items,
  type MaintenancePlanPage18Status
} from "../data/maintenancePlanPage18";
import {
  defaultMaintenancePlanPage19Signature,
  defaultMaintenancePlanPage19Values,
  maintenancePlanPage19Items,
  maintenancePlanPage19SignatureSlot
} from "../data/maintenancePlanPage19";
import {
  defaultSignMaintenanceFormState,
  getSignMaintenanceRowsForPage,
  signMaintenanceFrequencyOptions,
  signMaintenanceResultOptions,
  type SignMaintenanceChoice,
  type SignMaintenanceRemarkKind
} from "../data/signMaintenancePlan";
import {
  defaultSignInspectionPage15Choices,
  signInspectionPage15Options,
  signInspectionPage15Rows,
  type SignInspectionPage15Choice
} from "../data/signInspectionPage15";
import { signInspectionPage14ImageSlots } from "../data/signInspectionPage14";
import { getSignInspectionImageSlotsForPage } from "../data/signInspectionPages5To6";
import {
  defaultSignInspectionPage13State,
  signInspectionPage13Groups,
  signInspectionPage13Rows,
  type SignInspectionPage13RowState
} from "../data/signInspectionPage13";
import {
  defaultSignInspectionPage12State,
  signInspectionPage12Groups,
  signInspectionPage12Rows
} from "../data/signInspectionPage12";
import {
  defaultSignInspectionPage9State,
  getSignInspectionChangeSectionsForPage,
  signInspectionPage9Sections,
  type SignInspectionPage9ChangeChoice,
  type SignInspectionPage9Opinion,
  type SignInspectionPage9SectionState
} from "../data/signInspectionPage9";
import {
  defaultSignInspectionPage7State,
  hasBuildingMountedSign,
  signInspectionPage7TypeOptions,
  type SignInspectionPage7Contact,
  type SignInspectionPage7Group,
  type SignInspectionPage7TypeKey
} from "../data/signInspectionPage7";
import {
  defaultSignInspectionPage8State,
  signInspectionPage8ImageSlots,
  signInspectionPage8MaterialOptions,
  type SignInspectionPage8MaterialKey
} from "../data/signInspectionPage8";
import {
  defaultSignInspectionPage4MapLocation,
  defaultSignInspectionPage4State,
  signInspectionPage4MapSlot
} from "../data/signInspectionPage4";
import {
  defaultSignInspectionCoverFields,
  signInspectionCoverFieldKeys,
  signInspectionCoverImageSlot
} from "../data/signInspectionCover";
import {
  defaultMixingWorkshopPage14Checks,
  defaultMixingWorkshopPage15Checks,
  defaultMixingWorkshopRemarks,
  mixingWorkshopPage14FrequencyOptions,
  mixingWorkshopPage14Groups,
  mixingWorkshopPage15Groups,
  type MixingWorkshopPage14Frequency
} from "../data/mixingWorkshopPage14";
import {
  defaultMixingWorkshopPage23Checks,
  defaultMixingWorkshopPage23Remarks,
  mixingWorkshopPage23Groups
} from "../data/mixingWorkshopPage23";
import {
  defaultMixingWorkshopPage24Checks,
  defaultMixingWorkshopPage24Remarks,
  mixingWorkshopPage24FrequencyOptions,
  mixingWorkshopPage24Groups,
  type MixingWorkshopPage24Frequency
} from "../data/mixingWorkshopPage24";
import {
  defaultMixingWorkshopPage25Checks,
  defaultMixingWorkshopPage25Remarks,
  mixingWorkshopPage25Groups
} from "../data/mixingWorkshopPage25";
import {
  defaultMixingWorkshopPage26Checks,
  defaultMixingWorkshopPage26Remarks,
  mixingWorkshopPage26Groups
} from "../data/mixingWorkshopPage26";
import {
  defaultMixingWorkshopPages27To32Checks,
  defaultMixingWorkshopPages27To32Remarks,
  getMixingWorkshopExtendedDefinition,
  type MixingWorkshopExtendedPage
} from "../data/mixingWorkshopPages27To32";
import {
  defaultMixingWorkshopPages34To35Choices,
  defaultMixingWorkshopPages34To35Remarks,
  getMixingWorkshopSummaryDefinition,
  mixingWorkshopSummaryOptions,
  type MixingWorkshopSummaryChoice,
  type MixingWorkshopSummaryPage
} from "../data/mixingWorkshopPages34To35";
import type {
  AnnualAssessmentResult,
  CompanyHistory,
  CompanySearchResult,
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
import {
  completeReport,
  getCompanyHistory,
  searchCompanies,
  sendReportEmail,
  uploadImage
} from "../lib/api";

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

function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTemplatePageImage(templateId: ReportTemplateId, page: number) {
  const template = getReportTemplate(templateId);
  const sourcePage = templateId === "annual-inspection" && page === 23
    ? 22
    : templateId === "annual-inspection" && page >= 24
      ? page - 1
      : page;
  const assetVersion = template.assetVersion ? `?v=${template.assetVersion}` : "";
  return `${template.thumbnailDirectory}/page-${String(sourcePage).padStart(2, "0")}.png${assetVersion}`;
}

function pdfBytesToBase64(pdfBytes: Uint8Array) {
  const blobPart = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(blobPart).set(pdfBytes);
  const blob = new Blob([blobPart], { type: "application/pdf" });
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("ไม่สามารถอ่านไฟล์ PDF ได้"));
    reader.readAsDataURL(blob);
  });
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
  const [completedReportId, setCompletedReportId] = useState<string | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [companySearchResults, setCompanySearchResults] = useState<CompanySearchResult[]>([]);
  const [companySearchStatus, setCompanySearchStatus] = useState<"idle" | "searching" | "error">("idle");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [companyHistory, setCompanyHistory] = useState<CompanyHistory | null>(null);
  const [companyHistoryStatus, setCompanyHistoryStatus] = useState<"idle" | "loading" | "error">("idle");

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState(initialState?.fieldValues.customer_email ?? "");
  const [ccEmail, setCcEmail] = useState("");
  const [emailSendStatus, setEmailSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<ReportTemplateId>(
    initialState?.templateId ?? "annual-inspection"
  );
  const [currentTemplatePage, setCurrentTemplatePage] = useState(1);
  const [imageEdits, setImageEdits] = useState<Record<string, TemplateImageEdit>>(initialState?.imageEdits ?? {});
  const [imageRevision, setImageRevision] = useState(0);
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    ...defaultTemplateFieldValues,
    ...defaultSignInspectionCoverFields,
    building_permit_date: initialState?.fieldValues?.building_permit_date || getCurrentDateString(),
    controlled_use_permit_date: initialState?.fieldValues?.controlled_use_permit_date || getCurrentDateString(),
    ...initialState?.fieldValues,
    [signInspectionCoverFieldKeys.yearSuffix]:
      initialState?.fieldValues?.[signInspectionCoverFieldKeys.yearSuffix] === "68"
        ? "69"
        : initialState?.fieldValues?.[signInspectionCoverFieldKeys.yearSuffix]
          ?? defaultSignInspectionCoverFields[signInspectionCoverFieldKeys.yearSuffix]
  });

  const [mapLocation, setMapLocation] = useState<MapLocationValue>({
    ...defaultMapLocation,
    ...initialState?.mapLocation
  });
  const [mapLocationRevision, setMapLocationRevision] = useState(0);
  const [inspectionChecks, setInspectionChecks] = useState<Record<string, InspectionFrequency | null>>(
    { ...defaultInspectionChecks, ...initialState?.inspectionChecks }
  );
  const [maintenancePlanPage7Checks, setMaintenancePlanPage7Checks] = useState({
    ...defaultMaintenancePlanPage7Checks,
    ...initialState?.maintenancePlanPage7Checks
  });
  const [maintenancePlanPage8Checks, setMaintenancePlanPage8Checks] = useState({
    ...defaultMaintenancePlanPage8Checks,
    ...initialState?.maintenancePlanPage8Checks
  });
  const [maintenancePlanPages9To16Checks, setMaintenancePlanPages9To16Checks] = useState({
    ...defaultMaintenancePlanPages9To16Checks,
    ...initialState?.maintenancePlanPages9To16Checks
  });
  const [maintenancePlanPage18Values, setMaintenancePlanPage18Values] = useState(() =>
    Object.fromEntries(
      maintenancePlanPage18Items.map((item) => [
        item.key,
        {
          ...defaultMaintenancePlanPage18Values[item.key],
          ...initialState?.maintenancePlanPage18Values?.[item.key]
        }
      ])
    )
  );
  const [maintenancePlanPage19Values, setMaintenancePlanPage19Values] = useState(() =>
    Object.fromEntries(
      maintenancePlanPage19Items.map((item) => [
        item.key,
        {
          ...defaultMaintenancePlanPage19Values[item.key],
          ...initialState?.maintenancePlanPage19Values?.[item.key]
        }
      ])
    )
  );
  const [maintenancePlanPage19Signature, setMaintenancePlanPage19Signature] = useState({
    ...defaultMaintenancePlanPage19Signature,
    ...initialState?.maintenancePlanPage19Signature
  });
  const [signMaintenanceForm, setSignMaintenanceForm] = useState(() => ({
    choices: {
      ...defaultSignMaintenanceFormState.choices,
      ...initialState?.signMaintenanceForm?.choices
    },
    remarks: Object.fromEntries(
      Object.keys(defaultSignMaintenanceFormState.remarks).map((key) => [
        key,
        {
          ...defaultSignMaintenanceFormState.remarks[key],
          ...initialState?.signMaintenanceForm?.remarks?.[key]
        }
      ])
    )
  }));
  const [signInspectionPage15Choices, setSignInspectionPage15Choices] = useState({
    ...defaultSignInspectionPage15Choices,
    ...initialState?.signInspectionPage15Choices
  });
  const [signInspectionPage13State, setSignInspectionPage13State] = useState(() =>
    Object.fromEntries(signInspectionPage13Rows.map((row) => [
      row.key,
      {
        ...defaultSignInspectionPage13State[row.key],
        ...initialState?.signInspectionPage13State?.[row.key]
      }
    ]))
  );
  const [signInspectionPage12State, setSignInspectionPage12State] = useState(() =>
    Object.fromEntries(signInspectionPage12Rows.map((row) => [
      row.key,
      {
        ...defaultSignInspectionPage12State[row.key],
        ...initialState?.signInspectionPage12State?.[row.key]
      }
    ]))
  );
  const [signInspectionPage9State, setSignInspectionPage9State] = useState(() =>
    Object.fromEntries(signInspectionPage9Sections.map((section) => [
      section.key,
      {
        ...defaultSignInspectionPage9State[section.key],
        ...initialState?.signInspectionPage9State?.[section.key]
      }
    ]))
  );
  const [signInspectionPage7State, setSignInspectionPage7State] = useState(() => {
    const saved = initialState?.signInspectionPage7State;
    return {
      ...defaultSignInspectionPage7State,
      ...saved,
      signTypes: { ...defaultSignInspectionPage7State.signTypes, ...saved?.signTypes },
      ground: {
        ...defaultSignInspectionPage7State.ground,
        ...saved?.ground,
        signOwner: { ...defaultSignInspectionPage7State.ground.signOwner, ...saved?.ground?.signOwner },
        buildingOwner: { ...defaultSignInspectionPage7State.ground.buildingOwner, ...saved?.ground?.buildingOwner }
      },
      building: {
        ...defaultSignInspectionPage7State.building,
        ...saved?.building,
        signOwner: { ...defaultSignInspectionPage7State.building.signOwner, ...saved?.building?.signOwner },
        buildingOwner: { ...defaultSignInspectionPage7State.building.buildingOwner, ...saved?.building?.buildingOwner }
      }
    };
  });
  const [signInspectionPage4State, setSignInspectionPage4State] = useState(() => {
    const saved = initialState?.signInspectionPage4State;
    return {
      ...defaultSignInspectionPage4State,
      ...saved,
      mapLocation: {
        ...defaultSignInspectionPage4MapLocation,
        ...saved?.mapLocation
      }
    };
  });
  const [signInspectionPage8State, setSignInspectionPage8State] = useState(() => {
    const saved = initialState?.signInspectionPage8State;
    return {
      ...defaultSignInspectionPage8State,
      ...saved,
      materials: { ...defaultSignInspectionPage8State.materials, ...saved?.materials }
    };
  });
  const [signMaintenanceTool, setSignMaintenanceTool] = useState<"check" | "remark">("check");
  const [mixingWorkshopPage14Checks, setMixingWorkshopPage14Checks] = useState({
    ...defaultMixingWorkshopPage14Checks,
    ...initialState?.mixingWorkshopPage14Checks
  });
  const [mixingWorkshopPage15Checks, setMixingWorkshopPage15Checks] = useState({
    ...defaultMixingWorkshopPage15Checks,
    ...initialState?.mixingWorkshopPage15Checks
  });
  const [mixingWorkshopRemarks, setMixingWorkshopRemarks] = useState({
    ...defaultMixingWorkshopRemarks,
    ...initialState?.mixingWorkshopRemarks
  });
  const [mixingWorkshopPage23Checks, setMixingWorkshopPage23Checks] = useState({
    ...defaultMixingWorkshopPage23Checks,
    ...initialState?.mixingWorkshopPage23Checks
  });
  const [mixingWorkshopPage23Remarks, setMixingWorkshopPage23Remarks] = useState({
    ...defaultMixingWorkshopPage23Remarks,
    ...initialState?.mixingWorkshopPage23Remarks
  });
  const [mixingWorkshopPage24Checks, setMixingWorkshopPage24Checks] = useState({
    ...defaultMixingWorkshopPage24Checks,
    ...initialState?.mixingWorkshopPage24Checks
  });
  const [mixingWorkshopPage24Remarks, setMixingWorkshopPage24Remarks] = useState({
    ...defaultMixingWorkshopPage24Remarks,
    ...initialState?.mixingWorkshopPage24Remarks
  });
  const [mixingWorkshopPage25Checks, setMixingWorkshopPage25Checks] = useState({
    ...defaultMixingWorkshopPage25Checks,
    ...initialState?.mixingWorkshopPage25Checks
  });
  const [mixingWorkshopPage25Remarks, setMixingWorkshopPage25Remarks] = useState({
    ...defaultMixingWorkshopPage25Remarks,
    ...initialState?.mixingWorkshopPage25Remarks
  });
  const [mixingWorkshopPage26Checks, setMixingWorkshopPage26Checks] = useState({
    ...defaultMixingWorkshopPage26Checks,
    ...initialState?.mixingWorkshopPage26Checks
  });
  const [mixingWorkshopPage26Remarks, setMixingWorkshopPage26Remarks] = useState({
    ...defaultMixingWorkshopPage26Remarks,
    ...initialState?.mixingWorkshopPage26Remarks
  });
  const [mixingWorkshopPages27To32Checks, setMixingWorkshopPages27To32Checks] = useState(() =>
    Object.fromEntries(Object.entries(defaultMixingWorkshopPages27To32Checks).map(([page, checks]) => [
      page,
      { ...checks, ...(initialState?.mixingWorkshopPages27To32Checks?.[Number(page) as MixingWorkshopExtendedPage] ?? {}) }
    ])) as typeof defaultMixingWorkshopPages27To32Checks
  );
  const [mixingWorkshopPages27To32Remarks, setMixingWorkshopPages27To32Remarks] = useState(() =>
    Object.fromEntries(Object.entries(defaultMixingWorkshopPages27To32Remarks).map(([page, remarks]) => [
      page,
      { ...remarks, ...(initialState?.mixingWorkshopPages27To32Remarks?.[Number(page) as MixingWorkshopExtendedPage] ?? {}) }
    ])) as typeof defaultMixingWorkshopPages27To32Remarks
  );
  const [mixingWorkshopPages34To35Choices, setMixingWorkshopPages34To35Choices] = useState(() =>
    Object.fromEntries(Object.entries(defaultMixingWorkshopPages34To35Choices).map(([page, choices]) => [
      page,
      { ...choices, ...(initialState?.mixingWorkshopPages34To35Choices?.[Number(page) as MixingWorkshopSummaryPage] ?? {}) }
    ])) as typeof defaultMixingWorkshopPages34To35Choices
  );
  const [mixingWorkshopPages34To35Remarks, setMixingWorkshopPages34To35Remarks] = useState(() =>
    Object.fromEntries(Object.entries(defaultMixingWorkshopPages34To35Remarks).map(([page, remarks]) => [
      page,
      { ...remarks, ...(initialState?.mixingWorkshopPages34To35Remarks?.[Number(page) as MixingWorkshopSummaryPage] ?? {}) }
    ])) as typeof defaultMixingWorkshopPages34To35Remarks
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
  const [annualAssessmentResult, setAnnualAssessmentResult] = useState<AnnualAssessmentResult>(
    initialState?.annualAssessmentResult ?? null
  );
  
  const [page25Signatures, setPage25Signatures] = useState({
    ...defaultPage25Signatures,
    inspectionDate: initialState?.page25Signatures?.inspectionDate || getCurrentDateString(),
    ...initialState?.page25Signatures
  });

  const imageEditsRef = useRef(imageEdits);
  imageEditsRef.current = imageEdits;

  useEffect(() => () => {
    Object.values(imageEditsRef.current).forEach((edit) => {
      if (edit.objectUrl.startsWith("blob:")) URL.revokeObjectURL(edit.objectUrl);
    });
  }, []);

  useEffect(() => {
    const query = fieldValues.owner_company?.trim() ?? "";
    if (!query || selectedCompanyId) {
      setCompanySearchResults([]);
      setCompanySearchStatus("idle");
      return;
    }

    let cancelled = false;
    setCompanySearchStatus("searching");
    const timeoutId = window.setTimeout(() => {
      searchCompanies(query)
        .then((results) => {
          if (cancelled) return;
          setCompanySearchResults(results);
          setCompanySearchStatus("idle");
        })
        .catch((error) => {
          if (cancelled) return;
          console.error("[Company search failed]", error);
          setCompanySearchResults([]);
          setCompanySearchStatus("error");
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [fieldValues.owner_company, selectedCompanyId]);

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
  const currentMaintenancePlanFrequencyItems = maintenancePlanFrequencyPages[currentTemplatePage] ?? [];
  const currentMaintenancePlanSummaryItems = currentTemplatePage === 19
    ? maintenancePlanPage19Items
    : maintenancePlanPage18Items;
  const currentMaintenancePlanSummaryValues = currentTemplatePage === 19
    ? maintenancePlanPage19Values
    : maintenancePlanPage18Values;
  const currentSignMaintenanceRows = useMemo(
    () => getSignMaintenanceRowsForPage(currentTemplatePage).filter(
      (row) => currentTemplatePage !== 6 || row.kind === "result"
    ),
    [currentTemplatePage]
  );
  const currentMixingWorkshopGroups = currentTemplatePage === 15
    ? mixingWorkshopPage15Groups
    : mixingWorkshopPage14Groups;
  const currentMixingWorkshopChecks = currentTemplatePage === 15
    ? mixingWorkshopPage15Checks
    : mixingWorkshopPage14Checks;
  const currentMixingWorkshopExtendedDefinition = getMixingWorkshopExtendedDefinition(currentTemplatePage);
  const currentMixingWorkshopDetailedGroups = currentMixingWorkshopExtendedDefinition
    ? currentMixingWorkshopExtendedDefinition.groups
    : currentTemplatePage === 23
      ? mixingWorkshopPage23Groups
    : currentTemplatePage === 26
    ? mixingWorkshopPage26Groups
    : currentTemplatePage === 25
      ? mixingWorkshopPage25Groups
      : mixingWorkshopPage24Groups;
  const currentMixingWorkshopDetailedChecks = currentMixingWorkshopExtendedDefinition
    ? mixingWorkshopPages27To32Checks[currentMixingWorkshopExtendedDefinition.page]
    : currentTemplatePage === 23
      ? mixingWorkshopPage23Checks
    : currentTemplatePage === 26
    ? mixingWorkshopPage26Checks
    : currentTemplatePage === 25
      ? mixingWorkshopPage25Checks
      : mixingWorkshopPage24Checks;
  const currentMixingWorkshopDetailedRemarks = currentMixingWorkshopExtendedDefinition
    ? mixingWorkshopPages27To32Remarks[currentMixingWorkshopExtendedDefinition.page]
    : currentTemplatePage === 23
      ? mixingWorkshopPage23Remarks
    : currentTemplatePage === 26
    ? mixingWorkshopPage26Remarks
    : currentTemplatePage === 25
      ? mixingWorkshopPage25Remarks
      : mixingWorkshopPage24Remarks;
  const currentMixingWorkshopSummaryDefinition = getMixingWorkshopSummaryDefinition(currentTemplatePage);
  const currentMixingWorkshopSummaryChoices = currentMixingWorkshopSummaryDefinition
    ? mixingWorkshopPages34To35Choices[currentMixingWorkshopSummaryDefinition.page]
    : {};
  const currentMixingWorkshopSummaryRemarks = currentMixingWorkshopSummaryDefinition
    ? mixingWorkshopPages34To35Remarks[currentMixingWorkshopSummaryDefinition.page]
    : {};

  async function handleReplaceImage(slotKey: string, file: File) {
    try {
      const uploadedUrl = await uploadImage(file);
      setImageEdits((current) => ({
        ...current,
        [slotKey]: {
          slotKey,
          objectUrl: uploadedUrl,
          fileName: file.name,
          file
        }
      }));
      setImageRevision((current) => current + 1);
    } catch (err) {
      alert("ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
    }
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

  function handleCompanyNameChange(value: string) {
    updateFieldValue("owner_company", value);
    setSelectedCompanyId(null);
    setSelectedCompanyName("");
    setCompanyHistory(null);
    setCompanyHistoryStatus("idle");
  }

  async function handleCompanySelect(company: CompanySearchResult) {
    setSelectedCompanyId(company.id);
    setSelectedCompanyName(company.name);
    setCompanySearchResults([]);
    setCompanyHistoryStatus("loading");
    try {
      const history = await getCompanyHistory(company.id);
      setCompanyHistory(history);
      setCompanyHistoryStatus("idle");
    } catch (error) {
      console.error("[Load company history failed]", error);
      setCompanyHistory(null);
      setCompanyHistoryStatus("error");
    }
  }

  async function handleBusinessCardConfirm(fields: { companyName: string; companyAddress: string }) {
    handleCompanyNameChange(fields.companyName);
    if (fields.companyAddress) updateFieldValue("building_address", fields.companyAddress);
    setCompanySearchStatus("searching");

    try {
      const results = await searchCompanies(fields.companyName);
      const exactMatch = results.find((company) => company.matchType === "exact");
      setCompanySearchResults(results);
      setCompanySearchStatus("idle");
      if (exactMatch) await handleCompanySelect(exactMatch);
    } catch (error) {
      console.error("[Business card company search failed]", error);
      setCompanySearchResults([]);
      setCompanySearchStatus("error");
    }
  }

  async function handleSignInspectionCompanyScanConfirm(fields: { companyName: string; companyAddress: string }) {
    updateFieldValue(signInspectionCoverFieldKeys.companyName, fields.companyName);
    setSignInspectionPage4State((current) => ({
      ...current,
      signName: fields.companyName,
      address: fields.companyAddress || current.address
    }));
    setCompanySearchStatus("searching");

    try {
      const results = await searchCompanies(fields.companyName);
      const exactMatch = results.find((company) => company.matchType === "exact");
      setCompanySearchResults(results);
      setCompanySearchStatus("idle");
      if (exactMatch) await handleCompanySelect(exactMatch);
    } catch (error) {
      console.error("[Sign inspection company scan search failed]", error);
      setCompanySearchResults([]);
      setCompanySearchStatus("error");
    }
  }

  function updateMapLocation(value: MapLocationValue) {
    setMapLocation(value);
    setMapLocationRevision((current) => current + 1);
  }

  const coverYearText = getFieldValue("cover_year");
  const coverYearSuffix = coverYearText.startsWith("25")
    ? coverYearText.slice(2)
    : coverYearText.replace(/\D/g, "").slice(0, 2);
  const page17CoverDefaults = useMemo(() => getPage17CoverDefaults(fieldValues), [fieldValues]);
  const pdfFileName = useMemo(() => {
    if (selectedTemplateId !== "annual-inspection") return selectedTemplate.downloadFileName;
    const namePart = getFieldValue("building_name").trim() || coverYearText || "รายงาน";
    return `รายงานตรวจสอบอาคาร-${namePart.replace(/[\\/:*?"<>|]/g, "-")}.pdf`;
  }, [coverYearText, fieldValues, selectedTemplate, selectedTemplateId]);

  const renderState: ReportRenderState = useMemo(
    () => ({
      templateId: selectedTemplateId,
      annualAssessmentResult,
      maintenancePlanPage7Checks,
      maintenancePlanPage8Checks,
      maintenancePlanPages9To16Checks,
      maintenancePlanPage18Values,
      maintenancePlanPage19Values,
      maintenancePlanPage19Signature,
      signMaintenanceForm,
      signInspectionPage15Choices,
      signInspectionPage13State,
      signInspectionPage12State,
      signInspectionPage9State,
      signInspectionPage7State,
      signInspectionPage8State,
      signInspectionPage4State,
      mixingWorkshopPage14Checks,
      mixingWorkshopPage15Checks,
      mixingWorkshopRemarks,
      mixingWorkshopPage23Checks,
      mixingWorkshopPage23Remarks,
      mixingWorkshopPage24Checks,
      mixingWorkshopPage24Remarks,
      mixingWorkshopPage25Checks,
      mixingWorkshopPage25Remarks,
      mixingWorkshopPage26Checks,
      mixingWorkshopPage26Remarks,
      mixingWorkshopPages27To32Checks,
      mixingWorkshopPages27To32Remarks,
      mixingWorkshopPages34To35Choices,
      mixingWorkshopPages34To35Remarks,
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
      annualAssessmentResult,
      maintenancePlanPage7Checks,
      maintenancePlanPage8Checks,
      maintenancePlanPages9To16Checks,
      maintenancePlanPage18Values,
      maintenancePlanPage19Values,
      maintenancePlanPage19Signature,
      signMaintenanceForm,
      signInspectionPage15Choices,
      signInspectionPage13State,
      signInspectionPage12State,
      signInspectionPage9State,
      signInspectionPage7State,
      signInspectionPage8State,
      signInspectionPage4State,
      mixingWorkshopPage14Checks,
      mixingWorkshopPage15Checks,
      mixingWorkshopRemarks,
      mixingWorkshopPage23Checks,
      mixingWorkshopPage23Remarks,
      mixingWorkshopPage24Checks,
      mixingWorkshopPage24Remarks,
      mixingWorkshopPage25Checks,
      mixingWorkshopPage25Remarks,
      mixingWorkshopPage26Checks,
      mixingWorkshopPage26Remarks,
      mixingWorkshopPages27To32Checks,
      mixingWorkshopPages27To32Remarks,
      mixingWorkshopPages34To35Choices,
      mixingWorkshopPages34To35Remarks,
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

  function toggleSignMaintenanceChoice(key: string, choice: Exclude<SignMaintenanceChoice, null>) {
    setSignMaintenanceForm((current) => ({
      ...current,
      choices: {
        ...current.choices,
        [key]: current.choices[key] === choice ? null : choice
      }
    }));
  }

  function toggleSignInspectionPage15Choice(
    key: string,
    choice: Exclude<SignInspectionPage15Choice, null>
  ) {
    setSignInspectionPage15Choices((current) => ({
      ...current,
      [key]: current[key] === choice ? null : choice
    }));
  }

  function clearSignInspectionPage15() {
    setSignInspectionPage15Choices(
      Object.fromEntries(signInspectionPage15Rows.map((row) => [row.key, null]))
    );
  }

  function toggleSignInspectionPage13Choice<K extends keyof SignInspectionPage13RowState>(
    key: string,
    field: K,
    choice: Exclude<SignInspectionPage13RowState[K], null>
  ) {
    setSignInspectionPage13State((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: current[key][field] === choice ? null : choice
      }
    }));
  }

  function clearSignInspectionPage13() {
    setSignInspectionPage13State(Object.fromEntries(signInspectionPage13Rows.map((row) => [
      row.key,
      { presence: null, wear: null, damage: null, result: null }
    ])));
  }

  function toggleSignInspectionPage12Choice<K extends keyof SignInspectionPage13RowState>(
    key: string,
    field: K,
    choice: Exclude<SignInspectionPage13RowState[K], null>
  ) {
    setSignInspectionPage12State((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: current[key][field] === choice ? null : choice
      }
    }));
  }

  function clearSignInspectionPage12() {
    setSignInspectionPage12State(Object.fromEntries(signInspectionPage12Rows.map((row) => [
      row.key,
      { presence: null, wear: null, damage: null, result: null }
    ])));
  }

  function updateSignInspectionPage9Section(
    key: string,
    patch: Partial<SignInspectionPage9SectionState>
  ) {
    setSignInspectionPage9State((current) => ({
      ...current,
      [key]: { ...current[key], ...patch }
    }));
  }

  function toggleSignInspectionPage9Change(key: string, choice: Exclude<SignInspectionPage9ChangeChoice, null>) {
    const currentValue = signInspectionPage9State[key]?.changeChoice ?? null;
    updateSignInspectionPage9Section(key, { changeChoice: currentValue === choice ? null : choice });
  }

  function toggleSignInspectionPage9Opinion(key: string, opinion: Exclude<SignInspectionPage9Opinion, null>) {
    const currentValue = signInspectionPage9State[key]?.opinion ?? null;
    updateSignInspectionPage9Section(key, { opinion: currentValue === opinion ? null : opinion });
  }

  function clearSignInspectionPage9() {
    const pageKeys = new Set(getSignInspectionChangeSectionsForPage(currentTemplatePage).map((section) => section.key));
    setSignInspectionPage9State((current) => Object.fromEntries(
      Object.entries(current).map(([key, value]) => [
        key,
        pageKeys.has(key) ? structuredClone(defaultSignInspectionPage9State[key]) : value
      ])
    ));
  }

  function toggleSignInspectionPage7Type(key: SignInspectionPage7TypeKey) {
    setSignInspectionPage7State((current) => ({
      ...current,
      signTypes: { ...current.signTypes, [key]: !current.signTypes[key] }
    }));
  }

  function updateSignInspectionPage7Group(
    groupKey: "ground" | "building",
    patch: Partial<SignInspectionPage7Group>
  ) {
    setSignInspectionPage7State((current) => ({
      ...current,
      [groupKey]: { ...current[groupKey], ...patch }
    }));
  }

  function updateSignInspectionPage7Contact(
    groupKey: "ground" | "building",
    contactKey: "signOwner" | "buildingOwner",
    field: keyof SignInspectionPage7Contact,
    value: string
  ) {
    setSignInspectionPage7State((current) => ({
      ...current,
      [groupKey]: {
        ...current[groupKey],
        [contactKey]: { ...current[groupKey][contactKey], [field]: value }
      }
    }));
  }

  function fillSignInspectionPage7ContactFromCompany(
    groupKey: "ground" | "building",
    contactKey: "signOwner" | "buildingOwner"
  ) {
    const savedBuilding = companyHistory?.buildings[0];
    const companyName = selectedCompanyName.trim()
      || getFieldValue(signInspectionCoverFieldKeys.companyName).trim();
    const addressParts = [savedBuilding?.address, savedBuilding?.province, savedBuilding?.postalCode].filter(Boolean);
    const contact: SignInspectionPage7Contact = {
      name: companyName,
      address: addressParts.join(" "),
      phone: companyHistory?.company.phones[0] ?? savedBuilding?.phone ?? "",
      fax: savedBuilding?.fax ?? "",
      email: companyHistory?.company.emails[0] ?? ""
    };
    setSignInspectionPage7State((current) => ({
      ...current,
      [groupKey]: { ...current[groupKey], [contactKey]: contact }
    }));
  }

  function clearSignInspectionPage7() {
    setSignInspectionPage7State(structuredClone(defaultSignInspectionPage7State));
  }

  function toggleSignInspectionPage8Material(key: SignInspectionPage8MaterialKey) {
    setSignInspectionPage8State((current) => ({
      ...current,
      materials: { ...current.materials, [key]: !current.materials[key] }
    }));
  }

  function updateSignInspectionPage8(patch: Partial<typeof signInspectionPage8State>) {
    setSignInspectionPage8State((current) => ({ ...current, ...patch }));
  }

  function toggleSignInspectionPage8OpeningChoice(choice: "yes" | "no") {
    setSignInspectionPage8State((current) => ({
      ...current,
      openingEnabled: true,
      openingChoice: current.openingChoice === choice ? null : choice
    }));
  }

  function clearSignInspectionPage8() {
    setSignInspectionPage8State(structuredClone(defaultSignInspectionPage8State));
  }

  function updateSignInspectionPage4(patch: Partial<typeof signInspectionPage4State>) {
    setSignInspectionPage4State((current) => ({ ...current, ...patch }));
  }

  function updateSignInspectionPage4MapLocation(value: MapLocationValue) {
    setSignInspectionPage4State((current) => ({ ...current, mapLocation: value }));
  }

  function toggleSignInspectionPage4Plan(choice: "has" | "none") {
    setSignInspectionPage4State((current) => ({
      ...current,
      planChoice: current.planChoice === choice ? null : choice
    }));
  }

  function toggleSignInspectionPage4Permit(choice: "noData" | "age") {
    setSignInspectionPage4State((current) => ({
      ...current,
      permitChoice: current.permitChoice === choice ? null : choice
    }));
  }

  function clearSignInspectionPage4() {
    setSignInspectionPage4State(structuredClone(defaultSignInspectionPage4State));
  }

  function toggleCurrentSignInspectionChecklistChoice<K extends keyof SignInspectionPage13RowState>(
    key: string,
    field: K,
    choice: Exclude<SignInspectionPage13RowState[K], null>
  ) {
    if (currentTemplatePage === 12) {
      toggleSignInspectionPage12Choice(key, field, choice);
      return;
    }
    toggleSignInspectionPage13Choice(key, field, choice);
  }

  function toggleMixingWorkshopPage14Choice(key: string, frequency: MixingWorkshopPage14Frequency) {
    const setter = currentTemplatePage === 15
      ? setMixingWorkshopPage15Checks
      : setMixingWorkshopPage14Checks;
    setter((current) => ({
      ...current,
      [key]: current[key] === frequency ? null : frequency
    }));
  }

  function clearMixingWorkshopPage14() {
    const defaults = currentTemplatePage === 15
      ? defaultMixingWorkshopPage15Checks
      : defaultMixingWorkshopPage14Checks;
    const setter = currentTemplatePage === 15
      ? setMixingWorkshopPage15Checks
      : setMixingWorkshopPage14Checks;
    setter(Object.fromEntries(Object.keys(defaults).map((key) => [key, null])));
    const pageKeys = new Set(currentMixingWorkshopGroups.flatMap((group) => group.rows.map((row) => row.key)));
    setMixingWorkshopRemarks((current) => Object.fromEntries(
      Object.entries(current).map(([key, value]) => [key, pageKeys.has(key) ? "" : value])
    ));
  }

  function updateMixingWorkshopRemark(key: string, value: string) {
    setMixingWorkshopRemarks((current) => ({ ...current, [key]: value }));
  }

  function toggleMixingWorkshopPage24Choice(key: string, frequency: MixingWorkshopPage24Frequency) {
    if (currentMixingWorkshopExtendedDefinition) {
      const page = currentMixingWorkshopExtendedDefinition.page;
      setMixingWorkshopPages27To32Checks((current) => ({
        ...current,
        [page]: { ...current[page], [key]: current[page][key] === frequency ? null : frequency }
      }));
      return;
    }
    const setter = currentTemplatePage === 26
      ? setMixingWorkshopPage26Checks
      : currentTemplatePage === 25
        ? setMixingWorkshopPage25Checks
        : currentTemplatePage === 23
          ? setMixingWorkshopPage23Checks
          : setMixingWorkshopPage24Checks;
    setter((current) => ({
      ...current,
      [key]: current[key] === frequency ? null : frequency
    }));
  }

  function updateMixingWorkshopPage24Remark(key: string, value: string) {
    if (currentMixingWorkshopExtendedDefinition) {
      const page = currentMixingWorkshopExtendedDefinition.page;
      setMixingWorkshopPages27To32Remarks((current) => ({
        ...current,
        [page]: { ...current[page], [key]: value }
      }));
      return;
    }
    const setter = currentTemplatePage === 26
      ? setMixingWorkshopPage26Remarks
      : currentTemplatePage === 25
        ? setMixingWorkshopPage25Remarks
        : currentTemplatePage === 23
          ? setMixingWorkshopPage23Remarks
          : setMixingWorkshopPage24Remarks;
    setter((current) => ({ ...current, [key]: value }));
  }

  function clearMixingWorkshopPage24() {
    if (currentMixingWorkshopExtendedDefinition) {
      const page = currentMixingWorkshopExtendedDefinition.page;
      setMixingWorkshopPages27To32Checks((current) => ({
        ...current,
        [page]: Object.fromEntries(Object.keys(current[page]).map((key) => [key, null]))
      }));
      setMixingWorkshopPages27To32Remarks((current) => ({
        ...current,
        [page]: { ...defaultMixingWorkshopPages27To32Remarks[page] }
      }));
      return;
    }
    const defaults = currentTemplatePage === 26
      ? defaultMixingWorkshopPage26Checks
      : currentTemplatePage === 25
        ? defaultMixingWorkshopPage25Checks
        : currentTemplatePage === 23
          ? defaultMixingWorkshopPage23Checks
          : defaultMixingWorkshopPage24Checks;
    const checkSetter = currentTemplatePage === 26
      ? setMixingWorkshopPage26Checks
      : currentTemplatePage === 25
        ? setMixingWorkshopPage25Checks
        : currentTemplatePage === 23
          ? setMixingWorkshopPage23Checks
          : setMixingWorkshopPage24Checks;
    const remarkSetter = currentTemplatePage === 26
      ? setMixingWorkshopPage26Remarks
      : currentTemplatePage === 25
        ? setMixingWorkshopPage25Remarks
        : currentTemplatePage === 23
          ? setMixingWorkshopPage23Remarks
          : setMixingWorkshopPage24Remarks;
    checkSetter(Object.fromEntries(Object.keys(defaults).map((key) => [key, null])));
    remarkSetter(currentTemplatePage === 26
      ? { ...defaultMixingWorkshopPage26Remarks }
      : currentTemplatePage === 25
        ? { ...defaultMixingWorkshopPage25Remarks }
        : currentTemplatePage === 23
          ? { ...defaultMixingWorkshopPage23Remarks }
          : { ...defaultMixingWorkshopPage24Remarks });
  }

  function toggleMixingWorkshopSummaryChoice(key: string, choice: Exclude<MixingWorkshopSummaryChoice, null>) {
    if (!currentMixingWorkshopSummaryDefinition) return;
    const page = currentMixingWorkshopSummaryDefinition.page;
    setMixingWorkshopPages34To35Choices((current) => ({
      ...current,
      [page]: { ...current[page], [key]: current[page][key] === choice ? null : choice }
    }));
  }

  function updateMixingWorkshopSummaryRemark(key: string, value: string) {
    if (!currentMixingWorkshopSummaryDefinition) return;
    const page = currentMixingWorkshopSummaryDefinition.page;
    setMixingWorkshopPages34To35Remarks((current) => ({
      ...current,
      [page]: { ...current[page], [key]: value }
    }));
  }

  function clearMixingWorkshopSummaryPage() {
    if (!currentMixingWorkshopSummaryDefinition) return;
    const page = currentMixingWorkshopSummaryDefinition.page;
    setMixingWorkshopPages34To35Choices((current) => ({
      ...current,
      [page]: Object.fromEntries(Object.keys(current[page]).map((key) => [key, null]))
    }));
    setMixingWorkshopPages34To35Remarks((current) => ({
      ...current,
      [page]: Object.fromEntries(Object.keys(current[page]).map((key) => [key, ""]))
    }));
  }

  function updateSignMaintenanceRemark(key: string, kind: SignMaintenanceRemarkKind, text = "") {
    setSignMaintenanceForm((current) => ({
      ...current,
      remarks: {
        ...current.remarks,
        [key]: { kind, text: kind === "text" ? text : "" }
      }
    }));
  }

  function clearSignMaintenancePage() {
    const pageKeys = new Set(currentSignMaintenanceRows.map((row) => row.key));
    setSignMaintenanceForm((current) => ({
      choices: Object.fromEntries(
        Object.entries(current.choices).map(([key, value]) => [key, pageKeys.has(key) ? null : value])
      ),
      remarks: Object.fromEntries(
        Object.entries(current.remarks).map(([key, value]) => [
          key,
          pageKeys.has(key) ? { kind: null, text: "" } : value
        ])
      )
    }));
  }

  function selectMaintenancePlanFrequency(
    key: MaintenancePlanPage7ItemKey,
    frequency: MaintenancePlanFrequency
  ) {
    setMaintenancePlanPage7Checks((current) => ({ ...current, [key]: frequency }));
  }

  function selectMaintenancePlanPage8Frequency(
    key: MaintenancePlanPage8ItemKey,
    frequency: MaintenancePlanFrequency
  ) {
    setMaintenancePlanPage8Checks((current) => ({ ...current, [key]: frequency }));
  }

  function selectMaintenancePlanPages9To16Frequency(key: string, frequency: MaintenancePlanFrequency) {
    setMaintenancePlanPages9To16Checks((current) => ({ ...current, [key]: frequency }));
  }

  function toggleMaintenancePlanSummaryStatus(
    page: 18 | 19,
    key: string,
    status: Exclude<MaintenancePlanPage18Status, null>
  ) {
    const setValues = page === 19 ? setMaintenancePlanPage19Values : setMaintenancePlanPage18Values;
    setValues((current) => ({
      ...current,
      [key]: {
        ...current[key],
        status: current[key].status === status ? null : status
      }
    }));
  }

  function updateMaintenancePlanSummaryText(
    page: 18 | 19,
    key: string,
    field: "correction" | "note",
    value: string
  ) {
    const setValues = page === 19 ? setMaintenancePlanPage19Values : setMaintenancePlanPage18Values;
    setValues((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value }
    }));
  }

  function updateMaintenancePlanPage19Signature(
    field: "typedSignature" | "signerName",
    value: string
  ) {
    setMaintenancePlanPage19Signature((current) => ({ ...current, [field]: value }));
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
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await createReportPdf(renderState);
      const blobPart = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(blobPart).set(pdfBytes);
      const blob = new Blob([blobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = selectedTemplateId === "annual-inspection"
        ? `TEST-TRUE-${coverYearText}.pdf`
        : selectedTemplate.downloadFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Download PDF failed]", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  async function handleCompleteReport() {
    if (completeSaveStatus === "saving") return;
    if (completedReportId) {
      setIsEmailDialogOpen(true);
      return;
    }
    setCompleteSaveStatus("saving");
    try {
      const savedReport = await completeReport({
        ownerCompany: getFieldValue("owner_company"),
        customerEmail: getFieldValue("customer_email"),
        buildingName: getFieldValue("building_name"),
        buildingAddress: getFieldValue("building_address"),
        templateCode: selectedTemplate.code,
        templateName: selectedTemplate.name,
        templatePages: selectedTemplate.pages,
        inspectionDate: getFieldValue("inspection_date"),
        selectedCompanyId: selectedCompanyId ?? undefined,
        data: renderState
      });
      setCompletedReportId(savedReport.id);
      setRecipientEmail(getFieldValue("customer_email"));
      setEmailSendStatus("idle");
      setEmailError("");
      setIsEmailDialogOpen(true);
      setCompleteSaveStatus("idle");
    } catch (error) {
      console.error("[Complete report failed]", error);
      setCompleteSaveStatus("error");
    }
  }

  async function finishReportFlow() {
    if (activeDraft) {
      try {
        await deleteReportDraft(activeDraft.id);
      } catch (draftError) {
        console.warn("[Completed report saved, but draft cleanup failed]", draftError);
      }
    }
    onReportCompleted?.();
  }

  async function handleSendReportEmail() {
    if (!completedReportId || emailSendStatus === "sending") return;
    const normalizedEmail = recipientEmail.trim();
    const normalizedCc = ccEmail.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("กรุณากรอกอีเมลผู้รับให้ถูกต้อง");
      return;
    }

    if (normalizedCc && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCc)) {
      setEmailError("กรุณากรอกอีเมล CC ให้ถูกต้อง");
      return;
    }

    setEmailSendStatus("sending");
    setEmailError("");
    try {
      const pdfBytes = await createReportPdf(renderState);
      const pdfBase64 = await pdfBytesToBase64(pdfBytes);
      await sendReportEmail(completedReportId, {
        recipientEmail: normalizedEmail,
        ccEmail: normalizedCc || undefined,
        fileName: pdfFileName,
        pdfBase64
      });
      setEmailSendStatus("success");
      window.setTimeout(() => {
        void finishReportFlow();
      }, 1400);
    } catch (error) {
      setEmailSendStatus("error");
      setEmailError(error instanceof Error ? error.message : "ส่งรายงานทางอีเมลไม่สำเร็จ");
    }
  }

  function renderSignInspectionPage7Contact(
    groupKey: "ground" | "building",
    contactKey: "signOwner" | "buildingOwner",
    title: string
  ) {
    const contact = signInspectionPage7State[groupKey][contactKey];
    return (
      <section className="sign-inspection-page7-contact">
        <div className="sign-inspection-page7-contact-heading">
          <h4>{title}</h4>
          <button type="button" onClick={() => fillSignInspectionPage7ContactFromCompany(groupKey, contactKey)}>
            <Database size={15} aria-hidden="true" /> ใช้ข้อมูลบริษัทเดิม/หน้าปก
          </button>
        </div>
        <div className="form-grid sign-inspection-page7-contact-grid">
          <label className="field full">
            <span>ชื่อบริษัทหรือผู้ครอบครอง</span>
            <input
              maxLength={120}
              onChange={(event) => updateSignInspectionPage7Contact(groupKey, contactKey, "name", event.target.value)}
              value={contact.name}
            />
          </label>
          <label className="field full">
            <span>ที่อยู่สำหรับติดต่อ</span>
            <textarea
              maxLength={260}
              onChange={(event) => updateSignInspectionPage7Contact(groupKey, contactKey, "address", event.target.value)}
              rows={2}
              value={contact.address}
            />
          </label>
          {(["phone", "fax", "email"] as const).map((field) => (
            <label className="field" key={field}>
              <span>{field === "phone" ? "โทรศัพท์" : field === "fax" ? "โทรสาร" : "อีเมล"}</span>
              <input
                maxLength={field === "email" ? 120 : 40}
                onChange={(event) => updateSignInspectionPage7Contact(groupKey, contactKey, field, event.target.value)}
                type={field === "email" ? "email" : "text"}
                value={contact[field]}
              />
            </label>
          ))}
        </div>
      </section>
    );
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
                <BusinessCardScanner onConfirm={handleBusinessCardConfirm} />
                <div className="form-grid">
                  <label className="field">
                    <span>ปีรายงาน</span>
                    <div className="year-input">
                      <strong>25</strong>
                      <input
                        maxLength={2}
                        value={coverYearSuffix}
                        onChange={(event) => {
                          const val = event.target.value.replace(/\D/g, "").slice(0, 2);
                          updateFieldValue("cover_year", val ? `25${val}` : "25");
                        }}
                        placeholder="__"
                      />
                    </div>
                  </label>
                  <div className="field full company-search-field">
                    <label htmlFor="owner-company-search">ชื่อบริษัทด้านล่างหน้าปก</label>
                    <div className="company-search-input">
                      <Search size={17} aria-hidden="true" />
                      <input
                        id="owner-company-search"
                        value={getFieldValue("owner_company")}
                        onChange={(event) => handleCompanyNameChange(event.target.value)}
                        placeholder="พิมพ์ชื่อบริษัทเพื่อค้นหาข้อมูลเดิม"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-expanded={companySearchResults.length > 0}
                        aria-controls="company-search-results"
                      />
                      {companySearchStatus === "searching" ? <Loader2 className="spin" size={17} aria-label="กำลังค้นหา" /> : null}
                    </div>
                    {companySearchResults.length > 0 ? (
                      <div className="company-search-dropdown" id="company-search-results" role="listbox">
                        {companySearchResults.map((company) => (
                          <button
                            type="button"
                            role="option"
                            aria-selected={company.id === selectedCompanyId}
                            key={company.id}
                            onClick={() => void handleCompanySelect(company)}
                          >
                            <span className="company-result-main">
                              <strong>{company.name}</strong>
                              <small>{company.matchType === "exact" ? "ชื่อตรงกับข้อมูลเดิม" : "ชื่อใกล้เคียง"}</small>
                            </span>
                            <span className="company-result-meta">
                              {company.buildingCount} อาคาร · {company.reportCount} รายงาน
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {companySearchStatus === "idle" && getFieldValue("owner_company").trim() && !selectedCompanyId && companySearchResults.length === 0 ? (
                      <small className="company-search-hint">ไม่พบบริษัทเดิม ระบบจะสร้างบริษัทใหม่เมื่อบันทึกรายงาน</small>
                    ) : null}
                    {companySearchStatus === "error" ? (
                      <small className="company-search-error">ค้นหาบริษัทไม่สำเร็จ กรุณาตรวจสอบ API แล้วลองใหม่</small>
                    ) : null}
                    {selectedCompanyId ? (
                      <div className="selected-company-chip">
                        <Database size={15} aria-hidden="true" />
                        เลือกข้อมูลเดิม: {selectedCompanyName}
                        <button type="button" onClick={() => handleCompanyNameChange(getFieldValue("owner_company"))}>เปลี่ยน</button>
                      </div>
                    ) : null}
                  </div>
                  <label className="field full">
                    <span>อีเมลลูกค้า (สำหรับส่งรายงาน)</span>
                    <input
                      type="email"
                      value={getFieldValue("customer_email")}
                      onChange={(event) => updateFieldValue("customer_email", event.target.value)}
                      placeholder="customer@example.com"
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
                {companyHistoryStatus === "loading" ? (
                  <div className="company-history-loading">
                    <Loader2 className="spin" size={18} aria-hidden="true" />
                    กำลังดึงข้อมูลเก่าของบริษัท…
                  </div>
                ) : null}
                {companyHistoryStatus === "error" ? (
                  <p className="company-search-error" role="alert">ไม่สามารถเปิดข้อมูลเก่าของบริษัทได้</p>
                ) : null}
                {companyHistory ? (
                  <div className="company-history-layout">
                    <section className="company-history-panel existing-data-panel">
                      <div className="company-history-heading">
                        <Database size={18} aria-hidden="true" />
                        <div>
                          <strong>ข้อมูลเดิมในระบบ</strong>
                          <span>แสดงเพื่ออ้างอิงเท่านั้น ระบบจะไม่ทับข้อมูลในฟอร์มอัตโนมัติ</span>
                        </div>
                      </div>
                      <dl className="company-master-data">
                        <div><dt>ชื่อที่เคยบันทึก</dt><dd>{companyHistory.company.names.join(" · ")}</dd></div>
                        <div>
                          <dt>อีเมลเดิม</dt>
                          <dd>
                            {companyHistory.company.emails.length > 0
                              ? companyHistory.company.emails.map((email) => (
                                  <span className="historical-value-action" key={email}>
                                    {email}
                                    <button type="button" onClick={() => updateFieldValue("customer_email", email)}>ใช้ค่านี้</button>
                                  </span>
                                ))
                              : "ไม่มีข้อมูล"}
                          </dd>
                        </div>
                      </dl>
                      <div className="company-history-section">
                        <h3><Building2 size={17} aria-hidden="true" /> อาคารเดิม ({companyHistory.buildings.length})</h3>
                        {companyHistory.buildings.length > 0 ? companyHistory.buildings.map((building) => (
                          <article className="company-building-history" key={building.id}>
                            <div>
                              <strong>{building.name}</strong>
                              <span>{building.address || "ไม่มีที่อยู่เดิม"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateFieldValue("building_name", building.name);
                                if (building.address) updateFieldValue("building_address", building.address);
                              }}
                            >
                              ใช้ข้อมูลอาคารนี้
                            </button>
                          </article>
                        )) : <p>ยังไม่มีข้อมูลอาคาร</p>}
                      </div>
                      <div className="company-history-section">
                        <h3>รายงานเดิม ({companyHistory.reports.length})</h3>
                        {companyHistory.reports.length > 0 ? companyHistory.reports.map((report) => (
                          <details className="company-report-history" key={report.id}>
                            <summary>
                              <span>
                                <strong>{report.reportNo}</strong>
                                <small>{report.building} · {report.template}</small>
                              </span>
                              <time>{formatHistoryDate(report.updatedAt)}</time>
                            </summary>
                            <div className="company-report-history-body">
                              <p>สถานะ: {report.status} · วันที่ตรวจ: {report.inspectionDate || "ไม่ระบุ"}</p>
                              {report.data ? (
                                <details>
                                  <summary>ดูข้อมูลแบบฟอร์มเดิมทั้งหมด</summary>
                                  <pre>{JSON.stringify(report.data, null, 2)}</pre>
                                </details>
                              ) : (
                                <p className="legacy-data-note">รายงานนี้สร้างก่อนระบบเก็บรายละเอียดแบบฟอร์ม จึงมีเฉพาะข้อมูลสรุปด้านบน</p>
                              )}
                            </div>
                          </details>
                        )) : <p>ยังไม่มีรายงานเดิม</p>}
                      </div>
                    </section>
                    <section className="company-history-panel new-data-panel">
                      <div className="company-history-heading">
                        <FileText size={18} aria-hidden="true" />
                        <div>
                          <strong>ข้อมูลใหม่ในฟอร์มนี้</strong>
                          <span>ยังไม่บันทึก และแยกจากข้อมูลเดิมอย่างชัดเจน</span>
                        </div>
                      </div>
                      <dl className="company-current-data">
                        {[
                          ["ชื่อบริษัท", getFieldValue("owner_company")],
                          ["อีเมลลูกค้า", getFieldValue("customer_email")],
                          ["ชื่ออาคาร", getFieldValue("building_name")],
                          ["ที่อยู่อาคาร", getFieldValue("building_address")]
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value || "ยังไม่กรอก"}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  </div>
                ) : null}
              </section>
            ) : null}

{currentTemplatePage === 14 ? (
  <section className="builder-card general-building-card">
    <span className="page-kicker">หน้า 14</span>
    <h2>5.1 ข้อมูลทั่วไปของอาคาร</h2>
    <p>ชื่อบริษัท ชื่ออาคาร และที่อยู่ ดึงจากข้อมูลที่กรอกในหน้า 1 โดยอัตโนมัติ</p>
    <div className="form-grid">

      <label className="field">
        <span>ประเภทเอกสารใบอนุญาตก่อสร้าง</span>
        <input
          type="text"
          placeholder="เช่น อ.1"
          value={getFieldValue("building_permit_type")}
          onChange={(event) => updateFieldValue("building_permit_type", event.target.value)}
        />
      </label>
      <label className="field">
        <span>เลขที่ใบอนุญาตก่อสร้าง</span>
        <input
          type="text"
          placeholder="เช่น 100/34"
          value={getFieldValue("building_permit_number")}
          onChange={(event) => updateFieldValue("building_permit_number", event.target.value)}
        />
      </label>
      <label className="field full">
        <span>วันที่ใบอนุญาตก่อสร้าง</span>
        <input
          type="date"
          value={getFieldValue("building_permit_date")}
          onChange={(event) => updateFieldValue("building_permit_date", event.target.value)}
        />
      </label>

      <label className="field">
        <span>ประเภทเอกสารใบอนุญาตเปิดใช้อาคาร</span>
        <input
          type="text"
          placeholder="เช่น อ.6, ภ.1"
          value={getFieldValue("controlled_use_permit_type")}
          onChange={(event) => updateFieldValue("controlled_use_permit_type", event.target.value)}
        />
      </label>
      <label className="field">
        <span>เลขที่ใบอนุญาตเปิดใช้อาคาร</span>
        <input
          type="text"
          placeholder="เช่น 55/2561"
          value={getFieldValue("controlled_use_permit_number")}
          onChange={(event) => updateFieldValue("controlled_use_permit_number", event.target.value)}
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
                            onChange={() => {
                              const nextState = !page18Checks[option.key];
                              setPage18Checks((current) => ({ ...current, [option.key]: nextState }));
                              if (!nextState) {
                                updatePage18Text(field as keyof Page18TextState, "");
                              }
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                        <input
                          aria-label={option.label}
                          disabled={!page18Checks[option.key]}
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
                          onChange={() => {
                            const nextState = !page18Checks.has_other_building_info;
                            setPage18Checks((current) => ({ ...current, has_other_building_info: nextState }));
                            if (!nextState) {
                              updatePage18Text("otherBuildingInfo", "");
                            }
                          }}
                        />
                        <span>อื่น ๆ (ระบุ)</span>
                      </label>
                      <textarea
                        disabled={!page18Checks.has_other_building_info}
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
                          onChange={() => {
                            const nextState = !page18Checks[option.key];
                            setPage18Checks((current) => ({ ...current, [option.key]: nextState }));
                            if (!nextState) {
                              updatePage18Text(field as keyof Page18TextState, "");
                            }
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                      <input
                        disabled={!page18Checks[option.key]}
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
                          onChange={() => {
                            const nextState = !page18Checks[row.checkboxKey];
                            setPage18Checks((current) => ({ ...current, [row.checkboxKey]: nextState }));
                            if (!nextState) {
                              setPage18Materials((current) => ({
                                ...current,
                                [row.key]: { type: "", quantity: "", storage: "" }
                              }));
                            }
                          }}
                        />
                        <span>{row.label}</span>
                      </label>
                      {(["type", "quantity", "storage"] as const).map((field) => (
                        <input
                          disabled={!page18Checks[row.checkboxKey]}
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
                        onChange={() => {
                          const nextState = !page18Checks.stores_other_material;
                          setPage18Checks((current) => ({ ...current, stores_other_material: nextState }));
                          if (!nextState) {
                            updatePage18Text("otherMaterial", "");
                          }
                        }}
                      />
                      <span>อื่น ๆ (ระบุ)</span>
                    </label>
                    <input
                      disabled={!page18Checks.stores_other_material}
                      maxLength={150}
                      value={page18Text.otherMaterial}
                      onChange={(event) => updatePage18Text("otherMaterial", event.target.value)}
                    />
                  </div>
                </fieldset>
              </section>
            ) : null}

            {selectedTemplateId === "annual-inspection" && currentTemplatePage === 26 ? (
  <section className="builder-card page25-edit-card">
    <span className="page-kicker">หน้า 26</span>
    <h2>ผลประเมินและลายเซ็น</h2>
    <p>เลือกผลการตรวจสอบเพื่อให้ระบบสร้างหน้าสรุปที่ตรงกับผลประเมิน โดยไม่เปลี่ยนหัวและท้ายกระดาษของ Template</p>

    <fieldset className="annual-assessment-section">
      <legend>ผลการตรวจสอบอาคาร</legend>
      <div className="annual-assessment-options">
        <label className={`annual-assessment-option annual-assessment-pass${annualAssessmentResult === "pass" ? " is-selected" : ""}`}>
          <input
            type="radio"
            name="annual-assessment-result"
            checked={annualAssessmentResult === "pass"}
            onChange={() => setAnnualAssessmentResult("pass")}
          />
          <span><strong>ผ่าน</strong><small>สร้างหน้าสรุปผลรับรองว่าอาคารผ่านการตรวจสอบ</small></span>
        </label>
        <label className={`annual-assessment-option annual-assessment-fail${annualAssessmentResult === "fail" ? " is-selected" : ""}`}>
          <input
            type="radio"
            name="annual-assessment-result"
            checked={annualAssessmentResult === "fail"}
            onChange={() => setAnnualAssessmentResult("fail")}
          />
          <span><strong>ไม่ผ่าน</strong><small>สร้างหน้าสรุปข้อบกพร่องและกำหนดให้ดำเนินการแก้ไข</small></span>
        </label>
      </div>
      {annualAssessmentResult ? (
        <p className={`annual-assessment-status ${annualAssessmentResult}`}>
          หน้าสรุปปัจจุบัน: {annualAssessmentResult === "pass" ? "ผ่านการตรวจสอบ" : "ไม่ผ่านการตรวจสอบ"}
        </p>
      ) : (
        <p className="annual-assessment-status pending">กรุณาเลือก “ผ่าน” หรือ “ไม่ผ่าน”</p>
      )}
    </fieldset>

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

      {/* ปิดส่วนอัปโหลดลายเซ็นอิเล็กทรอนิกส์ชั่วคราว */}
      {/* 
      <ImageSlot
        edit={imageEdits.page25_inspector_signature}
        onReplace={handleReplaceImage}
        slot={page25SignatureSlots[0]}
      /> 
      */}
    </fieldset>

    <fieldset className="page25-signature-section">
      <legend>เจ้าของอาคาร / ผู้จัดการนิติบุคคล</legend>
      <div className="form-grid">

        <label className="field">
          <span>คำนำหน้า</span>
          <input
            maxLength={30}
            placeholder="นาย / นาง / นางสาว / บริษัท"
            value={page25Signatures.ownerTitle ?? ""}
            onChange={(event) => updatePage25SignatureField("ownerTitle", event.target.value)}
          />
        </label>
        <label className="field">
          <span>ชื่อ-นามสกุล</span>
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

      {/* ปิดส่วนอัปโหลดลายเซ็นอิเล็กทรอนิกส์ชั่วคราว */}
      {/* 
      <ImageSlot
        edit={imageEdits.page25_owner_signature}
        onReplace={handleReplaceImage}
        slot={page25SignatureSlots[1]}
      /> 
      */}
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
        ) : selectedTemplateId === "maintenance-plan" && currentTemplatePage === 7 ? (
          <section className="builder-card checklist-card maintenance-page7-card">
            <div className="checklist-header">
              <span>หน้า {currentTemplatePage}</span>
              <h2>ความถี่ในการตรวจบำรุงรักษา</h2>
              <p>แต่ละรายการเลือกได้ 1 ความถี่ เมื่อเลือกช่องใหม่ ระบบจะยกเลิกช่องเดิมให้อัตโนมัติ</p>
            </div>
            <div className="maintenance-frequency-grid maintenance-frequency-head" aria-hidden="true">
              <span>รายการตรวจบำรุงรักษา</span>
              {maintenancePlanFrequencyOptions.map((option) => (
                <strong key={option.key}>{option.label}</strong>
              ))}
            </div>
            <div className="maintenance-frequency-list">
              {maintenancePlanPage7Items.map((item) => (
                <div className="maintenance-frequency-grid maintenance-frequency-row" key={item.key}>
                  <span>{item.label}</span>
                  {maintenancePlanFrequencyOptions.map((option) => (
                    <label className="maintenance-frequency-radio" key={option.key}>
                      <input
                        checked={maintenancePlanPage7Checks[item.key] === option.key}
                        name={`maintenance-page7-${item.key}`}
                        onChange={() => selectMaintenancePlanFrequency(item.key, option.key)}
                        type="radio"
                      />
                      <span className="maintenance-frequency-control" aria-hidden="true" />
                      <span className="sr-only">{item.label} {option.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "maintenance-plan" && currentTemplatePage === 8 ? (
          <section className="builder-card checklist-card maintenance-page8-card">
            <div className="checklist-header">
              <span>หน้า {currentTemplatePage}</span>
              <h2>ความถี่ในการตรวจบำรุงรักษา</h2>
              <p>แต่ละรายการเลือกได้ 1 ความถี่ เมื่อเลือกช่องใหม่ ระบบจะยกเลิกช่องเดิมให้อัตโนมัติ</p>
            </div>
            <div className="maintenance-frequency-grid maintenance-frequency-head" aria-hidden="true">
              <span>รายการตรวจบำรุงรักษา</span>
              {maintenancePlanFrequencyOptions.map((option) => (
                <strong key={option.key}>{option.label}</strong>
              ))}
            </div>
            <div className="maintenance-frequency-list">
              {maintenancePlanPage8Items.map((item) => (
                <div className="maintenance-frequency-grid maintenance-frequency-row" key={item.key}>
                  <span>{item.label}</span>
                  {maintenancePlanFrequencyOptions.map((option) => (
                    <label className="maintenance-frequency-radio" key={option.key}>
                      <input
                        checked={maintenancePlanPage8Checks[item.key] === option.key}
                        name={`maintenance-page8-${item.key}`}
                        onChange={() => selectMaintenancePlanPage8Frequency(item.key, option.key)}
                        type="radio"
                      />
                      <span className="maintenance-frequency-control" aria-hidden="true" />
                      <span className="sr-only">{item.label} {option.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "maintenance-plan"
          && currentTemplatePage >= 9
          && currentTemplatePage <= 16 ? (
          <section className="builder-card checklist-card maintenance-pages9-16-card">
            <div className="checklist-header">
              <span>หน้า {currentTemplatePage}</span>
              <h2>ความถี่ในการตรวจบำรุงรักษา</h2>
              <p>แต่ละรายการเลือกได้ 1 ความถี่ เมื่อเลือกช่องใหม่ ระบบจะยกเลิกช่องเดิมให้อัตโนมัติ</p>
            </div>
            <div className="maintenance-frequency-grid maintenance-frequency-head" aria-hidden="true">
              <span>รายการตรวจบำรุงรักษา</span>
              {maintenancePlanFrequencyOptions.map((option) => (
                <strong key={option.key}>{option.label}</strong>
              ))}
            </div>
            <div className="maintenance-frequency-list">
              {currentMaintenancePlanFrequencyItems.map((item) => (
                <div className="maintenance-frequency-grid maintenance-frequency-row" key={item.key}>
                  <span>{item.label}</span>
                  {maintenancePlanFrequencyOptions.map((option) => (
                    <label className="maintenance-frequency-radio" key={option.key}>
                      <input
                        checked={maintenancePlanPages9To16Checks[item.key] === option.key}
                        name={`maintenance-${item.key}`}
                        onChange={() => selectMaintenancePlanPages9To16Frequency(item.key, option.key)}
                        type="radio"
                      />
                      <span className="maintenance-frequency-control" aria-hidden="true" />
                      <span className="sr-only">{item.label} {option.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "maintenance-plan"
          && (currentTemplatePage === 18 || currentTemplatePage === 19) ? (
          <section className="builder-card maintenance-page18-card">
            <div className="checklist-header">
              <span>หน้า {currentTemplatePage}</span>
              <h2>ตารางสรุปผลการตรวจสอบ</h2>
              <p>แต่ละรายการเลือกได้เพียง “ใช้ได้” หรือ “ใช้ไม่ได้” และข้อความจะแสดงใน PDF ทางขวาทันที</p>
            </div>
            <div
              className="maintenance-page18-table"
              role="table"
              aria-label={`กรอกผลการตรวจสอบหน้าที่ ${currentTemplatePage}`}
            >
              <div className="maintenance-page18-row maintenance-page18-head" role="row">
                <div role="columnheader">รายการตรวจสอบ</div>
                <div role="columnheader">ใช้ได้</div>
                <div role="columnheader">ใช้ไม่ได้</div>
                <div role="columnheader">มีการแก้ไขแล้ว</div>
                <div role="columnheader">หมายเหตุ</div>
              </div>
              {currentMaintenancePlanSummaryItems.map((item, index) => {
                const value = currentMaintenancePlanSummaryValues[item.key];
                const showSection = index === 0
                  || currentMaintenancePlanSummaryItems[index - 1].section !== item.section;
                return (
                  <div className="maintenance-page18-row" role="row" key={item.key}>
                    <div className="maintenance-page18-item" role="cell">
                      {showSection ? <strong>{item.section}</strong> : null}
                      <span><b>{item.number}</b>{item.label}</span>
                    </div>
                    <div className="maintenance-page18-choice" role="cell">
                      <input
                        aria-label={`${item.number} ใช้ได้`}
                        checked={value.status === "usable"}
                        name={`maintenance-page${currentTemplatePage}-${item.key}`}
                        onChange={() => toggleMaintenancePlanSummaryStatus(
                          currentTemplatePage,
                          item.key,
                          "usable"
                        )}
                        type="checkbox"
                      />
                    </div>
                    <div className="maintenance-page18-choice" role="cell">
                      <input
                        aria-label={`${item.number} ใช้ไม่ได้`}
                        checked={value.status === "unusable"}
                        name={`maintenance-page${currentTemplatePage}-${item.key}`}
                        onChange={() => toggleMaintenancePlanSummaryStatus(
                          currentTemplatePage,
                          item.key,
                          "unusable"
                        )}
                        type="checkbox"
                      />
                    </div>
                    <div role="cell">
                      <textarea
                        aria-label={`${item.number} มีการแก้ไขแล้ว`}
                        onChange={(event) => updateMaintenancePlanSummaryText(
                          currentTemplatePage,
                          item.key,
                          "correction",
                          event.target.value
                        )}
                        placeholder="พิมพ์รายละเอียด..."
                        rows={2}
                        value={value.correction}
                      />
                    </div>
                    <div role="cell">
                      <textarea
                        aria-label={`${item.number} หมายเหตุ`}
                        onChange={(event) => updateMaintenancePlanSummaryText(
                          currentTemplatePage,
                          item.key,
                          "note",
                          event.target.value
                        )}
                        placeholder="พิมพ์หมายเหตุ..."
                        rows={2}
                        value={value.note}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {currentTemplatePage === 19 ? (
              <fieldset className="page25-signature-section maintenance-page19-signature-section">
                <legend>ลายเซ็นเจ้าของอาคาร / ผู้รับมอบหมาย</legend>
                <div className="form-grid">
                  <label className="field">
                    <span>พิมพ์ลายเซ็น</span>
                    <input
                      aria-label="พิมพ์ลายเซ็นหน้า 19"
                      maxLength={80}
                      onChange={(event) => updateMaintenancePlanPage19Signature(
                        "typedSignature",
                        event.target.value
                      )}
                      placeholder="พิมพ์ชื่อหรือลายเซ็น"
                      value={maintenancePlanPage19Signature.typedSignature}
                    />
                  </label>
                  <label className="field">
                    <span>ชื่อผู้ลงนามในวงเล็บ</span>
                    <input
                      aria-label="ชื่อผู้ลงนามหน้า 19"
                      maxLength={80}
                      onChange={(event) => updateMaintenancePlanPage19Signature(
                        "signerName",
                        event.target.value
                      )}
                      placeholder="ชื่อ-นามสกุล"
                      value={maintenancePlanPage19Signature.signerName}
                    />
                  </label>
                </div>
                <ImageSlot
                  edit={imageEdits.maintenance_page19_signature}
                  hasDefaultImage={false}
                  onReplace={handleReplaceImage}
                  slot={maintenancePlanPage19SignatureSlot}
                />
                <small>หากอัปโหลดรูป ระบบจะใช้รูปลายเซ็นแทนข้อความ “พิมพ์ลายเซ็น” ใน PDF</small>
              </fieldset>
            ) : null}
          </section>
        ) : selectedTemplateId === "mixing-workshop-maintenance-plan"
          && currentTemplatePage === 14 ? (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <span className="page-kicker">หน้า 14 / 35</span>
              <h2>ตารางคงที่ตาม PDF ต้นฉบับ</h2>
              <p>หน้านี้ใช้ช่วงเวลาและความถี่ในการตรวจสอบตาม Template เดิม และไม่เปิดให้แก้ไขข้อมูล</p>
            </div>
          </section>
        ) : selectedTemplateId === "mixing-workshop-maintenance-plan"
          && currentTemplatePage === 15 ? (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <span className="page-kicker">หน้า 15 / 35</span>
              <h2>ตารางคงที่ตาม PDF ต้นฉบับ</h2>
              <p>หน้านี้ใช้ช่วงเวลาและความถี่ในการตรวจสอบตาม Template เดิม และลบวันที่ด้านล่างออกแล้ว</p>
            </div>
          </section>
        ) : selectedTemplateId === "mixing-workshop-maintenance-plan"
          && ((currentTemplatePage >= 23 && currentTemplatePage <= 32)) ? (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <span className="page-kicker">หน้า {currentTemplatePage} / 35</span>
              <h2>ตารางคงที่ตาม PDF ต้นฉบับ</h2>
              <p>หน้านี้ใช้ตารางและค่าตรวจบำรุงรักษาตาม Template เดิม และไม่เปิดให้แก้ไขข้อมูล</p>
            </div>
          </section>
        ) : selectedTemplateId === "mixing-workshop-maintenance-plan"
          && currentMixingWorkshopSummaryDefinition ? (
          <section className="builder-card mixing-page14-form-card">
            <div className="mixing-page14-form-heading">
              <div>
                <span>หน้า {currentTemplatePage} / 35</span>
                <h2>{currentMixingWorkshopSummaryDefinition.title}</h2>
                <p>เลือกผลตรวจและกรอกหมายเหตุจากตารางด้านซ้าย ระบบจะแสดงผลบน PDF ด้านขวาทันที</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label={`เครื่องมือหน้า ${currentTemplatePage}`}>
                <button onClick={clearMixingWorkshopSummaryPage} type="button">
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <div className="mixing-page14-table-list">
              {currentMixingWorkshopSummaryDefinition.groups.map((group) => (
                <section className="mixing-page14-table-section" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="mixing-page14-table-wrap">
                    <table className="mixing-page14-table mixing-summary-table">
                      <colgroup>
                        <col className="mixing-summary-item-col" />
                        {mixingWorkshopSummaryOptions.map((option) => <col className="mixing-summary-choice-col" key={option.key} />)}
                        <col className="mixing-summary-remark-col" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">รายการตรวจสอบ</th>
                          {mixingWorkshopSummaryOptions.map((option) => <th key={option.key} scope="col">{option.label}</th>)}
                          <th scope="col">หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => (
                          <tr key={row.key}>
                            <th scope="row">{row.label}</th>
                            {mixingWorkshopSummaryOptions.map((option) => (
                              <td data-label={option.label} key={option.key}>
                                <input
                                  aria-label={`${row.label} ${option.label}`}
                                  checked={currentMixingWorkshopSummaryChoices[row.key] === option.key}
                                  onChange={() => toggleMixingWorkshopSummaryChoice(row.key, option.key)}
                                  type="checkbox"
                                />
                              </td>
                            ))}
                            <td className="mixing-page14-remark-cell" data-label="หมายเหตุ">
                              <input
                                aria-label={`หมายเหตุ ${row.label}`}
                                maxLength={120}
                                onChange={(event) => updateMixingWorkshopSummaryRemark(row.key, event.target.value)}
                                placeholder="กรอกหมายเหตุ"
                                type="text"
                                value={currentMixingWorkshopSummaryRemarks[row.key] ?? ""}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 2 ? (
          <section className="builder-card sign-inspection-cover-form">
            <div className="image-upload-header">
              <div>
                <span className="page-kicker">หน้าปก - หน้า 2 / 15</span>
                <h2>แก้ไขข้อมูลหน้าปกรายงานตรวจสอบป้าย</h2>
                <p>ข้อมูลและรูปภาพที่แก้ไขจะแสดงใน PDF ด้านขวาทันที</p>
              </div>
            </div>

            <BusinessCardScanner onConfirm={handleSignInspectionCompanyScanConfirm} />

            <div className="form-grid sign-inspection-cover-fields">
              <label className="field sign-inspection-cover-year-field">
                <span>ปีรายงาน</span>
                <span className="year-input">
                  <strong>25</strong>
                  <input
                    aria-label="ตัวเลขปีรายงานต่อท้าย 25"
                    inputMode="numeric"
                    maxLength={2}
                    value={getFieldValue(signInspectionCoverFieldKeys.yearSuffix)}
                    onChange={(event) => updateFieldValue(
                      signInspectionCoverFieldKeys.yearSuffix,
                      event.target.value.replace(/\D/g, "").slice(0, 2)
                    )}
                  />
                </span>
              </label>
              <label className="field">
                <span>ชื่อบริษัทบนหน้าปก</span>
                <input
                  maxLength={100}
                  value={getFieldValue(signInspectionCoverFieldKeys.companyName)}
                  onChange={(event) => updateFieldValue(signInspectionCoverFieldKeys.companyName, event.target.value)}
                />
              </label>
              <label className="field full sign-inspection-cover-description-field">
                <span>ข้อความประเภทและขนาดป้ายใต้รูป</span>
                <textarea
                  maxLength={220}
                  rows={3}
                  value={getFieldValue(signInspectionCoverFieldKeys.description)}
                  onChange={(event) => updateFieldValue(signInspectionCoverFieldKeys.description, event.target.value)}
                />
              </label>
            </div>

            <div className="upload-grid sign-inspection-cover-upload-grid">
              <ImageSlot
                edit={imageEdits[signInspectionCoverImageSlot.key]}
                onReplace={handleReplaceImage}
                slot={signInspectionCoverImageSlot}
              />
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 4 ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page7-form sign-inspection-page4-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า 4 / 15</span>
                <h2>ข้อมูลป้าย ใบอนุญาต และตำแหน่งแผนที่</h2>
                <p>กรอกข้อมูลจากฟอร์มด้านซ้าย เลือก Checkbox และอัปโหลดหรือถ่ายรูปแผนที่ ข้อมูลจะอัปเดตลง PDF ทันที</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือหน้า 4">
                <button onClick={clearSignInspectionPage4} type="button"><Eraser size={16} aria-hidden="true" /> ล้างค่า</button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <section className="sign-inspection-page7-group-card">
              <h3>1. ข้อมูลป้ายและสถานที่ตั้งป้าย</h3>
              <div className="form-grid sign-inspection-page4-fields">
                <label className="field full">
                  <span>ชื่อป้าย</span>
                  <input maxLength={120} onChange={(event) => updateSignInspectionPage4({ signName: event.target.value })} value={signInspectionPage4State.signName} />
                </label>
                <label className="field full">
                  <span>ที่อยู่สถานที่ตั้งป้าย</span>
                  <textarea maxLength={300} onChange={(event) => updateSignInspectionPage4({ address: event.target.value })} rows={3} value={signInspectionPage4State.address} />
                </label>
                <label className="field">
                  <span>โทรศัพท์</span>
                  <input maxLength={40} onChange={(event) => updateSignInspectionPage4({ phone: event.target.value })} value={signInspectionPage4State.phone} />
                </label>
                <label className="field">
                  <span>โทรสาร</span>
                  <input maxLength={40} onChange={(event) => updateSignInspectionPage4({ fax: event.target.value })} value={signInspectionPage4State.fax} />
                </label>
              </div>
            </section>

            <section className="sign-inspection-page7-group-card">
              <h3>ข้อมูลใบอนุญาตก่อสร้าง</h3>
              <div className="form-grid sign-inspection-page4-permit-fields">
                <label className="field full">
                  <span>ได้รับใบอนุญาตก่อสร้างจาก</span>
                  <input maxLength={160} onChange={(event) => updateSignInspectionPage4({ permitAuthority: event.target.value })} value={signInspectionPage4State.permitAuthority} />
                </label>
                <label className="field">
                  <span>วันที่</span>
                  <input inputMode="numeric" maxLength={2} onChange={(event) => updateSignInspectionPage4({ permitDay: event.target.value.replace(/\D/g, "") })} value={signInspectionPage4State.permitDay} />
                </label>
                <label className="field">
                  <span>เดือน</span>
                  <input maxLength={30} onChange={(event) => updateSignInspectionPage4({ permitMonth: event.target.value })} value={signInspectionPage4State.permitMonth} />
                </label>
                <label className="field">
                  <span>พ.ศ.</span>
                  <input inputMode="numeric" maxLength={4} onChange={(event) => updateSignInspectionPage4({ permitYear: event.target.value.replace(/\D/g, "") })} value={signInspectionPage4State.permitYear} />
                </label>
              </div>
            </section>

            <section className="sign-inspection-page7-type-card">
              <h3>ข้อมูลแบบแปลนเดิม</h3>
              <div className="sign-inspection-page7-type-grid">
                <label><input checked={signInspectionPage4State.planChoice === "has"} onChange={() => toggleSignInspectionPage4Plan("has")} type="checkbox" /><span>มีแบบแปลนเดิม</span></label>
                <label><input checked={signInspectionPage4State.planChoice === "none"} onChange={() => toggleSignInspectionPage4Plan("none")} type="checkbox" /><span>ไม่มีแบบแปลนเดิม</span></label>
              </div>
            </section>

            <section className="sign-inspection-page7-type-card">
              <h3>ข้อมูลใบอนุญาตและอายุของป้าย</h3>
              <div className="sign-inspection-page7-type-grid">
                <label><input checked={signInspectionPage4State.permitChoice === "noData"} onChange={() => toggleSignInspectionPage4Permit("noData")} type="checkbox" /><span>ไม่มีข้อมูลการได้รับใบอนุญาตก่อสร้างจากเจ้าพนักงานท้องถิ่น</span></label>
                <label><input checked={signInspectionPage4State.permitChoice === "age"} onChange={() => toggleSignInspectionPage4Permit("age")} type="checkbox" /><span>ระบุอายุของป้าย</span></label>
              </div>
              {signInspectionPage4State.permitChoice === "age" ? (
                <label className="field sign-inspection-page4-age-field">
                  <span>อายุของป้ายประมาณ (เดือน)</span>
                  <input inputMode="numeric" maxLength={5} onChange={(event) => updateSignInspectionPage4({ signAgeMonths: event.target.value.replace(/\D/g, "") })} value={signInspectionPage4State.signAgeMonths} />
                </label>
              ) : null}
            </section>

            <section className="sign-inspection-page7-group-card sign-inspection-page4-map-card">
              <MapLocationField
                description="กรอกลิงก์ Google Maps และพิกัด GPS หรืออัปโหลดภาพแผนที่จากการแคปหน้าจอ"
                onChange={updateSignInspectionPage4MapLocation}
                pageLabel="หน้า 4"
                showCoordinates
                title="ลิงก์ Google Maps พิกัด GPS และรูปแผนที่"
                value={signInspectionPage4State.mapLocation}
              />
              <div className="upload-grid sign-inspection-page14-upload-grid">
                <ImageSlot edit={imageEdits[signInspectionPage4MapSlot.key]} onReplace={handleReplaceImage} slot={signInspectionPage4MapSlot} />
              </div>
              <p className="sign-inspection-page4-logo-note">โลโก้ SHERA ถูกลบออกจากแผนที่ใน PDF โดยอัตโนมัติ</p>
            </section>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 7 ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page7-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า 7 / 15</span>
                <h2>ข้อมูลทั่วไปและผู้เกี่ยวข้องของป้าย</h2>
                <p>เลือกประเภทป้ายก่อน ระบบจะแสดงเฉพาะชุดข้อมูลที่เกี่ยวข้องและอัปเดตลง PDF ทันที</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือหน้า 7">
                <button onClick={clearSignInspectionPage7} type="button">
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <section className="sign-inspection-page7-type-card">
              <h3>2. ประเภทของป้าย</h3>
              <div className="sign-inspection-page7-type-grid">
                {signInspectionPage7TypeOptions.map((option) => (
                  <label key={option.key}>
                    <input
                      checked={signInspectionPage7State.signTypes[option.key]}
                      onChange={() => toggleSignInspectionPage7Type(option.key)}
                      type="checkbox"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {signInspectionPage7State.signTypes.other ? (
                <label className="field sign-inspection-page7-other-field">
                  <span>ระบุประเภทป้ายอื่น ๆ</span>
                  <input
                    maxLength={100}
                    onChange={(event) => setSignInspectionPage7State((current) => ({
                      ...current,
                      otherTypeText: event.target.value
                    }))}
                    value={signInspectionPage7State.otherTypeText}
                  />
                </label>
              ) : null}
            </section>

            {!Object.values(signInspectionPage7State.signTypes).some(Boolean) ? (
              <p className="sign-inspection-page7-empty">เลือกประเภทป้ายอย่างน้อย 1 รายการเพื่อแสดงฟอร์มข้อมูล</p>
            ) : null}

            {signInspectionPage7State.signTypes.ground ? (
              <section className="sign-inspection-page7-group-card">
                <h3>ป้ายที่ติดตั้งบนพื้นดิน</h3>
                <label className="field full">
                  <span>ชื่อผลิตภัณฑ์โฆษณาหรือข้อความในป้าย</span>
                  <textarea
                    maxLength={240}
                    onChange={(event) => updateSignInspectionPage7Group("ground", { productText: event.target.value })}
                    rows={3}
                    value={signInspectionPage7State.ground.productText}
                  />
                </label>
                {renderSignInspectionPage7Contact("ground", "signOwner", "เจ้าของหรือผู้ครอบครองป้าย")}
                <div className="form-grid sign-inspection-page7-engineer-grid">
                  <label className="field">
                    <span>ชื่อผู้ออกแบบด้านวิศวกรรมโครงสร้าง</span>
                    <input
                      maxLength={120}
                      onChange={(event) => updateSignInspectionPage7Group("ground", { engineerName: event.target.value })}
                      value={signInspectionPage7State.ground.engineerName}
                    />
                  </label>
                  <label className="field">
                    <span>เลขใบอนุญาต</span>
                    <input
                      maxLength={80}
                      onChange={(event) => updateSignInspectionPage7Group("ground", { engineerLicense: event.target.value })}
                      value={signInspectionPage7State.ground.engineerLicense}
                    />
                  </label>
                </div>
              </section>
            ) : null}

            {hasBuildingMountedSign(signInspectionPage7State) ? (
              <section className="sign-inspection-page7-group-card">
                <h3>ป้ายบนอาคาร หลังคา ดาดฟ้า หรือส่วนอื่นของอาคาร</h3>
                <label className="field full">
                  <span>ชื่อผลิตภัณฑ์โฆษณาหรือข้อความในป้าย</span>
                  <textarea
                    maxLength={200}
                    onChange={(event) => updateSignInspectionPage7Group("building", { productText: event.target.value })}
                    rows={2}
                    value={signInspectionPage7State.building.productText}
                  />
                </label>
                {renderSignInspectionPage7Contact("building", "signOwner", "เจ้าของหรือผู้ครอบครองป้าย")}
                {renderSignInspectionPage7Contact("building", "buildingOwner", "เจ้าของหรือผู้ครอบครองอาคารที่ป้ายตั้งอยู่")}
                <div className="form-grid sign-inspection-page7-engineer-grid">
                  <label className="field">
                    <span>ชื่อผู้ออกแบบด้านวิศวกรรมโครงสร้าง</span>
                    <input
                      maxLength={120}
                      onChange={(event) => updateSignInspectionPage7Group("building", { engineerName: event.target.value })}
                      value={signInspectionPage7State.building.engineerName}
                    />
                  </label>
                  <label className="field">
                    <span>เลขใบอนุญาต</span>
                    <input
                      maxLength={80}
                      onChange={(event) => updateSignInspectionPage7Group("building", { engineerLicense: event.target.value })}
                      value={signInspectionPage7State.building.engineerLicense}
                    />
                  </label>
                </div>
              </section>
            ) : null}

          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 8 ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page7-form sign-inspection-page8-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า 8 / 15</span>
                <h2>ประเภทวัสดุและรายละเอียดของแผ่นป้าย</h2>
                <p>เลือก Checkbox และกรอกข้อความจากฟอร์มด้านซ้าย ข้อมูลจะอัปเดตลง PDF ทันที และเปลี่ยนหรือถ่ายรูปใหม่ได้ทั้ง 4 ช่อง</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือหน้า 8">
                <button onClick={clearSignInspectionPage8} type="button"><Eraser size={16} aria-hidden="true" /> ล้างค่า</button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <section className="sign-inspection-page7-type-card">
              <h3>4.1 ประเภทวัสดุของสิ่งที่สร้างขึ้นสำหรับติดหรือตั้งป้าย</h3>
              <div className="sign-inspection-page7-type-grid">
                {signInspectionPage8MaterialOptions.map((option) => (
                  <label key={option.key}>
                    <input checked={signInspectionPage8State.materials[option.key]} onChange={() => toggleSignInspectionPage8Material(option.key)} type="checkbox" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {signInspectionPage8State.materials.other ? (
                <label className="field sign-inspection-page7-other-field">
                  <span>ระบุวัสดุอื่น ๆ</span>
                  <input maxLength={160} onChange={(event) => updateSignInspectionPage8({ otherMaterialText: event.target.value })} value={signInspectionPage8State.otherMaterialText} />
                </label>
              ) : null}
            </section>

            <section className="sign-inspection-page7-group-card sign-inspection-page8-usage-card">
              <h3>4.2 ลักษณะการใช้งานหรือการประกอบกิจกรรมของอาคาร</h3>
              <div className="sign-inspection-page8-usage-list">
                <div className="sign-inspection-page8-usage-row">
                  <label className="sign-inspection-page8-check-label">
                    <input checked={signInspectionPage8State.signMaterialEnabled} onChange={() => updateSignInspectionPage8({ signMaterialEnabled: !signInspectionPage8State.signMaterialEnabled })} type="checkbox" />
                    <span>วัสดุของป้าย (โปรดระบุ)</span>
                  </label>
                  <input aria-label="ระบุวัสดุของป้าย" disabled={!signInspectionPage8State.signMaterialEnabled} maxLength={160} onChange={(event) => updateSignInspectionPage8({ signMaterialText: event.target.value })} placeholder="กรอกวัสดุของป้าย" value={signInspectionPage8State.signMaterialText} />
                </div>
                <div className="sign-inspection-page8-usage-row">
                  <label className="sign-inspection-page8-check-label">
                    <input checked={signInspectionPage8State.sideCountEnabled} onChange={() => updateSignInspectionPage8({ sideCountEnabled: !signInspectionPage8State.sideCountEnabled })} type="checkbox" />
                    <span>จำนวนด้านที่ติดป้าย</span>
                  </label>
                  <input aria-label="จำนวนด้านที่ติดป้าย" disabled={!signInspectionPage8State.sideCountEnabled} inputMode="numeric" maxLength={12} onChange={(event) => updateSignInspectionPage8({ sideCount: event.target.value.replace(/[^0-9.]/g, "") })} placeholder="กรอกจำนวนด้าน" value={signInspectionPage8State.sideCount} />
                </div>
                <div className="sign-inspection-page8-opening-row">
                  <label className="sign-inspection-page8-check-label">
                    <input checked={signInspectionPage8State.openingEnabled} onChange={() => updateSignInspectionPage8({ openingEnabled: !signInspectionPage8State.openingEnabled, openingChoice: signInspectionPage8State.openingEnabled ? null : signInspectionPage8State.openingChoice })} type="checkbox" />
                    <span>การเจาะช่องเปิดในป้าย</span>
                  </label>
                  <div className="sign-inspection-page8-inline-choices">
                    {(["yes", "no"] as const).map((choice) => (
                      <label key={choice}>
                        <input checked={signInspectionPage8State.openingChoice === choice} disabled={!signInspectionPage8State.openingEnabled} onChange={() => toggleSignInspectionPage8OpeningChoice(choice)} type="checkbox" />
                        <span>{choice === "yes" ? "มี" : "ไม่มี"}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sign-inspection-page8-usage-row">
                  <label className="sign-inspection-page8-check-label">
                    <input checked={signInspectionPage8State.otherUsageEnabled} onChange={() => updateSignInspectionPage8({ otherUsageEnabled: !signInspectionPage8State.otherUsageEnabled })} type="checkbox" />
                    <span>อื่น ๆ (โปรดระบุ)</span>
                  </label>
                  <input aria-label="ระบุลักษณะการใช้งานอื่น ๆ" disabled={!signInspectionPage8State.otherUsageEnabled} maxLength={160} onChange={(event) => updateSignInspectionPage8({ otherUsageText: event.target.value })} placeholder="กรอกข้อความเพิ่มเติม" value={signInspectionPage8State.otherUsageText} />
                </div>
              </div>
            </section>

            <section className="sign-inspection-page7-group-card">
              <h3>รูปภาพประกอบหน้า 8</h3>
              <div className="upload-grid sign-inspection-page14-upload-grid">
                {signInspectionPage8ImageSlots.map((slot) => (
                  <ImageSlot edit={imageEdits[slot.key]} key={slot.key} onReplace={handleReplaceImage} slot={slot} />
                ))}
              </div>
            </section>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && [9, 10, 11].includes(currentTemplatePage) ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page9-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า {currentTemplatePage} / 15</span>
                <h2>ผลการตรวจสอบการเปลี่ยนแปลงป้าย</h2>
                <p>เลือกผลตรวจและกรอกรายละเอียดทางด้านซ้าย ระบบจะแสดง ✓ และข้อความลงใน PDF ด้านขวาทันที</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label={`เครื่องมือหน้า ${currentTemplatePage}`}>
                <button onClick={clearSignInspectionPage9} type="button">
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <div className="sign-inspection-page9-sections">
              {getSignInspectionChangeSectionsForPage(currentTemplatePage).map((section) => {
                const value = signInspectionPage9State[section.key] ?? defaultSignInspectionPage9State[section.key];
                return (
                  <section className="sign-inspection-page9-section" key={section.key}>
                    <h3>{section.title}</h3>

                    <fieldset className="sign-inspection-page9-choice-group">
                      <legend>การเปลี่ยนแปลง</legend>
                      <label>
                        <input
                          checked={value.changeChoice === "none"}
                          onChange={() => toggleSignInspectionPage9Change(section.key, "none")}
                          type="checkbox"
                        />
                        <span>{section.noneLabel}</span>
                      </label>
                      <label>
                        <input
                          checked={value.changeChoice === "changed"}
                          onChange={() => toggleSignInspectionPage9Change(section.key, "changed")}
                          type="checkbox"
                        />
                        <span>{section.changedLabel}</span>
                      </label>
                    </fieldset>

                    {value.changeChoice === "changed" ? (
                      <label className="field sign-inspection-page9-textarea">
                        <span>รายละเอียดการเปลี่ยนแปลง</span>
                        <textarea
                          maxLength={220}
                          onChange={(event) => updateSignInspectionPage9Section(section.key, { changeDetails: event.target.value })}
                          placeholder="กรอกรายละเอียดที่ตรวจพบ"
                          rows={3}
                          value={value.changeDetails}
                        />
                      </label>
                    ) : null}

                    <fieldset className="sign-inspection-page9-choice-group compact">
                      <legend>ความเห็นของผู้ตรวจสอบ</legend>
                      <label>
                        <input
                          checked={value.opinion === "usable"}
                          onChange={() => toggleSignInspectionPage9Opinion(section.key, "usable")}
                          type="checkbox"
                        />
                        <span>ใช้ได้</span>
                      </label>
                      <label>
                        <input
                          checked={value.opinion === "unusable"}
                          onChange={() => toggleSignInspectionPage9Opinion(section.key, "unusable")}
                          type="checkbox"
                        />
                        <span>ใช้ไม่ได้</span>
                      </label>
                    </fieldset>

                    <label className="field sign-inspection-page9-textarea">
                      <span>รายละเอียดความเห็นเพิ่มเติม</span>
                      <textarea
                        maxLength={220}
                        onChange={(event) => updateSignInspectionPage9Section(section.key, { opinionDetails: event.target.value })}
                        placeholder="กรอกเพิ่มเติมได้ (ถ้ามี)"
                        rows={3}
                        value={value.opinionDetails}
                      />
                    </label>

                    <label className="sign-inspection-page9-other-toggle">
                      <input
                        checked={value.otherEnabled}
                        onChange={() => updateSignInspectionPage9Section(section.key, { otherEnabled: !value.otherEnabled })}
                        type="checkbox"
                      />
                      <span>อื่น ๆ (โปรดระบุ)</span>
                    </label>
                    {value.otherEnabled ? (
                      <label className="field sign-inspection-page9-textarea">
                        <span>รายละเอียดอื่น ๆ</span>
                        <textarea
                          maxLength={260}
                          onChange={(event) => updateSignInspectionPage9Section(section.key, { otherText: event.target.value })}
                          placeholder="กรอกรายละเอียดอื่น ๆ"
                          rows={4}
                          value={value.otherText}
                        />
                      </label>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && (currentTemplatePage === 12 || currentTemplatePage === 13) ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page13-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า {currentTemplatePage} / 15</span>
                <h2>การตรวจสอบอุปกรณ์ประกอบต่าง ๆ ของป้าย</h2>
                <p>เลือก Checkbox ตามผลตรวจ ระบบจะแสดง ✓ ใน PDF ด้านขวาทันที โดยแต่ละกลุ่มเลือกได้หนึ่งค่า</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือหน้า 13">
                <button onClick={currentTemplatePage === 12 ? clearSignInspectionPage12 : clearSignInspectionPage13} type="button">
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <div className="sign-maintenance-table-list">
              {(currentTemplatePage === 12 ? signInspectionPage12Groups : signInspectionPage13Groups).map((group) => (
                <section className="sign-maintenance-table-section" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="sign-maintenance-table-wrap">
                    <table className="sign-maintenance-table sign-inspection-page13-table">
                      <thead>
                        <tr>
                          <th className="item-column" rowSpan={2} scope="col">รายการตรวจสอบ</th>
                          <th colSpan={2} scope="colgroup">รายการ</th>
                          <th colSpan={2} scope="colgroup">การชำรุดสึกหรอ</th>
                          <th colSpan={2} scope="colgroup">ความเสียหาย</th>
                          <th colSpan={2} scope="colgroup">ความเห็นผู้ตรวจสอบ</th>
                        </tr>
                        <tr>
                          <th scope="col">มี</th><th scope="col">ไม่มี</th>
                          <th scope="col">มี</th><th scope="col">ไม่มี</th>
                          <th scope="col">มี</th><th scope="col">ไม่มี</th>
                          <th scope="col">ใช้ได้</th><th scope="col">ใช้ไม่ได้</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((row) => {
                          const value = currentTemplatePage === 12
                            ? signInspectionPage12State[row.key]
                            : signInspectionPage13State[row.key];
                          return (
                            <tr key={row.key}>
                              <th className="sign-maintenance-item" scope="row">{row.label}</th>
                              {(["yes", "no"] as const).map((choice) => (
                                <td className="sign-maintenance-checkbox-cell" data-label={`รายการ ${choice === "yes" ? "มี" : "ไม่มี"}`} key={`presence-${choice}`}>
                                  <input aria-label={`${row.label} รายการ ${choice === "yes" ? "มี" : "ไม่มี"}`} checked={value.presence === choice} onChange={() => toggleCurrentSignInspectionChecklistChoice(row.key, "presence", choice)} type="checkbox" />
                                </td>
                              ))}
                              {(["yes", "no"] as const).map((choice) => (
                                <td className="sign-maintenance-checkbox-cell" data-label={`ชำรุด ${choice === "yes" ? "มี" : "ไม่มี"}`} key={`wear-${choice}`}>
                                  <input aria-label={`${row.label} ชำรุด ${choice === "yes" ? "มี" : "ไม่มี"}`} checked={value.wear === choice} onChange={() => toggleCurrentSignInspectionChecklistChoice(row.key, "wear", choice)} type="checkbox" />
                                </td>
                              ))}
                              {(["yes", "no"] as const).map((choice) => (
                                <td className="sign-maintenance-checkbox-cell" data-label={`เสียหาย ${choice === "yes" ? "มี" : "ไม่มี"}`} key={`damage-${choice}`}>
                                  <input aria-label={`${row.label} เสียหาย ${choice === "yes" ? "มี" : "ไม่มี"}`} checked={value.damage === choice} onChange={() => toggleCurrentSignInspectionChecklistChoice(row.key, "damage", choice)} type="checkbox" />
                                </td>
                              ))}
                              {(["usable", "unusable"] as const).map((choice) => (
                                <td className="sign-maintenance-checkbox-cell" data-label={choice === "usable" ? "ใช้ได้" : "ใช้ไม่ได้"} key={`result-${choice}`}>
                                  <input aria-label={`${row.label} ${choice === "usable" ? "ใช้ได้" : "ใช้ไม่ได้"}`} checked={value.result === choice} onChange={() => toggleCurrentSignInspectionChecklistChoice(row.key, "result", choice)} type="checkbox" />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && (currentTemplatePage === 5 || currentTemplatePage === 6) ? (
          <section className="builder-card sign-inspection-page14-form">
            <div className="image-upload-header">
              <div>
                <span className="page-kicker">หน้า {currentTemplatePage} / 15</span>
                <h2>รูปภาพป้ายที่ตรวจสอบ</h2>
                <p>เลือก “เปลี่ยนรูป” เพื่ออัปโหลดจากเครื่อง หรือเลือก “ถ่ายรูป” เพื่อเปิดกล้อง รูปใหม่จะแสดงแทนตำแหน่งเดิมใน PDF ทันที</p>
              </div>
            </div>
            <div className="upload-grid sign-inspection-page14-upload-grid">
              {getSignInspectionImageSlotsForPage(currentTemplatePage).map((slot) => (
                <ImageSlot
                  edit={imageEdits[slot.key]}
                  key={slot.key}
                  onReplace={handleReplaceImage}
                  slot={slot}
                />
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 14 ? (
          <section className="builder-card sign-inspection-page14-form">
            <div className="image-upload-header">
              <div>
                <span className="page-kicker">หน้า 14 / 15</span>
                <h2>รูปภาพระบบป้องกันฟ้าผ่า</h2>
                <p>เปลี่ยนรูปหรือถ่ายรูปใหม่ได้ทั้ง 4 ช่อง รูปจะอยู่ในตำแหน่งเดิมของ PDF และแสดงในพรีวิวทันที</p>
              </div>
            </div>
            <div className="upload-grid sign-inspection-page14-upload-grid">
              {signInspectionPage14ImageSlots.map((slot) => (
                <ImageSlot
                  edit={imageEdits[slot.key]}
                  key={slot.key}
                  onReplace={handleReplaceImage}
                  slot={slot}
                />
              ))}
            </div>
          </section>
        ) : selectedTemplateId === "sign-inspection-report" && currentTemplatePage === 15 ? (
          <section className="builder-card sign-maintenance-form-card sign-inspection-page15-form">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า 15 / 15</span>
                <h2>สรุปการตรวจสอบอุปกรณ์ประกอบต่าง ๆ ของป้าย</h2>
                <p>เลือก Checkbox จากตารางด้านซ้าย ระบบจะแสดง ✓ ลงใน PDF ด้านขวาทันที และเลือกซ้ำเพื่อยกเลิกได้</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือหน้า 15">
                <button onClick={clearSignInspectionPage15} type="button">
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            <div className="sign-maintenance-table-wrap">
              <table className="sign-maintenance-table result">
                <thead>
                  <tr>
                    <th className="item-column" scope="col">รายการตรวจสอบ</th>
                    {signInspectionPage15Options.map((option) => (
                      <th key={option.key} scope="col">{option.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signInspectionPage15Rows.map((row) => (
                    <tr key={row.key}>
                      <th className="sign-maintenance-item" scope="row">
                        <span className="sign-inspection-row-number">{row.number}</span> {row.label}
                      </th>
                      {signInspectionPage15Options.map((option) => (
                        <td className="sign-maintenance-checkbox-cell" data-label={option.label} key={option.key}>
                          <input
                            aria-label={`${row.label} ${option.label}`}
                            checked={signInspectionPage15Choices[row.key] === option.key}
                            onChange={() => toggleSignInspectionPage15Choice(row.key, option.key)}
                            type="checkbox"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : selectedTemplateId === "sign-maintenance-plan" && currentTemplatePage === 5 ? (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <span className="page-kicker">หน้า 5 / 7</span>
              <h2>ข้อมูลคงที่ตาม PDF ต้นฉบับ</h2>
              <p>หน้านี้กำหนดรอบตรวจเป็น “1 ปี” ไว้แล้ว และไม่เปิดให้แก้ไขข้อมูล</p>
            </div>
          </section>
        ) : selectedTemplateId === "sign-maintenance-plan" ? (
          <section className="builder-card sign-maintenance-form-card">
            <div className="sign-maintenance-form-heading">
              <div>
                <span>หน้า {currentTemplatePage} / 7</span>
                <h2>กรอกข้อมูลแบบฟอร์ม</h2>
                <p>เลือก Checkbox จากตารางด้านซ้าย ระบบจะแสดง ✓ บน PDF ด้านขวาทันที โดยไม่แก้ไขไฟล์ต้นฉบับ</p>
              </div>
              <div className="sign-maintenance-toolbar" role="toolbar" aria-label="เครื่องมือกรอกแบบฟอร์ม">
                <button
                  className={signMaintenanceTool === "check" ? "active" : ""}
                  onClick={() => setSignMaintenanceTool("check")}
                  type="button"
                >
                  <Check size={16} aria-hidden="true" /> ติ๊กช่อง
                </button>
                <button
                  className={signMaintenanceTool === "remark" ? "active" : ""}
                  onClick={() => setSignMaintenanceTool("remark")}
                  type="button"
                >
                  <MessageSquare size={16} aria-hidden="true" /> หมายเหตุ
                </button>
                <button onClick={clearSignMaintenancePage} type="button" disabled={currentSignMaintenanceRows.length === 0}>
                  <Eraser size={16} aria-hidden="true" /> ล้างค่า
                </button>
                <button onClick={() => void handleSaveDraft()} type="button" disabled={draftSaveStatus === "saving"}>
                  <Save size={16} aria-hidden="true" /> {draftSaveStatus === "saving" ? "กำลังบันทึก" : "บันทึก"}
                </button>
                <button className="primary" onClick={() => void handleDownloadPdf()} type="button" disabled={isGeneratingPdf}>
                  <FileText size={16} aria-hidden="true" /> {isGeneratingPdf ? "กำลังสร้าง" : "สร้าง PDF"}
                </button>
              </div>
            </div>

            {currentSignMaintenanceRows.length === 0 ? (
              <div className="page-edit-empty">
                <h2>หน้านี้ไม่มีช่องที่ต้องกรอก</h2>
                <p>หน้าที่ 1–4 เป็นเนื้อหาคู่มือ ระบบจะคงหน้าเดิมไว้และเริ่มกรอกตารางที่หน้า 5</p>
              </div>
            ) : (
              <div className="sign-maintenance-table-list">
                {Array.from(
                  currentSignMaintenanceRows.reduce((groups, row) => {
                    const groupKey = `${row.kind}:${row.section}`;
                    const group = groups.get(groupKey);
                    if (group) group.rows.push(row);
                    else groups.set(groupKey, { kind: row.kind, section: row.section, rows: [row] });
                    return groups;
                  }, new Map<string, {
                    kind: "frequency" | "result";
                    section: string;
                    rows: typeof currentSignMaintenanceRows;
                  }>()).values()
                ).map((group) => {
                  const options = group.kind === "frequency"
                    ? signMaintenanceFrequencyOptions
                    : signMaintenanceResultOptions;
                  return (
                    <section className="sign-maintenance-table-section" key={`${group.kind}:${group.section}`}>
                      <h3>{group.section}</h3>
                      <div className="sign-maintenance-table-wrap">
                        <table className={`sign-maintenance-table ${group.kind}`}>
                          <thead>
                            <tr>
                              <th className="item-column" scope="col">รายการตรวจ</th>
                              {options.map((option) => (
                                <th key={option.key} scope="col">{option.label}</th>
                              ))}
                              <th className="remark-column" scope="col">หมายเหตุ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row) => {
                              const remark = signMaintenanceForm.remarks[row.key];
                              return (
                                <tr key={row.key}>
                                  <th className="sign-maintenance-item" scope="row">{row.label}</th>
                                  {options.map((option) => {
                                    const checked = signMaintenanceForm.choices[row.key] === option.key;
                                    return (
                                      <td className="sign-maintenance-checkbox-cell" data-label={option.label} key={option.key}>
                                        <input
                                          aria-label={`${row.label} ${option.label}`}
                                          checked={checked}
                                          onChange={() => toggleSignMaintenanceChoice(row.key, option.key)}
                                          type="checkbox"
                                        />
                                      </td>
                                    );
                                  })}
                                  <td className="sign-maintenance-remark-cell">
                                    <div className="sign-maintenance-remark-editor">
                                      <span>หมายเหตุ</span>
                                      <button
                                        className={remark?.kind === "check" ? "selected" : ""}
                                        onClick={() => updateSignMaintenanceRemark(row.key, remark?.kind === "check" ? null : "check")}
                                        type="button"
                                      >✓</button>
                                      <button
                                        className={remark?.kind === "none" ? "selected" : ""}
                                        onClick={() => updateSignMaintenanceRemark(row.key, remark?.kind === "none" ? null : "none")}
                                        type="button"
                                      >-ไม่มี</button>
                                      <input
                                        aria-label={`หมายเหตุ ${row.label}`}
                                        onChange={(event) => updateSignMaintenanceRemark(row.key, event.target.value ? "text" : null, event.target.value)}
                                        placeholder="พิมพ์ข้อความเอง"
                                        value={remark?.kind === "text" ? remark.text : ""}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="builder-card template-readonly-card">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h2>{selectedTemplate.name}</h2>
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

            <button
              className="primary-action small-action"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={16} className="custom-spinner" aria-hidden="true" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <FileText size={16} aria-hidden="true" />สร้าง PDF
                </>
              )}
            </button>
          </div>
        </div>
        <div className="preview-body">
          <div className="pdf-page pdf-template-page">
            <div className="pdf-template-canvas" data-existing-year-edit={coverYearText}>
              {selectedTemplateId === "annual-inspection" && (currentTemplatePage === 14 || currentTemplatePage === 15)
                ? null
                : <div className="locked-overlay">LOCKED TEMPLATE</div>}
              <ReportPdfPreview page={currentTemplatePage} renderState={renderState} zoom={previewZoom} />
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
                <img
                  alt={`PDF template page ${page}`}
                  decoding="async"
                  loading="lazy"
                  src={getTemplatePageImage(selectedTemplateId, page)}
                />
                <span>{page}</span>
              </button>
            ))}
            <div className="zoom-row">
              <button
                aria-label="ย่อ PDF"
                disabled={previewZoom <= 75}
                onClick={() => setPreviewZoom((current) => Math.max(75, current - 25))}
                type="button"
              >-</button>
              <span>{previewZoom}%</span>
              <button
                aria-label="ขยาย PDF"
                disabled={previewZoom >= 200}
                onClick={() => setPreviewZoom((current) => Math.min(200, current + 25))}
                type="button"
              >+</button>
            </div>


            <button
              className="secondary-action small-action"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Download size={16} aria-hidden="true" />ดาวน์โหลดร่าง
                </>
              )}
            </button>
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

      {isEmailDialogOpen ? (
        <div className="modal-backdrop report-email-backdrop" role="presentation">
          <section aria-labelledby="send-report-title" aria-modal="true" className="user-modal report-email-modal" role="dialog">
            <div className="modal-header">
              <div>
                <h2 id="send-report-title">ส่งรายงานให้ลูกค้า</h2>
                <p>ตรวจสอบอีเมลผู้รับและไฟล์ PDF ก่อนส่งรายงาน</p>
              </div>
              <button
                aria-label="ปิด"
                className="icon-button"
                disabled={emailSendStatus === "sending"}
                onClick={() => setIsEmailDialogOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {emailSendStatus === "success" ? (
              <div className="report-email-success" role="status">
                <span><Check size={26} aria-hidden="true" /></span>
                <h3>ส่งรายงานสำเร็จแล้ว</h3>
                <p>ส่งไฟล์ไปยัง {recipientEmail.trim()} เรียบร้อย กำลังพาไปหน้า “รายงานของฉัน”</p>
              </div>
            ) : (
              <>
                <label className="field full">
                  <span>อีเมลผู้รับ</span>
                  <div className="report-email-input">
                    <Mail size={18} aria-hidden="true" />
                    <input
                      autoFocus
                      type="email"
                      value={recipientEmail}
                      onChange={(event) => {
                        setRecipientEmail(event.target.value);
                        setEmailError("");
                      }}
                      placeholder="customer@example.com"
                    />
                  </div>
                </label>

                <label className="field full" style={{ marginTop: "0.75rem" }}>
                  <span>สำเนาถึง (CC)</span>
                  <div className="report-email-input">
                    <Mail size={18} aria-hidden="true" />
                    <input
                      type="email"
                      value={ccEmail}
                      onChange={(event) => {
                        setCcEmail(event.target.value);
                        setEmailError("");
                      }}
                      placeholder="cc@example.com"
                    />
                  </div>
                </label>

                <div className="report-file-card" style={{ marginTop: "1rem" }}>
                  <FileText size={28} aria-hidden="true" />
                  <div>
                    <strong>{pdfFileName}</strong>
                    <span>{selectedTemplate.pages} หน้า</span>
                  </div>
                </div>

                <p className="report-email-notice" style={{ marginTop: "0.75rem" }}>
                  ระบบจะส่งรายงานไปยัง <strong>{recipientEmail.trim() || "example@email.com"}</strong>
                  {ccEmail.trim() ? <> และ CC ถึง <strong>{ccEmail.trim()}</strong></> : null}
                </p>
                {emailError ? <p className="report-email-error" role="alert">{emailError}</p> : null}

                <div className="modal-actions report-email-actions">
                  <button
                    className="secondary-action"
                    disabled={emailSendStatus === "sending"}
                    onClick={() => void finishReportFlow()}
                    type="button"
                  >
                    บันทึกไว้ก่อน / ยังไม่ส่ง
                  </button>
                  <button
                    className="primary-action"
                    disabled={emailSendStatus === "sending"}
                    onClick={() => void handleSendReportEmail()}
                    type="button"
                  >
                    {emailSendStatus === "sending" ? (
                      <>
                        <Loader2 size={17} className="custom-spinner" aria-hidden="true" style={{ marginRight: "6px" }} />
                        กำลังสร้างและรายงานทางอีเมล
                      </>
                    ) : (
                      <>
                        <Send size={17} aria-hidden="true" />
                        ส่งรายงานทางอีเมล
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

function formatHistoryDate(value: string | null | undefined) {
  if (!value) return "ไม่ระบุวันที่";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
