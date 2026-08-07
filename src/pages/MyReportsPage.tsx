import { Edit3, FilePlus2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { LoadingSpinner, SkeletonTable } from "../components/LoadingSpinner";
import { getReportDrafts } from "../lib/reportDrafts";
import type { ReportDraft } from "../types";

type MyReportsPageProps = {
  onCreateReport: () => void;
  onEditDraft: (draft: ReportDraft) => void;
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getTemplateName(draft: ReportDraft) {
  return draft.templateId === "maintenance-plan"
    ? "แผนปฏิบัติการการตรวจบำรุงรักษาอาคาร"
    : "รายงานตรวจสอบอาคาร (ประจำปี)";
}

export function MyReportsPage({ onCreateReport, onEditDraft }: MyReportsPageProps) {
  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    getReportDrafts()
      .then((nextDrafts) => {
        if (isCurrent) setDrafts(nextDrafts);
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : "โหลดรายงานชั่วคราวไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="MY REPORTS"
        title="รายงานของฉัน"
        description="รายงานที่บันทึกชั่วคราว สามารถเปิดกลับมาแก้ไขและสร้าง PDF ต่อได้"
        action={
          <button className="primary-action" type="button" onClick={onCreateReport}>
            <FilePlus2 size={18} aria-hidden="true" />
            สร้างรายงานใหม่
          </button>
        }
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>รายงานที่บันทึกชั่วคราว</h2>
            <p>เรียงตามเวลาที่แก้ไขล่าสุด</p>
          </div>
        </div>
        {error ? <div className="empty-state">{error}</div> : null}
        {!error && isLoading ? <LoadingSpinner /> : null}
        {!error && !isLoading && drafts.length === 0 ? (
          <div className="empty-state empty-panel">ยังไม่มีรายงานที่บันทึกชั่วคราว</div>
        ) : null}
        {!error && !isLoading && drafts.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>รายงาน</th>
                  <th>เจ้าของอาคาร</th>
                  <th>Template</th>
                  <th>แก้ไขล่าสุด</th>
                  <th aria-label="การทำงาน" />
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <div className="draft-report-title">
                        <FileText size={18} aria-hidden="true" />
                        <div>
                          <strong>{draft.buildingName}</strong>
                          <span>{draft.title}</span>
                        </div>
                      </div>
                    </td>
                    <td>{draft.ownerCompany}</td>
                    <td>{getTemplateName(draft)}</td>
                    <td>{formatUpdatedAt(draft.updatedAt)}</td>
                    <td>
                      <button className="secondary-action draft-edit-action" type="button" onClick={() => onEditDraft(draft)}>
                        <Edit3 size={16} aria-hidden="true" />
                        แก้ไขต่อ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  );
}
