import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    role: "user",
    status: "active",
  });

  const { addToast } = useAdminToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("users");
      setUsers(data);
    } catch (err) {
      addToast("Error", "Failed to fetch users from Firestore.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      displayName: user.displayName || user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || user.phone || "",
      role: user.role || "user",
      status: user.status || "active",
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      displayName: "",
      email: "",
      phoneNumber: "",
      role: "user",
      status: "active",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedUser) {
        await updateDocument("users", selectedUser.id, formData);
        addToast("Success", "User details updated successfully.", "success");
      } else {
        await createDocument("users", formData);
        addToast("Success", "New user added.", "success");
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      addToast("Error", err.message || "Failed to save user.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "suspended" ? "active" : "suspended";
    try {
      await updateDocument("users", user.id, { status: newStatus });
      addToast("Updated", `User status changed to ${newStatus}.`, "success");
      loadUsers();
    } catch (err) {
      addToast("Error", "Failed to update user status.", "danger");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteDocument("users", selectedUser.id);
      addToast("Deleted", "User has been removed.", "success");
      setConfirmOpen(false);
      loadUsers();
    } catch (err) {
      addToast("Error", "Failed to delete user.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "User",
      key: "displayName",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="admin-sidebar-avatar" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
            {row.photoURL ? <img src={row.photoURL} alt="User" /> : (val || row.email || "U")[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "var(--admin-text)" }}>{val || row.name || "N/A"}</div>
            <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Phone", key: "phoneNumber", render: (val, row) => val || row.phone || "—" },
    {
      title: "Role",
      key: "role",
      render: (val) => (
        <span className={`admin-badge ${val === "admin" ? "admin-badge-primary" : "admin-badge-muted"}`}>
          {val || "user"}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (val) => (
        <span className={`admin-badge ${val === "suspended" ? "admin-badge-danger" : "admin-badge-success"}`}>
          {val || "active"}
        </span>
      ),
    },
    {
      title: "Joined Date",
      key: "createdAt",
      render: (val) => (val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : "Recent"),
    },
  ];

  return (
    <AdminLayout title="User Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">👥 User Management</h2>
          <p className="admin-page-subtitle">Manage accounts, roles, and access statuses across Mandhikkindo</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users by name, email, phone..."
        onAddClick={handleOpenAdd}
        addButtonText="Add User"
        actions={(row) => (
          <>
            <button
              onClick={() => handleToggleStatus(row)}
              className={`admin-btn admin-btn-sm ${row.status === "suspended" ? "admin-btn-success" : "admin-btn-secondary"}`}
              title={row.status === "suspended" ? "Activate User" : "Suspend User"}
            >
              {row.status === "suspended" ? "Activate" : "Suspend"}
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
              title="Edit User"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedUser(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete User"
            >
              🗑️
            </button>
          </>
        )}
      />

      {/* Edit/Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? "Edit User Account" : "Add New User"}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Display Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Email Address</label>
            <input
              type="email"
              required
              className="admin-form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Phone Number</label>
            <input
              type="text"
              className="admin-form-input"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Role</label>
              <select
                className="admin-form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Status</label>
              <select
                className="admin-form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${selectedUser?.displayName || selectedUser?.email}"?`}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
