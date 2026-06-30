import {
  BarChart3,
  Bell,
  Building2,
  CalendarPlus,
  FileArchive,
  FileText,
  FolderOpen,
  LayoutTemplate,
  LogOut,
  Menu,
  Settings,
  Users,
  HelpCircle,
  Search,
  ShieldCheck
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
  { id: "dashboard", label: "แดชบอร์ด", icon: BarChart3 },
  { id: "reports", label: "สร้างรายงานใหม่", icon: CalendarPlus },
  { id: "templates", label: "เทมเพลต", icon: LayoutTemplate },
  { id: "settings", label: "ตั้งค่าระบบ", icon: Settings }
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
          <button className="nav-item" type="button">
            <FileText size={19} aria-hidden="true" />
            <span>รายงานของฉัน</span>
          </button>
          <button className="nav-item" type="button">
            <FileArchive size={19} aria-hidden="true" />
            <span>รายงานทั้งหมด</span>
          </button>
          <span className="nav-group-label">ข้อมูลพื้นฐาน</span>
          <button className="nav-item" type="button">
            <Building2 size={19} aria-hidden="true" />
            <span>ลูกค้า / อาคาร</span>
          </button>
          <button className="nav-item" type="button">
            <FolderOpen size={19} aria-hidden="true" />
            <span>คลังรูปภาพ</span>
          </button>
          <span className="nav-group-label">ตั้งค่า</span>
          <button className="nav-item" type="button">
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
            <span>KN</span>
            <div>
              <strong>Kawkan</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>
        <div className="page-container">{children}</div>
      </div>
    </div>
  );
}
