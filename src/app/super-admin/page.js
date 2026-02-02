"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { ShieldAlert, Trash2, Key, Search, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdmin() {
  const [schools, setSchools] = useState([]);
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");

  // 1. SIMPLE AUTH CHECK
  const handleLogin = (e) => {
    e.preventDefault();
    // ⚠️ CHANGE THIS PASSWORD
    if (masterKey === "998357") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Master Key");
    }
  };

  // 2. FETCH ALL SCHOOLS
  useEffect(() => {
    if (isAuthenticated) {
      const schoolsRef = ref(db, "schools");
      onValue(schoolsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val.info
          }));
          setSchools(list);
        } else {
          setSchools([]);
        }
      });
    }
  }, [isAuthenticated]);

  // 3. DELETE SCHOOL
  const deleteSchool = async (schoolId, schoolName) => {
    if (confirm(`⚠️ DANGER: Delete "${schoolName}"? This cannot be undone.`)) {
        await remove(ref(db, `schools/${schoolId}`));
        alert("School Deleted.");
    }
  };

  // 4. RESET PASSWORD (Basic Alert for now)
  const resetPassword = async () => {
    alert("To reset a password, please use the Firebase Console directly for security reasons.");
  };

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-sm text-center">
                <ShieldAlert className="text-red-500 mx-auto mb-4" size={48} />
                <h1 className="text-xl font-bold text-white mb-6">Restricted Area</h1>
                <input 
                    type="password" 
                    placeholder="Enter Master Key" 
                    className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white mb-4 focus:border-red-500 outline-none"
                    onChange={e => setMasterKey(e.target.value)}
                />
                <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">Access Control</button>
            </form>
        </div>
    );
  }

  // --- DASHBOARD VIEW ---
  const filteredSchools = schools.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.owner?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldAlert className="text-red-500"/> Super Admin Panel
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage all registered coaching centers</p>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
                    <LogOut size={16}/> Logout
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="text-zinc-400 text-sm font-bold uppercase">Total Schools</div>
                    <div className="text-4xl font-bold text-white mt-2">{schools.length}</div>
                </div>
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                    <div className="text-zinc-400 text-sm font-bold uppercase">System Status</div>
                    <div className="text-green-500 font-bold mt-2 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Operational</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
                    <input 
                        placeholder="Search schools..." 
                        className="w-full bg-zinc-900 border border-zinc-800 pl-10 p-3 rounded-lg text-sm text-white focus:border-blue-500 outline-none"
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={() => window.location.reload()} className="p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 border border-zinc-800">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-950 text-zinc-500 text-xs uppercase border-b border-zinc-800">
                            <th className="p-4">School Name</th>
                            <th className="p-4">Owner</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">School ID</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredSchools.map((school) => (
                            <tr key={school.id} className="hover:bg-zinc-800/50 transition">
                                <td className="p-4 font-bold text-white">{school.name}</td>
                                <td className="p-4 text-zinc-400">{school.owner}</td>
                                <td className="p-4 text-zinc-400">{school.phone}</td>
                                <td className="p-4"><code className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-xs text-blue-400">{school.id}</code></td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => resetPassword()} className="p-2 bg-zinc-800 text-zinc-300 rounded hover:bg-blue-900 hover:text-blue-200">
                                        <Key size={16} />
                                    </button>
                                    <button onClick={() => deleteSchool(school.id, school.name)} className="p-2 bg-zinc-800 text-red-400 rounded hover:bg-red-900/30 hover:text-red-300">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}