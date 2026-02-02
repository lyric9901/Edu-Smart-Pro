"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { ShieldAlert, Trash2, Key, Search, RefreshCw, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdmin() {
  const router = useRouter();
  const [schools, setSchools] = useState([]);
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [isClient, setIsClient] = useState(false); // To avoid hydration mismatch

  // 1. INITIALIZE & CHECK SESSION
  useEffect(() => {
    setIsClient(true);
    const storedAuth = localStorage.getItem("superAdminAuth");
    if (storedAuth === "true") {
        setIsAuthenticated(true);
    }
  }, []);

  // 2. HANDLE LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    // In Vercel, set NEXT_PUBLIC_SUPER_ADMIN_KEY in Environment Variables
    const secret = process.env.NEXT_PUBLIC_SUPER_ADMIN_KEY || "998357"; 
    
    if (masterKey === secret) {
      setIsAuthenticated(true);
      localStorage.setItem("superAdminAuth", "true"); // Persist Login
    } else {
      alert("Invalid Master Key");
    }
  };

  // 3. LOGOUT
  const handleLogout = () => {
      if(confirm("Are you sure you want to logout?")) {
        setIsAuthenticated(false);
        localStorage.removeItem("superAdminAuth");
      }
  };

  // 4. FETCH SCHOOLS (Real-time)
  useEffect(() => {
    if (isAuthenticated) {
      const schoolsRef = ref(db, "schools");
      return onValue(schoolsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...(val.info || {}) // <--- FIXED: Handles missing info safely
          }));
          // Sort by creation date (newest first) if available, else by name
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSchools(list);
        } else {
          setSchools([]);
        }
      });
    }
  }, [isAuthenticated]);

  // 5. ACTIONS
  const deleteSchool = async (schoolId, schoolName) => {
    if (confirm(`⚠️ DANGER: Delete "${schoolName}"? This permanently removes all student data & logins. Cannot be undone.`)) {
        await remove(ref(db, `schools/${schoolId}`));
        // Optional: Remove admin login too if you track it separately
        await remove(ref(db, `admins/${schoolName}`)); 
        alert("School Data Deleted.");
    }
  };

  const resetPassword = () => {
    alert("Password reset must be done via Firebase Console for security.");
  };

  // Prevent hydration mismatch on load
  if (!isClient) return null; 

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 transition">
                    <ArrowLeft size={16}/> Back Home
                </button>
                <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Super Admin</h1>
                    <p className="text-zinc-500 text-sm mb-6">Restricted Access Only</p>
                    
                    <input 
                        type="password" 
                        placeholder="Master Key" 
                        className="w-full bg-black border border-zinc-700 p-3.5 rounded-xl text-white mb-4 focus:border-red-500 focus:ring-1 focus:ring-red-900 outline-none transition text-center tracking-widest font-bold"
                        onChange={e => setMasterKey(e.target.value)}
                    />
                    <button className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20">
                        Unlock Panel
                    </button>
                </form>
            </div>
        </div>
    );
  }

  // --- DASHBOARD VIEW ---
  const filteredSchools = schools.filter(s => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.owner?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-zinc-900 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <ShieldAlert className="text-red-500"/> EduSmart Admin
                    </h1>
                    <p className="text-zinc-500 mt-1 font-medium">Global Control Center</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/')} className="bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition">
                        Home
                    </button>
                    <button onClick={handleLogout} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition">
                        <LogOut size={16}/> Logout
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Total Schools</div>
                    <div className="text-4xl font-black text-white mt-2">{schools.length}</div>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Database Status</div>
                    <div className="text-emerald-500 font-bold mt-2 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Online & Live
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                    <input 
                        placeholder="Search by school name or owner..." 
                        className="w-full bg-zinc-900 border border-zinc-800 pl-12 p-3 rounded-xl text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-900 outline-none transition"
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Fixed Refresh Button: No longer reloads page, just acts as a visual reset */}
                <button 
                    onClick={() => { setSearch(""); alert("Data is already live (Real-time)."); }} 
                    className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-5">School Name</th>
                                <th className="p-5">Owner</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5">School ID</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredSchools.map((school) => (
                                <tr key={school.id} className="hover:bg-zinc-800/30 transition group">
                                    <td className="p-5 font-bold text-white">
                                        {school.name || <span className="text-red-500 italic">Unknown</span>}
                                    </td>
                                    <td className="p-5 text-zinc-400">{school.owner || "N/A"}</td>
                                    <td className="p-5 text-zinc-400 font-mono">{school.phone || "N/A"}</td>
                                    <td className="p-5"><code className="bg-black px-2 py-1 rounded text-xs text-zinc-500 font-mono select-all">{school.id}</code></td>
                                    <td className="p-5 text-right flex justify-end gap-2">
                                        <button onClick={() => resetPassword()} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-blue-900/30 hover:text-blue-400 transition" title="Reset Password">
                                            <Key size={16} />
                                        </button>
                                        <button onClick={() => deleteSchool(school.id, school.name)} className="p-2 bg-zinc-800 text-red-400 rounded-lg hover:bg-red-900/30 hover:text-red-300 transition" title="Delete School">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSchools.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-zinc-600 italic">
                                        No schools found. New registrations will appear here instantly.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}
