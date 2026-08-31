import { useState, useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { AppShell } from "./components/AppShell";
import { ReportsPage } from "./pages/ReportsPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { AllReportsPage } from "./pages/AllReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { HomePage } from "./pages/HomePage";
import { onUnauthorized, setAuthToken } from "./lib/http";
import type { AppSection, ReportDraft } from "./types";

const persistentAuthKey = "service-report-authenticated";
const sessionAuthKey = "service-report-session-authenticated";

type EntryRoute = "home" | "building-login" | "service-login" | "app";

function getEntryRoute(): EntryRoute {
  if (window.location.pathname === "/building-login" || window.location.pathname === "/login") return "building-login";
  if (window.location.pathname === "/service-login") return "service-login";
  if (window.location.pathname === "/app") return "app";
  return "home";
}

export function App() {
  const [entryRoute, setEntryRoute] = useState<EntryRoute>(getEntryRoute);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(persistentAuthKey) === "true"
      || sessionStorage.getItem(sessionAuthKey) === "true"
  );
  const [activeSection, setActiveSection] = useState<AppSection>("reports");
  const [editingDraft, setEditingDraft] = useState<ReportDraft | null>(null);

  function navigateEntry(route: EntryRoute, replace = false) {
    const path = {
      home: "/",
      "building-login": "/building-login",
      "service-login": "/service-login",
      app: "/app"
    }[route];
    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    setEntryRoute(route);
  }

  function openServiceLogin() {
    window.location.assign("/service/");
  }

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
    navigateEntry("app", true);
  }

  function handleLogout() {
    localStorage.removeItem(persistentAuthKey);
    sessionStorage.removeItem(sessionAuthKey);
    setAuthToken(null);
    setIsAuthenticated(false);
    navigateEntry("building-login", true);
  }

  useEffect(() => {
    onUnauthorized(() => {
      handleLogout();
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => setEntryRoute(getEntryRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (entryRoute === "home") {
    return (
      <HomePage
        onBuildingLogin={() => navigateEntry("building-login")}
        onServiceLogin={openServiceLogin}
      />
    );
  }

  if (entryRoute === "building-login" || entryRoute === "service-login") {
    return <LoginPage onLogin={handleLogin} system={entryRoute === "service-login" ? "service" : "building"} />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} system="building" />;
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
