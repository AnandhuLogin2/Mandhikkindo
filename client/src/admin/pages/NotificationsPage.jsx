import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { fetchCollection, createDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "Broadcast", // Broadcast, Community, Maintenance
    targetGroup: "All Users",
  });

  const { addToast } = useAdminToast();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("notifications");
      setNotifications(data);
    } catch (err) {
      addToast("Error", "Failed to load notification history.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createDocument("notifications", {
        ...formData,
        sentAt: new Date().toISOString(),
      });
      addToast("Sent!", `Notification broadcasted to ${formData.targetGroup}.`, "success");
      setModalOpen(false);
      loadNotifications();
    } catch (err) {
      addToast("Error", err.message || "Failed to dispatch notification.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument("notifications", id);
      addToast("Deleted", "Notification log deleted.", "success");
      loadNotifications();
    } catch (err) {
      addToast("Error", "Failed to delete log.", "danger");
    }
  };

  const columns = [
    {
      title: "Title & Message",
      key: "title",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--admin-text)" }}>{val}</strong>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{row.message}</div>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      render: (val) => {
        const badgeClass = val === "Maintenance" ? "admin-badge-danger" : val === "Community" ? "admin-badge-info" : "admin-badge-primary";
        return <span className={`admin-badge ${badgeClass}`}>{val || "Broadcast"}</span>;
      },
    },
    { title: "Audience Target", key: "targetGroup", render: (val) => val || "All Users" },
    {
      title: "Dispatched",
      key: "createdAt",
      render: (val, row) => (val?.seconds ? new Date(val.seconds * 1000).toLocaleString() : row.sentAt || "Recent"),
    },
  ];

  return (
    <AdminLayout title="Notifications Dispatcher">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🔔 Notification Dispatcher</h2>
          <p className="admin-page-subtitle">Send system broadcasts, community alerts, or maintenance announcements</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="admin-btn admin-btn-primary">
          <span>📢</span> Compose Notification
        </button>
      </div>

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        searchPlaceholder="Search notification history..."
        actions={(row) => (
          <button
            onClick={() => handleDelete(row.id)}
            className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
            title="Delete Log"
          >
            🗑️
          </button>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Compose & Dispatch Notification"
        size="lg"
      >
        <form onSubmit={handleSend}>
          <div className="admin-form-group">
            <label className="admin-form-label">Notification Title</label>
            <input
              type="text"
              required
              className="admin-form-input"
              placeholder="e.g. New Mandhi Spot Added in Calicut!"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Notification Type</label>
              <select
                className="admin-form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Broadcast">Global Broadcast</option>
                <option value="Community">Community Alert</option>
                <option value="Maintenance">Maintenance Window</option>
                <option value="Promotion">Promotional Offer</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Target Audience</label>
              <select
                className="admin-form-select"
                value={formData.targetGroup}
                onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
              >
                <option value="All Users">All Registered Users</option>
                <option value="Community Leaders">Community Leaders Only</option>
                <option value="Ernakulam District">Ernakulam District</option>
                <option value="Kozhikode District">Kozhikode District</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Notification Message Body</label>
            <textarea
              required
              className="admin-form-textarea"
              rows={4}
              placeholder="Enter message details to send to user devices..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Dispatch Notification"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
