import { useCallback, useEffect, useState } from "react";
import AdminPasswordDialog from "../components/admin/AdminPasswordDialog";
import AdminUserForm from "../components/admin/AdminUserForm";
import AdminUserTable from "../components/admin/AdminUserTable";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../services/adminApi";

export default function AdminPage({ authState, onBack, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const handleApiError = useCallback(
    (apiError) => {
      if (apiError.status === 401) {
        onLogout("กรุณาเข้าสู่ระบบใหม่");
        return;
      }
      setError(apiError.message);
    },
    [onLogout],
  );

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getAdminUsers(authState.token);
      setUsers(result.users || []);
    } catch (apiError) {
      handleApiError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [authState.token, handleApiError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSave = async (payload) => {
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      if (selectedUser) {
        await updateAdminUser(authState.token, selectedUser.id, payload);
        setNotice("แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
      } else {
        await createAdminUser(authState.token, payload);
        setNotice("เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว");
      }
      setSelectedUser(null);
      await loadUsers();
      return { ok: true };
    } catch (apiError) {
      handleApiError(apiError);
      return { ok: false, message: apiError.message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user) => {
    setError("");
    setNotice("");
    try {
      await updateAdminUser(authState.token, user.id, {
        is_active: !user.is_active,
      });
      setNotice(
        user.is_active ? "ปิดใช้งานบัญชีเรียบร้อยแล้ว" : "เปิดใช้งานบัญชีเรียบร้อยแล้ว",
      );
      await loadUsers();
    } catch (apiError) {
      handleApiError(apiError);
    }
  };

  const handleChangePassword = async (user, password) => {
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      await updateAdminUser(authState.token, user.id, { password });
      setPasswordUser(null);
      setNotice(`เปลี่ยนรหัสผ่านของ ${user.email} เรียบร้อยแล้ว`);
      return { ok: true };
    } catch (apiError) {
      handleApiError(apiError);
      return { ok: false, message: apiError.message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`ยืนยันการลบบัญชี ${user.email} ?`)) return;
    setError("");
    setNotice("");
    try {
      await deleteAdminUser(authState.token, user.id);
      setNotice("ลบผู้ใช้เรียบร้อยแล้ว");
      if (selectedUser?.id === user.id) setSelectedUser(null);
      await loadUsers();
    } catch (apiError) {
      handleApiError(apiError);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 font-sarabun text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
                Administration
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                ระบบจัดการผู้ใช้งาน
              </h1>
              <p className="mt-2 text-sm text-blue-100 md:text-base">
                เพิ่มบัญชี ตั้งรหัสผ่าน กำหนดสิทธิ์ และควบคุมการเข้าใช้งาน
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl bg-white/15 px-5 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25"
            >
              ← กลับหน้ารายงาน
            </button>
          </div>
        </header>

        {notice && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            {notice}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <AdminUserForm
            key={selectedUser?.id || "new-user"}
            selectedUser={selectedUser}
            currentUserId={authState.user?.id}
            isSaving={isSaving}
            onSave={handleSave}
            onCancelEdit={() => setSelectedUser(null)}
          />
          <AdminUserTable
            users={users}
            currentUserId={authState.user?.id}
            isLoading={isLoading}
            onEdit={setSelectedUser}
            onChangePassword={setPasswordUser}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <AdminPasswordDialog
        user={passwordUser}
        isSaving={isSaving}
        onClose={() => setPasswordUser(null)}
        onSave={handleChangePassword}
      />
    </div>
  );
}
