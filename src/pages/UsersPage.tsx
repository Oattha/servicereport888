import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X
} from "lucide-react";
import { createUser, deleteUser, getUsers, type CreateUserInput } from "../lib/api";
import { LoadingSpinner, SkeletonTable } from "../components/LoadingSpinner";
import type { UserRecord, UserRole, UserStatus } from "../types";

const emptyForm: CreateUserInput = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  role: "user",
  status: "active"
};

const roleClass: Record<UserRole, string> = {
  admin: "role-admin",
  user: "role-inspector"
};

const roleLabel: Record<UserRole, string> = {
  admin: "Administrator",
  user: "User"
};

const statusLabel: Record<UserStatus, string> = {
  active: "ใช้งานอยู่",
  inactive: "ไม่ใช้งาน"
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function formatLastLogin(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateUserInput>(emptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !search
        || user.fullName.toLowerCase().includes(search)
        || user.username.toLowerCase().includes(search)
        || user.email.toLowerCase().includes(search);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const activeCount = users.filter((user) => user.status === "active").length;
  const inactiveCount = users.filter((user) => user.status === "inactive").length;
  const roleCount = new Set(users.map((user) => user.role)).size;

  function handleToggleModal(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      setForm(emptyForm);
      setError("");
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const createdUser = await createUser(form);
      setUsers((current) => [createdUser, ...current]);
      setForm(emptyForm);
      setIsDialogOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "เพิ่มผู้ใช้งานไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(user: UserRecord) {
    if (!window.confirm(`ลบผู้ใช้งาน ${user.fullName}?`)) return;

    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบผู้ใช้งานไม่สำเร็จ");
    }
  }

  return (
    <section className="users-page" style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="users-header" style={{ flexShrink: 0 }}>
        <div>
          <h1>จัดการผู้ใช้งาน (Users)</h1>
          <p>เพิ่ม แก้ไข ลบ และจัดการสิทธิ์การใช้งานของระบบ</p>
        </div>
      </div>

      <div className="user-stat-grid" style={{ flexShrink: 0 }}>
        <article className="user-stat-card">
          <span className="stat-icon blue"><Users size={28} /></span>
          <div><small>ผู้ใช้งานทั้งหมด</small><strong>{users.length} <span>คน</span></strong></div>
        </article>
        <article className="user-stat-card">
          <span className="stat-icon green"><UserCheck size={28} /></span>
          <div><small>ผู้ใช้งานที่ใช้งานอยู่</small><strong>{activeCount} <span>คน</span></strong></div>
        </article>
        <article className="user-stat-card">
          <span className="stat-icon gray"><UserX size={28} /></span>
          <div><small>ผู้ใช้งานที่ไม่ใช้งาน</small><strong>{inactiveCount} <span>คน</span></strong></div>
        </article>
        <article className="user-stat-card">
          <span className="stat-icon purple"><ShieldCheck size={28} /></span>
          <div><small>บทบาททั้งหมด</small><strong>{roleCount} <span>บทบาท</span></strong></div>
        </article>
      </div>

      <section className="users-panel" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        <div className="users-toolbar" style={{ flexShrink: 0 }}>
          <label className="users-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล, หรือชื่อผู้ใช้..."
            />
            <Search size={18} aria-hidden="true" />
          </label>
          <select aria-label="บทบาท" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}>
            <option value="all">ทุกบทบาท</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
          </select>
          <select aria-label="สถานะ" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | UserStatus)}>
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
          <div className="users-toolbar-actions">
            <button className="primary-action" type="button" onClick={() => handleToggleModal(true)}>
              <Plus size={18} />เพิ่มผู้ใช้งานใหม่
            </button>
            <button className="icon-button" type="button" aria-label="Refresh" onClick={() => void loadUsers()}>
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {error ? <div className="panel-error" style={{ flexShrink: 0 }}>{error}</div> : null}

        <div className="users-table-wrap" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ชื่อผู้ใช้</th>
                  <th>อีเมล</th>
                  <th>บทบาท</th>
                  <th>สถานะ</th>
                  <th>เข้าสู่ระบบล่าสุด</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state">ยังไม่มีข้อมูลผู้ใช้งาน</div></td></tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-name-cell">
                        <span className="table-avatar">{getInitials(user.fullName)}</span>
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-pill ${roleClass[user.role]}`}>{roleLabel[user.role]}</span></td>
                    <td><span className={user.status === "active" ? "status-pill active" : "status-pill inactive"}>{statusLabel[user.status]}</span></td>
                    <td>{formatLastLogin(user.lastLoginAt)}</td>
                    <td>
                      <div className="user-actions">
                        <button type="button" aria-label={`Edit ${user.fullName}`} disabled><Edit3 size={15} /></button>
                        <button type="button" aria-label={`Delete ${user.fullName}`} onClick={() => void handleDeleteUser(user)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
             </tbody>
           </table>
         )}
        </div>

        <div className="users-pagination" style={{ flexShrink: 0 }}>
          <span>แสดง {filteredUsers.length} จาก {users.length} รายการ</span>
        </div>
      </section>

      {isDialogOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="user-modal" onSubmit={handleCreateUser}>
            <div className="modal-header">
              <div>
                <h2>เพิ่มผู้ใช้งานใหม่</h2>
                <p>ข้อมูลนี้จะถูกบันทึกลง PostgreSQL</p>
              </div>
              <button type="button" className="icon-button" aria-label="Close" onClick={() => handleToggleModal(false)}>
                <X size={18} />
              </button>
            </div>

            {error ? <div className="panel-error" style={{ marginBottom: "1rem" }}>{error}</div> : null}

            <div className="modal-grid">
              <label className="field">
                <span>ชื่อ-นามสกุล</span>
                <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
              </label>
              <label className="field">
                <span>ชื่อผู้ใช้</span>
                <input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
              </label>
              <label className="field full">
                <span>อีเมล</span>
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="field">
                <span>รหัสผ่าน</span>
                <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </label>
              <label className="field">
                <span>บทบาท</span>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
              <label className="field">
                <span>สถานะ</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}>
                  <option value="active">ใช้งานอยู่</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-action" type="button" onClick={() => handleToggleModal(false)}>ยกเลิก</button>
              <button className="primary-action" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกผู้ใช้งาน"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}