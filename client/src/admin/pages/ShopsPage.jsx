import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandhiTypes, setMandhiTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    district: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    description: "",
    rating: 4.5,
    selectedTypes: [],
    images: [],
  });

  const { addToast } = useAdminToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [shopsData, districtsData, typesData] = await Promise.all([
        fetchCollection("mandhi_shops"),
        fetchCollection("districts"),
        fetchCollection("mandhi_types"),
      ]);
      setShops(shopsData);
      setDistricts(districtsData);
      setMandhiTypes(typesData);
    } catch (err) {
      addToast("Error", "Failed to fetch shop records.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (shop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name || shop.shopName || "",
      district: shop.district || "",
      address: shop.address || "",
      latitude: shop.latitude || shop.coordinates?.[0] || "",
      longitude: shop.longitude || shop.coordinates?.[1] || "",
      phone: shop.phone || "",
      description: shop.description || "",
      rating: shop.rating || 4.5,
      selectedTypes: shop.selectedTypes || shop.types || [],
      images: shop.images || (shop.image ? [shop.image] : []),
    });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedShop(null);
    setFormData({
      name: "",
      district: districts[0]?.name || "",
      address: "",
      latitude: "",
      longitude: "",
      phone: "",
      description: "",
      rating: 4.5,
      selectedTypes: [],
      images: [],
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        rating: parseFloat(formData.rating) || 4.5,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        coordinates: [parseFloat(formData.latitude) || 0, parseFloat(formData.longitude) || 0],
        image: formData.images[0] || "",
      };

      if (selectedShop) {
        await updateDocument("mandhi_shops", selectedShop.id, payload);
        addToast("Updated", "Mandhi shop details updated.", "success");
      } else {
        await createDocument("mandhi_shops", payload);
        addToast("Success", "New Mandhi shop added to registry.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      addToast("Error", err.message || "Failed to save shop.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedShop) return;
    setActionLoading(true);
    try {
      await deleteDocument("mandhi_shops", selectedShop.id);
      addToast("Deleted", "Mandhi shop removed.", "success");
      setConfirmOpen(false);
      loadData();
    } catch (err) {
      addToast("Error", "Failed to delete shop.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Shop",
      key: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "var(--admin-surface-2)", flexShrink: 0 }}>
            {row.images?.[0] || row.image ? (
              <img src={row.images?.[0] || row.image} alt={val} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "18px" }}>🍗</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "var(--admin-text)" }}>{val || row.shopName || "Unnamed Shop"}</div>
            <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>{row.address?.slice(0, 35)}...</div>
          </div>
        </div>
      ),
    },
    { title: "District", key: "district" },
    { title: "Phone", key: "phone", render: (val) => val || "—" },
    {
      title: "Rating",
      key: "rating",
      render: (val) => (
        <span className="admin-badge admin-badge-warning">
          ⭐ {val || 4.5}
        </span>
      ),
    },
    {
      title: "Images",
      key: "images",
      render: (val, row) => (val?.length || (row.image ? 1 : 0)) + " photo(s)",
    },
  ];

  return (
    <AdminLayout title="Mandhi Shop Directory">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🍗 Mandhi Shop Management</h2>
          <p className="admin-page-subtitle">Add, edit, upload photos, and set geo-coordinates for Mandhi spots</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={shops}
        loading={loading}
        searchPlaceholder="Search shop by name, district, address..."
        onAddClick={handleOpenAdd}
        addButtonText="Add Mandhi Shop"
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
              title="Edit Shop"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedShop(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete Shop"
            >
              🗑️
            </button>
          </>
        )}
      />

      {/* Shop Edit/Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedShop ? "Edit Mandhi Shop" : "Add New Mandhi Shop"}
        size="lg"
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Shop Name</label>
              <input
                type="text"
                required
                className="admin-form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">District</label>
              <select
                className="admin-form-select"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                {districts.length === 0 ? (
                  <option value="Ernakulam">Ernakulam</option>
                ) : (
                  districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Full Address</label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Latitude</label>
              <input
                type="number"
                step="any"
                className="admin-form-input"
                placeholder="e.g. 9.9312"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Longitude</label>
              <input
                type="number"
                step="any"
                className="admin-form-input"
                placeholder="e.g. 76.2673"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Contact Phone</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Rating (1 to 5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                className="admin-form-input"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description & Specialties</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Shop Images (Firebase Storage Upload)</label>
            <ImageUploader
              folder="mandhi_shops"
              multiple={true}
              value={formData.images}
              onChange={(urls) => setFormData({ ...formData, images: urls })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save Shop"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Mandhi Shop"
        message={`Are you sure you want to remove shop "${selectedShop?.name}"?`}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
