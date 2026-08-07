import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeCommunities,
  createCommunityGroup,
  joinCommunityGroup,
  subscribeGroupMessages,
  sendGroupMessage
} from "../services/communityService";

export function useCommunity() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Subscribe to communities in Firestore
  useEffect(() => {
    const unsub = subscribeCommunities((items) => {
      setGroups(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time chat messages when active group changes
  useEffect(() => {
    if (!activeGroupId) {
      setMessages([]);
      return;
    }
    const unsub = subscribeGroupMessages(activeGroupId, (msgList) => {
      setMessages(msgList);
    });
    return () => unsub();
  }, [activeGroupId]);

  const selectGroup = useCallback((groupId) => {
    setActiveGroupId(groupId);
  }, []);

  const createGroup = useCallback(async (groupData) => {
    const newGroup = await createCommunityGroup(groupData);
    if (user) {
      await joinCommunityGroup(newGroup.id, user);
    }
    setActiveGroupId(newGroup.id);
    return newGroup;
  }, [user]);

  const joinGroup = useCallback(async (groupId) => {
    await joinCommunityGroup(groupId, user);
    setActiveGroupId(groupId);
  }, [user]);

  const sendMessage = useCallback(async (text) => {
    if (!activeGroupId || !text.trim()) return;
    await sendGroupMessage(activeGroupId, text.trim(), user);
  }, [activeGroupId, user]);

  return {
    groups,
    loading,
    activeGroupId,
    selectGroup,
    messages,
    sendMessage,
    createGroup,
    joinGroup,
  };
}
