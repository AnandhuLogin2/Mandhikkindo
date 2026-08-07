import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "districts";

const DEFAULT_DISTRICTS = [
  { name: "Ernakulam", code: "EKM", famousSpots: "Edappally, Kakkanad, Fort Kochi" },
  { name: "Kozhikode", code: "KKD", famousSpots: "Beach Road, Mavoor Road, Paragon" },
  { name: "Malappuram", code: "MLP", famousSpots: "Kottakkal, Perinthalmanna" },
  { name: "Thiruvananthapuram", code: "TVM", famousSpots: "Kazhakkoottam, East Fort" },
  { name: "Thrissur", code: "TCR", famousSpots: "Swaraj Round, West Fort" },
  { name: "Kannur", code: "KNR", famousSpots: "Thana, Fort Road" },
  { name: "Kollam", code: "KLM", famousSpots: "Chinnakada, Ashramam" },
  { name: "Palakkad", code: "PKD", famousSpots: "Stadium Bypass, Fort Maidan" },
];

export const getDistricts = async () => {
  try {
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_DISTRICTS;
  } catch (err) {
    console.warn("Districts Firestore fetch fallback:", err);
    return DEFAULT_DISTRICTS;
  }
};

export const addDistrict = async (data) => {
  const colRef = collection(db, COLLECTION);
  const res = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
  return { id: res.id, ...data };
};

export const updateDistrict = async (id, data) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  return { id, ...data };
};

export const deleteDistrict = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
