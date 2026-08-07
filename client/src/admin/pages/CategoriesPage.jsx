import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    icon: "🏷️",
    description: "",
  });

  const { addToast } = useAdminToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("categories");
      setCategories(data);
    } catch (err) {
      addToast("Error", "Failed to load categories.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenEdit = (c) => {
    setSelectedCategory(c);
    setFormData({
      name: c.name || "",
      icon: c.icon || "🏷️",
      description: c.description || "",
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setFormData({ name: "", icon: "🏷️", description: "" });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedCategory) {
        await updateDocument("categories", selectedCategory.id, formData);
        addToast("Updated", "Category updated.", "success");
      } else {
        await createDocument("categories", formData);
        addToast("Success", "New category added.", "success");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      addToast("Error", err.message || "Failed to save category.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await deleteDocument("categories", selectedCategory.id);
      addToast("Deleted", "Category deleted.", "success");
      setConfirmOpen(false);
      loadCategories();
    } catch (err) {
      addToast("Error", "Failed to delete category.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Icon",
      key: "icon",
      render: (val) => <span style={{ fontSize: "20px" }}>{val || "🏷️"}</span>,
    },
    {
      title: "Category Name",
      key: "name",
      render: (val) => <strong style={{ color: "var(--admin-text)" }}>{val}</strong>,
    },
    { title: "Description", key: "description", render: (val) => val || "—" },
  ];

  return (
    <AdminLayout title="Categories Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🏷️ Categories Management</h2>
          <p className="admin-page-subtitle">Define shop categories (Family, Premium, Budget, Arabian, Local)</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        searchPlaceholder="Search categories..."
        onAddClick={handleOpenAdd}
        addButtonText="Add Category"
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
              title="Edit Category"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedCategory(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete Category"
            >
              🗑️
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Category Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              placeholder="e.g. Premium, Family, Arabian, Budget, Local"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Emoji / Icon</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. 👨‍👩‍👧‍👦, 👑, 💰, 🕌, 🌴"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
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
              {actionLoading ? <span className="admin-spinner" /> : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${selectedCategory?.name}"?`}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
