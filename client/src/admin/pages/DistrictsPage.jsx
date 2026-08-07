import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    famousSpots: "",
  });

  const { addToast } = useAdminToast();

  const loadDistricts = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("districts");
      setDistricts(data);
    } catch (err) {
      addToast("Error", "Failed to load districts.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  const handleOpenEdit = (d) => {
    setSelectedDistrict(d);
    setFormData({
      name: d.name || "",
      code: d.code || "",
      famousSpots: d.famousSpots || "",
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedDistrict(null);
    setFormData({ name: "", code: "", famousSpots: "" });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedDistrict) {
        await updateDocument("districts", selectedDistrict.id, formData);
        addToast("Updated", "District updated successfully.", "success");
      } else {
        await createDocument("districts", formData);
        addToast("Success", "New district added.", "success");
      }
      setModalOpen(false);
      loadDistricts();
    } catch (err) {
      addToast("Error", err.message || "Failed to save district.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDistrict) return;
    setActionLoading(true);
    try {
      await deleteDocument("districts", selectedDistrict.id);
      addToast("Deleted", "District removed.", "success");
      setConfirmOpen(false);
      loadDistricts();
    } catch (err) {
      addToast("Error", "Failed to delete district.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "District Name",
      key: "name",
      render: (val) => <strong style={{ color: "var(--admin-text)" }}>{val}</strong>,
    },
    { title: "Code / Tag", key: "code", render: (val) => val || "—" },
    { title: "Famous Mandhi Hubs", key: "famousSpots", render: (val) => val || "General region" },
  ];

  return (
    <AdminLayout title="District Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">📍 District Management</h2>
          <p className="admin-page-subtitle">Configure available districts for Mandhi shop indexing and filtering</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={districts}
        loading={loading}
        searchPlaceholder="Search districts..."
        onAddClick={handleOpenAdd}
        addButtonText="Add District"
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
              title="Edit District"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedDistrict(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete District"
            >
              🗑️
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDistrict ? "Edit District" : "Add District"}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">District Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              placeholder="e.g. Ernakulam, Kozhikode, Malappuram"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Short Code / Abbreviation</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. EKM, KKD"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Famous Mandhi Hubs</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Edappally, Paragon, Beach Road"
              value={formData.famousSpots}
              onChange={(e) => setFormData({ ...formData, famousSpots: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save District"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete District"
        message={`Are you sure you want to delete district "${selectedDistrict?.name}"?`}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
