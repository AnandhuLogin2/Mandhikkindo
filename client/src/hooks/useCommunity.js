import { useCallback, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function useCommunity(shops = []) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState({}); // groupId -> array of messages

  const socketRef = useRef(null);

  // Fetch groups list from backend REST API
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/groups");
      if (res?.data) {
        setGroups(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch groups from server (falling back):", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Socket.io initialization when user is authenticated
  useEffect(() => {
    if (!user) return;

    let socket;
    user.getIdToken().then((token) => {
      socket = io(API_BASE_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("⚡ Socket.io connected for user:", user.uid);
      });

      socket.on("group:message", (message) => {
        if (message && message.groupId) {
          setMessages((prev) => ({
            ...prev,
            [message.groupId]: [...(prev[message.groupId] || []), message],
          }));
        }
      });

      socket.on("disconnect", () => {
        console.log("⚡ Socket.io disconnected");
      });
    }).catch(console.error);

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Create a new group via backend REST API
  const createGroup = useCallback(
    async (groupData) => {
      if (!user) {
        throw new Error("Must be logged in to create a group");
      }
      try {
        const res = await api.post("/api/groups", groupData, user);
        const newGroup = res.data;
        setGroups((prev) => [newGroup, ...prev]);
        return newGroup;
      } catch (err) {
        console.error("Create group failed:", err);
        throw err;
      }
    },
    [user]
  );

  // Join group via backend REST API
  const joinGroup = useCallback(
    async (groupId) => {
      if (!user) {
        throw new Error("Must be logged in to join a group");
      }
      try {
        const res = await api.post(`/api/groups/${groupId}/join`, {}, user);
        const updatedGroup = res.data;
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? updatedGroup : g))
        );
        return updatedGroup;
      } catch (err) {
        console.error("Join group failed:", err);
        throw err;
      }
    },
    [user]
  );

  // Leave group via backend REST API
  const leaveGroup = useCallback(
    async (groupId) => {
      if (!user) {
        throw new Error("Must be logged in to leave a group");
      }
      try {
        const res = await api.post(`/api/groups/${groupId}/leave`, {}, user);
        const updatedGroup = res.data;
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? updatedGroup : g))
        );
        return updatedGroup;
      } catch (err) {
        console.error("Leave group failed:", err);
        throw err;
      }
    },
    [user]
  );

  // Send message via Socket.io or REST
  const addMessage = useCallback(
    async (groupId, text) => {
      if (!user) return;

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("group:message", { groupId, text });
      } else {
        // Fallback local state if socket not ready
        const localMsg = {
          id: `msg-${Date.now()}`,
          groupId,
          text,
          authorUid: user.uid,
          authorName: user.displayName || "You",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => ({
          ...prev,
          [groupId]: [...(prev[groupId] || []), localMsg],
        }));
      }
    },
    [user]
  );

  return {
    groups,
    loading,
    error,
    messages,
    fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    addMessage,
  };
}
