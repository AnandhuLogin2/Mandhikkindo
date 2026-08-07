export default function StatCard({ title, value, icon, color = "#F97316", trend, trendType = "up" }) {
  return (
    <div className="admin-stat-card" style={{ "--stat-color": color }}>
      <div className="admin-stat-card-header">
        <div>
          <div className="admin-stat-card-label">{title}</div>
          <div className="admin-stat-card-value">{value !== undefined && value !== null ? value.toLocaleString() : "0"}</div>
        </div>
        <div className="admin-stat-card-icon" style={{ background: `${color}20`, color }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`admin-stat-card-trend ${trendType}`}>
          <span>{trendType === "up" ? "▲" : "▼"}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
