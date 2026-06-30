import { useMemo, useState } from "react";
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
import { ReportPdfPreview } from "../components/ReportPdfPreview";
import { annualInspectionTemplate, imageSlots, templateFields } from "../data/pdfTemplate";
import type { ReportRenderState, TemplateImageEdit } from "../types";
import { createReportPdf } from "../utils/reportRenderer";
import { ReplaceImage } from "../utils/templateEditing";

const buildingTypes = [
  "อาคารสูง",
  "อาคารขนาดใหญ่พิเศษ",
  "อาคารชุมนุมคน",
  "โรงงาน",
  "อาคารชุด",
  "อาคารอยู่อาศัยรวม",
  "อื่นๆ (ระบุ)"
];

const previewPages = Array.from({ length: annualInspectionTemplate.pages }, (_, index) => index + 1);

function getTemplatePageImage(page: number) {
  return `/templates/bangchan-report-pages/page-${String(page).padStart(2, "0")}.png`;
}

export function ReportsPage() {
  const [currentTemplatePage, setCurrentTemplatePage] = useState(1);
  const [imageEdits, setImageEdits] = useState<Record<string, TemplateImageEdit>>({});
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  const [ownerCompany, setOwnerCompany] = useState("บริษัท บางชันเยนเนอเรลเซชเมนส์ จำกัด");
  const [coverYearSuffix, setCoverYearSuffix] = useState("68");
  const [logoHeadline, setLogoHeadline] = useState("PROVISION INSPECTOR");
  const [logoSubline, setLogoSubline] = useState("COMPANYLIMITED");
  const [logoDetail, setLogoDetail] = useState("บริษัท โปรวิชั่น อินสเปคเตอร์ จำกัด");
  const [logoWebsite, setLogoWebsite] = useState("www.pvi-inspector.com");

  const lockedFieldSummary = useMemo(() => {
    const textFields = templateFields.filter((field) => field.type !== "signature").length;
    return `${textFields} ช่องข้อมูล, ${imageSlots.length} ช่องรูปภาพ, ${annualInspectionTemplate.pages} หน้า`;
  }, []);

  const currentPageImageSlots = useMemo(
    () => imageSlots.filter((slot) => slot.page === currentTemplatePage),
    [currentTemplatePage]
  );

  function handleReplaceImage(slotKey: string, file: File) {
    setImageEdits((current) => ReplaceImage(current, slotKey, file));
  }

  const coverYearTail = coverYearSuffix.padEnd(2, "_").slice(0, 2);
  const coverYearText = `25${coverYearTail}`;
  const renderState: ReportRenderState = useMemo(
    () => ({
      coverYear: coverYearText,
      ownerCompany,
      logoHeadline,
      logoSubline,
      logoDetail,
      logoWebsite,
      imageEdits
    }),
    [coverYearText, imageEdits, logoDetail, logoHeadline, logoSubline, logoWebsite, ownerCompany]
  );

  async function handleDownloadPdf() {
    const pdfBytes = await createReportPdf(renderState);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TEST-TRUE-${coverYearText}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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

        <section className="template-lock-card">
          <div>
            <span className="template-chip">
              <LockKeyhole size={15} aria-hidden="true" />
              Locked PDF Template
            </span>
            <h2>{annualInspectionTemplate.name}</h2>
            <p>
              ฟอร์มนี้แก้เฉพาะข้อมูลที่ผูกกับตำแหน่งในเทมเพลตเท่านั้น รูปแบบหน้า ตาราง ฟอนต์ และตำแหน่งรูปจะไม่ขยับ
            </p>
          </div>
          <div className="template-lock-meta">
            <strong>{annualInspectionTemplate.id}</strong>
            <span>{lockedFieldSummary}</span>
          </div>
        </section>

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
                    setCoverYearSuffix(value);
                  }}
                  placeholder="__"
                />
              </div>
            </label>
            <label className="field full">
              <span>ชื่อบริษัทด้านล่างหน้าปก</span>
              <input value={ownerCompany} onChange={(event) => setOwnerCompany(event.target.value)} />
            </label>
            <label className="field">
              <span>ข้อความโลโก้บรรทัด 1</span>
              <input value={logoHeadline} onChange={(event) => setLogoHeadline(event.target.value)} />
            </label>
            <label className="field">
              <span>ข้อความโลโก้บรรทัด 2</span>
              <input value={logoSubline} onChange={(event) => setLogoSubline(event.target.value)} />
            </label>
            <label className="field">
              <span>ชื่อบริษัทข้างโลโก้</span>
              <input value={logoDetail} onChange={(event) => setLogoDetail(event.target.value)} />
            </label>
            <label className="field">
              <span>เว็บไซต์ข้างโลโก้</span>
              <input value={logoWebsite} onChange={(event) => setLogoWebsite(event.target.value)} />
            </label>
          </div>
        </section>
        ) : null}

        {currentTemplatePage === 1 ? null : (
          <section className="builder-card page-edit-empty">
            <span>Page {currentTemplatePage}</span>
            <h2>????????????????????????????????</h2>
            <p>????????????????????????????????? ??????????????????????????????????????????????</p>
          </section>
        )}

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
              <div className="locked-overlay">LOCKED TEMPLATE</div>
              <ReportPdfPreview page={currentTemplatePage} renderState={renderState} />
            </div>
          </div>
          <div className="thumb-strip">
            <span>หน้าที่ 1 / 25</span>
            {previewPages.map((page) => (
              <button
                className={page === currentTemplatePage ? "thumb active image-thumb" : "thumb image-thumb"}
                key={page}
                type="button"
                onClick={() => setCurrentTemplatePage(page)}
              >
                <img alt={`PDF template page ${page}`} src={getTemplatePageImage(page)} />
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
          <span>บันทึกอัตโนมัติแล้ว เมื่อสักครู่</span>
        </div>
        <div className="footer-actions">
          <button className="secondary-action" type="button"><Save size={17} aria-hidden="true" />บันทึกชั่วคราว</button>
          <button className="primary-action" type="button">ถัดไป <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
