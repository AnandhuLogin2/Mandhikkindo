import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import { useAdminAuth } from "../context/AdminAuthContext";
import { updateProfile, updatePassword } from "firebase/auth";
import { useAdminToast } from "../components/AdminToast";

export default function ProfilePage() {
  const { adminUser } = useAdminAuth();
  const [displayName, setDisplayName] = useState(adminUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(adminUser?.photoURL || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { addToast } = useAdminToast();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!adminUser) return;
    setLoading(true);
    try {
      await updateProfile(adminUser, { displayName, photoURL });
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          addToast("Error", "Passwords do not match.", "warning");
          setLoading(false);
          return;
        }
        await updatePassword(adminUser, newPassword);
        setNewPassword("");
        setConfirmPassword("");
      }
      addToast("Success", "Admin profile updated successfully.", "success");
    } catch (err) {
      addToast("Error", err.message || "Failed to update profile.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Profile">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">👤 Administrator Profile</h2>
          <p className="admin-page-subtitle">Update your personal account credentials and display avatar</p>
        </div>
      </div>

      <div className="admin-card" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleUpdateProfile}>
          <div className="admin-form-group" style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              className="admin-sidebar-avatar"
              style={{ width: "80px", height: "80px", margin: "0 auto 12px", fontSize: "32px" }}
            >
              {photoURL ? <img src={photoURL} alt="Avatar" /> : displayName?.[0] || adminUser?.email?.[0] || "A"}
            </div>
            <div style={{ fontWeight: "700", fontSize: "16px", color: "var(--admin-text)" }}>
              {adminUser?.email}
            </div>
            <div style={{ fontSize: "12px", color: "var(--admin-primary)", marginTop: "2px" }}>
              Super Administrator
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Display Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Profile Avatar Image (Firebase Storage)</label>
            <ImageUploader
              folder="admin_avatars"
              multiple={false}
              value={photoURL}
              onChange={(url) => setPhotoURL(url)}
            />
          </div>

          <hr className="admin-divider" />

          <h3 className="admin-card-title">🔒 Change Password</h3>

          <div className="admin-form-group">
            <label className="admin-form-label">New Password (leave blank to keep current)</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {newPassword && (
            <div className="admin-form-group">
              <label className="admin-form-label">Confirm New Password</label>
              <input
                type="password"
                required
                className="admin-form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button type="submit" disabled={loading} className="admin-btn admin-btn-primary">
              {loading ? <span className="admin-spinner" /> : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
