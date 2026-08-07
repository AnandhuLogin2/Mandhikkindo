import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const { addToast } = useAdminToast();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("reviews");
      setReviews(data);
    } catch (err) {
      addToast("Error", "Failed to load reviews.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (review, status) => {
    try {
      await updateDocument("reviews", review.id, { status });
      addToast("Updated", `Review marked as ${status}.`, "success");
      loadReviews();
    } catch (err) {
      addToast("Error", "Failed to update review status.", "danger");
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    try {
      await deleteDocument("reviews", selectedReview.id);
      addToast("Deleted", "Review permanently deleted.", "success");
      setConfirmOpen(false);
      loadReviews();
    } catch (err) {
      addToast("Error", "Failed to delete review.", "danger");
    }
  };

  const columns = [
    {
      title: "User",
      key: "userName",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--admin-text)" }}>{val || row.userEmail || "Customer"}</strong>
          <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>Shop: {row.shopName || "Mandhi Spot"}</div>
        </div>
      ),
    },
    {
      title: "Rating",
      key: "rating",
      render: (val) => <span className="admin-badge admin-badge-warning">⭐ {val || 5}</span>,
    },
    {
      title: "Comment",
      key: "comment",
      render: (val) => <span style={{ fontSize: "13px" }}>{val || "No text provided"}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (val) => {
        const s = val || "approved";
        const badgeClass = s === "approved" ? "admin-badge-success" : s === "hidden" ? "admin-badge-danger" : "admin-badge-warning";
        return <span className={`admin-badge ${badgeClass}`}>{s}</span>;
      },
    },
  ];

  return (
    <AdminLayout title="Reviews Moderation">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">⭐ Customer Reviews</h2>
          <p className="admin-page-subtitle">Approve, hide, restore, or delete customer ratings and feedback</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        searchPlaceholder="Search reviews by user or comment text..."
        actions={(row) => {
          const currentStatus = row.status || "approved";
          return (
            <>
              {currentStatus === "hidden" ? (
                <button
                  onClick={() => handleUpdateStatus(row, "approved")}
                  className="admin-btn admin-btn-success admin-btn-sm"
                  title="Approve / Restore"
                >
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus(row, "hidden")}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  title="Hide Review"
                >
                  Hide
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedReview(row);
                  setConfirmOpen(true);
                }}
                className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
                title="Delete Review"
              >
                🗑️
              </button>
            </>
          );
        }}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to permanently remove this customer review?"
      />
    </AdminLayout>
  );
}
