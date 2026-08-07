import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminSidebar({ collapsed, mobileOpen, closeMobile }) {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/admin/dashboard" },
    { label: "Users", icon: "👥", path: "/admin/users" },
    { label: "Mandhi Shops", icon: "🍗", path: "/admin/shops" },
    { label: "Districts", icon: "📍", path: "/admin/districts" },
    { label: "Categories", icon: "🏷️", path: "/admin/categories" },
    { label: "Mandhi Types", icon: "🍲", path: "/admin/mandhi-types" },
    { label: "Communities", icon: "💬", path: "/admin/communities" },
    { label: "Reviews", icon: "⭐", path: "/admin/reviews" },
    { label: "Gallery", icon: "🖼️", path: "/admin/gallery" },
    { label: "Quiz", icon: "🎯", path: "/admin/quiz" },
    { label: "Notifications", icon: "🔔", path: "/admin/notifications" },
    { label: "Analytics", icon: "📈", path: "/admin/analytics" },
    { label: "Site Settings", icon: "⚙️", path: "/admin/settings" },
    { label: "Profile", icon: "👤", path: "/admin/profile" },
  ];

  return (
    <>
      {mobileOpen && <div className="admin-mobile-overlay" onClick={closeMobile} />}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">🍚</div>
          {!collapsed && (
            <div className="admin-sidebar-logo-text">
              <h2>Mandhikkindo</h2>
              <span>Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-label">Main Menu</div>}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="admin-nav-item-icon">{item.icon}</span>
                {!collapsed && <span className="admin-nav-item-text">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {adminUser?.photoURL ? (
                <img src={adminUser.photoURL} alt="Admin" />
              ) : (
                adminUser?.email?.[0]?.toUpperCase() || "A"
              )}
            </div>
            {!collapsed && (
              <div className="admin-sidebar-user-info">
                <div className="admin-sidebar-user-name">{adminUser?.displayName || adminUser?.email || "Admin User"}</div>
                <div className="admin-sidebar-user-role">Administrator</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ color: "var(--admin-danger)", marginTop: "4px" }}
            title={collapsed ? "Logout" : undefined}
          >
            <span className="admin-nav-item-icon">🚪</span>
            {!collapsed && <span className="admin-nav-item-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
