import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile with Express backend Firestore user document
  const syncBackendSession = async (firebaseUser) => {
    try {
      const res = await api.post("/api/auth/session", {}, firebaseUser);
      if (res?.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.warn("Backend session sync failed (server may be offline):", err.message);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncBackendSession(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (!auth) throw new Error("Sign-in is not configured yet. Please contact the site owner.");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncBackendSession(result.user);
      }
      return result.user;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (auth) await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Sign-Out Error:", error);
      throw error;
    }
  }, []);

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
