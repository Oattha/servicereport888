function formatDate(value) {
  if (!value) return "ยังไม่เคย";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminUserTable({
  users,
  currentUserId,
  isLoading,
  onEdit,
  onChangePassword,
  onToggleActive,
  onDelete,
}) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
        กำลังโหลดรายชื่อผู้ใช้...
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-900">บัญชีทั้งหมด</h2>
        <p className="mt-1 text-sm text-slate-500">
          พบผู้ใช้ {users.length} บัญชี
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ผู้ใช้</th>
              <th className="px-6 py-4">สิทธิ์</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4">เข้าใช้ล่าสุด</th>
              <th className="px-6 py-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              return (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${
                        user.is_active ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          user.is_active ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {user.is_active ? "ใช้งานได้" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangePassword(user)}
                        className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                      >
                        เปลี่ยนรหัสผ่าน
                      </button>
                      <button
                        type="button"
                        disabled={isCurrentUser}
                        onClick={() => onToggleActive(user)}
                        className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {user.is_active ? "ปิดบัญชี" : "เปิดบัญชี"}
                      </button>
                      <button
                        type="button"
                        disabled={isCurrentUser}
                        onClick={() => onDelete(user)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
