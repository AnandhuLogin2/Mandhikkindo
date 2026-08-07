import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminHeader({ title, toggleSidebar, toggleMobileSidebar }) {
  const { adminUser } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="admin-header">
      <button
        onClick={toggleMobileSidebar}
        className="admin-icon-btn d-md-none"
        style={{ display: "none" }} // Handled in responsive CSS or toggle
        title="Toggle Menu"
      >
        ☰
      </button>
      <button onClick={toggleSidebar} className="admin-icon-btn" title="Toggle Sidebar">
        ↔
      </button>

      <h1 className="admin-header-title">{title}</h1>

      <form onSubmit={handleSearchSubmit} className="admin-header-search">
        <span className="admin-header-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Global Search (Users, Shops, Communities...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="admin-header-actions">
        <button
          className="admin-icon-btn"
          title="Notifications"
          onClick={() => navigate("/admin/notifications")}
        >
          🔔
          <span className="admin-notif-badge">3</span>
        </button>

        <button
          className="admin-icon-btn"
          title="Profile"
          onClick={() => navigate("/admin/profile")}
        >
          {adminUser?.photoURL ? (
            <img
              src={adminUser.photoURL}
              alt="Avatar"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            "👤"
          )}
        </button>
      </div>
    </header>
  );
}
