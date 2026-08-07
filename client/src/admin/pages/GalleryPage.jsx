import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Food Showcase",
    imageUrl: "",
    isFeatured: false,
  });

  const { addToast } = useAdminToast();

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("gallery");
      setGalleryItems(data);
    } catch (err) {
      addToast("Error", "Failed to load gallery items.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ title: "", category: "Food Showcase", imageUrl: "", isFeatured: false });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      category: item.category || "Food Showcase",
      imageUrl: item.imageUrl || item.url || "",
      isFeatured: item.isFeatured || false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      addToast("Required", "Please upload an image.", "warning");
      return;
    }
    setActionLoading(true);
    try {
      if (selectedItem) {
        await updateDocument("gallery", selectedItem.id, formData);
        addToast("Updated", "Gallery item updated.", "success");
      } else {
        await createDocument("gallery", formData);
        addToast("Success", "New photo uploaded to gallery.", "success");
      }
      setModalOpen(false);
      loadGallery();
    } catch (err) {
      addToast("Error", err.message || "Failed to save photo.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      await deleteDocument("gallery", selectedItem.id);
      addToast("Deleted", "Image removed from gallery.", "success");
      setConfirmOpen(false);
      loadGallery();
    } catch (err) {
      addToast("Error", "Failed to delete image.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Gallery Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🖼️ Media Gallery</h2>
          <p className="admin-page-subtitle">Upload and manage featured imagery stored in Firebase Storage</p>
        </div>
        <button onClick={handleOpenAdd} className="admin-btn admin-btn-primary">
          <span>➕</span> Upload New Photo
        </button>
      </div>

      {loading ? (
        <div className="admin-text-center" style={{ padding: "40px" }}>
          <span className="admin-spinner admin-spinner-lg" />
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🖼️</div>
          <div className="admin-empty-title">Gallery is Empty</div>
          <p className="admin-empty-text">Click "Upload New Photo" to add images to Firebase Storage.</p>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="admin-gallery-item">
              <img src={item.imageUrl || item.url} alt={item.title || "Gallery"} />
              {item.isFeatured && (
                <div style={{ position: "absolute", top: "8px", left: "8px", zIndex: 2 }}>
                  <span className="admin-badge admin-badge-primary">Featured</span>
                </div>
              )}
              <div className="admin-gallery-overlay">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setConfirmOpen(true);
                  }}
                  className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem ? "Edit Gallery Item" : "Upload to Gallery"}
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Image Title</label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Category Tag</label>
            <select
              className="admin-form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Food Showcase">Food Showcase</option>
              <option value="Ambiance">Ambiance & Dining</option>
              <option value="Community Meets">Community Meets</option>
              <option value="Promotions">Promotions & Banners</option>
            </select>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Image Upload (Firebase Storage)</label>
            <ImageUploader
              folder="gallery"
              multiple={false}
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              Mark as Featured Homepage Image
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save Photo"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Image"
        message="Are you sure you want to delete this photo from the media gallery?"
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
