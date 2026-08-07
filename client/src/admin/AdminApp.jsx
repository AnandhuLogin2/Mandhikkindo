import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminToastProvider } from "./components/AdminToast";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import "./styles/admin.css";

// Lazy-loaded Admin Pages
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const ShopsPage = lazy(() => import("./pages/ShopsPage"));
const DistrictsPage = lazy(() => import("./pages/DistrictsPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const MandhiTypesPage = lazy(() => import("./pages/MandhiTypesPage"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function PageLoader() {
  return (
    <div className="admin-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div className="admin-spinner admin-spinner-lg" style={{ marginBottom: "16px" }} />
        <p style={{ color: "var(--admin-text-muted)", fontSize: "14px" }}>Loading Module...</p>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Admin Route */}
            <Route path="login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="dashboard"
              element={
                <AdminProtectedRoute>
                  <DashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <AdminProtectedRoute>
                  <UsersPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="shops"
              element={
                <AdminProtectedRoute>
                  <ShopsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="districts"
              element={
                <AdminProtectedRoute>
                  <DistrictsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="categories"
              element={
                <AdminProtectedRoute>
                  <CategoriesPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="mandhi-types"
              element={
                <AdminProtectedRoute>
                  <MandhiTypesPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="communities"
              element={
                <AdminProtectedRoute>
                  <CommunitiesPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="reviews"
              element={
                <AdminProtectedRoute>
                  <ReviewsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="gallery"
              element={
                <AdminProtectedRoute>
                  <GalleryPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="quiz"
              element={
                <AdminProtectedRoute>
                  <QuizPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <AdminProtectedRoute>
                  <NotificationsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <AdminProtectedRoute>
                  <AnalyticsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <AdminProtectedRoute>
                  <SettingsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <AdminProtectedRoute>
                  <ProfilePage />
                </AdminProtectedRoute>
              }
            />

            {/* Default Admin fallback to dashboard */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </AdminToastProvider>
    </AdminAuthProvider>
  );
}
