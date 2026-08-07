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

const COLLECTION = "mandhi_types";

const DEFAULT_TYPES = [
  { name: "Chicken Mandhi", spiciness: "Medium", priceEstimate: "₹220 - ₹400", description: "Steamed chicken over fragrant long-grain rice" },
  { name: "Beef Mandhi", spiciness: "Medium-High", priceEstimate: "₹260 - ₹480", description: "Tender beef chunks marinated in Arabian spices" },
  { name: "Mutton Mandhi", spiciness: "Mild", priceEstimate: "₹380 - ₹700", description: "Slow-roasted tender lamb platter" },
  { name: "Alfaham Mandhi", spiciness: "Spicy", priceEstimate: "₹240 - ₹450", description: "Charcoal grilled smoky chicken over butter rice" },
  { name: "Kuzhi Mandhi", spiciness: "Medium", priceEstimate: "₹250 - ₹460", description: "Traditional pit-cooked authentic Yemeni style" },
];

export const getMandhiTypes = async () => {
  try {
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_TYPES;
  } catch (err) {
    console.warn("Mandhi Types Firestore fetch fallback:", err);
    return DEFAULT_TYPES;
  }
};

export const addMandhiType = async (data) => {
  const colRef = collection(db, COLLECTION);
  const res = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
  return { id: res.id, ...data };
};

export const updateMandhiType = async (id, data) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  return { id, ...data };
};

export const deleteMandhiType = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
