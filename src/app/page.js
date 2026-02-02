"use client";
export const dynamic = "force-dynamic"; // CRITICAL FOR VERCEL BUILD

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Lock, User, School, Loader2, GraduationCap, ShieldCheck } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("schoolId");
  const { loginAdmin } = useAuth();
  
  const [schoolName, setSchoolName] = useState("");
  const [activeTab, setActiveTab] = useState("student"); 
  
  // Forms
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [studentForm, setStudentForm] = useState({ name: "", phone: "" });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Auto-Load School Name
  useEffect(() => {
    if (schoolId) {
      get(ref(db, `schools/${schoolId}/info`)).then((snapshot) => {
        if (snapshot.exists()) {
          setSchoolName(snapshot.val().name);
        }
      });
    }
  }, [schoolId]);

  // 2. Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginAdmin(adminForm.username, adminForm.password, schoolId);
    if (!res.success) {
      setError(res.message);
      setLoading(false);
    }
  };

  // 3. Handle Student Login
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!schoolId) {
        setError("Invalid Link. Please ask your teacher for the Magic Link.");
        setLoading(false);
        return;
    }

    const batchesRef = ref(db, `schools/${schoolId}/batches`);
    const snapshot = await get(batchesRef);
    
    let foundStudent = null;
    if (snapshot.exists()) {
        snapshot.forEach(batch => {
            const students = batch.val().students || [];
            const match = students.find(s => 
                s.name.trim().toLowerCase() === studentForm.name.trim().toLowerCase() && 
                s.phone.trim() === studentForm.phone.trim()
            );
            if (match) foundStudent = { ...match, batchName: batch.val().name };
        });
    }

    if (foundStudent) {
        localStorage.setItem("eduSmartStudent", JSON.stringify({ ...foundStudent, schoolId }));
        router.push("/student"); 
    } else {
        setError("Student not found. Please check Name and Phone.");
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 font-sans p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-20"></div>
            <div className="relative z-10">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10">
                    <School className="text-blue-400" size={32} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                    {schoolName || "EduSmart Portal"}
                </h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                    {schoolName ? "Your Digital Classroom" : "Please use your Institute's Magic Link"}
                </p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50">
            <button 
                onClick={() => setActiveTab("student")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === "student" 
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
            >
                <GraduationCap size={18}/> Student
            </button>
            <button 
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === "admin" 
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
            >
                <ShieldCheck size={18}/> Admin
            </button>
        </div>

        <div className="p-8">
            {/* STUDENT FORM */}
            {activeTab === "student" && (
                <form onSubmit={handleStudentLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input required placeholder="Your Name" 
                                className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                            />
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input required placeholder="Phone Number" 
                                className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                onChange={e => setStudentForm({...studentForm, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                    <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Enter Classroom"}
                    </button>
                </form>
            )}

            {/* ADMIN FORM */}
            {activeTab === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input required placeholder="Username" 
                                className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                onChange={e => setAdminForm({...adminForm, username: e.target.value})}
                            />
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input type="password" required placeholder="Password" 
                                className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Admin Login"}
                    </button>
                </form>
            )}

            {!schoolId && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 mb-2">Tutor or Coaching Owner?</p>
                    <a href="/register" className="inline-block text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition">
                        Register Your Coaching Free →
                    </a>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Suspense Wrapper
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold">Loading Portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
