import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function MandhiTypesPage() {
  const [mandhiTypes, setMandhiTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    spiciness: "Medium",
    priceEstimate: "₹240 - ₹450",
    description: "",
  });

  const { addToast } = useAdminToast();

  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("mandhi_types");
      setMandhiTypes(data);
    } catch (err) {
      addToast("Error", "Failed to load Mandhi types.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleOpenEdit = (t) => {
    setSelectedType(t);
    setFormData({
      name: t.name || "",
      spiciness: t.spiciness || "Medium",
      priceEstimate: t.priceEstimate || "₹240 - ₹450",
      description: t.description || "",
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedType(null);
    setFormData({ name: "", spiciness: "Medium", priceEstimate: "₹240 - ₹450", description: "" });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedType) {
        await updateDocument("mandhi_types", selectedType.id, formData);
        addToast("Updated", "Mandhi type updated.", "success");
      } else {
        await createDocument("mandhi_types", formData);
        addToast("Success", "New Mandhi type created.", "success");
      }
      setModalOpen(false);
      loadTypes();
    } catch (err) {
      addToast("Error", err.message || "Failed to save Mandhi type.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    setActionLoading(true);
    try {
      await deleteDocument("mandhi_types", selectedType.id);
      addToast("Deleted", "Mandhi type removed.", "success");
      setConfirmOpen(false);
      loadTypes();
    } catch (err) {
      addToast("Error", "Failed to delete item.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Mandhi Dish",
      key: "name",
      render: (val) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🍲</span>
          <strong style={{ color: "var(--admin-text)" }}>{val}</strong>
        </div>
      ),
    },
    { title: "Spice Level", key: "spiciness" },
    { title: "Price Range", key: "priceEstimate" },
    { title: "Description", key: "description", render: (val) => val || "—" },
  ];

  return (
    <AdminLayout title="Mandhi Types Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🍲 Mandhi Types</h2>
          <p className="admin-page-subtitle">Manage dish variations (Chicken, Beef, Mutton, Alfaham, Kuzhi Mandhi)</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mandhiTypes}
        loading={loading}
        searchPlaceholder="Search Mandhi dishes..."
        onAddClick={handleOpenAdd}
        addButtonText="Add Mandhi Type"
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
              title="Edit Type"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedType(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete Type"
            >
              🗑️
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedType ? "Edit Mandhi Type" : "Add Mandhi Type"}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Dish Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              placeholder="e.g. Chicken Mandhi, Mutton Mandhi, Alfaham Mandhi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Spiciness Level</label>
              <select
                className="admin-form-select"
                value={formData.spiciness}
                onChange={(e) => setFormData({ ...formData, spiciness: e.target.value })}
              >
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
                <option value="Extra Spicy">Extra Spicy</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Estimated Price Range</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.priceEstimate}
                onChange={(e) => setFormData({ ...formData, priceEstimate: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save Dish Type"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Mandhi Type"
        message={`Are you sure you want to delete dish type "${selectedType?.name}"?`}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
