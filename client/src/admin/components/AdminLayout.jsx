import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-root">
      <div className="admin-layout">
        <AdminSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          closeMobile={() => setMobileOpen(false)}
        />
        <div className={`admin-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <AdminHeader
            title={title}
            toggleSidebar={() => setCollapsed(!collapsed)}
            toggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
