import { ArrowRight, Building2, CheckCircle2, Cog, Headphones, Wrench } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

type HomePageProps = {
  onBuildingLogin: () => void;
  onServiceLogin: () => void;
};

const systems = [
  {
    key: "building",
    title: "รายงานตรวจสอบอาคารประจำปี",
    description: "สำหรับบันทึก ตรวจสอบ และจัดทำรายงานการตรวจสอบอาคารประจำปี",
    icon: Building2,
    accentIcon: CheckCircle2,
    action: "เข้าสู่ระบบ",
    tone: "blue"
  },
  {
    key: "service",
    title: "ระบบรายงานการบริการ",
    description: "สำหรับจัดการรายงานการให้บริการ และติดตามสถานะการดำเนินงาน",
    icon: Headphones,
    accentIcon: Wrench,
    action: "เข้าสู่ระบบ",
    tone: "green"
  }
] as const;

export function HomePage({ onBuildingLogin, onServiceLogin }: HomePageProps) {
  return (
    <main className="system-home-page">
      <header className="system-home-header">
        <div className="system-home-brand">
          <BrandLogo />
          <span className="system-home-divider" aria-hidden="true" />
          <strong>ระบบรายงาน</strong>
        </div>
      </header>

      <section className="system-home-main" aria-labelledby="system-home-title">
        <div className="system-home-decoration system-home-building" aria-hidden="true">
          <Building2 />
        </div>
        <div className="system-home-decoration system-home-gear" aria-hidden="true">
          <Cog />
        </div>

        <div className="system-home-intro">
          <span>ยินดีต้อนรับเข้าสู่</span>
          <h1 id="system-home-title">ระบบรายงาน</h1>
          <p>กรุณาเลือกประเภทของระบบที่ต้องการเข้าใช้งาน</p>
        </div>

        <div className="system-card-grid">
          {systems.map(({ key, title, description, icon: Icon, accentIcon: AccentIcon, action, tone }) => {
            const onLogin =
  key === "building"
    ? onBuildingLogin
    : () => {
        window.location.href = "https://report-service-react-frontend.vercel.app/";
        // หรือถ้าต้องการให้เปิดแท็บใหม่:
        // window.open("https://report-service-react-frontend.vercel.app/", "_blank", "noopener,noreferrer");
      };
            return (
              <article className={`system-card system-card-${tone}`} key={key}>
                <div className="system-card-icon" aria-hidden="true">
                  <Icon className="system-card-main-icon" />
                  <span><AccentIcon /></span>
                </div>
                <h2>{title}</h2>
                <p>{description}</p>
                <button type="button" onClick={onLogin}>
                  <span>{action}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="system-home-footer">
        <Cog aria-hidden="true" />
        <span>© 2024 TEST TRUE CO., LTD. All rights reserved.</span>
      </footer>
    </main>
  );
}
