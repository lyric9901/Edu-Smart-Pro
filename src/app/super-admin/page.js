"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, remove, update } from "firebase/database";
import { ShieldAlert, Trash2, Key, Search, RefreshCw, LogOut, ArrowLeft, Eye, EyeOff, Edit, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdmin() {
  const router = useRouter();
  const [schools, setSchools] = useState({}); 
  const [admins, setAdmins] = useState({});   
  const [combinedData, setCombinedData] = useState([]);
  
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  // --- MODAL STATES ---
  const [editingSchool, setEditingSchool] = useState(null); // For General Info
  const [resettingPassword, setResettingPassword] = useState(null); // For Password
  
  // --- FORMS ---
  const [editForm, setEditForm] = useState({ name: "", owner: "", phone: "" });
  const [passForm, setPassForm] = useState("");

  // 1. INITIALIZE
  useEffect(() => {
    setIsClient(true);
    const storedAuth = localStorage.getItem("superAdminAuth");
    if (storedAuth === "true") setIsAuthenticated(true);
  }, []);

  // 2. AUTH
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
      if(confirm("Logout?")) {
        setIsAuthenticated(false);
        localStorage.removeItem("superAdminAuth");
      }
  };

  // 3. FETCH DATA
  useEffect(() => {
    if (isAuthenticated) {
      const unsubSchools = onValue(ref(db, "schools"), (snap) => setSchools(snap.val() || {}));
      const unsubAdmins = onValue(ref(db, "admins"), (snap) => setAdmins(snap.val() || {}));
      return () => { unsubSchools(); unsubAdmins(); };
    }
  }, [isAuthenticated]);

  // 4. COMBINE DATA
  useEffect(() => {
    if (schools) {
      const list = Object.entries(schools).map(([id, val]) => {
        const adminEntry = Object.entries(admins || {}).find(([_, v]) => v.schoolId === id);
        return {
          id,
          ...val.info,
          username: adminEntry ? adminEntry[0] : null,
          password: adminEntry ? adminEntry[1].password : null
        };
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCombinedData(list);
    }
  }, [schools, admins]);

  // --- ACTIONS ---

  // A. DELETE SCHOOL
  const deleteSchool = async (schoolId, schoolName, username) => {
    if (confirm(`⚠️ PERMANENTLY DELETE "${schoolName}"?\n\nThis will remove all students, fees, and login access.`)) {
        await remove(ref(db, `schools/${schoolId}`));
        if (username) await remove(ref(db, `admins/${username}`));
        alert("Deleted successfully.");
    }
  };

  // B. EDIT SCHOOL INFO
  const openEditModal = (school) => {
      setEditingSchool(school);
      setEditForm({ name: school.name, owner: school.owner, phone: school.phone });
  };

  const saveSchoolInfo = async () => {
      if(!editingSchool) return;
      await update(ref(db, `schools/${editingSchool.id}/info`), {
          name: editForm.name,
          owner: editForm.owner,
          phone: editForm.phone
      });
      setEditingSchool(null);
  };

  // C. CHANGE PASSWORD
  const openPassModal = (school) => {
      setResettingPassword(school);
      setPassForm(""); // Reset input
  };

  const saveNewPassword = async () => {
      if(!resettingPassword || !resettingPassword.username || !passForm.trim()) return;
      await update(ref(db, `admins/${resettingPassword.username}`), {
          password: passForm.trim()
      });
      setResettingPassword(null);
      alert("Password updated!");
  };

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isClient) return null; 

  // --- LOGIN UI ---
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center w-full max-w-sm">
                <ShieldAlert className="text-red-500 mx-auto mb-4" size={40} />
                <h1 className="text-xl font-bold text-white mb-6">Restricted Area</h1>
                <input type="password" placeholder="Master Key" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white mb-4 text-center" onChange={e => setMasterKey(e.target.value)} />
                <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Unlock</button>
            </form>
        </div>
    );
  }

  const filteredSchools = combinedData.filter(s => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.owner?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans relative">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-6">
                <h1 className="text-2xl font-black flex items-center gap-3 text-red-500"><ShieldAlert/> Super Admin</h1>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/')} className="bg-zinc-900 px-4 py-2 rounded-lg text-sm font-bold">Home</button>
                    <button onClick={handleLogout} className="bg-red-900/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold">Logout</button>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                    <input placeholder="Search..." className="w-full bg-zinc-900 border border-zinc-800 pl-12 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none" onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-5">Coaching</th>
                                <th className="p-5">Credentials</th>
                                <th className="p-5 text-right">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredSchools.map((school) => (
                                <tr key={school.id} className="hover:bg-zinc-800/30">
                                    <td className="p-5">
                                        <div className="font-bold text-lg text-white">{school.name}</div>
                                        <div className="text-zinc-500">{school.owner} • {school.phone}</div>
                                    </td>
                                    <td className="p-5">
                                        {school.username ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2"><span className="text-zinc-500 text-xs w-8">ID:</span> <span className="text-blue-400 font-mono">{school.username}</span></div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-500 text-xs w-8">PW:</span> 
                                                    <span className="text-zinc-300 font-mono">{showPasswords[school.id] ? school.password : "••••••"}</span>
                                                    <button onClick={() => togglePassword(school.id)} className="text-zinc-600 hover:text-white"><Eye size={14}/></button>
                                                </div>
                                            </div>
                                        ) : <span className="text-red-500 text-xs font-bold">No Admin</span>}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(school)} className="p-2 bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-900/40" title="Edit Info"><Edit size={18}/></button>
                                            <button onClick={() => openPassModal(school)} className="p-2 bg-yellow-900/20 text-yellow-400 rounded-lg hover:bg-yellow-900/40" title="Change Password"><Key size={18}/></button>
                                            <button onClick={() => deleteSchool(school.id, school.name, school.username)} className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40" title="Delete"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- EDIT MODAL --- */}
        <AnimatePresence>
        {editingSchool && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">Edit Coaching Details</h3>
                    <div className="space-y-3">
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Coaching Name" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
                        <input value={editForm.owner} onChange={e => setEditForm({...editForm, owner: e.target.value})} placeholder="Owner Name" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
                        <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setEditingSchool(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700">Cancel</button>
                        <button onClick={saveSchoolInfo} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={18}/> Save</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* --- PASSWORD MODAL --- */}
        <AnimatePresence>
        {resettingPassword && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-2xl shadow-2xl">
                    <h3 className="text-xl font-bold mb-2">Reset Password</h3>
                    <p className="text-zinc-500 text-sm mb-4">New password for <strong>{resettingPassword.username}</strong></p>
                    <input 
                        type="text" 
                        value={passForm} 
                        onChange={e => setPassForm(e.target.value)} 
                        placeholder="Enter New Password" 
                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500 font-mono text-center tracking-widest text-lg" 
                    />
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setResettingPassword(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700">Cancel</button>
                        <button onClick={saveNewPassword} className="flex-1 py-3 bg-yellow-600 rounded-xl font-bold text-black hover:bg-yellow-500 flex items-center justify-center gap-2"><Key size={18}/> Update</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}
