import { useState } from "react";
import PasswordInput from "./PasswordInput";

export default function AdminPasswordDialog({
  user,
  isSaving,
  onClose,
  onSave,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    const result = await onSave(user, password);
    if (!result?.ok) {
      setError(result?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-dialog-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">
              Security
            </p>
            <h2
              id="password-dialog-title"
              className="mt-2 text-2xl font-bold text-slate-900"
            >
              เปลี่ยนรหัสผ่าน
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 font-bold text-slate-500 hover:bg-slate-200 disabled:opacity-50"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              รหัสผ่านใหม่
            </label>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              ยืนยันรหัสผ่านใหม่
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {isSaving ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
