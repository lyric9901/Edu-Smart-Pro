"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Define the User structure
export interface AuthUser {
  role: 'admin' | 'student';
  username: string;
  institutionCode: string;
}

// Define what the Context provides
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAdmin: (username: string, password: string, institutionCodeFromLogin?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// Initialize Context with undefined to enforce Provider usage
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // 1. Check LocalStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem("eduSmartUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 2. ADMIN LOGIN
  const loginAdmin = async (
    username: string, 
    password: string, 
    institutionCodeFromLogin?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const adminRef = doc(firestore, "admins", username);
      const snapshot = await getDoc(adminRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data() as DocumentData;
        
        if (data.password !== password) throw new Error("Wrong Password");
        
        if (institutionCodeFromLogin && data.institutionCode !== institutionCodeFromLogin) {
           throw new Error("This admin does not belong to this institution code.");
        }

        const userData: AuthUser = {
          role: "admin",
          username: username,
          institutionCode: data.institutionCode
        };

        setUser(userData);
        localStorage.setItem("eduSmartUser", JSON.stringify(userData));
        router.push("/dashboard/admin"); 
        return { success: true };
      }
      throw new Error("Username not found");
    } catch (error: any) {
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

// Custom hook with null-check safety
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};