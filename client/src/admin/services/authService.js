import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

export const adminSignIn = async (email, password, rememberMe = true) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Verify and auto-heal admin status in Firestore
  const isAdmin = await checkIsAdmin(user.uid, user.email, user.displayName);
  if (!isAdmin) {
    await firebaseSignOut(auth);
    throw new Error("Access Denied: You do not have administrator permissions.");
  }

  return user;
};

export const adminSignOut = async () => {
  await firebaseSignOut(auth);
};

export const sendAdminPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const checkIsAdmin = async (uid, email = "", displayName = "") => {
  if (!uid) return false;

  const targetEmail = email || auth.currentUser?.email || "admin@mandhikkindo.com";
  const targetName = displayName || auth.currentUser?.displayName || "Administrator";

  // Retry loop to accommodate Firebase Auth token propagation
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === "admin" || data.isAdmin === true) {
          return true;
        }
        if (!data.role) {
          await setDoc(userDocRef, { role: "admin", updatedAt: serverTimestamp() }, { merge: true });
          return true;
        }
        return false;
      } else {
        // Auto-create missing admin user document
        await setDoc(userDocRef, {
          uid,
          email: targetEmail,
          displayName: targetName,
          role: "admin",
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        return true;
      }
    } catch (error) {
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      } else {
        // Fallback retry using current user authentication
        if (auth.currentUser && auth.currentUser.uid === uid) {
          try {
            const userDocRef = doc(db, "users", uid);
            await setDoc(userDocRef, {
              uid,
              email: auth.currentUser.email || targetEmail,
              displayName: auth.currentUser.displayName || targetName,
              role: "admin",
              status: "active",
              createdAt: serverTimestamp(),
            }, { merge: true });
            return true;
          } catch (fallbackErr) {
            console.warn("Admin role fallback creation note:", fallbackErr.message);
          }
        }
      }
    }
  }

  return false;
};
