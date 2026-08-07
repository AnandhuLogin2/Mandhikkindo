import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, createDocument, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedQ, setSelectedQ] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "General",
    active: true,
  });

  const { addToast } = useAdminToast();

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("quiz_questions");
      setQuestions(data);
    } catch (err) {
      addToast("Error", "Failed to load quiz questions.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenAdd = () => {
    setSelectedQ(null);
    setFormData({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      category: "General",
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setSelectedQ(q);
    setFormData({
      questionText: q.questionText || q.question || "",
      options: q.options || ["", "", "", ""],
      correctAnswer: q.correctAnswer ?? 0,
      category: q.category || "General",
      active: q.active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (selectedQ) {
        await updateDocument("quiz_questions", selectedQ.id, formData);
        addToast("Updated", "Quiz question updated.", "success");
      } else {
        await createDocument("quiz_questions", formData);
        addToast("Success", "New quiz question added.", "success");
      }
      setModalOpen(false);
      loadQuestions();
    } catch (err) {
      addToast("Error", err.message || "Failed to save question.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (q) => {
    try {
      await updateDocument("quiz_questions", q.id, { active: !q.active });
      addToast("Updated", `Question ${!q.active ? "enabled" : "disabled"}.`, "success");
      loadQuestions();
    } catch (err) {
      addToast("Error", "Failed to toggle question state.", "danger");
    }
  };

  const handleDelete = async () => {
    if (!selectedQ) return;
    setActionLoading(true);
    try {
      await deleteDocument("quiz_questions", selectedQ.id);
      addToast("Deleted", "Question removed from pool.", "success");
      setConfirmOpen(false);
      loadQuestions();
    } catch (err) {
      addToast("Error", "Failed to delete question.", "danger");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Question",
      key: "questionText",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--admin-text)" }}>{val || row.question}</strong>
          <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>
            Options: {row.options?.join(" | ")}
          </div>
        </div>
      ),
    },
    { title: "Category", key: "category" },
    {
      title: "Status",
      key: "active",
      render: (val) => (
        <span className={`admin-badge ${val !== false ? "admin-badge-success" : "admin-badge-muted"}`}>
          {val !== false ? "Active" : "Disabled"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Quiz Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">🎯 Mandhi Quiz Engine</h2>
          <p className="admin-page-subtitle">Manage interactive Mandhi quiz questions and scoring rules</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={questions}
        loading={loading}
        searchPlaceholder="Search questions..."
        onAddClick={handleOpenAdd}
        addButtonText="Add Question"
        actions={(row) => (
          <>
            <button
              onClick={() => handleToggleActive(row)}
              className={`admin-btn admin-btn-sm ${row.active !== false ? "admin-btn-secondary" : "admin-btn-success"}`}
            >
              {row.active !== false ? "Disable" : "Enable"}
            </button>
            <button
              onClick={() => handleOpenEdit(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm admin-btn-icon"
            >
              ✏️
            </button>
            <button
              onClick={() => {
                setSelectedQ(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
            >
              🗑️
            </button>
          </>
        )}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedQ ? "Edit Quiz Question" : "Add Quiz Question"}
        size="lg"
      >
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Question Text</label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Category</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="General / Malabar / Spices"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="admin-form-label">Options (4 choices)</label>
            {formData.options.map((opt, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === idx}
                  onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                />
                <input
                  type="text"
                  required
                  className="admin-form-input"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...formData.options];
                    newOpts[idx] = e.target.value;
                    setFormData({ ...formData, options: newOpts });
                  }}
                />
              </div>
            ))}
            <span style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>
              Select radio button next to the correct answer choice
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={() => setModalOpen(false)} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="admin-btn admin-btn-primary">
              {actionLoading ? <span className="admin-spinner" /> : "Save Question"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question from the quiz pool?"
        loading={actionLoading}
      />
    </AdminLayout>
  );
}
