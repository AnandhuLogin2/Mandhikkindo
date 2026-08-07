import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";
import shopsRaw from "../data/shops.json";

const COLLECTION = "mandhi_shops";

export const getShops = async () => {
  try {
    const colRef = collection(db, COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    // Auto-seed if collection is empty
    console.log("🌱 Mandhi Shops collection is empty. Seeding from shops.json into Firestore...");
    const batch = writeBatch(db);
    const seedShops = shopsRaw.slice(0, 15); // seed initial set
    const seededList = [];

    for (const item of seedShops) {
      const newRef = doc(colRef);
      const payload = {
        ...item,
        createdAt: serverTimestamp(),
      };
      batch.set(newRef, payload);
      seededList.push({ id: newRef.id, ...item });
    }
    await batch.commit();
    return seededList;
  } catch (err) {
    console.warn("Firestore fetch fallback to shops.json:", err);
    return shopsRaw;
  }
};

export const subscribeShops = (callback) => {
  const colRef = collection(db, COLLECTION);
  return onSnapshot(colRef, (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    } else {
      getShops().then(callback);
    }
  }, (err) => {
    console.warn("Shops subscription fallback:", err);
    callback(shopsRaw);
  });
};

export const addShop = async (shopData) => {
  const colRef = collection(db, COLLECTION);
  const res = await addDoc(colRef, {
    ...shopData,
    createdAt: serverTimestamp(),
  });
  return { id: res.id, ...shopData };
};

export const updateShop = async (id, shopData) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...shopData,
    updatedAt: serverTimestamp(),
  });
  return { id, ...shopData };
};

export const deleteShop = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
  return true;
};
