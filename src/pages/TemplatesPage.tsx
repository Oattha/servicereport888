import { FileLock2, LayoutTemplate, Plus, ShieldCheck } from "lucide-react";
import { templates } from "../data/mockData";
import { PageHeader } from "../components/PageHeader";

export function TemplatesPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="Template Control"
        title="Report Templates"
        description="Admins manage approved report formats. Users cannot move layouts, tables, fonts, or image positions."
        action={
          <button className="primary-action" type="button">
            <Plus size={19} aria-hidden="true" />
            Add Template
          </button>
        }
      />

      <div className="template-grid">
        {templates.map((template) => (
          <article className="template-card" key={template.id}>
            <div className="template-icon">
              <LayoutTemplate size={26} aria-hidden="true" />
            </div>
            <div>
              <span className={template.active ? "template-state on" : "template-state"}>{template.active ? "Active" : "Disabled"}</span>
              <h2>{template.name}</h2>
              <p>{template.id} · Version {template.version}</p>
            </div>
            <div className="template-meta">
              <span><FileLock2 size={16} /> {template.lockedFields} locked fields</span>
              <span><ShieldCheck size={16} /> {template.pages} fixed pages</span>
            </div>
            <button className="secondary-action" type="button">Configure Fields</button>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Template Rule</h2>
            <p>Each template will map field keys to fixed PDF coordinates. The editor will only expose the fields and photo slots allowed by the selected template.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
