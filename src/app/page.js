"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { Lock, User, School, ArrowRight, Loader2, GraduationCap, ShieldCheck } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("schoolId");
  const { loginAdmin } = useAuth();
  
  const [schoolName, setSchoolName] = useState("");
  const [activeTab, setActiveTab] = useState("student"); // Default tab
  
  // Forms
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [studentForm, setStudentForm] = useState({ name: "", phone: "" });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Auto-Load School Name from Magic Link
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

  // 3. Handle Student Login (Name + Phone Match)
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!schoolId) {
        setError("Invalid Link. Please ask your teacher for the Magic Link.");
        setLoading(false);
        return;
    }

    // Search for student in this school's batches
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
        // Save session & Redirect
        localStorage.setItem("eduSmartStudent", JSON.stringify({ ...foundStudent, schoolId }));
        router.push("/student"); 
    } else {
        setError("Student not found. Please check Name and Phone.");
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header - Auto-detected School Name */}
        <div className="bg-black p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                <School className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">
                {schoolName || "EduSmart Portal"}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
                {schoolName ? "Welcome to your coaching app" : "Please use a valid Magic Link"}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
            <button 
                onClick={() => setActiveTab("student")}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === "student" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-600"}`}
            >
                <GraduationCap size={18}/> Student
            </button>
            <button 
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === "admin" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-600"}`}
            >
                <ShieldCheck size={18}/> Teacher
            </button>
        </div>

        <div className="p-8">
            {/* STUDENT FORM */}
            {activeTab === "student" && (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="relative group">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition"/>
                        <input required placeholder="Your Name" 
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                            onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                        />
                    </div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition"/>
                        <input required placeholder="Your Phone Number" 
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                            onChange={e => setStudentForm({...studentForm, phone: e.target.value})}
                        />
                    </div>
                    {error && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <button disabled={loading} className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-zinc-800 transition">
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Access Dashboard"}
                    </button>
                </form>
            )}

            {/* ADMIN FORM */}
            {activeTab === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="relative group">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition"/>
                        <input required placeholder="Username" 
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                            onChange={e => setAdminForm({...adminForm, username: e.target.value})}
                        />
                    </div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition"/>
                        <input type="password" required placeholder="Password" 
                            className="w-full pl-10 p-3 border rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                            onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                        />
                    </div>
                    {error && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</p>}
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Login as Admin"}
                    </button>
                </form>
            )}

            {!schoolId && (
                <div className="mt-6 text-center text-xs text-gray-400">
                    Need to register a coaching? <a href="/register" className="text-blue-600 font-bold hover:underline">Click Here</a>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Next.js Suspense Wrapper for Search Params
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}