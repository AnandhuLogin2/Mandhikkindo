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

const QUESTIONS = "quiz_questions";
const RESULTS = "quiz_results";

const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    key: "protein",
    questionText: "Chicken, Beef, Mutton or Fish?",
    options: [
      { label: "Chicken", value: "Chicken Mandhi" },
      { label: "Beef", value: "Beef Mandhi" },
      { label: "Mutton", value: "Mutton Mandhi" },
      { label: "Fish", value: "Fish Mandhi" },
    ],
    active: true
  },
  {
    id: "q2",
    key: "spice",
    questionText: "Spicy or Mild?",
    options: [
      { label: "Bring the heat", value: "spicy" },
      { label: "Keep it mild", value: "mild" },
    ],
    active: true
  },
  {
    id: "q3",
    key: "budget",
    questionText: "Budget bite or Premium plate?",
    options: [
      { label: "Budget", value: "budget" },
      { label: "Premium", value: "premium" },
    ],
    active: true
  },
  {
    id: "q4",
    key: "crowd",
    questionText: "Dining solo, with family, or with friends?",
    options: [
      { label: "Solo", value: "solo" },
      { label: "Family", value: "family" },
      { label: "Friends", value: "friends" },
    ],
    active: true
  }
];

export const getQuizQuestions = async () => {
  try {
    const snap = await getDocs(collection(db, QUESTIONS));
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return docs.filter((q) => q.active !== false);
    }
    return DEFAULT_QUESTIONS;
  } catch (err) {
    console.warn("Quiz questions fetch fallback:", err);
    return DEFAULT_QUESTIONS;
  }
};

export const subscribeQuizQuestions = (callback) => {
  return onSnapshot(collection(db, QUESTIONS), (snap) => {
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(docs.filter((q) => q.active !== false));
    } else {
      callback(DEFAULT_QUESTIONS);
    }
  }, (err) => {
    console.warn("Quiz subscription fallback:", err);
    callback(DEFAULT_QUESTIONS);
  });
};

export const saveQuizAttemptResult = async (resultData, user) => {
  const colRef = collection(db, RESULTS);
  const payload = {
    ...resultData,
    uid: user?.uid || "anon",
    createdAt: serverTimestamp(),
  };
  const res = await addDoc(colRef, payload);
  return { id: res.id, ...payload };
};

export const addQuizQuestion = async (data) => {
  const res = await addDoc(collection(db, QUESTIONS), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
  return { id: res.id, ...data };
};

export const updateQuizQuestion = async (id, data) => {
  await updateDoc(doc(db, QUESTIONS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
};

export const deleteQuizQuestion = async (id) => {
  await deleteDoc(doc(db, QUESTIONS, id));
  return true;
};
