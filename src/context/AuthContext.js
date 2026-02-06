"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child } from "firebase/database";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: 'admin' | 'student', name: '...', schoolId: '...' }
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

  // 2. ADMIN LOGIN
  const loginAdmin = async (username, password, schoolIdFromLink) => {
    try {
      // Check if admin exists in Firebase
      const snapshot = await get(child(ref(db), `admins/${username}`));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Verify Password
        if (data.password !== password) throw new Error("Wrong Password");
        
        // Verify School ID (Security Check)
        // If they used a magic link for School A, but try to login as Admin of School B, block it.
        if (schoolIdFromLink && data.schoolId !== schoolIdFromLink) {
           throw new Error("This admin does not belong to this coaching center link.");
        }

        const userData = {
          role: "admin",
          username: username,
          schoolId: data.schoolId
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