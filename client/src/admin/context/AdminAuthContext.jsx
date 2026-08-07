import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase";
import { checkIsAdmin, adminSignIn, adminSignOut, sendAdminPasswordReset } from "../services/authService";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminCheck = await checkIsAdmin(user.uid);
        if (adminCheck) {
          setAdminUser(user);
          setIsAdmin(true);
        } else {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
      setLoadingAdmin(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password, rememberMe) => {
    setLoadingAdmin(true);
    try {
      const user = await adminSignIn(email, password, rememberMe);
      setAdminUser(user);
      setIsAdmin(true);
      return user;
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await adminSignOut();
    setAdminUser(null);
    setIsAdmin(false);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendAdminPasswordReset(email);
  }, []);

  const value = {
    adminUser,
    isAdmin,
    loadingAdmin,
    login,
    logout,
    resetPassword
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
