// src/app/dashboard/admin/page.js
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase"; // <-- Updated to Firestore
import { doc, collection, getDocs, setDoc, updateDoc, onSnapshot } from "firebase/firestore"; // <-- Firestore functions
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react"; 
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { 
  Plus, UserPlus, Users, Trash2, TrendingUp, X, Copy, 
  CheckCircle, PieChart, Sparkles, LayoutGrid, Search, ChevronRight,
  ArrowLeft, Share2, Download, LogOut, Upload, FileText, FileDown, BookOpen, Calendar,
  Award, AlertTriangle, Activity
} from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border backdrop-blur-md ${
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
  const fileInputRef = useRef(null);
   
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [batchTab, setBatchTab] = useState("students"); 
   
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null); 
   
  const [showAllBatches, setShowAllBatches] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); 
  const [newBatchName, setNewBatchName] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", phone: "" });
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newAssignment, setNewAssignment] = useState({ title: "", description: "" });
  const [newTest, setNewTest] = useState({ name: "", score: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- 1. FETCH ALL BATCHES FROM FIRESTORE ---
  useEffect(() => {
    // Note: We use user.institutionCode now instead of schoolId!
    if (!user?.institutionCode) return;
    
    const fetchBatches = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, `institutions/${user.institutionCode}/batches`));
            const list = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                list.push({
                    id: doc.id,
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

  // --- 2. REAL-TIME LISTEN ONLY TO SELECTED BATCH IN FIRESTORE ---
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

  const createBatch = async () => {
    if (!newBatchName.trim() || !user?.institutionCode) return;
    const id = Date.now().toString();
    const newBatchData = { name: newBatchName, students: [], assignments: {} };
    
    // Save to Firestore
    await setDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, id), newBatchData);
    
    setBatches(prev => [...prev, { id, ...newBatchData }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewBatchName("");
    showToast("New batch created!");
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
    
    // Update Array in Firestore
    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedStudents
    });

    setNewStudent({ name: "", phone: "" });
    showToast("Student added successfully");
  };

  const createAssignment = async () => {
    if (!selectedBatch || !newAssignment.title || !user?.institutionCode) return;
    const id = Date.now().toString();
    
    const updatedAssignments = {
        ...(selectedBatch.assignments || {}),
        [id]: {
            id,
            title: newAssignment.title,
            description: newAssignment.description,
            createdAt: new Date().toISOString()
        }
    };

    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        assignments: updatedAssignments
    });

    setNewAssignment({ title: "", description: "" });
    showToast("Assignment created!");
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

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedBatch || !user?.institutionCode) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const text = event.target.result;
            const rows = text.split("\n").slice(1);
            const newEntries = [];

            rows.forEach(row => {
                const [name, phone] = row.split(",");
                if (name && name.trim() !== "") {
                    newEntries.push({
                        id: Date.now() + Math.random(),
                        name: name.trim().replace(/"/g, ""),
                        phone: phone ? phone.trim().replace(/"/g, "") : "N/A",
                        fees: {},
                        attendance: {},
                        performance: 0,
                        performanceHistory: []
                    });
                }
            });

            if (newEntries.length === 0) return showToast("No valid data found in CSV", "error");

            const updatedStudents = [...(selectedBatch.students || []), ...newEntries];
            await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
                students: updatedStudents
            });

            showToast(`Imported ${newEntries.length} students!`);
        } catch (err) {
            showToast("Failed to parse CSV", "error");
        }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Phone\nRahul Sharma,9876543210\nPriya Verma,9123456789";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Batch Analytics Calculations
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
    <div className="min-h-screen bg-black text-zinc-100 font-sans p-4 md:p-8">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${selectedBatch ? 'hidden md:flex' : 'flex'}`}
        >
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <LayoutGrid className="text-blue-500" /> Admin Dashboard
                </h1>
                <p className="text-zinc-400 text-sm font-medium">Manage your institute efficiently</p>
            </div>
            
            <div className="flex gap-3 items-center">
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => logout()} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-900/20 text-red-500 border border-red-800/50 shadow-sm hover:shadow-md transition"
                >
                    <LogOut size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                </motion.button>
            </div>
        </motion.div>
        
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
            className={`bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/10 flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden ${selectedBatch ? 'hidden md:flex' : 'flex'}`}
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
            className={`bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-zinc-800 h-fit ${selectedBatch ? 'hidden lg:block' : 'block'}`}
          >
            <h2 className="font-bold text-zinc-300 mb-4 text-lg flex items-center gap-2">
                <Users size={20}/> Batches
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input 
                value={newBatchName} 
                onChange={e => setNewBatchName(e.target.value)}
                placeholder="New Batch..." 
                className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-zinc-200"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={createBatch} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                <Plus size={20} />
              </motion.button>
            </div>

            <div className="space-y-2">
              {loading ? (
                  <>
                    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-24"/><Skeleton className="h-6 w-8 rounded-full"/></div>
                    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-2xl"><Skeleton className="h-4 w-32"/><Skeleton className="h-6 w-8 rounded-full"/></div>
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
                            ? "bg-blue-900/20 border-blue-800/50 text-blue-400 border shadow-sm" 
                            : "hover:bg-zinc-800 text-zinc-400 border border-transparent"
                        }`}
                        >
                        <span className="font-bold text-sm">{batch.name}</span>
                        <span className="text-xs bg-black px-2.5 py-1 rounded-full border border-zinc-800 text-zinc-500 font-bold shadow-sm">
                            {batch.students?.length || 0}
                        </span>
                        </motion.div>
                    ))}
                    {batches.length > 5 && (
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAllBatches(true)}
                            className="w-full py-3 mt-2 text-sm font-bold text-blue-400 hover:bg-blue-900/10 rounded-2xl transition flex items-center justify-center gap-1"
                        >
                            View All {batches.length} Batches <ChevronRight size={16}/>
                        </motion.button>
                    )}
                  </>
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-zinc-600 text-sm font-medium">No batches yet.</p>
                  </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} 
            className={`lg:col-span-2 ${selectedBatch ? 'block' : 'hidden lg:block'}`}
          >
            {selectedBatch ? (
              <div className="bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-zinc-800 min-h-[500px] flex flex-col">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-6 border-b border-zinc-800 gap-4">
                  <div className="flex items-start gap-4">
                    <button 
                        onClick={() => setSelectedBatch(null)} 
                        className="lg:hidden mt-1 p-2 -ml-2 text-zinc-500 hover:bg-zinc-800 hover:text-white rounded-full transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-2">
                            {selectedBatch.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-400 font-medium bg-black px-3 py-1 rounded-lg border border-zinc-800 shadow-inner flex items-center gap-1">
                             <LayoutGrid size={12} className="text-blue-500" /> ID: {selectedBatch.id.slice(-6)}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium bg-black px-3 py-1 rounded-lg border border-zinc-800 shadow-inner flex items-center gap-1">
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
                                className="pl-9 pr-4 py-2.5 w-full bg-black border border-zinc-800 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors text-zinc-200"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={exportRealData}
                            className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-zinc-700 transition flex items-center gap-2 border border-zinc-700"
                        >
                            <FileDown size={16}/> Export
                        </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 border-b border-zinc-800 mb-8 overflow-x-auto custom-scrollbar pb-1">
                    {[
                        { id: "students", label: "Students List", icon: <Users size={18}/>, color: "text-blue-500", border: "border-blue-500" },
                        { id: "homework", label: "Homework & Tasks", icon: <BookOpen size={18}/>, color: "text-indigo-400", border: "border-indigo-400" },
                        { id: "analytics", label: "Batch Analytics", icon: <Activity size={18}/>, color: "text-purple-500", border: "border-purple-500" }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setBatchTab(tab.id)} 
                            className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap rounded-t-xl ${
                                batchTab === tab.id 
                                ? `${tab.color} ${tab.border} bg-zinc-800/50` 
                                : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/30"
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {batchTab === "students" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="flex flex-col gap-3 mb-6 bg-black p-5 rounded-2xl border border-zinc-800 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <UserPlus size={18} className="absolute left-4 top-3.5 text-zinc-500"/>
                                    <input 
                                        placeholder="Student Name" 
                                        className="w-full pl-11 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium text-zinc-200"
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                                    />
                                </div>
                                <input 
                                    placeholder="Phone Number" 
                                    className="w-full md:w-48 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-medium text-zinc-200"
                                    value={newStudent.phone}
                                    onChange={e => setNewStudent({...newStudent, phone: e.target.value})}
                                />
                                <motion.button whileTap={{ scale: 0.95 }} onClick={addStudent} className="bg-white text-black px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg">
                                    Add Student
                                </motion.button>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-2">
                                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                                <FileText size={14}/> Bulk Operations
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={downloadTemplate} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition px-2 py-1">Download Template</button>
                                    <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleCSVImport} />
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition border border-zinc-700 shadow-sm">
                                    <Upload size={14}/> Import CSV
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-[1.5rem] border border-zinc-800 shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950 text-zinc-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="p-5 whitespace-nowrap">Student Name</th>
                                    <th className="p-5 whitespace-nowrap hidden sm:table-cell">Contact Info</th>
                                    <th className="p-5 whitespace-nowrap">Performance</th>
                                    <th className="p-5 text-right whitespace-nowrap">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/50">
                                <AnimatePresence>
                                {filteredStudents.map((student, i) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.03 }}
                                        key={student.id} 
                                        className="hover:bg-zinc-800/80 transition-colors duration-200"
                                    >
                                    <td className="p-5 font-bold text-zinc-200 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900/60 to-purple-900/60 border border-blue-800/30 text-blue-300 flex items-center justify-center text-sm font-black shadow-inner shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[15px] tracking-tight">{student.name}</span>
                                            <span className="sm:hidden text-xs text-zinc-500 font-medium mt-0.5">{student.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-zinc-400 font-mono font-medium hidden sm:table-cell">{student.phone}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide border shadow-sm ${
                                            !student.performance ? "bg-zinc-900 text-zinc-500 border-zinc-800" 
                                            : student.performance >= 80 ? "bg-green-900/20 text-green-400 border-green-800/50" 
                                            : student.performance >= 50 ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/50" 
                                            : "bg-red-900/20 text-red-400 border-red-800/50"
                                        }`}>
                                            {student.performance || 0}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2">
                                        <button onClick={() => openAnalytics(student)} className="text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800/30 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm" title="Manage Analytics">
                                                <TrendingUp size={18}/>
                                        </button>
                                        <button onClick={() => deleteStudent(student.id)} className="text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/30 border border-red-800/30 p-2.5 rounded-xl transition-all hover:scale-105 shadow-sm" title="Remove Student">
                                                <Trash2 size={18}/>
                                        </button>
                                        </div>
                                    </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                                {filteredStudents.length === 0 && (
                                    <tr><td colSpan="4" className="p-16 text-center text-zinc-500 font-medium bg-zinc-900/30 border-dashed">No students found in this batch.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {batchTab === "homework" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                        <div className="bg-black p-5 rounded-[1.5rem] border border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                            <input 
                                placeholder="Assignment Title (e.g., Chapter 4 Essay)" 
                                value={newAssignment.title}
                                onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                                className="flex-1 w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 outline-none transition-colors font-medium"
                            />
                            <input 
                                placeholder="Description (optional details or instructions)" 
                                value={newAssignment.description}
                                onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                                className="flex-[2] w-full bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-sm text-white focus:border-indigo-500 outline-none transition-colors font-medium"
                            />
                            <button onClick={createAssignment} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                                Create Assignment
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><BookOpen size={20} className="text-indigo-400"/> Current Homework</h3>
                            {selectedBatch.assignments && Object.keys(selectedBatch.assignments).length > 0 ? (
                                Object.values(selectedBatch.assignments).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(assign => (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={assign.id} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:border-zinc-700 transition-colors">
                                        <div>
                                            <h4 className="font-black text-white text-lg tracking-tight">{assign.title}</h4>
                                            {assign.description && <p className="text-sm text-zinc-400 mt-1.5 font-medium leading-relaxed">{assign.description}</p>}
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                                            <span className="text-xs text-zinc-500 font-bold bg-black px-3 py-1 rounded-lg border border-zinc-800">{new Date(assign.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/20">
                                    <BookOpen size={48} className="mx-auto mb-4 text-zinc-700" />
                                    <p className="text-zinc-400 text-base font-bold">No homework assigned yet.</p>
                                    <p className="text-zinc-600 text-sm mt-1">Use the form above to notify your students.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {batchTab === "analytics" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={64}/></div>
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Batch Average</h3>
                                <div className="text-5xl font-black text-white flex items-baseline gap-1">
                                    {batchAnalytics.average}<span className="text-2xl text-zinc-600">%</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><Users size={64}/></div>
                                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Students</h3>
                                <div className="text-5xl font-black text-white">
                                    {selectedBatch.students?.length || 0}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-red-900/20 to-black p-6 rounded-[1.5rem] border border-red-900/30 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><AlertTriangle className="text-red-500" size={64}/></div>
                                <h3 className="text-red-400/80 text-xs font-bold uppercase tracking-widest mb-2">Needs Attention</h3>
                                <div className="text-5xl font-black text-white">
                                    {batchAnalytics.needsAttention.length}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-zinc-900/80 p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm h-[400px] flex flex-col">
                                <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2"><PieChart size={18} className="text-purple-500"/> Performance Distribution</h3>
                                <div className="flex-1 w-full min-h-0">
                                    {batchAnalytics.chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={batchAnalytics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                <Tooltip 
                                                    cursor={{fill: '#27272a', opacity: 0.4}}
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
                                        <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 font-medium">
                                            No test data available for visualization.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-zinc-900 p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Award size={18} className="text-yellow-500"/> Top Performers</h3>
                                    <div className="space-y-3">
                                        {batchAnalytics.topPerformers.length > 0 ? batchAnalytics.topPerformers.map((student, i) => (
                                            <div key={student.id} className="flex justify-between items-center bg-black p-3 rounded-xl border border-zinc-800">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-zinc-400/20 text-zinc-300' : 'bg-orange-600/20 text-orange-500'}`}>{i + 1}</span>
                                                    <span className="font-bold text-sm text-zinc-200 truncate max-w-[120px]">{student.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-green-400">{student.performance}%</span>
                                            </div>
                                        )) : (
                                            <p className="text-zinc-600 text-sm italic">Not enough data.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-zinc-900 p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500"/> Quick Insights</h3>
                                    <ul className="space-y-4 text-sm text-zinc-400 font-medium">
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-white">{batchAnalytics.chartData.filter(d => d.score >= 80).length} students</strong> are excelling (Score &gt; 80%).</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-white">{batchAnalytics.chartData.filter(d => d.score >= 50 && d.score < 80).length} students</strong> are performing averagely.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"/>
                                            <span><strong className="text-white">{batchAnalytics.needsAttention.length} students</strong> are at risk (Score &lt; 40%) and require intervention.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-zinc-900 rounded-[2rem] border-2 border-dashed border-zinc-800 text-zinc-600 p-10 min-h-[500px]">
                <div className="bg-zinc-800 p-6 rounded-full mb-5 shadow-inner">
                  <LayoutGrid size={48} className="opacity-30"/>
                </div>
                <p className="font-black text-xl text-zinc-400">Select a batch to manage</p>
                <p className="text-sm font-medium mt-2">or create a completely new one from the sidebar.</p>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
        {showShareModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative border border-zinc-800">
                    <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full hover:bg-red-900/20 hover:text-red-500 transition z-10"><X size={20}/></button>
                    
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Share2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">Share Access</h3>
                        <p className="text-zinc-500 text-sm mb-6">Scan to join using code <strong>{user?.institutionCode}</strong>.</p>
                        
                        <div className="bg-white p-4 rounded-2xl border-2 border-zinc-700 shadow-sm mb-6">
                             <QRCodeSVG value={magicLinkUrl} size={200} level={"H"} includeMargin={true} id="magic-qr" />
                        </div>

                        <div className="w-full bg-black p-3 rounded-xl border border-zinc-800 flex items-center gap-2 mb-4">
                             <code className="text-xs flex-1 truncate text-left text-zinc-400 font-mono">{magicLinkUrl}</code>
                             <button onClick={copyLink} className="p-2 hover:bg-zinc-800 rounded-lg transition text-blue-500">
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
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-zinc-800">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xl font-black text-white">All Batches ({batches.length})</h3>
                        <button onClick={() => setShowAllBatches(false)} className="p-2 bg-zinc-800 rounded-full hover:rotate-90 transition text-zinc-400"><X size={20}/></button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                        {batches.map(batch => (
                            <motion.button 
                                key={batch.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedBatch(batch); setBatchTab("students"); setShowAllBatches(false); }}
                                className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all ${
                                    selectedBatch?.id === batch.id 
                                    ? "bg-blue-900/20 border border-blue-800/50 text-blue-400" 
                                    : "bg-black hover:bg-zinc-800 text-zinc-300 border border-transparent"
                                }`}
                            >
                                <span className="font-bold">{batch.name}</span>
                                <span className="text-xs bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 font-bold shadow-sm">{batch.students?.length || 0} Students</span>
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
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-zinc-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800">
                  <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white flex justify-between items-start shadow-inner">
                      <div>
                          <h3 className="text-3xl font-black tracking-tight">{selectedStudent.name}</h3>
                          <p className="text-blue-100 text-sm font-medium mt-1 bg-black/20 inline-block px-3 py-1 rounded-full">{selectedStudent.phone}</p>
                      </div>
                      <button onClick={() => setSelectedStudent(null)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                  </div>
                   
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-900/10 p-5 rounded-2xl border border-green-800/30 text-center">
                              <div className="text-4xl font-black text-green-400">{getStats(selectedStudent).attPercent}%</div>
                              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Attendance Record</div>
                          </div>
                          <div className="bg-orange-900/10 p-5 rounded-2xl border border-orange-800/30 text-center">
                              <div className="text-4xl font-black text-orange-400">{getStats(selectedStudent).paidMonths}</div>
                              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mt-2">Paid Months</div>
                          </div>
                      </div>

                      <div className="bg-black p-6 rounded-[1.5rem] border border-zinc-800 shadow-sm">
                          <label className="block text-sm font-bold text-white mb-4 flex items-center gap-2">
                              <TrendingUp size={18} className="text-blue-500"/> Register New Test Result
                          </label>
                          <div className="flex gap-2 items-center mb-4">
                              <input 
                                  type="text" 
                                  placeholder="Test Identifier (e.g., Midterms)"
                                  value={newTest.name}
                                  onChange={e => setNewTest({...newTest, name: e.target.value})}
                                  className="flex-1 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-sm outline-none focus:border-blue-500 text-white transition-colors"
                              />
                              <input 
                                  type="number" 
                                  placeholder="Score %"
                                  min="0" max="100"
                                  value={newTest.score}
                                  onChange={e => setNewTest({...newTest, score: e.target.value})}
                                  className="w-24 bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-sm text-center outline-none focus:border-blue-500 text-white transition-colors font-bold"
                              />
                          </div>
                          <motion.button whileTap={{ scale: 0.98 }} onClick={saveTestScore} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-500/20">
                              Save to Performance History
                          </motion.button>

                          {selectedStudent.performanceHistory && selectedStudent.performanceHistory.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-zinc-800">
                                  <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Recorded Academic History</h4>
                                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      {selectedStudent.performanceHistory.map((test, index) => (
                                          <div key={test.id} className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-[1rem] border border-zinc-800/80">
                                              <div className="flex gap-3 items-center">
                                                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">{index + 1}</div>
                                                  <div>
                                                      <p className="text-sm font-black text-zinc-200">{test.name}</p>
                                                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">{new Date(test.date).toLocaleDateString()}</p>
                                                  </div>
                                              </div>
                                              <div className={`px-3 py-1 rounded-lg text-sm font-black border ${
                                                  test.score >= 80 ? 'bg-green-900/20 text-green-400 border-green-800/50' 
                                                  : test.score >= 50 ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50'
                                                  : 'bg-red-900/20 text-red-400 border-red-800/50'
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