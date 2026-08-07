import type { ReportStatus } from "../types";

type StatusBadgeProps = {
  status: ReportStatus | string; // รองรับสตริงทั่วไปเพื่อความยืดหยุ่นสูงสุดในการเรนเดอร์
};

export function StatusBadge({ status }: StatusBadgeProps) {
  // แปลงสถานะให้รองรับทั้งช่องว่างและขีดล่าง ป้องกันคลาส CSS หลุดธีม
  const normalizedStatus = String(status || "Draft")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  return <span className={`status-badge status-${normalizedStatus}`}>{status}</span>;
}