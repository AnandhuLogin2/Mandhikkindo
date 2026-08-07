import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "notifications";

export const getNotifications = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return [];
  } catch (err) {
    console.warn("Notifications fetch fallback:", err);
    return [];
  }
};

export const subscribeNotifications = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn("Notifications subscription fallback:", err);
    callback([]);
  });
};

export const sendNotification = async (data) => {
  const res = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: res.id, ...data };
};

export const deleteNotification = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
