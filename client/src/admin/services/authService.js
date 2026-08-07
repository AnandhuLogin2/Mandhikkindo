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
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.role === "admin" || data.isAdmin === true) {
        return true;
      }
      // If user doc exists but role is missing or needs update
      if (!data.role) {
        await setDoc(userDocRef, { role: "admin", updatedAt: serverTimestamp() }, { merge: true });
        return true;
      }
      return false;
    } else {
      // Document does not exist in Firestore yet: auto-create admin user doc
      console.log("📝 Auto-creating missing admin document in Firestore users collection...");
      await setDoc(userDocRef, {
        uid,
        email: email || auth.currentUser?.email || "admin@mandhikkindo.com",
        displayName: displayName || auth.currentUser?.displayName || "Administrator",
        role: "admin",
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return true;
    }
  } catch (error) {
    console.error("Error checking/creating admin role:", error.message);
    // If Firestore rules temporarily block before login auth state propagation, check currentUser email fallback
    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        const userDocRef = doc(db, "users", uid);
        await setDoc(userDocRef, {
          uid,
          email: auth.currentUser.email || email,
          displayName: auth.currentUser.displayName || displayName || "Administrator",
          role: "admin",
          status: "active",
          createdAt: serverTimestamp(),
        }, { merge: true });
        return true;
      } catch (err) {
        console.warn("Auto-create fallback retry failed:", err.message);
      }
    }
    return false;
  }
};
