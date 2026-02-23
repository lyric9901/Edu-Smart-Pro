"use client";
import { useState, useEffect, useMemo, Suspense } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, onValue, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, IndianRupee, Bell, PieChart, Clock, 
  Settings, Plus, LogOut, Moon, Sun, X, Lock,
  ChevronRight, ChevronLeft, LayoutDashboard, User, Flame, TrendingUp, AlertCircle,
  Maximize, Minimize, Home // Imported Icons
} from "lucide-react";

// --- SKELETON LOADER ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800/50 rounded-2xl ${className}`} />
);

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
};

function StudentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- STATE ---
  const [students, setStudents] = useState([]); 
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]); 
  const [mounted, setMounted] = useState(false);
  
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calendar
  const [viewDate, setViewDate] = useState(new Date());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "" });
  const [addError, setAddError] = useState("");

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("eduSmartTheme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") document.documentElement.classList.add("dark");

    const storedList = localStorage.getItem("eduSmartStudentsList");
    
    if (storedList) {
        setStudents(JSON.parse(storedList));
        setLoading(false);
    } else {
        const singleStudent = localStorage.getItem("eduSmartStudent");
        if (singleStudent) {
            const s = JSON.parse(singleStudent);
            setStudents([s]);
            localStorage.setItem("eduSmartStudentsList", JSON.stringify([s]));
            setLoading(false);
        } else {
            router.push("/");
        }
    }
  }, [router]);

  // --- FULLSCREEN LISTENER ---
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const currentStudent = students[activeStudentIndex];

  // Extract stable identities
  const studentSchoolId = currentStudent?.schoolId;
  const studentName = currentStudent?.name;
  const studentPhone = currentStudent?.phone;

  // --- 2. REAL-TIME DATA SYNC ---
  useEffect(() => {
    if (!studentSchoolId) return;

    // A. Listen for GLOBAL NOTICES
    const noticesRef = ref(db, `schools/${studentSchoolId}/notices`);
    const unsubNotices = onValue(noticesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val, type: 'notice' })).reverse() : [];
      setNotices(list);
    });

    // B. Listen for STUDENT DATA UPDATES (Includes Personal Notifications)
    const batchesRef = ref(db, `schools/${studentSchoolId}/batches`);
    const unsubBatches = onValue(batchesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let updatedData = null;
      Object.entries(data).forEach(([bId, batch]) => {
        const batchStudents = batch.students || [];
        const index = batchStudents.findIndex(s => s.name === studentName && s.phone === studentPhone);
        
        if (index !== -1) {
            updatedData = { 
                ...batchStudents[index], 
                batchName: batch.name, 
                batchId: bId, // Save batch ID to update password later
                studentIndex: index, // Save index to update password later
                schoolId: studentSchoolId,
                batchTiming: batch.timing 
            };
        }
      });

      if (updatedData) {
        setStudents(prev => {
            const currentData = prev[activeStudentIndex];
            if (JSON.stringify(currentData) !== JSON.stringify(updatedData)) {
                const newStudents = [...prev];
                newStudents[activeStudentIndex] = updatedData;
                localStorage.setItem("eduSmartStudentsList", JSON.stringify(newStudents));
                return newStudents;
            }
            return prev;
        });
      }
    });

    return () => {
      unsubNotices();
      unsubBatches();
    };
  }, [studentSchoolId, studentName, studentPhone, activeStudentIndex]);


  // --- MERGE NOTICES ---
  const allMessages = useMemo(() => {
    // 1. Personal
    const personal = currentStudent?.notifications 
        ? Object.entries(currentStudent.notifications).map(([id, val]) => ({ id, ...val, isPersonal: true }))
        : [];
    
    // 2. Global
    const global = notices || [];

    // 3. Merge & Sort
    const combined = [...personal, ...global];
    return combined.sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [currentStudent, notices]);


  // --- ACTIONS ---
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("eduSmartTheme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLogout = () => {
    if (confirm("Logout from all accounts?")) {
      const schoolId = currentStudent?.schoolId;
      localStorage.removeItem("eduSmartStudentsList");
      localStorage.removeItem("eduSmartStudent");
      window.location.href = `/?schoolId=${schoolId}`;
    }
  };

  const switchStudent = (index) => {
    setActiveStudentIndex(index);
    setActiveTab("dashboard");
    setShowSettings(false);
  };

  const addNewChild = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!currentStudent?.schoolId) return;

    try {
      const batchesRef = ref(db, `schools/${currentStudent.schoolId}/batches`);
      const snapshot = await get(batchesRef);
      let found = null;
      if (snapshot.exists()) {
        snapshot.forEach(batch => {
            const list = batch.val().students || [];
            const match = list.find(s => 
                s.name.trim().toLowerCase() === addForm.name.trim().toLowerCase() && 
                s.phone.trim() === addForm.phone.trim()
            );
            if (match) found = { ...match, batchName: batch.val().name, schoolId: currentStudent.schoolId };
        });
      }

      if (found) {
        if (students.some(s => s.name === found.name && s.phone === found.phone)) {
            setAddError("Student already added.");
            return;
        }
        const newList = [...students, found];
        setStudents(newList);
        localStorage.setItem("eduSmartStudentsList", JSON.stringify(newList));
        setActiveStudentIndex(newList.length - 1);
        setShowAddModal(false);
        setAddForm({ name: "", phone: "" });
      } else {
        setAddError("Student not found.");
      }
    } catch (err) {
      setAddError("Connection failed.");
    }
  };

  // --- SAVE PASSWORD ---
  const savePassword = async () => {
    if (!newPassword) return;
    if (currentStudent?.schoolId && currentStudent?.batchId && currentStudent?.studentIndex !== undefined) {
        const path = `schools/${currentStudent.schoolId}/batches/${currentStudent.batchId}/students/${currentStudent.studentIndex}/password`;
        await set(ref(db, path), newPassword);
        setPassMsg("Password saved successfully!");
        setNewPassword("");
        setTimeout(() => setPassMsg(""), 3000);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    if (!currentStudent) return { attPercent: 0, feePaid: 0, streak: 0, monthlyData: [], monthLabels: [] };
    
    // 1. Calculate Attendance Percentage
    const allAttendanceValues = Object.values(currentStudent.attendance || {});
    const validDays = allAttendanceValues.filter(v => v === "present" || v === "absent");
    const attTotal = validDays.length;
    const attPresent = validDays.filter(v => v === "present").length;
    const attPercent = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
    
    // 2. Fees
    const currentYear = new Date().getFullYear();
    const feePaid = Object.values(currentStudent.fees?.[currentYear] || {}).filter(v => v === "paid").length;
    
    // 3. Streak
    let streak = 0;
    const sortedDates = Object.keys(currentStudent.attendance || {}).sort((a,b) => new Date(b) - new Date(a));
    for (let date of sortedDates) {
        const status = currentStudent.attendance[date];
        if (status === 'present') streak++;
        else if (status === 'absent') break; 
    }

    // 4. Monthly Data
    const monthlyData = [];
    const monthLabels = [];
    
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mStr = d.toLocaleString('default', { month: 'short' });
        monthLabels.push(mStr);
        
        const daysInMonth = Object.entries(currentStudent.attendance || {}).filter(([k, v]) => {
            const kDate = new Date(k);
            return kDate.getMonth() === d.getMonth() && 
                   kDate.getFullYear() === d.getFullYear() &&
                   (v === 'present' || v === 'absent');
        });
        
        const p = daysInMonth.filter(([,v]) => v === 'present').length;
        const t = daysInMonth.length;
        monthlyData.push(t ? Math.round((p/t)*100) : 0);
    }

    return { attPercent, feePaid, streak, monthlyData, monthLabels };
  }, [currentStudent]);

  // --- LOADING UI ---
  if (!mounted || loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 space-y-4 select-none">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-3" />
                </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <Skeleton className="w-full h-40 rounded-[1.5rem]" />
        <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-[1.5rem]" />
            <Skeleton className="h-28 rounded-[1.5rem]" />
        </div>
    </div>
  );

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Home' },
    { id: 'attendance', icon: <CheckCircle size={28} />, label: 'Attendance', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'fees', icon: <IndianRupee size={28} />, label: 'Fees', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'notices', icon: <Bell size={28} />, label: 'Inbox', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'analytics', icon: <PieChart size={28} />, label: 'Stats', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'timing', icon: <Clock size={28} />, label: 'Time', color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ];

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 select-none ${theme === 'dark' ? 'bg-black text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 z-30 p-4">
        <div className="p-4 mb-6">
            <h1 className="text-2xl font-black text-blue-600 tracking-tighter flex items-center gap-2">EduSmart</h1>
        </div>
        <div className="flex-1 space-y-2">
            {navItems.map(item => (
                <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-zinc-400'}`}
                >
                    {item.id === 'dashboard' ? <Home size={20}/> : item.icon} 
                    {item.label}
                </button>
            ))}
        </div>
        <div onClick={() => setShowSettings(true)} className="mt-auto flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700 transition">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold">
                {currentStudent.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{currentStudent.name}</p>
                <p className="text-xs text-slate-500">Settings</p>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 relative">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-50/90 dark:bg-black/90 backdrop-blur-xl px-4 py-3 flex justify-between items-center border-b border-slate-200/50 dark:border-white/10">
            {activeTab === 'dashboard' ? (
                <div className="flex items-center gap-3" onClick={() => setShowSettings(true)}>
                    <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 text-sm">
                        {currentStudent.name.charAt(0)}
                    </motion.div>
                    <div>
                        <h1 className="text-base font-bold leading-none">{currentStudent.name}</h1>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium">{currentStudent.batchName}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <motion.button 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => setActiveTab('dashboard')} 
                        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm"
                    >
                        <ChevronLeft size={20} className="text-slate-800 dark:text-zinc-200"/>
                    </motion.button>
                    <h1 className="text-lg font-bold">{navItems.find(n => n.id === activeTab)?.label}</h1>
                </div>
            )}

            <div className="flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFullscreen} className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                    {isFullscreen ? <Minimize size={18} className="text-slate-600 dark:text-zinc-400" /> : <Maximize size={18} className="text-slate-600 dark:text-zinc-400" />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                    <Settings size={18} className="text-slate-600 dark:text-zinc-400" />
                </motion.button>
            </div>
        </header>

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-10 py-6">
            <div><h2 className="text-2xl font-bold">{navItems.find(n => n.id === activeTab)?.label}</h2></div>
            <div className="flex items-center gap-4">
                <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm hover:scale-105 transition" title="Toggle Fullscreen">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm hover:scale-105 transition">
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
        </header>

        {/* BODY */}
        <div className="px-4 md:px-10 pb-10 max-w-5xl mx-auto pt-4 md:pt-0">
            <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD (GRID MENU) */}
            {activeTab === 'dashboard' && (
                <motion.div key="dash" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    {/* Welcome Text */}
                    <div className="md:hidden mt-2 mb-4">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Dashboard</h2>
                        <p className="text-slate-500 text-sm font-medium">What would you like to check today?</p>
                    </div>

                    {/* Grid Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {navItems.filter(item => item.id !== 'dashboard').map((item, i) => (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setActiveTab(item.id)}
                                className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-4 aspect-square md:aspect-auto md:py-10 group"
                            >
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center ${item.bg || 'bg-slate-100'} ${item.color || 'text-slate-600'} transition-transform group-hover:scale-110`}>
                                    {item.icon}
                                </div>
                                <span className="font-bold text-lg text-slate-700 dark:text-zinc-200">{item.label}</span>
                            </motion.button>
                        ))}
                        
                        {/* SETTINGS BUTTON ON HOME PAGE */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setShowSettings(true)}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-4 aspect-square md:aspect-auto md:py-10 group"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-transform group-hover:scale-110">
                                <Settings size={28} />
                            </div>
                            <span className="font-bold text-lg text-slate-700 dark:text-zinc-200">Settings</span>
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* 2. ATTENDANCE (Calendar) */}
            {activeTab === 'attendance' && (
                <motion.div key="att" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                         <div className="flex justify-between items-center mb-6 md:mb-8">
                             <h3 className="font-bold text-lg md:text-xl">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                             <div className="flex gap-2">
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 md:p-3 bg-slate-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition"><ChevronLeft size={18}/></button>
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 md:p-3 bg-slate-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition"><ChevronRight size={18}/></button>
                             </div>
                         </div>
                         <div className="grid grid-cols-7 gap-y-6 text-center">
                            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-[10px] md:text-xs font-bold text-slate-400">{d}</span>)}
                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const y = viewDate.getFullYear();
                                const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                                const dStr = String(day).padStart(2, '0');
                                const dateKey = `${y}-${m}-${dStr}`;
                                const status = currentStudent.attendance?.[dateKey];
                                const isPresent = status === 'present';
                                const isAbsent = status === 'absent';
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1">
                                        <span className={`text-xs md:text-sm font-bold ${isPresent || isAbsent ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{day}</span>
                                        {isPresent && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                        {isAbsent && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500" />}
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                </motion.div>
            )}

            {/* 3. FEES */}
            {activeTab === 'fees' && (
                <motion.div key="fees" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                       <div className="p-5 md:p-6 border-b border-slate-100 dark:border-zinc-800">
                           <h2 className="text-lg md:text-xl font-bold">Academic Fee {new Date().getFullYear()}</h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-5 md:p-6">
                           {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map((m, i) => {
                               const status = currentStudent.fees?.[new Date().getFullYear()]?.[m] || "pending";
                               return (
                                   <motion.div 
                                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} 
                                       key={m} 
                                       className={`p-4 rounded-2xl border flex justify-between items-center ${status === 'paid' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-slate-50 dark:bg-black border-slate-100 dark:border-zinc-800'}`}
                                   >
                                       <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold uppercase ${status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                                               {m.substring(0,3)}
                                           </div>
                                           <span className="capitalize font-bold text-sm md:text-base text-slate-700 dark:text-slate-200">{m}</span>
                                       </div>
                                       {status === 'paid' ? <CheckCircle size={18} className="text-green-500" /> : <div className="text-[10px] md:text-xs bg-slate-200 dark:bg-zinc-800 px-2 md:px-3 py-1 rounded-full font-bold uppercase text-slate-500">Due</div>}
                                   </motion.div>
                               )
                           })}
                       </div>
                    </div>
                </motion.div>
            )}

            {/* 4. INBOX */}
            {activeTab === 'notices' && (
                <motion.div key="notices" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    {allMessages.length > 0 ? (
                        allMessages.map((msg, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                key={msg.id} 
                                className={`p-5 md:p-6 rounded-[1.5rem] border shadow-sm flex gap-4 ${
                                    msg.type === 'alert' 
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' 
                                    : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${
                                    msg.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                }`}>
                                    {msg.type === 'alert' ? <AlertCircle size={20} className="md:w-6 md:h-6" /> : <Bell size={20} className="md:w-6 md:h-6" />}
                                </div>
                                <div>
                                    <p className={`text-sm md:text-base font-medium leading-relaxed ${
                                        msg.type === 'alert' ? 'text-red-800 dark:text-red-200' : 'text-slate-800 dark:text-zinc-100'
                                    }`}>{msg.text}</p>
                                    <p className={`text-[10px] md:text-xs font-bold mt-2 ${
                                        msg.type === 'alert' ? 'text-red-400' : 'text-slate-400'
                                    }`}>{new Date(msg.date).toLocaleDateString()}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-32 opacity-50"><Bell size={48} className="mx-auto mb-4" /><p>All caught up!</p></div>
                    )}
                </motion.div>
            )}

            {/* 5. ANALYTICS (Refined) */}
            {activeTab === 'analytics' && (
                <motion.div key="analytics" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    
                    {/* Performance Card */}
                    <div className="bg-black dark:bg-zinc-800 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-40"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <TrendingUp size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Overall Performance</span>
                            </div>
                            <div className="text-6xl font-black tracking-tighter">
                                {currentStudent.performance || 0}<span className="text-2xl text-white/50">%</span>
                            </div>
                            <p className="text-sm font-medium text-white/60 mt-2">Based on exam results and assignments.</p>
                        </div>
                    </div>

                    {/* Stats Grid: Attendance & Fees */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-40">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-4xl font-black tracking-tight">{stats.attPercent}<span className="text-lg text-slate-400">%</span></div>
                                <div className="text-xs font-bold text-slate-400 uppercase mt-1">Attendance</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between h-40">
                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                                <IndianRupee size={20} />
                            </div>
                            <div>
                                <div className="text-4xl font-black tracking-tight">{stats.feePaid}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase mt-1">Months Paid</div>
                            </div>
                        </div>
                    </div>

                    {/* Existing Trend Graph */}
                    <div className="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Trend</p>
                                <h3 className="text-lg md:text-xl font-bold">Last 6 Months</h3>
                            </div>
                        </div>
                        <div className="flex items-end justify-between h-32 md:h-40 gap-2">
                            {stats.monthlyData && stats.monthlyData.length > 0 ? stats.monthlyData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl relative h-full overflow-hidden">
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: `${val}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                                            className="absolute bottom-0 w-full bg-blue-600 rounded-xl"
                                        />
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400">{stats.monthLabels[i]}</span>
                                </div>
                            )) : (
                                <p className="w-full text-center text-slate-400 text-xs py-10">No analytics data available yet.</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 6. TIMING VIEW */}
            {activeTab === 'timing' && (
                <motion.div key="timing" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[40vh] md:min-h-[50vh]">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-zinc-900 border-4 border-purple-100 dark:border-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-xl">
                            <Clock size={40} className="md:w-12 md:h-12" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Class Schedule</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm md:text-base">{currentStudent.batchName} Batch</p>
                        
                        <div className="flex items-center gap-3 md:gap-8">
                            <div className="bg-white dark:bg-zinc-900 p-5 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center w-36 md:w-56 shadow-sm">
                                <div className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-2">Start</div>
                                <div className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">
                                    {currentStudent.batchTiming?.start 
                                        ? new Date(`1970-01-01T${currentStudent.batchTiming.start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                        : "--:--"}
                                </div>
                            </div>
                            <div className="h-1 w-4 md:w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                            <div className="bg-white dark:bg-zinc-900 p-5 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center w-36 md:w-56 shadow-sm">
                                <div className="text-[10px] md:text-xs text-slate-400 uppercase font-bold mb-2">End</div>
                                <div className="text-xl md:text-3xl font-black text-slate-800 dark:text-white">
                                    {currentStudent.batchTiming?.end 
                                        ? new Date(`1970-01-01T${currentStudent.batchTiming.end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                        : "--:--"}
                                </div>
                            </div>
                        </div>
                </motion.div>
            )}

            </AnimatePresence>
        </div>
      </main>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
      {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white dark:bg-zinc-900 w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black tracking-tight">Settings</h3>
                      <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full">
                          <X size={20}/>
                      </button>
                  </div>
                  
                  {/* Account Switcher */}
                  <div className="space-y-3 mb-8">
                      {students.map((s, idx) => (
                          <button key={idx} onClick={() => switchStudent(idx)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${idx === activeStudentIndex ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold">
                                  {s.name.charAt(0)}
                              </div>
                              <span className="font-bold flex-1 text-left">{s.name}</span>
                              {idx === activeStudentIndex && <CheckCircle size={20}/>}
                          </button>
                      ))}
                      <button onClick={() => { setShowSettings(false); setShowAddModal(true); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                              <Plus size={20}/>
                          </div>
                          Add Another Child
                      </button>
                  </div>

                  {/* Security / Change Password */}
                  <div className="mb-6 bg-slate-50 dark:bg-black p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <h4 className="font-bold text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Lock size={14}/> Security
                      </h4>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              placeholder="Set Custom Password" 
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 font-medium"
                          />
                          <button onClick={savePassword} className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition shadow-sm">
                              Save
                          </button>
                      </div>
                      {passMsg && (
                          <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                              <CheckCircle size={12}/> {passMsg}
                          </p>
                      )}
                  </div>

                  {/* Theme Switcher */}
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl mb-6">
                      <div className="flex items-center gap-3 font-bold">
                          {theme === 'light' ? <Sun size={20}/> : <Moon size={20}/>} 
                          {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                      </div>
                      <button onClick={toggleTheme} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          <motion.div layout className={`w-5 h-5 bg-white rounded-full shadow-md ${theme === 'dark' ? 'translate-x-5' : ''}`} />
                      </button>
                  </div>
                  
                  <button onClick={handleLogout} className="w-full py-4 text-red-500 font-black bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition">
                      <LogOut size={20} /> Logout
                  </button>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* ADD CHILD MODAL */}
      <AnimatePresence>
      {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
                  <h3 className="text-2xl font-black mb-2">Add Child</h3>
                  <p className="text-slate-500 text-sm mb-6">Enter details to add sibling from <strong>{currentStudent.batchName}</strong>.</p>
                  <form onSubmit={addNewChild} className="space-y-4">
                      <div className="bg-slate-50 dark:bg-black p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500 transition">
                          <input required placeholder="Student Name" className="w-full p-3 bg-transparent outline-none font-bold placeholder:font-medium" onChange={e => setAddForm({...addForm, name: e.target.value})} />
                      </div>
                      <div className="bg-slate-50 dark:bg-black p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500 transition">
                          <input required placeholder="Phone Number" className="w-full p-3 bg-transparent outline-none font-bold placeholder:font-medium" onChange={e => setAddForm({...addForm, phone: e.target.value})} />
                      </div>
                      {addError && <p className="text-red-500 text-center font-bold text-sm bg-red-50 p-2 rounded-xl">{addError}</p>}
                      <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition">
                              Cancel
                          </button>
                          <button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg shadow-blue-500/30">
                              Add
                          </button>
                      </div>
                  </form>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}

// --- 3. WRAPPER FOR SUSPENSE (Required for build) ---
export default function StudentPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-bold bg-slate-50 dark:bg-black">Loading Portal...</div>}>
      <StudentContent />
    </Suspense>
  );
}
