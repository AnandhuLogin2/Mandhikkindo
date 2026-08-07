import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import { fetchDocument, createDocument, updateDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "Mandhikkindo",
    tagline: "Find the Best Mandhi Spots in Kerala",
    logoUrl: "",
    themeColor: "#F97316",
    contactEmail: "contact@mandhikkindo.com",
    contactPhone: "+91 98765 43210",
    facebookLink: "https://facebook.com/mandhikkindo",
    instagramLink: "https://instagram.com/mandhikkindo",
    youtubeLink: "https://youtube.com/mandhikkindo",
    footerText: "© 2026 Mandhikkindo. All Rights Reserved. Kerala's #1 Mandhi Guide.",
    bannerUrl: "",
    maintenanceMode: false,
  });

  const { addToast } = useAdminToast();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const doc = await fetchDocument("site_settings", "main");
        if (doc) {
          setFormData((prev) => ({ ...prev, ...doc }));
        }
      } catch (err) {
        console.warn("Using default settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDocument("site_settings", formData, "main");
      addToast("Saved!", "Global site settings updated in Firestore.", "success");
    } catch (err) {
      addToast("Error", "Failed to save settings.", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">⚙️ Site Configuration</h2>
          <p className="admin-page-subtitle">Manage public site branding, contact info, social links, and homepage hero banner</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-text-center" style={{ padding: "40px" }}><span className="admin-spinner admin-spinner-lg" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-card">
          <h3 className="admin-card-title">🏷️ Branding & Identity</h3>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Website Name</label>
              <input
                type="text"
                required
                className="admin-form-input"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Tagline</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Logo Upload (Firebase Storage)</label>
              <ImageUploader
                folder="branding"
                multiple={false}
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Homepage Hero Banner Upload</label>
              <ImageUploader
                folder="branding"
                multiple={false}
                value={formData.bannerUrl}
                onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
              />
            </div>
          </div>

          <hr className="admin-divider" />

          <h3 className="admin-card-title">📞 Contact & Social Profiles</h3>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Contact Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Contact Phone</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Instagram Link</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.instagramLink}
                onChange={(e) => setFormData({ ...formData, instagramLink: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Facebook Link</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.facebookLink}
                onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
              />
            </div>
          </div>

          <hr className="admin-divider" />

          <h3 className="admin-card-title">📝 Footer & Operational Status</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">Footer Copyright Notice</label>
            <input
              type="text"
              className="admin-form-input"
              value={formData.footerText}
              onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              />
              Enable Public Maintenance Mode Banner
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? <span className="admin-spinner" /> : "Save Configuration"}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
