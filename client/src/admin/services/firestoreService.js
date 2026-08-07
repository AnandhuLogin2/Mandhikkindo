import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { db } from "../../config/firebase";

// Generic CRUD operations with resilient fallbacks
export const fetchCollection = async (collectionName, queryConstraints = []) => {
  const colRef = collection(db, collectionName);
  try {
    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    if (queryConstraints.length > 0) {
      try {
        const fallbackSnap = await getDocs(colRef);
        const items = fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => {
          const tA = a.createdAt?.seconds || (typeof a.createdAt === 'number' ? a.createdAt : 0);
          const tB = b.createdAt?.seconds || (typeof b.createdAt === 'number' ? b.createdAt : 0);
          return tB - tA;
        });
        return items;
      } catch (fallbackError) {
        console.warn(`Fetch ${collectionName} note:`, fallbackError.message);
      }
    }
    return [];
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
    console.warn(`Fetch document ${id} note:`, error.message);
    return null;
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
      await setDoc(docRef, payload, { merge: true });
      return { id: customId, ...payload };
    } else {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, ...payload };
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error.message);
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
    console.error(`Error updating document ${id} in ${collectionName}:`, error.message);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error.message);
    throw error;
  }
};

export const subscribeToCollection = (collectionName, callback, queryConstraints = []) => {
  const colRef = collection(db, collectionName);
  const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.warn(`Subscription note on ${collectionName}:`, error.message);
    callback([]);
  });
};
