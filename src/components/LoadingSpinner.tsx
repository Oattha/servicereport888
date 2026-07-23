export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <p>กำลังโหลด...</p>
    </div>
  );
}

export function SkeletonText({ width = "100%", height = "20px" }) {
  return (
    <div
      className="skeleton-loader"
      style={{ width, height }}
    />
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: "12px 16px" }}>
          <SkeletonText />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <table className="users-table">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}
