"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase"; 
import { doc, collection, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react"; 
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { 
  Plus, UserPlus, Users, Trash2, TrendingUp, X, Copy, 
  CheckCircle, PieChart, Sparkles, LayoutGrid, Search, ChevronRight,
  ArrowLeft, Share2, Download, LogOut, FileDown,
  Award, AlertTriangle, Activity, Edit, CheckSquare, IndianRupee, Bell
} from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed top-6 md:bottom-6 md:top-auto right-6 md:right-6 left-6 md:left-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 z-[100] border backdrop-blur-md ${
      type === "error" 
      ? "bg-red-900/90 text-red-100 border-red-800" 
      : "bg-zinc-900/90 text-white border-zinc-800"
    }`}
  >
    {type === "error" ? <X size={20} className="text-red-400"/> : <CheckCircle size={20} className="text-green-400"/>}
    <span className="font-bold text-sm">{message}</span>
  </motion.div>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-zinc-800/50 rounded-xl ${className}`} />
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
   
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [batchTab, setBatchTab] = useState("students"); 
   
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null); 
   
  const [showAllBatches, setShowAllBatches] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); 
  
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [showSelectBatchModal, setShowSelectBatchModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const [newBatchName, setNewBatchName] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newTest, setNewTest] = useState({ name: "", score: "" });

  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [editBatchName, setEditBatchName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsEditingBatch(false);
  }, [selectedBatch?.id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cleanUpOldHomework = async (batchId, assignments) => {
    if (!assignments || Object.keys(assignments).length === 0) return;
    
    const now = new Date();
    const FORTY_FIVE_DAYS = 45 * 24 * 60 * 60 * 1000;
    let needsUpdate = false;
    const updatedAssignments = { ...assignments };

    Object.keys(updatedAssignments).forEach(key => {
        const hwDate = new Date(updatedAssignments[key].createdAt);
        if (now - hwDate > FORTY_FIVE_DAYS) {
            delete updatedAssignments[key];
            needsUpdate = true;
        }
    });

    if (needsUpdate) {
        try {
            await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, batchId), {
                assignments: updatedAssignments
            });
        } catch (error) {
            console.error("Cleanup error:", error);
        }
    }
  };

  useEffect(() => {
    if (!user?.institutionCode) return;
    
    const fetchBatches = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, `institutions/${user.institutionCode}/batches`));
            const list = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                cleanUpOldHomework(docSnap.id, data.assignments);
                list.push({
                    id: docSnap.id,
                    ...data,
                    students: data.students || [],
                    assignments: data.assignments || {}
                });
            });
            list.sort((a, b) => a.name.localeCompare(b.name));
            setBatches(list);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
        setLoading(false);
    };

    fetchBatches();
  }, [user?.institutionCode]);

  useEffect(() => {
    if (!user?.institutionCode || !selectedBatch?.id) return;
    
    const batchDocRef = doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id);
    const unsub = onSnapshot(batchDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedBatch = {
                id: docSnap.id,
                ...data,
                students: data.students || [],
                assignments: data.assignments || {}
            };
            setSelectedBatch(updatedBatch);
            setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
            if (selectedStudent) {
                const updatedStudent = updatedBatch.students.find(s => s.id === selectedStudent.id);
                if (updatedStudent) setSelectedStudent(updatedStudent);
            }
        }
    });
    return () => unsub();
  }, [user?.institutionCode, selectedBatch?.id, selectedStudent?.id]);

  const globalFeeStats = useMemo(() => {
      let total = 0;
      let paid = 0;
      const currentYear = new Date().getFullYear();
      batches.forEach(b => {
          const students = b.students || [];
          total += students.length;
          students.forEach(s => {
              const fees = s.fees?.[currentYear] || {};
              const hasPaid = Object.values(fees).includes("paid");
              if(hasPaid) paid++;
          });
      });
      return { total, paid };
  }, [batches]);

  const createBatch = async () => {
    if (!newBatchName.trim() || !user?.institutionCode) return;
    const id = Date.now().toString();
    const newBatchData = { name: newBatchName, students: [], assignments: {} };
    
    await setDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, id), newBatchData);
    setBatches(prev => [...prev, { id, ...newBatchData }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewBatchName("");
    showToast("New batch created!");
  };

  const handleEditBatch = async () => {
    if (!editBatchName.trim() || !user?.institutionCode || !selectedBatch) return;
    try {
        await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
            name: editBatchName.trim()
        });
        showToast("Batch renamed successfully!");
        setIsEditingBatch(false);
    } catch (err) {
        showToast("Failed to rename batch", "error");
    }
  };

  const handleDeleteBatch = async () => {
    if (!user?.institutionCode || !selectedBatch) return;
    if (!confirm(`Are you sure you want to permanently delete the batch "${selectedBatch.name}"?`)) return;

    try {
        await deleteDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id));
        setBatches(prev => prev.filter(b => b.id !== selectedBatch.id));
        setSelectedBatch(null);
        showToast("Batch deleted successfully!");
    } catch (err) {
        showToast("Failed to delete batch", "error");
    }
  };

  const addStudent = async () => {
    if (!selectedBatch || !user?.institutionCode) return;
    if (!newStudent.name) {
        showToast("Enter a name!", "error");
        return;
    }
    const updatedStudents = [...(selectedBatch.students || []), {
      id: Date.now(),
      name: newStudent.name,
      phone: newStudent.phone || "N/A",
      fees: {},
      attendance: {},
      performance: 0,
      performanceHistory: []
    }];
    
    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedStudents
    });

    setNewStudent({ name: "", phone: "" });
    showToast("Student added successfully");
  };

  const saveTestScore = async () => {
    if (!selectedStudent || !selectedBatch || !newTest.name || !newTest.score || !user?.institutionCode) return;
    
    const updatedStudents = selectedBatch.students.map(s => {
        if (s.id === selectedStudent.id) {
            const history = s.performanceHistory || [];
            const updatedHistory = [...history, { 
                id: Date.now(), 
                name: newTest.name, 
                score: Number(newTest.score),
                date: new Date().toISOString() 
            }];
            const avg = Math.round(updatedHistory.reduce((acc, curr) => acc + curr.score, 0) / updatedHistory.length);
            
            return { ...s, performanceHistory: updatedHistory, performance: avg };
        }
        return s;
    });

    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedStudents
    });
    
    setNewTest({ name: "", score: "" });
    showToast("Test score added!");
  };

  const exportRealData = () => {
    if (!selectedBatch || !selectedBatch.students || selectedBatch.students.length === 0) {
        showToast("No students to export!", "error");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Phone,Performance Score\n";
    selectedBatch.students.forEach(s => {
        csvContent += `${s.id},"${s.name}","${s.phone}",${s.performance || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedBatch.name}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Student list downloaded!");
  };

  const openAnalytics = (student) => {
    setSelectedStudent(student);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/login?code=${user?.institutionCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    showToast("Login Link Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteStudent = async (studentId) => {
    if(!confirm("Are you sure you want to remove this student?")) return;
    const updatedList = selectedBatch.students.filter(s => s.id !== studentId);
    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedList
    });
    showToast("Student removed");
  };

  const downloadQR = () => {
    const svg = document.getElementById("magic-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${user?.institutionCode}-qrcode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("QR Code Downloaded");
  };

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

  const batchAnalytics = useMemo(() => {
      if (!selectedBatch || !selectedBatch.students || selectedBatch.students.length === 0) {
          return { average: 0, chartData: [], topPerformers: [], needsAttention: [] };
      }

      const validStudents = selectedBatch.students.filter(s => s.performance !== undefined);
      const totalScore = validStudents.reduce((acc, s) => acc + (s.performance || 0), 0);
      const average = validStudents.length > 0 ? Math.round(totalScore / validStudents.length) : 0;

      const chartData = validStudents.map(s => ({
          name: s.name.split(" ")[0], 
          score: s.performance || 0,
          fullName: s.name
      }));

      const sorted = [...validStudents].sort((a, b) => (b.performance || 0) - (a.performance || 0));
      const topPerformers = sorted.slice(0, 3);
      const needsAttention = sorted.filter(s => (s.performance || 0) < 40).slice(0, 5);

      return { average, chartData, topPerformers, needsAttention };
  }, [selectedBatch]);

  if (!mounted) return null;

  const magicLinkUrl = `${typeof window !== 'undefined' ? window.location.origin : ""}/login?code=${user?.institutionCode}`;

  return (
    <div className="min-h-screen bg-transparent md:bg-slate-50 md:dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 font-sans p-4 md:p-8">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="md:hidden relative w-full mx-auto bg-gradient-to-br from-indigo-500/10 to-blue-500/5 dark:from-indigo-900/30 dark:to-blue-900/20 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] p-6 mb-4 flex flex-row items-center justify-between overflow-hidden">
          
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl"></div>

          <div className="relative z-10 flex flex-col items-start w-[55%]">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Join Institute</h2>
            <h3 className="text-xl font-black text-zinc-800 dark:text-white leading-tight mt-1 mb-2">Institution Code</h3>
            
            <div className="bg-white/60 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/50 dark:border-zinc-700 font-mono font-black text-blue-600 dark:text-blue-400 shadow-inner w-full mb-3">
                {user?.institutionCode || "Loading..."}
            </div>

            <button onClick={() => setShowShareModal(true)} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                <Share2 size={14} /> Share Code
            </button>
          </div>

          <div className="relative z-10 w-[45%] flex justify-end h-full mt-2">
            <svg className="w-36 h-36 drop-shadow-2xl translate-x-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" fill="#E0E7FF" opacity="0.3" className="dark:opacity-10"/>
                <path d="M15 25 L20 30 M20 25 L15 30" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M85 30 L90 35 M90 30 L85 35" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="20" cy="65" r="3" fill="#60A5FA" />
                <circle cx="80" cy="60" r="2" fill="#818CF8" />
                <path d="M30 85 L70 85 L75 95 L25 95 Z" fill="#94A3B8" />
                <path d="M35 70 L65 70 L70 85 L30 85 Z" fill="#CBD5E1" />
                <path d="M35 85 C35 55 40 45 50 45 C60 45 65 55 65 85 Z" fill="#4F46E5"/>
                <path d="M40 85 L40 60 C40 55 60 55 60 60 L60 85 Z" fill="#4338CA"/>
                <circle cx="50" cy="35" r="16" fill="#FDE68A"/>
                <path d="M32 35 C32 15 68 15 68 35 C65 20 35 20 32 35 Z" fill="#1E293B"/>
                <path d="M38 18 C45 10 55 10 62 18 C58 22 42 22 38 18 Z" fill="#0F172A"/>
                <circle cx="44" cy="35" r="5" fill="white" stroke="#1E293B" strokeWidth="2"/>
                <circle cx="56" cy="35" r="5" fill="white" stroke="#1E293B" strokeWidth="2"/>
                <line x1="49" y1="35" x2="51" y2="35" stroke="#1E293B" strokeWidth="2"/>
                <line x1="34" y1="33" x2="39" y2="35" stroke="#1E293B" strokeWidth="2"/>
                <line x1="66" y1="33" x2="61" y2="35" stroke="#1E293B" strokeWidth="2"/>
                <path d="M47 43 Q50 46 53 43" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="md:hidden grid grid-cols-3 gap-3 mb-6 relative z-10">
            <button onClick={() => setShowAllBatches(true)} className="flex flex-col items-center justify-center gap-2.5 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-[1.5rem] shadow-sm hover:scale-105 transition">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Users size={20}/></div>
                <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300 text-center leading-tight">View<br/>Batches</span>
            </button>
            <Link href="/dashboard/notices" className="flex flex-col items-center justify-center gap-2.5 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-[1.5rem] shadow-sm hover:scale-105 transition">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center"><Bell size={20}/></div>
                <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300 text-center leading-tight">Send<br/>Notice</span>
            </Link>
            <Link href="/dashboard/attendance" className="flex flex-col items-center justify-center gap-2.5 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-[1.5rem] shadow-sm hover:scale-105 transition">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center"><CheckSquare size={20}/></div>
                <span className="text-[10px] font-black uppercase text-zinc-700 dark:text-zinc-300 text-center leading-tight">Mark<br/>Attend</span>
            </Link>
        </div>

        {!selectedBatch && (
            <div className="md:hidden bg-white/50 dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-white/50 dark:border-zinc-800 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-zinc-700 dark:text-zinc-300 text-lg flex items-center gap-2">
                        <IndianRupee size={20} className="text-green-500"/> Fee Overview
                    </h2>
                    <button onClick={() => setShowAllBatches(true)} className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:scale-105 transition">
                        View Batches
                    </button>
                </div>
                
                <div className="flex gap-4">
                    <div className="flex-1 bg-white dark:bg-black p-4 rounded-2xl shadow-inner border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-zinc-800 dark:text-white">{globalFeeStats.total}</div>
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Total Students</div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-black p-4 rounded-2xl shadow-inner border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-green-600 dark:text-green-400">{globalFeeStats.paid}</div>
                        <div className="text-[10px] uppercase font-bold text-zinc-500 mt-1">Fees Paid</div>
                    </div>
                </div>
            </div>
        )}

        {/* DESKTOP BANNER: Moved to Top Since Header is Gone */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
            className={`bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/10 flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden hidden md:flex`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex-1 relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-300 fill-yellow-300"/> Institution Code
              </h2>
              <p className="text-blue-100 text-sm mt-1 max-w-lg font-medium">
                  Students can join using code: <strong className="bg-black/30 px-2 py-1 rounded text-white">{user?.institutionCode}</strong>
              </p>
          </div>

          <div className="flex gap-2 relative z-10 w-full md:w-auto">
              <div className="flex-1 md:flex-none flex bg-black/30 backdrop-blur-md rounded-2xl p-1.5 items-center border border-white/10">
                  <code className="flex-1 px-4 py-2 text-xs md:text-sm font-mono text-white/90 truncate max-w-[150px] md:max-w-xs">
                     {user?.institutionCode}
                  </code>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={copyLink} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition flex items-center gap-2 shadow-sm">
                      {copied ? <CheckCircle size={14}/> : <Copy size={14}/>} 
                      <span className="hidden sm:inline">{copied ? "Copied Link" : "Copy Link"}</span>
                  </motion.button>
              </div>

              <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowShareModal(true)} 
                className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-2xl font-bold text-sm hover:bg-yellow-300 transition flex items-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                  <Share2 size={18}/> <span className="hidden sm:inline">Share</span>
              </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} 
            className={`bg-white/50 dark:bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-white/50 dark:border-zinc-800 h-fit ${selectedBatch ? 'hidden lg:block' : 'hidden md:block'}`}
          >
            <h2 className="font-bold text-zinc-700 dark:text-zinc-300 mb-4 text-lg flex items-center gap-2">
                <Users size={20}/> Batches
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input 
                value={newBatchName} 
                onChange={e => setNewBatchName(e.target.value)}
                placeholder="New Batch..." 
                className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-zinc-800 dark:text-zinc-200"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={createBatch} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                <Plus size={20} />
              </motion.button>
            </div>

            <div className="space-y-2">
              {loading ? (
                  <>
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-24"/><Skeleton className="h-6 w-8 rounded-full"/></div>
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-32"/><Skeleton className="h-6 w-8 rounded-full"/></div>
                  </>
              ) : batches.length > 0 ? (
                  <>
                    {batches.slice(0, 5).map(batch => (
                        <motion.div 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        key={batch.id} 
                        onClick={() => { setSelectedBatch(batch); setBatchTab("students"); }}
                        className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-200 ${
                            selectedBatch?.id === batch.id 
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 border shadow-sm" 
                            : "hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-transparent"
                        }`}
                        >
                        <span className="font-bold text-sm">{batch.name}</span>
                        <span className="text-xs bg-white dark:bg-black px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-800 text-zinc-500 font-bold shadow-sm">
                            {batch.students?.length || 0}
                        </span>
                        </motion.div>
                    ))}
                    {batches.length > 5 && (
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAllBatches(true)}
                            className="w-full py-3 mt-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition flex items-center justify-center gap-1"
                        >
                            View All {batches.length} Batches <ChevronRight size={16}/>
                        </motion.button>
                    )}
                  </>
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl">
                      <p className="text-zinc-500 dark:text-zinc-600 text-sm font-medium">No batches yet.</p>
                  </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} 
            className="lg:col-span-2"
          >
            {selectedBatch ? (
              <div className="bg-white/50 dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-white/50 dark:border-zinc-800 min-h-[500px] flex flex-col">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-gray-200 dark:border-zinc-800 gap-4">
                  <div className="flex items-start gap-4">
                    <button 
                        onClick={() => setSelectedBatch(null)} 
                        className="lg:hidden mt-1 p-2 -ml-2 text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white rounded-full transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        {isEditingBatch ? (
                            <div className="flex items-center gap-3 mb-1">
                                <input 
                                    value={editBatchName} 
                                    onChange={e => setEditBatchName(e.target.value)}
                                    className="bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 py-1.5 px-3 rounded-xl text-2xl md:text-3xl font-black text-black dark:text-white outline-none focus:border-blue-500 transition-colors w-full md:w-auto"
                                    autoFocus
                                />
                                <button onClick={handleEditBatch} className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg transition" title="Save">
                                    <CheckCircle size={20}/>
                                </button>
                                <button onClick={() => setIsEditingBatch(false)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg transition" title="Cancel">
                                    <X size={20}/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl md:text-3xl font-black text-zinc-800 dark:text-white flex items-center gap-2">
                                    {selectedBatch.name}
                                </h2>
                                <div className="flex gap-1">
                                    <button onClick={() => setShowAddStudentModal(true)} className="md:hidden text-zinc-500 hover:text-green-500 dark:hover:text-green-400 p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition" title="Add Student">
                                        <UserPlus size={18}/>
                                    </button>
                                    <button onClick={() => { setEditBatchName(selectedBatch.name); setIsEditingBatch(true); }} className="text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="Rename Batch">
                                        <Edit size={18}/>
                                    </button>
                                    <button onClick={handleDeleteBatch} className="text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete Batch">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-white dark:bg-black px-3 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-1">
                             <LayoutGrid size={12} className="text-blue-500" /> ID: {selectedBatch.id.slice(-6)}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-white dark:bg-black px-3 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-1">
                             <Users size={12} className="text-green-500" /> {selectedBatch.students?.length || 0} Students
                          </span>
                        </div>
                    </div>
                  </div>
                  
                  {batchTab === "students" && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-3 text-zinc-500"/>
                            <input 
                                placeholder="Search student..." 
                                className="pl-9 pr-4 py-2.5 w-full bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors text-zinc-800 dark:text-zinc-200"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={exportRealData}
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-2 border border-gray-300 dark:border-zinc-700"
                        >
                            <FileDown size={16}/> Export
                        </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 border-b border-gray-200 dark:border-zinc-800 mb-8 overflow-x-auto custom-scrollbar pb-1">
                    {[
                        { id: "students", label: "Students List", icon: <Users size={18}/>, color: "text-blue-600 dark:text-blue-500", border: "border-blue-500" },
                        { id: "analytics", label: "Batch Analytics", icon: <Activity size={18}/>, color: "text-purple-600 dark:text-purple-500", border: "border-purple-500" }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setBatchTab(tab.id)} 
                            className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap rounded-t-xl ${
                                batchTab === tab.id 
                                ? `${tab.color} ${tab.border} bg-gray-50 dark:bg-zinc-800/50` 
                                : "text-zinc-500 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/30"
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {batchTab === "students" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        
                        <div className="hidden md:flex flex-col gap-3 mb-6 bg-white dark:bg-black p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <UserPlus size={18} className="absolute left-4 top-3.5 text-zinc-500"/>
                                    <input 
                                        placeholder="Student Name" 
                                        className="w-full pl-11 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium text-zinc-800 dark:text-zinc-200"
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                                    />
                                </div>
                                <input 
                                    placeholder="Phone Number" 
                                    className="w-full md:w-48 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium text-zinc-800 dark:text-zinc-200"
                                    value={newStudent.phone}
                                    onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                                />
                                <motion.button whileTap={{ scale: 0.95 }} onClick={addStudent} className="bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg">
                                    Add Student
                                </motion.button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm mt-4 md:mt-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 dark:bg-zinc-950 text-zinc-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-5 whitespace-nowrap">Student Name</th>
                                    <th className="p-5 whitespace-nowrap hidden sm:table-cell">Contact Info</th>
                                    <th className="p-5 whitespace-nowrap">Performance</th>
                                    <th className="p-5 text-right whitespace-nowrap">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50 bg-white dark:bg-zinc-900/50">
                                <AnimatePresence>
                                {filteredStudents.map((student, i) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.03 }}
                                        key={student.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-colors duration-200"
                                    >
                                    <td className="p-5 font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/60 dark:to-purple-900/60 border border-blue-200 dark:border-blue-800/30 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-black shadow-inner shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] tracking-tight">{student.name}</span>
                                            <span className="sm:hidden text-xs text-zinc-500 font-medium mt-0.5">{student.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-zinc-500 dark:text-zinc-400 font-mono font-medium hidden sm:table-cell">{student.phone}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide border shadow-sm ${
                                            !student.performance ? "bg-gray-100 dark:bg-zinc-900 text-zinc-500 border-gray-200 dark:border-zinc-800" 
                                            : student.performance >= 80 ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50" 
                                            : student.performance >= 50 ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50" 
                                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                                        }`}>
                                            {student.performance || 0}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                        <button onClick={() => openAnalytics(student)} className="text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/30 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm" title="Manage Analytics">
                                                <TrendingUp size={18}/>
                                        </button>
                                        <button onClick={() => deleteStudent(student.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm" title="Remove Student">
                                                <Trash2 size={18}/>
                                        </button>
                                        </div>
                                    </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                                {filteredStudents.length === 0 && (
                                    <tr><td colSpan="4" className="p-16 text-center text-zinc-500 font-medium bg-gray-50 dark:bg-zinc-900/30 border-dashed">No students found in this batch.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {batchTab === "analytics" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 text-zinc-500"><Activity size={64}/></div>
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Batch Average</h3>
                                <div className="text-5xl font-black text-zinc-800 dark:text-white flex items-baseline gap-1">
                                    {batchAnalytics.average}<span className="text-2xl text-zinc-400 dark:text-zinc-600">%</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20 text-zinc-500"><Users size={64}/></div>
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Students</h3>
                                <div className="text-5xl font-black text-zinc-800 dark:text-white">
                                    {selectedBatch.students?.length || 0}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-black p-6 rounded-[1.5rem] border border-red-200 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20"><AlertTriangle className="text-red-500" size={64}/></div>
                                <h3 className="text-red-500 dark:text-red-400/80 text-xs font-bold uppercase tracking-widest mb-2">Needs Attention</h3>
                                <div className="text-5xl font-black text-red-600 dark:text-white">
                                    {batchAnalytics.needsAttention.length}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-gray-50 dark:bg-zinc-900/80 p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm h-[400px] flex flex-col">
                                <h3 className="font-bold text-lg text-zinc-800 dark:text-white mb-6 flex items-center gap-2"><PieChart size={18} className="text-purple-500"/> Performance Distribution</h3>
                                <div className="flex-1 w-full min-h-0">
                                    {batchAnalytics.chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={batchAnalytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} className="dark:stroke-[#27272a]" />
                                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                <Tooltip 
                                                    cursor={{fill: '#e4e4e7', opacity: 0.4}}
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '16px', color: '#fff', padding: '12px' }}
                                                    itemStyle={{ color: '#a855f7', fontWeight: '900' }}
                                                    formatter={(value) => [`${value}%`, 'Score']}
                                                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}
                                                />
                                                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                                    {batchAnalytics.chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#22c55e' : entry.score >= 50 ? '#eab308' : '#ef4444'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl text-zinc-500 font-medium">
                                            No test data available for visualization.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-500"/> Top Performers</h3>
                                    <div className="space-y-3">
                                        {batchAnalytics.topPerformers.length > 0 ? batchAnalytics.topPerformers.map((student, i) => (
                                            <div key={student.id} className="flex justify-between items-center bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500' : i === 1 ? 'bg-gray-200 dark:bg-zinc-400/20 text-gray-600 dark:text-zinc-300' : 'bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500'}`}>{i + 1}</span>
                                                    <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200 truncate max-w-[120px]">{student.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-green-500 dark:text-green-400">{student.performance}%</span>
                                            </div>
                                        )) : (
                                            <p className="text-zinc-500 text-sm italic">Not enough data.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500"/> Quick Insights</h3>
                                    <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-zinc-800 dark:text-white">{batchAnalytics.chartData.filter(d => d.score >= 80).length} students</strong> are excelling (Score &gt; 80%).</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-zinc-800 dark:text-white">{batchAnalytics.chartData.filter(d => d.score >= 50 && d.score < 80).length} students</strong> are performing averagely.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-zinc-800 dark:text-white">{batchAnalytics.needsAttention.length} students</strong> are at risk (Score &lt; 40%) and require intervention.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

              </div>
            ) : (
              <div className="h-full hidden md:flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-zinc-800 text-zinc-500 p-10 min-h-[500px]">
                <div className="bg-gray-200 dark:bg-zinc-800 p-6 rounded-full mb-5 shadow-inner">
                  <LayoutGrid size={48} className="opacity-30 dark:opacity-30 text-gray-500 dark:text-white"/>
                </div>
                <p className="font-black text-xl text-zinc-600 dark:text-zinc-400">Select a batch to manage</p>
                <p className="text-sm font-medium mt-2">or create a completely new one from the sidebar.</p>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
        {showCreateBatchModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-white flex items-center gap-2"><LayoutGrid size={20} className="text-blue-500"/> Create New Batch</h3>
                        <button onClick={() => setShowCreateBatchModal(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition text-zinc-500 dark:text-zinc-400"><X size={20}/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input 
                            value={newBatchName} 
                            onChange={e => setNewBatchName(e.target.value)}
                            placeholder="Enter Batch Name..." 
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium text-zinc-800 dark:text-zinc-200"
                            autoFocus
                        />
                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => { createBatch(); setShowCreateBatchModal(false); }} 
                            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                        >
                            Create Batch
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showAddStudentModal && selectedBatch && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black text-zinc-800 dark:text-white flex items-center gap-2"><UserPlus size={20} className="text-green-500"/> Add Student</h3>
                            <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider">{selectedBatch.name}</p>
                        </div>
                        <button onClick={() => setShowAddStudentModal(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition text-zinc-500 dark:text-zinc-400"><X size={20}/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input 
                            placeholder="Student Full Name" 
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl text-sm outline-none focus:border-green-500 transition-colors font-medium text-zinc-800 dark:text-zinc-200"
                            value={newStudent.name}
                            onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                            autoFocus
                        />
                        <input 
                            placeholder="Phone Number (Optional)" 
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 p-4 rounded-xl text-sm outline-none focus:border-green-500 transition-colors font-medium text-zinc-800 dark:text-zinc-200"
                            value={newStudent.phone}
                            onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                        />
                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => { addStudent(); setShowAddStudentModal(false); }} 
                            className="w-full bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/30"
                        >
                            Save Student
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showSelectBatchModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-gray-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-white">Select Batch to Add Student</h3>
                        <button onClick={() => setShowSelectBatchModal(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition text-zinc-500 dark:text-zinc-400"><X size={20}/></button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                        {batches.map(batch => (
                            <motion.button 
                                key={batch.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { 
                                    setSelectedBatch(batch); 
                                    setBatchTab("students"); 
                                    setShowSelectBatchModal(false); 
                                    setTimeout(() => setShowAddStudentModal(true), 200);
                                }}
                                className="w-full p-4 rounded-2xl flex justify-between items-center transition-all bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent shadow-sm"
                            >
                                <span className="font-bold">{batch.name}</span>
                                <span className="text-xs bg-white dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-bold shadow-sm">{batch.students?.length || 0} Students</span>
                            </motion.button>
                        ))}
                        {batches.length === 0 && (
                            <div className="text-center py-8 text-zinc-500 font-medium">
                                No batches exist. Please create one first!
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showShareModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative border border-gray-200 dark:border-zinc-800">
                    <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-500 transition z-10"><X size={20}/></button>
                    
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Share2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Share Access</h3>
                        <p className="text-zinc-500 text-sm mb-6">Scan to join using code <strong>{user?.institutionCode}</strong>.</p>
                        
                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-700 shadow-sm mb-6">
                             <QRCodeSVG value={magicLinkUrl} size={200} level={"H"} includeMargin={true} id="magic-qr" />
                        </div>

                        <div className="w-full bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-2 mb-4">
                             <code className="text-xs flex-1 truncate text-left text-zinc-600 dark:text-zinc-400 font-mono">{magicLinkUrl}</code>
                             <button onClick={copyLink} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg transition text-blue-600 dark:text-blue-500">
                                {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                             </button>
                        </div>

                        <button onClick={downloadQR} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                            <Download size={18} /> Download QR Code
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showAllBatches && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-gray-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center gap-4">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-white flex-1">All Batches ({batches.length})</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowCreateBatchModal(true)} className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:scale-110 transition shadow-sm">
                                <Plus size={20}/>
                            </button>
                            <button onClick={() => setShowAllBatches(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition text-zinc-500 dark:text-zinc-400">
                                <X size={20}/>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                        {batches.map(batch => (
                            <motion.button 
                                key={batch.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedBatch(batch); setBatchTab("students"); setShowAllBatches(false); }}
                                className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${
                                    selectedBatch?.id === batch.id 
                                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400" 
                                    : "bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent shadow-sm"
                                }`}
                            >
                                <span className="font-bold">{batch.name}</span>
                                <span className="text-xs bg-white dark:bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-bold shadow-sm">{batch.students?.length || 0} Students</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-6 text-white flex justify-between items-start shadow-inner">
                      <div>
                          <h3 className="text-3xl font-black tracking-tight">{selectedStudent.name}</h3>
                          <p className="text-blue-100 text-sm font-medium mt-1 bg-black/20 inline-block px-3 py-1 rounded-full">{selectedStudent.phone}</p>
                      </div>
                      <button onClick={() => setSelectedStudent(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                  </div>
                   
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-200 dark:border-green-800/30 text-center">
                              <div className="text-4xl font-black text-green-600 dark:text-green-400">{getStats(selectedStudent).attPercent}%</div>
                              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Attendance Record</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-800/30 text-center">
                              <div className="text-4xl font-black text-orange-600 dark:text-orange-400">{getStats(selectedStudent).paidMonths}</div>
                              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Paid Months</div>
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-black p-6 rounded-[1.5rem] border border-gray-200 dark:border-zinc-800 shadow-sm">
                          <label className="block text-sm font-bold text-zinc-800 dark:text-white mb-4 flex items-center gap-2">
                              <TrendingUp size={18} className="text-blue-500"/> Register New Test Result
                          </label>
                          <div className="flex gap-2 items-center mb-4">
                              <input 
                                  type="text" 
                                  placeholder="Test Identifier (e.g., Midterms)"
                                  value={newTest.name}
                                  onChange={e => setNewTest({...newTest, name: e.target.value})}
                                  className="flex-1 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 p-3.5 rounded-xl text-sm outline-none focus:border-blue-500 text-zinc-800 dark:text-white transition-colors"
                              />
                              <input 
                                  type="number" 
                                  placeholder="Score %"
                                  min="0" max="100"
                                  value={newTest.score}
                                  onChange={e => setNewTest({...newTest, score: e.target.value})}
                                  className="w-24 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 p-3.5 rounded-xl text-sm text-center outline-none focus:border-blue-500 text-zinc-800 dark:text-white transition-colors font-bold"
                              />
                          </div>
                          <motion.button whileTap={{ scale: 0.98 }} onClick={saveTestScore} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-500/20">
                              Save to Performance History
                          </motion.button>

                          {selectedStudent.performanceHistory && selectedStudent.performanceHistory.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
                                  <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Recorded Academic History</h4>
                                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      {selectedStudent.performanceHistory.map((test, index) => (
                                          <div key={test.id} className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-4 rounded-[1rem] border border-gray-200 dark:border-zinc-800/80">
                                              <div className="flex gap-3 items-center">
                                                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">{index + 1}</div>
                                                  <div>
                                                      <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{test.name}</p>
                                                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">{new Date(test.date).toLocaleDateString()}</p>
                                                  </div>
                                              </div>
                                              <div className={`px-3 py-1 rounded-lg text-sm font-black border ${
                                                  test.score >= 80 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                                                  : test.score >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50'
                                                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
                                              }`}>
                                                  {test.score}%
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}