"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: 'admin' | 'student', name: '...', institutionCode: '...' }
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Check LocalStorage on load (Keep user logged in on refresh)
  useEffect(() => {
    const savedUser = localStorage.getItem("eduSmartUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 2. ADMIN LOGIN (Updated for Firestore)
  const loginAdmin = async (username, password, institutionCodeFromLogin) => {
    try {
      // Check if admin exists in Firestore
      const adminRef = doc(firestore, "admins", username);
      const snapshot = await getDoc(adminRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        // Verify Password
        if (data.password !== password) throw new Error("Wrong Password");
        
        // Verify Institution Code (Security Check)
        // If they registered for LPS, but try to login to a different code, block it.
        if (institutionCodeFromLogin && data.institutionCode !== institutionCodeFromLogin) {
           throw new Error("This admin does not belong to this institution code.");
        }

        const userData = {
          role: "admin",
          username: username,
          institutionCode: data.institutionCode
        };

        // Save & Redirect
        setUser(userData);
        localStorage.setItem("eduSmartUser", JSON.stringify(userData));
        router.push("/dashboard/admin"); 
        return { success: true };
      }
      throw new Error("Username not found");
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 3. LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("eduSmartUser");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);