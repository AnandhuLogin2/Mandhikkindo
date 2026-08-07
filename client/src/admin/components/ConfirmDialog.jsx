import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="admin-text-center">
        <div className={`admin-confirm-icon ${type === "danger" ? "admin-confirm-danger" : "admin-confirm-warning"}`}>
          {type === "danger" ? "🗑️" : "⚠️"}
        </div>
        <h3 className="admin-confirm-title">{title}</h3>
        <p className="admin-confirm-text">{message}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "center" }}>
          <button onClick={onClose} disabled={loading} className="admin-btn admin-btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`admin-btn ${type === "danger" ? "admin-btn-danger" : "admin-btn-primary"}`}
          >
            {loading ? <span className="admin-spinner" /> : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
