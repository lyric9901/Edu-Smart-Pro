"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAdmin } from "@/lib/supabaseDb";
import { useRouter } from "next/navigation";
import { initPushNotifications } from "@/lib/notifications";

// Define the User structure
export interface AuthUser {
  role: 'admin' | 'student' | 'superadmin';
  username: string;
  institutionCode: string;
  schoolId?: string;
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
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed?.username) {
          initPushNotifications(parsed.username).catch(() => {});
        }
      } catch (e) {
        console.error("Error reading saved user session:", e);
      }
    }

    const savedStudent = localStorage.getItem("eduSmartStudent");
    if (savedStudent) {
      try {
        const student = JSON.parse(savedStudent);
        const studentId = student.id || student.phone || student.name;
        if (studentId) {
          initPushNotifications(studentId).catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    }

    setLoading(false);
  }, []);

  // 2. ADMIN LOGIN (Secure Server-Side API)
  const loginAdmin = async (
    username: string, 
    password: string, 
    institutionCodeFromLogin?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          institutionCode: institutionCodeFromLogin?.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to log in.");
      }

      const userData: AuthUser = {
        role: data.user.role || "admin",
        username: data.user.username,
        institutionCode: data.user.institutionCode,
      };

      setUser(userData);
      localStorage.setItem("eduSmartUser", JSON.stringify(userData));
      initPushNotifications(userData.username, userData.institutionCode).catch(() => {});
      router.push("/dashboard/admin"); 
      return { success: true };
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