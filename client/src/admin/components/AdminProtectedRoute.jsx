import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const { adminUser, isAdmin, loadingAdmin } = useAdminAuth();
  const location = useLocation();

  if (loadingAdmin) {
    return (
      <div className="admin-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="admin-spinner admin-spinner-lg" style={{ marginBottom: "16px" }}></div>
          <p style={{ color: "var(--admin-text-muted)", fontSize: "14px" }}>Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (!adminUser || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
