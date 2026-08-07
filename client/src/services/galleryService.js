import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "gallery";

const DEFAULT_GALLERY = [
  { id: "g1", title: "Arabian Chicken Kuzhi Mandhi Platter", category: "Food Showcase", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", isFeatured: true },
  { id: "g2", title: "Grilled Alfaham over Spiced Basmati", category: "Food Showcase", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80", isFeatured: true },
  { id: "g3", title: "Slow-Cooked Royal Beef Mandhi", category: "Food Showcase", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", isFeatured: true },
  { id: "g4", title: "Mutton Mandhi Family Feast", category: "Food Showcase", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80", isFeatured: true }
];

export const getGalleryImages = async () => {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_GALLERY;
  } catch (err) {
    console.warn("Gallery fetch fallback:", err);
    return DEFAULT_GALLERY;
  }
};

export const subscribeGalleryImages = (callback) => {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    if (!snap.empty) {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } else {
      callback(DEFAULT_GALLERY);
    }
  }, (err) => {
    console.warn("Gallery subscription fallback:", err);
    callback(DEFAULT_GALLERY);
  });
};

export const addGalleryImage = async (data) => {
  const res = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: res.id, ...data };
};

export const updateGalleryImage = async (id, data) => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
};

export const deleteGalleryImage = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
