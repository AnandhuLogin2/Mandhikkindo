import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "success": return "✅";
      case "danger": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "success": return "var(--admin-success)";
      case "danger": return "var(--admin-danger)";
      case "warning": return "var(--admin-warning)";
      default: return "var(--admin-primary)";
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="admin-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="admin-toast"
            style={{ "--toast-color": getColor(toast.type) }}
          >
            <div className="admin-toast-icon">{getIcon(toast.type)}</div>
            <div className="admin-toast-body">
              <div className="admin-toast-title">{toast.title}</div>
              {toast.message && <div className="admin-toast-msg">{toast.message}</div>}
            </div>
            <button className="admin-toast-close" onClick={() => removeToast(toast.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return context;
}
