import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

const COMMUNITIES = "communities";
const MESSAGES = "community_messages";
const MEMBERS = "community_members";

const DEFAULT_COMMUNITIES = [
  { id: "c1", name: "Ernakulam Mandhi Hunters", district: "Ernakulam", membersCount: 14, status: "active", description: "Foodies hunting for the best pit Mandhi in Kochi." },
  { id: "c2", name: "Kozhikode Biryani & Mandhi Club", district: "Kozhikode", membersCount: 22, status: "active", description: "Malabar food connoisseurs sharing weekend spots." },
  { id: "c3", name: "Trivandrum Foodie Hub", district: "Thiruvananthapuram", membersCount: 9, status: "active", description: "Capital city Mandhi lovers group." }
];

export const getCommunities = async () => {
  try {
    const snap = await getDocs(collection(db, COMMUNITIES));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_COMMUNITIES;
  } catch (err) {
    console.warn("Communities fetch fallback:", err);
    return DEFAULT_COMMUNITIES;
  }
};

export const subscribeCommunities = (callback) => {
  return onSnapshot(collection(db, COMMUNITIES), (snap) => {
    if (!snap.empty) {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } else {
      callback(DEFAULT_COMMUNITIES);
    }
  }, (err) => {
    console.warn("Communities subscription fallback:", err);
    callback(DEFAULT_COMMUNITIES);
  });
};

export const createCommunityGroup = async (groupData) => {
  const colRef = collection(db, COMMUNITIES);
  const payload = {
    ...groupData,
    membersCount: 1,
    status: "active",
    createdAt: serverTimestamp(),
  };
  const res = await addDoc(colRef, payload);
  return { id: res.id, ...payload };
};

export const joinCommunityGroup = async (groupId, user) => {
  const memberRef = collection(db, MEMBERS);
  await addDoc(memberRef, {
    communityId: groupId,
    uid: user?.uid || "anon",
    displayName: user?.displayName || user?.email || "Foodie Member",
    joinedAt: serverTimestamp(),
  });

  // Increment member count in group doc
  try {
    const groupRef = doc(db, COMMUNITIES, groupId);
    const snap = await getDocs(query(collection(db, MEMBERS), where("communityId", "==", groupId)));
    await updateDoc(groupRef, { membersCount: snap.size || 1 });
  } catch (err) {
    console.warn("Count update failed:", err);
  }
  return true;
};

export const subscribeGroupMessages = (groupId, callback) => {
  if (!groupId) return () => {};
  const q = query(
    collection(db, MESSAGES),
    where("communityId", "==", groupId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  }, (err) => {
    console.warn("Messages subscription fallback:", err);
    callback([]);
  });
};

export const sendGroupMessage = async (groupId, text, user) => {
  const colRef = collection(db, MESSAGES);
  const payload = {
    communityId: groupId,
    senderUid: user?.uid || "anon",
    senderName: user?.displayName || user?.email || "Anonymous",
    text,
    createdAt: serverTimestamp(),
  };
  const res = await addDoc(colRef, payload);
  return { id: res.id, ...payload };
};

export const deleteCommunityGroup = async (groupId) => {
  await deleteDoc(doc(db, COMMUNITIES, groupId));
  return true;
};
