import type { ReportStatus } from "../types";

type StatusBadgeProps = {
  status: ReportStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
}
