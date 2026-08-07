import { useState, useRef } from "react";
import { uploadImage } from "../services/storageService";

export default function ImageUploader({ folder = "uploads", value = [], onChange, multiple = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadImage(folder, file));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);

      if (multiple) {
        onChange([...(Array.isArray(value) ? value : []), ...validUrls]);
      } else {
        onChange(validUrls[0] || "");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (urlToRemove) => {
    if (multiple) {
      onChange(value.filter((url) => url !== urlToRemove));
    } else {
      onChange("");
    }
  };

  const images = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className={`admin-upload-zone ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div>
            <div className="admin-spinner" style={{ marginBottom: "8px" }} />
            <div className="admin-upload-zone-text">Uploading to Firebase Storage...</div>
          </div>
        ) : (
          <div>
            <div className="admin-upload-zone-icon">☁️</div>
            <div className="admin-upload-zone-text">
              Drag & Drop images or <strong>Browse</strong>
            </div>
            <span style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>
              PNG, JPG, WEBP up to 5MB
            </span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="admin-upload-preview">
          {images.map((url, idx) => (
            <div key={idx} className="admin-upload-preview-item">
              <img src={url} alt={`Upload ${idx}`} />
              <button
                type="button"
                className="admin-upload-preview-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(url);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
