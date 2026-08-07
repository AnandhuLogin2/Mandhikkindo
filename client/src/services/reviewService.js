import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "reviews";

const DEFAULT_REVIEWS = [
  {
    userName: "Anoop Kumar",
    userEmail: "anoop@gmail.com",
    shopName: "Nahdi Kuzhi Mandhi",
    rating: 5,
    comment: "The rice alone is worth the drive. Meat fell right off the bone.",
    status: "approved",
    likes: 12
  },
  {
    userName: "Fathima Rahman",
    userEmail: "fathima@gmail.com",
    shopName: "Port Muziris Mandhi",
    rating: 5,
    comment: "Portion sizes are unreal — came for lunch, left with dinner too.",
    status: "approved",
    likes: 8
  },
  {
    userName: "Rahul V",
    userEmail: "rahul@gmail.com",
    shopName: "Al Reem Arabian",
    rating: 4,
    comment: "Best mandhi I've had outside of a Gulf trip, honestly.",
    status: "approved",
    likes: 15
  },
  {
    userName: "Meera Nair",
    userEmail: "meera@gmail.com",
    shopName: "Arabian Treat",
    rating: 5,
    comment: "The smoky pit flavour actually comes through — rare these days.",
    status: "approved",
    likes: 6
  }
];

export const getReviews = async () => {
  try {
    const colRef = collection(db, COLLECTION);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEFAULT_REVIEWS;
  } catch (err) {
    console.warn("Reviews Firestore fetch fallback:", err);
    return DEFAULT_REVIEWS;
  }
};

export const subscribeReviews = (callback) => {
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    } else {
      callback(DEFAULT_REVIEWS);
    }
  }, (err) => {
    console.warn("Reviews subscription fallback:", err);
    callback(DEFAULT_REVIEWS);
  });
};

export const addReview = async (reviewData) => {
  const colRef = collection(db, COLLECTION);
  const payload = {
    ...reviewData,
    status: "approved",
    likes: 0,
    createdAt: serverTimestamp(),
  };
  const res = await addDoc(colRef, payload);
  return { id: res.id, ...payload };
};

export const updateReviewStatus = async (id, status) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
  return true;
};

export const deleteReview = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return true;
};
