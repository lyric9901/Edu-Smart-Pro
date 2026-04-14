// src/app/login/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Lock, User, School, Loader2, GraduationCap, ShieldCheck, Building2, ChevronRight, ArrowLeft, MapPin } from "lucide-react";

function LoginPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState("student"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);
  const [schoolName, setSchoolName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  
  const [studentForm, setStudentForm] = useState({ name: "", passwordInput: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  // --- AUTO-LOGIN & URL CODE LOGIC ---
  useEffect(() => {
    // 1. Check for existing session (Persistent Login)
    const adminSession = localStorage.getItem("eduSmartUser");
    const studentSession = localStorage.getItem("eduSmartStudent");

    if (adminSession) {
        router.replace("/dashboard/admin");
        return;
    }
    if (studentSession) {
        router.replace("/student");
        return;
    }

    // 2. If no session, check for Magic Link in URL
    const urlCode = searchParams.get("code");
    if (urlCode) {
        setInstitutionCode(urlCode.toUpperCase());
        verifyCode(urlCode);
    }
  }, [searchParams, router]);

  const verifyCode = async (codeToVerify) => {
    setLoading(true);
    setError("");
    try {
      const code = codeToVerify.toUpperCase().trim();
      const instDoc = await getDoc(doc(firestore, "institutions", code));
      
      if (instDoc.exists()) {
        setSchoolName(instDoc.data().name);
        setInstitutionCode(code);
        
        const branchSnapshot = await getDocs(collection(firestore, `institutions/${code}/branches`));
        const branchList = [];
        branchSnapshot.forEach((doc) => branchList.push({ id: doc.id, ...doc.data() }));
        
        setBranches(branchList);
        
        if (branchList.length > 1) {
            setStep(2); 
        } else {
            setSelectedBranch(branchList[0]?.id || "main-branch");
            setStep(3); 
        }
      } else {
        setError("Institution Code not found.");
        setStep(1);
      }
    } catch (err) {
      setError("Failed to verify: " + err.message);
      setStep(1);
    }
    setLoading(false);
  };

  const handleCheckCode = (e) => {
    e.preventDefault();
    verifyCode(institutionCode);
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const code = institutionCode.toUpperCase().trim();
        const inputName = String(studentForm.name).trim().toLowerCase();
        const inputPass = String(studentForm.passwordInput).trim();
        
        // 1. Try checking the NEW Branches folder
        let batchesRef = collection(firestore, `institutions/${code}/branches/${selectedBranch}/batches`);
        let snapshot = await getDocs(batchesRef);
        
        // 2. FALLBACK: If the branch folder is empty, check the OLD folder!
        // This ensures coachings created before the branch update still work perfectly.
        if (snapshot.empty) {
            batchesRef = collection(firestore, `institutions/${code}/batches`);
            snapshot = await getDocs(batchesRef);
        }
        
        let foundStudent = null;

        // 3. Search through the batches for the student
        snapshot.forEach(batchDoc => {
            const batchData = batchDoc.data();
            const studentsArr = batchData.students || [];
            
            const match = studentsArr.find(s => {
                // Forcing everything to Strings prevents silent crashing if a phone is saved as a Number
                const dbName = String(s.name || "").trim().toLowerCase();
                const dbPhone = String(s.phone || "").trim();
                const dbPass = s.password || "";

                const nameMatch = (dbName === inputName);
                const passMatch = (dbPass === inputPass) || (dbPhone === inputPass);

                return nameMatch && passMatch;
            });

            if (match) {
                foundStudent = { 
                    ...match, 
                    batchId: batchDoc.id, 
                    batchName: batchData.name,
                    institutionCode: code,
                    branchId: selectedBranch,
                    batchTiming: batchData.timing 
                };
            }
        });

        if (foundStudent) {
            localStorage.setItem("eduSmartStudent", JSON.stringify(foundStudent));
            localStorage.setItem("eduSmartStudentsList", JSON.stringify([foundStudent]));
            router.push("/student"); 
        } else {
            setError("Invalid Credentials. Please check Name and Password/Phone.");
        }
    } catch (err) {
        console.error("Login Error:", err);
        setError("Login failed: " + err.message);
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginAdmin(adminForm.username, adminForm.password, institutionCode.toUpperCase());
    if (!res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 font-sans p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-20"></div>
            <div className="relative z-10">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/10">
                    <School className="text-blue-400" size={32} />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                    {schoolName || "EduSmart Portal"}
                </h1>
                {step > 1 && activeTab === "student" && (
                    <p className="text-blue-300 text-sm mt-2 font-medium flex justify-center items-center gap-1 cursor-pointer hover:text-white transition" onClick={() => setStep(1)}>
                        <ArrowLeft size={14}/> Change Institute
                    </p>
                )}
            </div>
        </div>

        {/* Tabs */}
        {step === 1 && (
            <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50">
                <button 
                    onClick={() => {setActiveTab("student"); setError("");}}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === "student" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    <GraduationCap size={18}/> Student
                </button>
                <button 
                    onClick={() => {setActiveTab("admin"); setError("");}}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === "admin" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    <ShieldCheck size={18}/> Admin
                </button>
            </div>
        )}

        <div className="p-8">
            {/* STUDENT FLOW */}
            {activeTab === "student" && (
                <div className="space-y-5">
                    {/* Step 1: Institution Code */}
                    {step === 1 && (
                        <form onSubmit={handleCheckCode} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="relative group">
                                <Building2 size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                                <input required placeholder="Enter Institution Code" 
                                    className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-bold text-slate-700 uppercase"
                                    value={institutionCode}
                                    onChange={e => setInstitutionCode(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-center text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                            <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify Code <ChevronRight size={18}/></>}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Branch Selection */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <p className="text-sm font-bold text-slate-500 text-center mb-4">Select your campus</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {branches.map((branch) => (
                                    <button 
                                        key={branch.id}
                                        onClick={() => { setSelectedBranch(branch.id); setStep(3); }}
                                        className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition text-left group"
                                    >
                                        <div className="bg-white p-2 rounded-lg border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600 transition">
                                            <MapPin size={18} />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-blue-700">{branch.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Login Credentials */}
                    {step === 3 && (
                        <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                                <input required placeholder="Student Name" 
                                    className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                    onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                                />
                            </div>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                                <input required type="password" placeholder="Password or Phone Number" 
                                    className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-medium text-slate-700"
                                    onChange={e => setStudentForm({...studentForm, passwordInput: e.target.value})}
                                />
                            </div>
                            {error && <p className="text-red-500 text-center text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                            <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Enter Classroom"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* ADMIN FLOW */}
            {activeTab === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Building2 size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input required placeholder="Institution Code" 
                                value={institutionCode}
                                className="w-full pl-12 p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-bold text-slate-700 uppercase"
                                onChange={e => setInstitutionCode(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition"/>
                            <input required placeholder="Admin Username" 
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

            {!institutionCode && (
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-500" size={32}/></div>}>
      <LoginPortal />
    </Suspense>
  );
}