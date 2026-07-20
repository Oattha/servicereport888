import {
  Bell,
  CalendarPlus,
  FileArchive,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Users
} from "lucide-react";
import type { ReactNode } from "react";
import type { AppSection } from "../types";

type AppShellProps = {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onLogout: () => void;
  children: ReactNode;
};

const navItems = [
  { id: "reports", label: "สร้างรายงานใหม่", icon: CalendarPlus }
] as const;

export function AppShell({ activeSection, onNavigate, onLogout, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="app-brand">
          <div className="app-brand-mark">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <strong>TEST TRUE</strong>
            <span>SAFETY FUTURE SERVICE</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          <span className="nav-group-label">จัดการรายงาน</span>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={activeSection === id ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => onNavigate(id)}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
          <button
            className={activeSection === "my-reports" ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onNavigate("my-reports")}
          >
            <FileText size={19} aria-hidden="true" />
            <span>รายงานของฉัน</span>
          </button>
          <button
            className={activeSection === "all-reports" ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onNavigate("all-reports")}
          >
            <FileArchive size={19} aria-hidden="true" />
            <span>รายงานทั้งหมด</span>
          </button>

          <span className="nav-group-label">ตั้งค่า</span>
          <button
            className={activeSection === "users" ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onNavigate("users")}
          >
            <Users size={19} aria-hidden="true" />
            <span>ผู้ใช้งาน</span>
          </button>
        </nav>

        <div className="sidebar-panel">
          <span>Current Flow</span>
          <strong>Template locked, fields editable</strong>
          <p>Users fill data, upload photos, preview PDF, then send to customers.</p>
        </div>

        <button className="nav-item logout" type="button" onClick={onLogout}>
          <LogOut size={19} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-menu" type="button" aria-label="Open menu">
            <Menu size={20} aria-hidden="true" />
          </button>
          <h1 className="topbar-title">สร้างรายงานตรวจสอบอาคาร (ประจำปี)</h1>
          <div className="search-box compact-search">
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search" placeholder="Search reports, customers, templates" />
          </div>
          <button className="icon-button" type="button" aria-label="Help">
            <HelpCircle size={20} aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" aria-label="Notifications">
            <Bell size={20} aria-hidden="true" />
          </button>
          <div className="user-chip">
            <span>U</span>
            <div>
              <strong>User</strong>
              <small>Authenticated</small>
            </div>
          </div>
        </header>
        <div className="page-container">{children}</div>
      </div>
    </div>
  );
}
