"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { ShieldAlert, Trash2, Key, Search, RefreshCw, LogOut, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdmin() {
  const router = useRouter();
  const [schools, setSchools] = useState({}); // Store as object for easier lookup
  const [admins, setAdmins] = useState({});   // Store as object
  const [combinedData, setCombinedData] = useState([]);
  
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showPasswords, setShowPasswords] = useState({}); // Toggle visibility per row

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
    const secret = process.env.NEXT_PUBLIC_SUPER_ADMIN_KEY || "998357"; 
    
    if (masterKey === secret) {
      setIsAuthenticated(true);
      localStorage.setItem("superAdminAuth", "true");
    } else {
      alert("Invalid Master Key");
    }
  };

  const handleLogout = () => {
      if(confirm("Are you sure you want to logout?")) {
        setIsAuthenticated(false);
        localStorage.removeItem("superAdminAuth");
      }
  };

  // 3. FETCH DATA (Schools & Admins)
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch Schools
      const schoolsRef = ref(db, "schools");
      const unsubSchools = onValue(schoolsRef, (snapshot) => {
        setSchools(snapshot.val() || {});
      });

      // Fetch Admins (To link usernames)
      const adminsRef = ref(db, "admins");
      const unsubAdmins = onValue(adminsRef, (snapshot) => {
        setAdmins(snapshot.val() || {});
      });

      return () => {
        unsubSchools();
        unsubAdmins();
      };
    }
  }, [isAuthenticated]);

  // 4. COMBINE DATA
  useEffect(() => {
    if (schools) {
      const list = Object.entries(schools).map(([id, val]) => {
        // Find matching admin for this school ID
        const adminEntry = Object.entries(admins || {}).find(([username, adminData]) => adminData.schoolId === id);
        const adminUsername = adminEntry ? adminEntry[0] : null;
        const adminPassword = adminEntry ? adminEntry[1].password : null;

        return {
          id,
          ...val.info,
          username: adminUsername,
          password: adminPassword
        };
      });
      // Sort by creation date (newest first)
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCombinedData(list);
    }
  }, [schools, admins]);

  // 5. DELETE ACTION (Removes School + Admin Login)
  const deleteSchool = async (schoolId, schoolName, username) => {
    const confirmMsg = `⚠️ DANGER: Are you sure you want to delete "${schoolName}"?\n\nThis will permanently delete:\n1. All student data, fees, attendance.\n2. The admin login "${username}".\n\nThis action CANNOT be undone.`;
    
    if (confirm(confirmMsg)) {
        try {
            // 1. Delete School Data
            await remove(ref(db, `schools/${schoolId}`));
            
            // 2. Delete Admin Login (if exists)
            if (username) {
                await remove(ref(db, `admins/${username}`));
            }
            
            alert("✅ School and Admin credentials deleted successfully.");
        } catch (error) {
            alert("Error deleting data: " + error.message);
        }
    }
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
  const filteredSchools = combinedData.filter(s => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.owner?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.username?.toLowerCase() || "").includes(search.toLowerCase())
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
                    <div className="text-4xl font-black text-white mt-2">{combinedData.length}</div>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider">System Status</div>
                    <div className="text-emerald-500 font-bold mt-2 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Live Sync
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                    <input 
                        placeholder="Search by school, owner, or username..." 
                        className="w-full bg-zinc-900 border border-zinc-800 pl-12 p-3 rounded-xl text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-900 outline-none transition"
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setSearch("")} 
                    className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
                    title="Clear Search"
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
                                <th className="p-5">School Info</th>
                                <th className="p-5">Admin Credentials</th>
                                <th className="p-5">Contact</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredSchools.map((school) => (
                                <tr key={school.id} className="hover:bg-zinc-800/30 transition group">
                                    {/* School Info */}
                                    <td className="p-5">
                                        <div className="font-bold text-white text-base">{school.name || <span className="text-red-500 italic">Unknown</span>}</div>
                                        <div className="text-zinc-500 text-xs mt-1">ID: <span className="font-mono text-zinc-400">{school.id}</span></div>
                                    </td>

                                    {/* Admin Credentials */}
                                    <td className="p-5">
                                        {school.username ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-500 text-xs uppercase font-bold w-12">User:</span>
                                                    <span className="text-blue-400 font-mono font-medium">{school.username}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-500 text-xs uppercase font-bold w-12">Pass:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-zinc-300 font-mono">
                                                            {showPasswords[school.id] ? school.password : "••••••••"}
                                                        </span>
                                                        <button onClick={() => togglePassword(school.id)} className="text-zinc-600 hover:text-zinc-400">
                                                            {showPasswords[school.id] ? <EyeOff size={12}/> : <Eye size={12}/>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-red-500 text-xs font-bold bg-red-900/20 px-2 py-1 rounded">NO ADMIN LINKED</span>
                                        )}
                                    </td>

                                    {/* Contact Info */}
                                    <td className="p-5">
                                        <div className="text-zinc-300">{school.owner || "N/A"}</div>
                                        <div className="text-zinc-500 text-xs font-mono mt-1">{school.phone || "N/A"}</div>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-5 text-right">
                                        <button 
                                            onClick={() => deleteSchool(school.id, school.name, school.username)} 
                                            className="bg-zinc-800 text-red-400 hover:bg-red-900/30 hover:text-red-300 px-4 py-2 rounded-lg transition flex items-center gap-2 ml-auto text-xs font-bold"
                                            title="Delete School & Admin"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSchools.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-zinc-600 italic">
                                        No matching schools found.
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
