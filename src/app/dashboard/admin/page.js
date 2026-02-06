"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react"; // IMPORTED QR CODE
import { 
  Plus, UserPlus, Users, Trash2, TrendingUp, X, Copy, 
  CheckCircle, PieChart, Sun, Moon, Sparkles, LayoutGrid, Search, ChevronRight,
  ArrowLeft, Share2, Download // ADDED Share2 and Download
} from "lucide-react";

// --- SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800/50 rounded-xl ${className}`} />
);

export default function AdminDashboard() {
  const { user } = useAuth();
   
  // --- STATE ---
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
   
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
   
  // Modals & UI
  const [showAllBatches, setShowAllBatches] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); // NEW STATE FOR SHARE MODAL
  const [newBatchName, setNewBatchName] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });
  const [performanceScore, setPerformanceScore] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("eduSmartTheme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("eduSmartTheme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  // --- FETCH DATA ---
  useEffect(() => {
    if (user?.schoolId) {
      const batchRef = ref(db, `schools/${user.schoolId}/batches`);
      return onValue(batchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data)
            .map(([id, val]) => ({
              id,
              ...val,
              students: val.students || []
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setBatches(list);
           
          if (selectedBatch) {
            const updated = list.find(b => b.id === selectedBatch.id);
            if (updated) setSelectedBatch(updated);
            if (selectedStudent) {
                const updatedStudent = updated.students.find(s => s.id === selectedStudent.id);
                if (updatedStudent) setSelectedStudent(updatedStudent);
            }
          }
        }
        setLoading(false); 
      });
    } else {
        setLoading(false);
    }
  }, [user, selectedBatch?.id, selectedStudent?.id]);

  // --- ACTIONS ---
  const createBatch = () => {
    if (!newBatchName.trim()) return;
    const id = Date.now().toString();
    set(ref(db, `schools/${user.schoolId}/batches/${id}`), {
      id,
      name: newBatchName,
      students: []
    });
    setNewBatchName("");
  };

  const addStudent = () => {
    if (!selectedBatch || !newStudent.name) return;
    const updatedStudents = [...(selectedBatch.students || []), {
      id: Date.now(),
      name: newStudent.name,
      phone: newStudent.phone,
      fees: {},
      attendance: {},
      performance: 0 
    }];
    set(ref(db, `schools/${user.schoolId}/batches/${selectedBatch.id}/students`), updatedStudents);
    setNewStudent({ name: "", phone: "" });
  };

  const savePerformance = () => {
    if (!selectedStudent || !selectedBatch) return;
    const studentIndex = selectedBatch.students.findIndex(s => s.id === selectedStudent.id);
    if (studentIndex === -1) return;
    const path = `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${studentIndex}/performance`;
    set(ref(db, path), Number(performanceScore));
    setSelectedStudent(null);
  };

  const openAnalytics = (student) => {
    setSelectedStudent(student);
    setPerformanceScore(student.performance || 0);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/?schoolId=${user.schoolId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteStudent = (studentId) => {
    if(!confirm("Remove this student?")) return;
    const updatedList = selectedBatch.students.filter(s => s.id !== studentId);
    set(ref(db, `schools/${user.schoolId}/batches/${selectedBatch.id}/students`), updatedList);
  };

  // --- DOWNLOAD QR FUNCTION ---
  const downloadQR = () => {
    const svg = document.getElementById("magic-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${user?.schoolId}-qrcode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CALCULATIONS ---
  const getStats = (student) => {
    const totalDays = Object.keys(student.attendance || {}).length;
    const present = Object.values(student.attendance || {}).filter(v => v === "present").length;
    const attPercent = totalDays ? Math.round((present / totalDays) * 100) : 0;
    const currentYear = new Date().getFullYear();
    const paidMonths = Object.values(student.fees?.[currentYear] || {}).filter(v => v === "paid").length;
    return { attPercent, paidMonths };
  };

  const filteredStudents = selectedBatch?.students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  ) || [];

  if (!mounted) return null;

  const magicLinkUrl = `${typeof window !== 'undefined' ? window.location.origin : ""}/?schoolId=${user?.schoolId}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-zinc-100' : 'bg-slate-50 text-slate-900'} font-sans p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedBatch ? 'hidden md:flex' : 'flex'}`}
        >
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <LayoutGrid className="text-blue-600" /> Admin Dashboard
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Manage your institute efficiently</p>
            </div>
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition"
            >
                {theme === 'light' ? <Moon size={18} className="text-slate-600"/> : <Sun size={18} className="text-orange-400"/>}
                <span className="text-xs font-bold uppercase tracking-wider">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </motion.button>
        </motion.div>
        
        {/* MAGIC LINK CARD - Now with "Share" button */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
            className={`bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/20 flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden ${selectedBatch ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex-1 relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-300 fill-yellow-300"/> Magic Access Link
              </h2>
              <p className="text-blue-100 text-sm mt-1 max-w-lg font-medium">
                  Use this link to connect students instantly to <strong>{user?.username}'s Coaching</strong>.
              </p>
          </div>

          <div className="flex gap-2 relative z-10 w-full md:w-auto">
              <div className="flex-1 md:flex-none flex bg-black/20 backdrop-blur-md rounded-2xl p-1.5 items-center border border-white/10">
                  <code className="flex-1 px-4 py-2 text-xs md:text-sm font-mono text-white/90 truncate max-w-[150px] md:max-w-xs">
                     {typeof window !== 'undefined' ? window.location.host : "..."}/?schoolId=...
                  </code>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={copyLink} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition flex items-center gap-2 shadow-sm">
                      {copied ? <CheckCircle size={14}/> : <Copy size={14}/>} 
                      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </motion.button>
              </div>

              {/* SHARE BUTTON - OPENS MODAL */}
              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowShareModal(true)} 
                className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-2xl font-bold text-sm hover:bg-yellow-300 transition flex items-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                  <Share2 size={18}/> <span className="hidden sm:inline">Share & QR</span>
              </motion.button>
          </div>
        </motion.div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          
          {/* LEFT SIDEBAR: BATCHES */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} 
            className={`bg-white dark:bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 h-fit ${selectedBatch ? 'hidden lg:block' : 'block'}`}
          >
            <h2 className="font-bold text-slate-700 dark:text-zinc-300 mb-4 text-lg flex items-center gap-2">
                <Users size={20}/> Batches
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input 
                value={newBatchName} 
                onChange={e => setNewBatchName(e.target.value)}
                placeholder="New Batch..." 
                className="flex-1 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={createBatch} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                <Plus size={20} />
              </motion.button>
            </div>

            <div className="space-y-2">
              {loading ? (
                  <>
                    <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-24"/><Skeleton className="h-6 w-8 rounded-full"/></div>
                    <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-32"/><Skeleton className="h-6 w-8 rounded-full"/></div>
                  </>
              ) : batches.length > 0 ? (
                  <>
                    {batches.slice(0, 3).map(batch => (
                        <motion.div 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        key={batch.id} 
                        onClick={() => setSelectedBatch(batch)}
                        className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-200 ${
                            selectedBatch?.id === batch.id 
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 border shadow-sm" 
                            : "hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-transparent"
                        }`}
                        >
                        <span className="font-bold text-sm">{batch.name}</span>
                        <span className="text-xs bg-white dark:bg-black px-2.5 py-1 rounded-full border border-slate-100 dark:border-zinc-800 text-slate-400 font-bold shadow-sm">
                            {batch.students.length}
                        </span>
                        </motion.div>
                    ))}
                    {batches.length > 3 && (
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAllBatches(true)}
                            className="w-full py-3 mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition flex items-center justify-center gap-1"
                        >
                            View All {batches.length} Batches <ChevronRight size={16}/>
                        </motion.button>
                    )}
                  </>
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                      <p className="text-slate-400 text-sm font-medium">No batches yet.</p>
                  </div>
              )}
            </div>
          </motion.div>

          {/* MAIN CONTENT: STUDENT LIST */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} 
            className={`lg:col-span-2 ${selectedBatch ? 'block' : 'hidden lg:block'}`}
          >
            {selectedBatch ? (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 min-h-[500px] flex flex-col">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800 gap-4">
                  <div className="flex items-center">
                    <button 
                        onClick={() => setSelectedBatch(null)} 
                        className="lg:hidden mr-3 p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            {selectedBatch.name}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">Manage students details & scores</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                      <div className="relative flex-1 md:flex-none">
                          <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                          <input 
                            placeholder="Search..." 
                            className="pl-9 pr-4 py-2 w-full md:w-32 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center">
                          Active
                      </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-50 dark:bg-black p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <div className="relative flex-1">
                      <UserPlus size={18} className="absolute left-3 top-3.5 text-slate-400"/>
                      <input 
                        placeholder="Student Name" 
                        className="w-full pl-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium"
                        value={newStudent.name}
                        onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                      />
                  </div>
                  <input 
                    placeholder="Phone Number" 
                    className="w-full md:w-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium"
                    value={newStudent.phone}
                    onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                  />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={addStudent} className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg">
                    Add
                  </motion.button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500 font-bold uppercase text-xs">
                      <tr>
                        <th className="p-4 whitespace-nowrap">Student Name</th>
                        <th className="p-4 whitespace-nowrap hidden sm:table-cell">Contact</th>
                        <th className="p-4 whitespace-nowrap">Score</th>
                        <th className="p-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      <AnimatePresence>
                      {filteredStudents.map((student, i) => (
                        <motion.tr 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.05 }}
                            key={student.id} 
                            className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition"
                        >
                          <td className="p-4 font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                                  {student.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span>{student.name}</span>
                                <span className="sm:hidden text-xs text-slate-400 font-normal">{student.phone}</span>
                              </div>
                          </td>
                          <td className="p-4 text-slate-500 font-mono font-medium hidden sm:table-cell">{student.phone}</td>
                          <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                !student.performance ? "bg-slate-100 dark:bg-zinc-800 text-slate-400" 
                                : student.performance >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                                : student.performance >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" 
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              }`}>
                                  {student.performance || 0}%
                              </span>
                          </td>
                          <td className="p-4 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => openAnalytics(student)} className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 p-2 rounded-xl transition" title="Analytics">
                                    <TrendingUp size={18}/>
                               </button>
                               <button onClick={() => deleteStudent(student.id)} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 p-2 rounded-xl transition" title="Remove">
                                    <Trash2 size={18}/>
                               </button>
                             </div>
                          </td>
                        </motion.tr>
                      ))}
                      </AnimatePresence>
                      {filteredStudents.length === 0 && (
                        <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-medium">No students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 p-10">
                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-full mb-4">
                  <LayoutGrid size={48} className="opacity-20"/>
                </div>
                <p className="font-bold text-lg">Select a batch to manage</p>
                <p className="text-sm opacity-60">or create a new one from the sidebar</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* --- MODALS --- */}

        {/* 1. SHARE & QR MODAL (NEW) */}
        <AnimatePresence>
        {showShareModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
                    <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-zinc-800 rounded-full hover:bg-red-50 hover:text-red-500 transition z-10"><X size={20}/></button>
                    
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Share2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Share Access</h3>
                        <p className="text-slate-500 text-sm mb-6">Scan to join <strong>{user?.username}</strong>'s classroom.</p>
                        
                        {/* QR CODE DISPLAY */}
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 dark:border-zinc-700 shadow-sm mb-6">
                             <QRCodeSVG 
                                id="magic-qr"
                                value={magicLinkUrl} 
                                size={200}
                                level={"H"}
                                includeMargin={true}
                             />
                        </div>

                        {/* COPY LINK */}
                        <div className="w-full bg-slate-50 dark:bg-black p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center gap-2 mb-4">
                             <code className="text-xs flex-1 truncate text-left text-slate-600 dark:text-zinc-400 font-mono">
                                {magicLinkUrl}
                             </code>
                             <button onClick={copyLink} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition text-blue-600">
                                {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                             </button>
                        </div>

                        {/* DOWNLOAD BUTTON */}
                        <button 
                            onClick={downloadQR}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                        >
                            <Download size={18} /> Download QR Code
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* 2. ALL BATCHES MODAL */}
        <AnimatePresence>
        {showAllBatches && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-black">All Batches ({batches.length})</h3>
                        <button onClick={() => setShowAllBatches(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition"><X size={20}/></button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                        {batches.map(batch => (
                            <motion.button 
                                key={batch.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedBatch(batch); setShowAllBatches(false); }}
                                className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${
                                    selectedBatch?.id === batch.id 
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400" 
                                    : "bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-transparent"
                                }`}
                            >
                                <span className="font-bold">{batch.name}</span>
                                <span className="text-xs bg-white dark:bg-zinc-900 px-3 py-1 rounded-full text-slate-500 font-bold shadow-sm">{batch.students.length} Students</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* 3. ANALYTICS MODAL */}
        <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
                  <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-2xl font-black">{selectedStudent.name}</h3>
                          <p className="text-blue-100 text-sm opacity-80 font-medium">{selectedStudent.phone}</p>
                      </div>
                      <button onClick={() => setSelectedStudent(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                  </div>
                   
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                              <div className="text-3xl font-black text-slate-800 dark:text-white">{getStats(selectedStudent).attPercent}%</div>
                              <div className="text-xs text-green-700 dark:text-green-400 font-bold uppercase mt-1">Attendance</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800 text-center">
                              <div className="text-3xl font-black text-slate-800 dark:text-white">{getStats(selectedStudent).paidMonths}</div>
                              <div className="text-xs text-orange-700 dark:text-orange-400 font-bold uppercase mt-1">Months Paid</div>
                          </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-black p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                          <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                              <PieChart size={18} className="text-blue-500"/> Update Score
                          </label>
                          <div className="flex gap-4 items-center mb-4">
                              <input 
                                  type="number" 
                                  min="0" max="100"
                                  value={performanceScore}
                                  onChange={e => setPerformanceScore(e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 p-3 rounded-xl text-2xl font-black text-center focus:border-blue-500 outline-none transition-all"
                              />
                              <span className="text-2xl font-black text-slate-300 dark:text-zinc-700">%</span>
                          </div>
                          <input 
                              type="range" min="0" max="100" 
                              value={performanceScore} 
                              onChange={e => setPerformanceScore(e.target.value)}
                              className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                      </div>

                      <motion.button whileTap={{ scale: 0.98 }} onClick={savePerformance} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg text-lg">
                          Save Updates
                      </motion.button>
                  </div>
              </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}