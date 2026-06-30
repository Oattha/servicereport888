import { ArrowRight, CheckCircle2, Clock3, FilePlus2, FileText, Mail, ShieldCheck, Upload } from "lucide-react";
import { reports } from "../data/mockData";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";

type DashboardPageProps = {
  onStartReport: () => void;
};

const workflow = [
  { title: "Select locked template", icon: ShieldCheck },
  { title: "Fill inspection fields", icon: FileText },
  { title: "Upload site photos", icon: Upload },
  { title: "Preview and send PDF", icon: Mail }
];

export function DashboardPage({ onStartReport }: DashboardPageProps) {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Enterprise Workspace"
        title="Building Inspection Operations"
        description="Create consistent inspection reports without manually editing PDF layouts."
        action={
          <button className="primary-action" type="button" onClick={onStartReport}>
            <FilePlus2 size={19} aria-hidden="true" />
            New Report
          </button>
        }
      />

      <div className="metric-grid">
        <article className="metric-card">
          <span>Reports this month</span>
          <strong>42</strong>
          <small>12 ready for review</small>
        </article>
        <article className="metric-card">
          <span>Average creation time</span>
          <strong>18m</strong>
          <small>Reduced manual PDF work</small>
        </article>
        <article className="metric-card">
          <span>PDFs sent</span>
          <strong>128</strong>
          <small>Customer delivery tracked</small>
        </article>
        <article className="metric-card">
          <span>Active templates</span>
          <strong>3</strong>
          <small>Layout locked by admin</small>
        </article>
      </div>

      <div className="content-grid">
        <section className="panel wide-panel">
          <div className="panel-header">
            <div>
              <h2>Report Creation Flow</h2>
              <p>Users only edit approved fields. Page layout remains locked.</p>
            </div>
          </div>
          <div className="workflow-row">
            {workflow.map(({ title, icon: Icon }, index) => (
              <div className="workflow-step" key={title}>
                <div className="step-icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <strong>{title}</strong>
                {index < workflow.length - 1 ? <ArrowRight size={18} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Today</h2>
              <p>Work requiring attention</p>
            </div>
          </div>
          <div className="task-list">
            <div><Clock3 size={18} /><span>3 reports awaiting inspector input</span></div>
            <div><CheckCircle2 size={18} /><span>2 PDFs ready to send</span></div>
            <div><Mail size={18} /><span>5 customer emails delivered</span></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Recent Reports</h2>
            <p>Latest report activity across the team</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Report</th>
                <th>Customer</th>
                <th>Building</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 4).map((report) => (
                <tr key={report.id}>
                  <td><strong>{report.id}</strong></td>
                  <td>{report.customer}</td>
                  <td>{report.building}</td>
                  <td><StatusBadge status={report.status} /></td>
                  <td>{report.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
