import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { db } from "../../config/firebase";

// Generic CRUD operations
export const fetchCollection = async (collectionName, queryConstraints = []) => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

export const fetchDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${id} from ${collectionName}:`, error);
    throw error;
  }
};

export const createDocument = async (collectionName, data, customId = null) => {
  try {
    const payload = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    if (customId) {
      const docRef = doc(db, collectionName, customId);
      await setDoc(docRef, payload);
      return { id: customId, ...payload };
    } else {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, ...payload };
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, payload);
    return { id, ...payload };
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error);
    throw error;
  }
};

export const subscribeToCollection = (collectionName, callback, queryConstraints = []) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...queryConstraints);
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.error(`Subscription error on ${collectionName}:`, error);
  });
};
