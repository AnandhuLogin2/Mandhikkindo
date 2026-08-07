import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

export const adminSignIn = async (email, password, rememberMe = true) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Verify admin status in Firestore
  const isAdmin = await checkIsAdmin(userCredential.user.uid);
  if (!isAdmin) {
    await firebaseSignOut(auth);
    throw new Error("Access Denied: You do not have administrator permissions.");
  }

  return userCredential.user;
};

export const adminSignOut = async () => {
  await firebaseSignOut(auth);
};

export const sendAdminPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const checkIsAdmin = async (uid) => {
  if (!uid) return false;
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === "admin" || data.isAdmin === true;
    }
    return false;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
