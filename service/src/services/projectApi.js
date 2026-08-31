import { BACKEND_URL } from "../utils/config";

export async function searchProjects(token, query = "") {
  const params = new URLSearchParams({
    q: query.trim(),
    limit: "10",
  });
  const response = await fetch(`${BACKEND_URL}/api/projects?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      result.detail || result.message || "โหลดข้อมูลโครงการไม่สำเร็จ",
    );
    error.status = response.status;
    throw error;
  }
  return result.projects || [];
}
