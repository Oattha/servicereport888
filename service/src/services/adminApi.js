import { BACKEND_URL } from "../utils/config";

async function adminRequest(path, token, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      result.detail || result.message || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ",
    );
    error.status = response.status;
    throw error;
  }
  return result;
}

export function getAdminUsers(token) {
  return adminRequest("/api/admin/users", token);
}

export function createAdminUser(token, user) {
  return adminRequest("/api/admin/users", token, {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateAdminUser(token, userId, user) {
  return adminRequest(`/api/admin/users/${userId}`, token, {
    method: "PATCH",
    body: JSON.stringify(user),
  });
}

export function deleteAdminUser(token, userId) {
  return adminRequest(`/api/admin/users/${userId}`, token, {
    method: "DELETE",
  });
}
