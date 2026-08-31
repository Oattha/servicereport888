import { useEffect, useState } from "react";
import { useAuthSession } from "./hooks/useAuthSession";
import LoginPage from "./pages/LoginPage";
import ReportPage from "./pages/ReportPage";
import AdminPage from "./pages/AdminPage";
import PrintPreviewPage from "./pages/PrintPreviewPage";

const getPageFromHash = () => {
  if (window.location.hash === "#admin") return "admin";
  if (window.location.hash === "#print-preview") return "print-preview";
  return "report";
};

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const {
    authState,
    isAuthLoading,
    isLoginSubmitting,
    authNotice,
    login,
    logout,
    clearAuthNotice,
  } = useAuthSession();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            กำลังตรวจสอบ session...
          </p>
        </div>
      </div>
    );
  }

  if (!authState.token) {
    return (
      <LoginPage
        onLogin={login}
        isLoading={isLoginSubmitting}
        sessionNotice={authNotice}
        onDismissNotice={clearAuthNotice}
      />
    );
  }

  const openPage = (page) => {
    window.location.hash = page === "admin" ? "admin" : "";
    setCurrentPage(page);
  };

  if (currentPage === "admin") {
    return (
      <AdminPage
        authState={authState}
        onBack={() => openPage("report")}
        onLogout={logout}
      />
    );
  }

  if (currentPage === "print-preview") {
    return <PrintPreviewPage onBack={() => openPage("report")} />;
  }

  return (
    <ReportPage
      authState={authState}
      onLogout={logout}
      onOpenAdmin={() => openPage("admin")}
    />
  );
}

export default App;
