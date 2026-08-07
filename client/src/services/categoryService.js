import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "categories";

const DEFAULT_CATEGORIES = [
  { icon: "🍗", name: "Chicken Kuzhi Mandhi", description: "Classic slow-pit grilled chicken Mandhi" },
  { icon: "🔥", name: "Alfaham Mandhi", description: "Charcoal grilled juicy Alfaham over spiced rice" },
  { icon: "🥩", name: "Beef Mandhi", description: "Tender beef chunks slow cooked to perfection" },
  { icon: "🍖", name: "Mutton Mandhi", description: "Melt in mouth royal mutton Arabian rice" },
  { icon: "🐟", name: "Fish Mandhi", description: "Fresh Malabar catch grilled Mandhi style" },
  { icon: "⭐", name: "Top Rated", description: "Highest rated customer favorites across Kerala" },
  { icon: "👪", name: "Family Favourites", description: "Large sharing platters for family gatherings" },
  { icon: "💎", name: "Hidden Gems", description: "Authentic local secret spots" },
];

export const getCategories = async () => {
  try {
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_CATEGORIES;
  } catch (err) {
    console.warn("Categories Firestore fetch fallback:", err);
    return DEFAULT_CATEGORIES;
  }
};

export const addCategory = async (data) => {
  const colRef = collection(db, COLLECTION);
  const res = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
  return { id: res.id, ...data };
};

export const updateCategory = async (id, data) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  return { id, ...data };
};

export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
