"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, IndianRupee, Bell, PieChart, Clock, 
  Settings, Plus, LogOut, Moon, Sun, X,
  ChevronRight, ChevronLeft, LayoutDashboard, User, Flame, TrendingUp
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

export default function StudentPortal() {
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
  
  // Calendar
  const [viewDate, setViewDate] = useState(new Date());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "" });
  const [addError, setAddError] = useState("");

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

  const currentStudent = students[activeStudentIndex];

  // Extract stable identities for useEffect dependencies to prevent loops
  const studentSchoolId = currentStudent?.schoolId;
  const studentName = currentStudent?.name;
  const studentPhone = currentStudent?.phone;

  // --- 2. REAL-TIME DATA SYNC ---
  useEffect(() => {
    if (!studentSchoolId) return;

    // A. Listen for NOTICES
    const noticesRef = ref(db, `schools/${studentSchoolId}/notices`);
    const unsubNotices = onValue(noticesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })).reverse() : [];
      setNotices(list);
    });

    // B. Listen for STUDENT DATA UPDATES (Attendance, Fees, etc.)
    const batchesRef = ref(db, `schools/${studentSchoolId}/batches`);
    const unsubBatches = onValue(batchesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let updatedData = null;
      // Search for our student in the live data
      Object.values(data).forEach(batch => {
        const batchStudents = batch.students || [];
        const match = batchStudents.find(s => 
            s.name === studentName && 
            s.phone === studentPhone
        );
        if (match) {
            updatedData = { 
                ...match, 
                batchName: batch.name, 
                schoolId: studentSchoolId,
                batchTiming: batch.timing // Include timing data
            };
        }
      });

      // Only update state if data ACTUALLY changed to prevent infinite re-renders
      if (updatedData) {
        setStudents(prev => {
            const currentData = prev[activeStudentIndex];
            // Compare stringified versions to detect deep changes
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
  }, [studentSchoolId, studentName, studentPhone, activeStudentIndex]); // Stable dependencies


  // --- ACTIONS ---
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("eduSmartTheme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleLogout = () => {
    if (confirm("Logout from all accounts?")) {
      const schoolId = currentStudent?.schoolId;
      localStorage.removeItem("eduSmartStudentsList");
      localStorage.removeItem("eduSmartStudent");
      // Use window.location to force full reload and clear any in-memory states
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
        // Prevent duplicate child
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

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    if (!currentStudent) return {};
    const attTotal = Object.keys(currentStudent.attendance || {}).length;
    const attPresent = Object.values(currentStudent.attendance || {}).filter(v => v === "present").length;
    const attPercent = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
    const currentYear = new Date().getFullYear();
    const feePaid = Object.values(currentStudent.fees?.[currentYear] || {}).filter(v => v === "paid").length;
    
    // Streak Logic
    let streak = 0;
    const sortedDates = Object.keys(currentStudent.attendance || {}).sort((a,b) => new Date(b) - new Date(a));
    for (let date of sortedDates) {
        if (currentStudent.attendance[date] === 'present') streak++;
        else break; 
    }

    // Monthly Data
    const monthlyData = [0,0,0,0,0,0];
    const monthLabels = [];
    for(let i=5; i>=0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mStr = d.toLocaleString('default', { month: 'short' });
        monthLabels.push(mStr);
        
        const daysInMonth = Object.entries(currentStudent.attendance || {}).filter(([k]) => {
            const kDate = new Date(k);
            return kDate.getMonth() === d.getMonth() && kDate.getFullYear() === d.getFullYear();
        });
        const p = daysInMonth.filter(([,v]) => v === 'present').length;
        const t = daysInMonth.length;
        monthlyData[5-i] = t ? Math.round((p/t)*100) : 0;
    }

    return { attPercent, feePaid, streak, monthlyData, monthLabels };
  }, [currentStudent]);

  // --- LOADING UI ---
  if (!mounted || loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-20 h-3" />
                </div>
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="w-full h-48 rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-[2rem]" />
            <Skeleton className="h-32 rounded-[2rem]" />
        </div>
        <Skeleton className="w-full h-24 rounded-[2rem]" />
    </div>
  );

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { id: 'attendance', icon: <CheckCircle size={20} />, label: 'Attend' },
    { id: 'fees', icon: <IndianRupee size={20} />, label: 'Fees' },
    { id: 'notices', icon: <Bell size={20} />, label: 'Inbox' },
    { id: 'analytics', icon: <PieChart size={20} />, label: 'Stats' },
    { id: 'timing', icon: <Clock size={20} />, label: 'Time' },
  ];

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 z-30 p-4">
        <div className="p-4 mb-6">
            <h1 className="text-2xl font-black text-blue-600 tracking-tighter flex items-center gap-2">EduSmart</h1>
        </div>
        <div className="flex-1 space-y-2">
            {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-zinc-400'}`}>
                    {item.icon} {item.label}
                </button>
            ))}
        </div>
        <div onClick={() => setShowSettings(true)} className="mt-auto flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700 transition">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold">{currentStudent.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden"><p className="text-sm font-bold truncate">{currentStudent.name}</p><p className="text-xs text-slate-500">Settings</p></div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 relative">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center border-b border-slate-200/50 dark:border-white/10">
            <div className="flex items-center gap-3" onClick={() => setShowSettings(true)}>
                <motion.div whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                    {currentStudent.name.charAt(0)}
                </motion.div>
                <div>
                    <h1 className="text-lg font-bold leading-none">{currentStudent.name}</h1>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">{currentStudent.batchName}</p>
                </div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                <Settings size={20} className="text-slate-600 dark:text-zinc-400" />
            </motion.button>
        </header>

        {/* DESKTOP HEADER */}
        <header className="hidden md:flex items-center justify-between px-10 py-6">
            <div><h2 className="text-2xl font-bold">{navItems.find(n => n.id === activeTab)?.label}</h2></div>
            <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-sm hover:scale-105 transition">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            </div>
        </header>

        {/* BODY */}
        <div className="px-4 md:px-10 pb-32 md:pb-10 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
            
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
                <motion.div key="dash" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    {/* Hero */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-black dark:bg-zinc-900 text-white p-8 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-40"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">PERFORMANCE SCORE</span>
                                    {stats.streak > 3 && <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Flame size={12}/> {stats.streak} Day Streak</span>}
                                </div>
                                <div className="text-6xl md:text-8xl font-black tracking-tighter">
                                    {currentStudent.performance || 0}<span className="text-2xl md:text-4xl text-white/40 font-bold">%</span>
                                </div>
                                <p className="text-white/60 mt-2 font-medium">Keep pushing! You're doing great.</p>
                            </div>
                            <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                                <div className="absolute inset-0 border-t-4 border-r-4 border-blue-500 rounded-full rotate-45"></div>
                                <TrendingUp size={32} className="text-blue-400"/>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('attendance')} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm cursor-pointer relative overflow-hidden group">
                            <div className="absolute top-4 right-4 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition"><CheckCircle size={16}/></div>
                            <div className="mt-8">
                                <div className="text-4xl font-bold tracking-tight">{stats.attPercent}%</div>
                                <div className="text-sm text-slate-500 font-medium">Attendance</div>
                            </div>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('fees')} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm cursor-pointer relative overflow-hidden group">
                            <div className="absolute top-4 right-4 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition"><IndianRupee size={16}/></div>
                            <div className="mt-8">
                                <div className="text-4xl font-bold tracking-tight">{stats.feePaid}</div>
                                <div className="text-sm text-slate-500 font-medium">Months Paid</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Notices Preview */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Bell size={18} className="text-blue-500"/> Latest Notice</h3>
                            <button onClick={() => setActiveTab('notices')} className="text-xs font-bold text-slate-400 hover:text-blue-600">View All</button>
                        </div>
                        {notices.length > 0 ? (
                            <div className="p-4 bg-slate-50 dark:bg-black rounded-2xl">
                                <p className="text-sm font-medium line-clamp-2">{notices[0].text}</p>
                                <p className="text-[10px] text-slate-400 mt-2">{new Date(notices[0].date).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm text-center">No new notices.</p>
                        )}
                    </div>
                </motion.div>
            )}

            {/* 2. ATTENDANCE (Calendar) */}
            {activeTab === 'attendance' && (
                <motion.div key="att" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                             <h3 className="font-bold text-xl">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                             <div className="flex gap-2">
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition"><ChevronLeft size={20}/></button>
                                 <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition"><ChevronRight size={20}/></button>
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-7 gap-y-6 text-center">
                            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="text-xs font-bold text-slate-400">{d}</span>)}
                            
                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                            
                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                // Convert JS Date to YYYY-MM-DD
                                const y = viewDate.getFullYear();
                                const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                                const dStr = String(day).padStart(2, '0');
                                const dateKey = `${y}-${m}-${dStr}`;
                                
                                const status = currentStudent.attendance?.[dateKey];
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1">
                                        <span className={`text-sm font-bold ${status ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{day}</span>
                                        {status && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                                        )}
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
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                       <div className="p-6 border-b border-slate-100 dark:border-zinc-800"><h2 className="text-xl font-bold">Academic Fee {new Date().getFullYear()}</h2></div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                           {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map((m, i) => {
                               const status = currentStudent.fees?.[new Date().getFullYear()]?.[m] || "pending";
                               return (
                                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={m} className={`p-4 rounded-2xl border flex justify-between items-center ${status === 'paid' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-slate-50 dark:bg-black border-slate-100 dark:border-zinc-800'}`}>
                                       <div className="flex items-center gap-3">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold uppercase ${status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>{m.substring(0,3)}</div>
                                           <span className="capitalize font-bold text-slate-700 dark:text-slate-200">{m}</span>
                                       </div>
                                       {status === 'paid' ? <CheckCircle size={20} className="text-green-500" /> : <div className="text-xs bg-slate-200 dark:bg-zinc-800 px-3 py-1 rounded-full font-bold uppercase text-slate-500">Due</div>}
                                   </motion.div>
                               )
                           })}
                       </div>
                    </div>
                </motion.div>
            )}

            {/* 4. NOTICES (Full List) */}
            {activeTab === 'notices' && (
                <motion.div key="notices" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <h2 className="text-2xl font-bold px-2">Inbox</h2>
                    {notices.length > 0 ? (
                        notices.map((notice, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                key={notice.id} 
                                className="bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm flex gap-4"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-800 dark:text-zinc-100 font-medium leading-relaxed">{notice.text}</p>
                                    <p className="text-xs font-bold text-slate-400 mt-2">{new Date(notice.date).toLocaleDateString()}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-32 opacity-50"><Bell size={48} className="mx-auto mb-4" /><p>All caught up!</p></div>
                    )}
                </motion.div>
            )}

            {/* 5. ANALYTICS (Full Stats) */}
            {activeTab === 'analytics' && (
                <motion.div key="analytics" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <h2 className="text-2xl font-bold px-2">Analytics</h2>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-end mb-6">
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Trend</p><h3 className="text-xl font-bold">Last 6 Months</h3></div>
                        </div>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {stats.monthlyData.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl relative h-full overflow-hidden">
                                        <motion.div 
                                            initial={{ height: 0 }} animate={{ height: `${val}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                                            className="absolute bottom-0 w-full bg-blue-600 rounded-xl"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{stats.monthLabels[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 6. TIMING VIEW (NEW) */}
            {activeTab === 'timing' && (
                <motion.div key="timing" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="w-32 h-32 bg-white dark:bg-zinc-900 border-4 border-purple-100 dark:border-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
                            <Clock size={48} />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Class Schedule</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">{currentStudent.batchName} Batch</p>
                        
                        <div className="flex items-center gap-4 md:gap-8">
                            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center w-40 md:w-56 shadow-sm">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-2">Start</div>
                                <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
                                    {currentStudent.batchTiming?.start 
                                        ? new Date(`1970-01-01T${currentStudent.batchTiming.start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                        : "--:--"}
                                </div>
                            </div>
                            <div className="h-1 w-8 md:w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                            <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center w-40 md:w-56 shadow-sm">
                                <div className="text-xs text-slate-400 uppercase font-bold mb-2">End</div>
                                <div className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
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

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-black/90 dark:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 z-50 shadow-2xl">
          <div className="flex justify-between items-center px-2">
              {navItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-4 rounded-full transition-all duration-300 relative ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg scale-110 -translate-y-2' : 'text-white/60 hover:text-white'}`}>
                      {item.icon}
                  </button>
              ))}
          </div>
      </nav>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
      {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white dark:bg-zinc-900 w-full sm:w-96 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black tracking-tight">Settings</h3><button onClick={() => setShowSettings(false)} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"><X size={20}/></button></div>
                  <div className="space-y-3 mb-8">
                      {students.map((s, idx) => (
                          <button key={idx} onClick={() => switchStudent(idx)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${idx === activeStudentIndex ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                              <span className="font-bold flex-1 text-left">{s.name}</span>
                              {idx === activeStudentIndex && <CheckCircle size={20}/>}
                          </button>
                      ))}
                      <button onClick={() => { setShowSettings(false); setShowAddModal(true); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition"><div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"><Plus size={20}/></div>Add Another Child</button>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800 rounded-2xl mb-6"><div className="flex items-center gap-3 font-bold">{theme === 'light' ? <Sun size={20}/> : <Moon size={20}/>} {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</div><button onClick={toggleTheme} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}><motion.div layout className={`w-5 h-5 bg-white rounded-full shadow-md ${theme === 'dark' ? 'translate-x-5' : ''}`} /></button></div>
                  <button onClick={handleLogout} className="w-full py-4 text-red-500 font-black bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition"><LogOut size={20} /> Logout</button>
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
                      <div className="bg-slate-50 dark:bg-black p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500 transition"><input required placeholder="Student Name" className="w-full p-3 bg-transparent outline-none font-bold placeholder:font-medium" onChange={e => setAddForm({...addForm, name: e.target.value})} /></div>
                      <div className="bg-slate-50 dark:bg-black p-1 rounded-2xl border border-slate-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500 transition"><input required placeholder="Phone Number" className="w-full p-3 bg-transparent outline-none font-bold placeholder:font-medium" onChange={e => setAddForm({...addForm, phone: e.target.value})} /></div>
                      {addError && <p className="text-red-500 text-center font-bold text-sm bg-red-50 p-2 rounded-xl">{addError}</p>}
                      <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition">Cancel</button><button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg shadow-blue-500/30">Add</button></div>
                  </form>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}