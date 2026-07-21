import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { AppShell } from "./components/AppShell";
import { ReportsPage } from "./pages/ReportsPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { AllReportsPage } from "./pages/AllReportsPage";
import { UsersPage } from "./pages/UsersPage";
import type { AppSection, ReportDraft } from "./types";

const persistentAuthKey = "service-report-authenticated";
const sessionAuthKey = "service-report-session-authenticated";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(persistentAuthKey) === "true"
      || sessionStorage.getItem(sessionAuthKey) === "true"
  );
  const [activeSection, setActiveSection] = useState<AppSection>("reports");
  const [editingDraft, setEditingDraft] = useState<ReportDraft | null>(null);

  function startNewReport() {
    setEditingDraft(null);
    setActiveSection("reports");
  }

  function editDraft(draft: ReportDraft) {
    setEditingDraft(draft);
    setActiveSection("reports");
  }

  function navigate(section: AppSection) {
    if (section === "reports") setEditingDraft(null);
    setActiveSection(section);
  }

  function handleLogin(remember: boolean) {
    if (remember) {
      localStorage.setItem(persistentAuthKey, "true");
      sessionStorage.removeItem(sessionAuthKey);
    } else {
      sessionStorage.setItem(sessionAuthKey, "true");
      localStorage.removeItem(persistentAuthKey);
    }
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem(persistentAuthKey);
    sessionStorage.removeItem(sessionAuthKey);
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const page = {
    reports: (
      <ReportsPage
        initialDraft={editingDraft}
        key={editingDraft?.id ?? "new-report"}
        onReportCompleted={() => setActiveSection("my-reports")}
      />
    ),
    "my-reports": <MyReportsPage onCreateReport={startNewReport} onEditDraft={editDraft} />,
    "all-reports": <AllReportsPage />,
    users: <UsersPage />
  }[activeSection];

  return (
    <AppShell
      activeSection={activeSection}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {page}
    </AppShell>
  );
}
