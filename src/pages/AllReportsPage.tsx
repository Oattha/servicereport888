import { FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { getReports } from "../lib/api";
import type { SharedReport } from "../types";

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AllReportsPage() {
  const [reports, setReports] = useState<SharedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setIsLoading(true);
    setError("");
    try {
      setReports(await getReports());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดรายการรายงานไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="ALL REPORTS"
        title="รายงานทั้งหมด"
        description="รายงานฉบับเสร็จจากผู้ใช้งานทุกคนในระบบ"
        action={
          <button className="secondary-action all-reports-refresh" type="button" onClick={loadReports} disabled={isLoading}>
            <RefreshCw size={17} aria-hidden="true" />
            รีเฟรช
          </button>
        }
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>รายการรายงานฉบับเสร็จ</h2>
            <p>ข้อมูลนี้อ่านจากฐานข้อมูลกลางและมองเห็นร่วมกันทุกบัญชี</p>
          </div>
        </div>
        {error ? <div className="empty-state">{error}</div> : null}
        {!error && isLoading ? <div className="empty-state">กำลังโหลดรายงาน...</div> : null}
        {!error && !isLoading && reports.length === 0 ? (
          <div className="empty-state empty-panel">ยังไม่มีรายงานที่บันทึกเป็นฉบับเสร็จ</div>
        ) : null}
        {!error && !isLoading && reports.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>เลขที่รายงาน</th>
                  <th>อาคาร</th>
                  <th>เจ้าของอาคาร</th>
                  <th>Template</th>
                  <th>ผู้บันทึก</th>
                  <th>สถานะ</th>
                  <th>บันทึกล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="draft-report-title">
                        <FileText size={18} aria-hidden="true" />
                        <strong>{report.reportNo}</strong>
                      </div>
                    </td>
                    <td>{report.building}</td>
                    <td>{report.customer}</td>
                    <td>{report.template}</td>
                    <td>{report.inspector}</td>
                    <td><span className="completed-report-status">เสร็จแล้ว</span></td>
                    <td>{formatUpdatedAt(report.updatedAt)}</td>
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
