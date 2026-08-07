import { Mail, ServerCog, Shield, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

const settings = [
  { title: "Users and Roles", text: "Admin, inspector, reviewer, and email sender permissions.", icon: Users },
  { title: "Email Delivery", text: "SMTP sender profile, customer templates, and delivery logs.", icon: Mail },
  { title: "Security", text: "Session rules, password policy, and audit trail retention.", icon: Shield },
  { title: "PDF Engine", text: "Template storage, render queue, and generation status.", icon: ServerCog }
];

export function SettingsPage() {
  return (
    <section className="page-stack">
      <PageHeader
        eyebrow="System Administration"
        title="Settings"
        description="Prepare the operational foundation before connecting database, PDF generation, and email services."
      />
      <div className="settings-grid">
        {settings.map(({ title, text, icon: Icon }) => (
          <article className="settings-card" key={title}>
            <Icon size={24} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
