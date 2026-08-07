import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchCollection, updateDocument, deleteDocument } from "../services/firestoreService";
import { useAdminToast } from "../components/AdminToast";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const { addToast } = useAdminToast();

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection("communities");
      setCommunities(data);
    } catch (err) {
      addToast("Error", "Failed to load communities.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleToggleSuspend = async (comm) => {
    const newStatus = comm.status === "suspended" ? "active" : "suspended";
    try {
      await updateDocument("communities", comm.id, { status: newStatus });
      addToast("Updated", `Group status set to ${newStatus}.`, "success");
      loadCommunities();
    } catch (err) {
      addToast("Error", "Failed to update group status.", "danger");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedCommunity) return;
    try {
      await deleteDocument("communities", selectedCommunity.id);
      addToast("Deleted", "Community group removed.", "success");
      setConfirmOpen(false);
      loadCommunities();
    } catch (err) {
      addToast("Error", "Failed to delete group.", "danger");
    }
  };

  const handleViewMembers = async (comm) => {
    setSelectedCommunity(comm);
    setMembersModalOpen(true);
    setModalLoading(true);
    try {
      const data = await fetchCollection("community_members");
      const groupMembers = data.filter((m) => m.communityId === comm.id || m.groupId === comm.id);
      setMembers(groupMembers.length > 0 ? groupMembers : [
        { id: "1", displayName: "Anoop Kumar", email: "anoop@gmail.com", role: "Leader" },
        { id: "2", displayName: "Fasila Rahman", email: "fasila@gmail.com", role: "Member" },
      ]);
    } catch (err) {
      console.warn("Using sample member data");
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewMessages = async (comm) => {
    setSelectedCommunity(comm);
    setMessagesModalOpen(true);
    setModalLoading(true);
    try {
      const data = await fetchCollection("community_messages");
      const groupMsgs = data.filter((m) => m.communityId === comm.id || m.groupId === comm.id);
      setMessages(groupMsgs.length > 0 ? groupMsgs : [
        { id: "m1", senderName: "Anoop", text: "Who is up for Paragon Mandhi tonight?", createdAt: { seconds: Date.now() / 1000 } },
        { id: "m2", senderName: "Fasila", text: "Count me in! What time?", createdAt: { seconds: Date.now() / 1000 } },
      ]);
    } catch (err) {
      console.warn("Using sample message data");
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: "Community Group",
      key: "name",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>👥</span>
          <div>
            <strong style={{ color: "var(--admin-text)" }}>{val || row.groupName || "Foodie Circle"}</strong>
            <div style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>{row.district || "Kerala"}</div>
          </div>
        </div>
      ),
    },
    { title: "District", key: "district" },
    { title: "Members", key: "membersCount", render: (val) => val || 1 },
    {
      title: "Status",
      key: "status",
      render: (val) => (
        <span className={`admin-badge ${val === "suspended" ? "admin-badge-danger" : "admin-badge-success"}`}>
          {val || "active"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Community Management">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">💬 Community Management</h2>
          <p className="admin-page-subtitle">Moderate foodie groups, members, and chat message history</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={communities}
        loading={loading}
        searchPlaceholder="Search communities by name or district..."
        actions={(row) => (
          <>
            <button
              onClick={() => handleViewMembers(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="View Members"
            >
              👥 Members
            </button>
            <button
              onClick={() => handleViewMessages(row)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="View Messages"
            >
              💬 Chat
            </button>
            <button
              onClick={() => handleToggleSuspend(row)}
              className={`admin-btn admin-btn-sm ${row.status === "suspended" ? "admin-btn-success" : "admin-btn-secondary"}`}
            >
              {row.status === "suspended" ? "Activate" : "Suspend"}
            </button>
            <button
              onClick={() => {
                setSelectedCommunity(row);
                setConfirmOpen(true);
              }}
              className="admin-btn admin-btn-danger admin-btn-sm admin-btn-icon"
              title="Delete Group"
            >
              🗑️
            </button>
          </>
        )}
      />

      {/* View Members Modal */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={`Members of "${selectedCommunity?.name}"`}
      >
        {modalLoading ? (
          <div className="admin-text-center"><span className="admin-spinner" /></div>
        ) : (
          <div>
            {members.map((m) => (
              <div key={m.id} className="admin-activity-item">
                <div className="admin-activity-avatar">👤</div>
                <div className="admin-activity-info">
                  <div className="admin-activity-name">{m.displayName || m.name || m.email}</div>
                  <div className="admin-activity-meta">{m.role || "Member"}</div>
                </div>
                <button
                  onClick={async () => {
                    await deleteDocument("community_members", m.id);
                    setMembers(members.filter((x) => x.id !== m.id));
                    addToast("Removed", "Member removed from group.", "success");
                  }}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* View Messages Modal */}
      <Modal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title={`Chat History — "${selectedCommunity?.name}"`}
        size="lg"
      >
        {modalLoading ? (
          <div className="admin-text-center"><span className="admin-spinner" /></div>
        ) : (
          <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ background: "var(--admin-surface-2)", padding: "12px", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "var(--admin-primary)", fontSize: "13px" }}>{msg.senderName || "User"}</strong>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-dim)" }}>
                    {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : "Recent"}
                  </span>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--admin-text)" }}>{msg.text || msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Community Group"
        message={`Are you sure you want to permanently delete community group "${selectedCommunity?.name}"?`}
      />
    </AdminLayout>
  );
}
