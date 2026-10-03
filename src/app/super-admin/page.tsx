"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, Trash2, Key, Search, RefreshCw, LogOut, ArrowLeft, Edit, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdmin() {
  const router = useRouter();
  const [schools, setSchools] = useState<any>({}); 
  const [admins, setAdmins] = useState<any>({});
  
  const [masterKey, setMasterKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [isClient, setIsClient] = useState(false);

  // --- MODAL STATES ---
  const [editingSchool, setEditingSchool] = useState<any>(null); 
  const [resettingPassword, setResettingPassword] = useState<any>(null); 
  
  // --- FORMS ---
  const [editForm, setEditForm] = useState({ name: "", owner: "", phone: "" });
  const [passForm, setPassForm] = useState("");

  // 1. INITIALIZE (Server-side Session Check)
  useEffect(() => {
    setIsClient(true);
    fetch("/api/super-admin/check-session")
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .catch(() => {});
  }, []);

  // 2. AUTH
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/super-admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: masterKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        alert(data.message || "Invalid Master Key");
      }
    } catch (err: any) {
      alert("Verification failed: " + (err?.message || "Unknown error"));
    }
  };

  const handleLogout = async () => {
    if (confirm("Logout?")) {
      await fetch("/api/super-admin/logout", { method: "POST" }).catch(() => {});
      setIsAuthenticated(false);
    }
  };

  // 3. FETCH DATA (Secure Server-Side API)
  const loadData = async () => {
    try {
      const res = await fetch("/api/super-admin/institutions");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSchools(data.schools || {});
          setAdmins(data.admins || {});
        }
      }
    } catch (err) {
      console.error("Failed to load super admin data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // 4. COMBINE DATA
  const combinedData = useMemo(() => {
    if (!schools || Object.keys(schools).length === 0) return [];
    const list = Object.entries(schools).map(([id, val]: [string, any]) => {
      // Find admin matching this institution code (case-insensitive)
      const adminEntry = Object.entries(admins || {}).find(([_, v]: [string, any]) => 
        (v.institutionCode || "").trim().toUpperCase() === id.trim().toUpperCase()
      );
      return {
        id, // This is the institutionCode (e.g., LPS)
        name: val.name,
        owner: val.owner,
        phone: val.phone,
        createdAt: val.createdAt,
        username: adminEntry ? (adminEntry[1] as any)?.username || adminEntry[0] : null,
        password: adminEntry ? (adminEntry[1] as any)?.password : null
      };
    });
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [schools, admins]);

  // --- ACTIONS ---

  // A. DELETE SCHOOL (Secure Server API)
  const deleteSchool = async (schoolId: string, schoolName: string, username: string) => {
    if (confirm(`⚠️ PERMANENTLY DELETE "${schoolName}"?\n\nThis will remove all branches, students, and login access.`)) {
        try {
            const res = await fetch("/api/super-admin/institutions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "delete_institution",
                    institutionId: schoolId,
                    username,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");
            alert("Deleted successfully.");
            loadData();
        } catch (error: any) {
            alert("Error deleting: " + (error?.message || error));
        }
    }
  };

  // B. EDIT SCHOOL INFO (Secure Server API)
  const openEditModal = (school: any) => {
      setEditingSchool(school);
      setEditForm({ name: school.name, owner: school.owner, phone: school.phone });
  };

  const saveSchoolInfo = async () => {
      if(!editingSchool) return;
      try {
          const res = await fetch("/api/super-admin/institutions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  action: "update_institution",
                  institutionId: editingSchool.id,
                  updates: {
                      name: editForm.name,
                      owner: editForm.owner,
                      phone: editForm.phone,
                  },
              }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "Failed to update");
          setEditingSchool(null);
          loadData();
      } catch (error: any) {
          alert("Failed to update: " + (error?.message || error));
      }
  };

  // C. CHANGE PASSWORD (Secure Server API)
  const openPassModal = (school: any) => {
      setResettingPassword(school);
      setPassForm(""); 
  };

  const saveNewPassword = async () => {
      if(!resettingPassword || !resettingPassword.username || !passForm.trim()) return;
      const targetUsername = resettingPassword.username.trim();
      const newPassword = passForm.trim();
      try {
          const res = await fetch("/api/super-admin/institutions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  action: "update_password",
                  username: targetUsername,
                  newPassword,
              }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "Failed to update password");
          setResettingPassword(null);
          alert("Password updated successfully!");
          loadData();
      } catch (error: any) {
          alert("Failed to update password: " + (error?.message || error));
      }
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

  const filteredSchools = combinedData.filter((s: any) => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (s.owner?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (s.id?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans relative">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-6">
                <h1 className="text-2xl font-black flex items-center gap-3 text-red-500"><ShieldAlert/> Super Admin</h1>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/')} className="bg-zinc-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition">Home</button>
                    <button onClick={handleLogout} className="bg-red-900/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-900/40 transition">Logout</button>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
                    <input placeholder="Search by name, owner, or code..." className="w-full bg-zinc-900 border border-zinc-800 pl-12 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition" onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-5">Coaching Details</th>
                                <th className="p-5">Credentials</th>
                                <th className="p-5 text-right">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredSchools.map((school: any) => (
                                <tr key={school.id} className="hover:bg-zinc-800/30 transition">
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-lg text-white">{school.name}</div>
                                            <span className="bg-black text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs font-mono">{school.id}</span>
                                        </div>
                                        <div className="text-zinc-500 mt-1">{school.owner} • {school.phone}</div>
                                    </td>
                                    <td className="p-5">
                                        {school.username ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2"><span className="text-zinc-500 text-xs w-8">ID:</span> <span className="text-blue-400 font-mono">{school.username}</span></div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-500 text-xs w-8">PW:</span> 
                                                    <span className="text-emerald-400 text-xs font-mono bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">Encrypted</span>
                                                </div>
                                            </div>
                                        ) : <span className="text-red-500 text-xs font-bold">No Admin</span>}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(school)} className="p-2 bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-900/40 transition shadow-sm" title="Edit Info"><Edit size={18}/></button>
                                            <button onClick={() => openPassModal(school)} className="p-2 bg-yellow-900/20 text-yellow-400 rounded-lg hover:bg-yellow-900/40 transition shadow-sm" title="Change Password"><Key size={18}/></button>
                                            <button onClick={() => deleteSchool(school.id, school.name, school.username)} className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 transition shadow-sm" title="Delete"><Trash2 size={18}/></button>
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
                        <button onClick={() => setEditingSchool(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700 transition">Cancel</button>
                        <button onClick={saveSchoolInfo} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition"><Save size={18}/> Save</button>
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
                        <button onClick={() => setResettingPassword(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700 transition">Cancel</button>
                        <button onClick={saveNewPassword} className="flex-1 py-3 bg-yellow-600 rounded-xl font-bold text-black hover:bg-yellow-500 flex items-center justify-center gap-2 transition"><Key size={18}/> Update</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
}