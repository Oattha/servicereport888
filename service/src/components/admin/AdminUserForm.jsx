import { useState } from "react";
import PasswordInput from "./PasswordInput";

const emptyForm = {
  email: "",
  password: "",
  role: "user",
  is_active: true,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function AdminUserForm({
  selectedUser,
  currentUserId,
  isSaving,
  onSave,
  onCancelEdit,
}) {
  const [form, setForm] = useState(() =>
    selectedUser
      ? {
          email: selectedUser.email,
          password: "",
          role: selectedUser.role || "user",
          is_active: selectedUser.is_active,
        }
      : emptyForm,
  );
  const [error, setError] = useState("");
  const isEditing = Boolean(selectedUser);
  const isEditingCurrentUser = selectedUser?.id === currentUserId;

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (!isEditing && form.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (isEditing && form.password && form.password.length < 8) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    const payload = {
      ...form,
      ...(isEditingCurrentUser ? { role: "admin", is_active: true } : {}),
    };
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    const result = await onSave(payload);
    if (result?.ok) {
      if (!isEditing) setForm(emptyForm);
    } else {
      setError(result?.message || "บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
          User Management
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {isEditing ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "เว้นรหัสผ่านว่างไว้ หากไม่ต้องการเปลี่ยนรหัสผ่าน"
            : "กำหนดบัญชี รหัสผ่าน และสิทธิ์การใช้งาน"}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            อีเมล
          </label>
          <input
            className={inputClass}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="user@company.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {isEditing ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}
          </label>
          <PasswordInput
            className={inputClass}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            สิทธิ์
          </label>
          <select
            className={`${inputClass} ${isEditingCurrentUser ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={isEditingCurrentUser}
          >
            <option value="user">ผู้ใช้งานทั่วไป</option>
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
          </select>
          {isEditingCurrentUser && (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              บัญชีที่กำลังใช้งานอยู่ต้องคงสิทธิ์ Admin เพื่อไม่ให้หลุดจากระบบจัดการ
            </p>
          )}
        </div>

        <label
          className={`flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ${
            isEditingCurrentUser ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            disabled={isEditingCurrentUser}
            className="h-5 w-5 rounded border-slate-300 text-indigo-600"
          />
          <span className="text-sm font-semibold text-slate-700">
            เปิดใช้งานบัญชี
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving
              ? "กำลังบันทึก..."
              : isEditing
                ? "บันทึกการแก้ไข"
                : "เพิ่มผู้ใช้"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
