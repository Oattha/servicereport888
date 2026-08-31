import { Building2, ClipboardCheck, ShieldCheck, Wrench, BarChart3, Headphones, FileText, Clock3 } from "lucide-react";
import { LoginForm } from "../components/LoginForm";
import { BrandLogo } from "../components/BrandLogo";

const buildingFeatures = [
  { label: "ตรวจสอบอาคาร", icon: ClipboardCheck },
  { label: "บำรุงรักษา", icon: Wrench },
  { label: "ความปลอดภัย", icon: ShieldCheck },
  { label: "รายงานและสรุปผล", icon: BarChart3 }
];

const serviceFeatures = [
  { label: "รับแจ้งบริการ", icon: Headphones },
  { label: "ติดตามงาน", icon: Clock3 },
  { label: "บันทึกการบริการ", icon: Wrench },
  { label: "รายงานและสรุปผล", icon: FileText }
];

type LoginPageProps = {
  onLogin: (remember: boolean) => void;
  system?: "building" | "service";
};

export function LoginPage({ onLogin, system = "building" }: LoginPageProps) {
  const isService = system === "service";
  const features = isService ? serviceFeatures : buildingFeatures;
  return (
    <main className="login-page">
      <section className="hero-panel" aria-label={isService ? "ระบบรายงานการบริการ" : "ระบบรายงานการตรวจสอบอาคาร"}>
        <div className="hero-content">
          <div className="hero-title-group">
            <h1>{isService ? "ระบบรายงานการบริการ" : "ระบบรายงานการตรวจสอบอาคาร"}</h1>
            <p>{isService ? "จัดการ ติดตาม และสรุปรายงานการให้บริการ" : "และแผนปฏิบัติการตรวจบำรุงรักษาบริษัท"}</p>
            <span className="title-line" aria-hidden="true" />
          </div>

          <div className="feature-list" aria-label="ความสามารถของระบบ">
            {features.map(({ label, icon: Icon }) => (
              <div className="feature-item" key={label}>
                <Icon size={31} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="building-card" aria-hidden="true">
          {isService
            ? <Headphones size={420} strokeWidth={1.05} />
            : <Building2 size={420} strokeWidth={1.05} />}
        </div>
        <div className="scan-ring scan-ring-large" aria-hidden="true" />
        <div className="scan-ring scan-ring-small" aria-hidden="true" />
      </section>

      <section className="form-panel" aria-label="เข้าสู่ระบบ">
        <div className="login-card">
          <BrandLogo />
          <LoginForm onLogin={onLogin} />
          <footer className="login-footer">
            <p>© 2024 TEST TRUE Co., Ltd. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
