import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { AppSection } from "./types";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<AppSection>("reports");

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const page = {
    dashboard: <DashboardPage onStartReport={() => setActiveSection("reports")} />,
    reports: <ReportsPage />,
    templates: <TemplatesPage />,
    settings: <SettingsPage />
  }[activeSection];

  return (
    <AppShell
      activeSection={activeSection}
      onNavigate={setActiveSection}
      onLogout={() => setIsAuthenticated(false)}
    >
      {page}
    </AppShell>
  );
}
