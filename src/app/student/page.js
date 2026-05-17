// src/app/student/page.js

"use client";
import { z } from "zod";
import toast from "react-hot-toast";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { firestore } from "@/lib/firebase"; 
import { doc, getDoc, collection, getDocs, onSnapshot, updateDoc } from "firebase/firestore"; 
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
    CheckCircle, IndianRupee, Bell, PieChart, Clock,
    Settings, Plus, LogOut, X, Lock, Shield,
    ChevronRight, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle,
    Home, BookOpen, Users
} from "lucide-react";


// --- ZOD SCHEMAS ---
const childSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

const passwordSchema = z.object({
    current: z.string().min(1, "Current password is required"),
    new: z.string().min(6, "New password must be at least 6 characters"),
    confirm: z.string()
}).refine((data) => data.new === data.confirm, {
    message: "New passwords do not match",
    path: ["confirm"], 
});

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-white/10 backdrop-blur-md rounded-2xl ${className}`} />
);

const pageVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3 } }
};

function StudentContent() {
    const router = useRouter();

    const [students, setStudents] = useState([]);
    const [activeStudentIndex, setActiveStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [notices, setNotices] = useState([]);
    const [mounted, setMounted] = useState(false);

    const [assignments, setAssignments] = useState([]);

    const [viewDate, setViewDate] = useState(new Date());

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsView, setSettingsView] = useState("main");
    const [showAddModal, setShowAddModal] = useState(false);

    const [addForm, setAddForm] = useState({ name: "", phone: "" });
    const [addError, setAddError] = useState("");
    const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });
    const [passMsg, setPassMsg] = useState({ text: "", type: "" });

    useEffect(() => {
        setMounted(true);
        document.documentElement.classList.add("dark");
        localStorage.setItem("eduSmartTheme", "dark");

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

    useEffect(() => {
        if (!currentStudent?.institutionCode || !currentStudent?.batchId || !currentStudent?.id) return;

        const batchRef = doc(firestore, `institutions/${currentStudent.institutionCode}/batches`, currentStudent.batchId);
        const unsubBatch = onSnapshot(batchRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                const updatedStudentData = (data.students || []).find(s => s.id === currentStudent.id);
                if (updatedStudentData) {
                    const mergedData = {
                        ...updatedStudentData,
                        batchName: data.name,
                        batchId: currentStudent.batchId,
                        institutionCode: currentStudent.institutionCode,
                        batchTiming: data.timing
                    };
                    setStudents(prev => {
                        const newStudents = [...prev];
                        newStudents[activeStudentIndex] = mergedData;
                        localStorage.setItem("eduSmartStudentsList", JSON.stringify(newStudents));
                        return newStudents;
                    });
                }

                if (data.assignments) {
                    setAssignments(Object.values(data.assignments).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                } else {
                    setAssignments([]);
                }
            }
        });

        const noticesRef = collection(firestore, `institutions/${currentStudent.institutionCode}/notices`);
        const unsubNotices = onSnapshot(noticesRef, (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => list.push({ id: docSnap.id, ...docSnap.data(), type: 'notice' }));
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setNotices(list);
        });

        return () => {
            unsubBatch();
            unsubNotices();
        };
    }, [currentStudent?.institutionCode, currentStudent?.batchId, currentStudent?.id, activeStudentIndex]);

    const allMessages = useMemo(() => {
        const personal = currentStudent?.notifications
            ? currentStudent.notifications.map(val => ({ ...val, isPersonal: true }))
            : [];
        const global = notices || [];
        return [...personal, ...global].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }, [currentStudent, notices]);


    const handleLogout = () => {
        if (confirm("Logout from all accounts?")) {
            const code = currentStudent?.institutionCode;
            localStorage.removeItem("eduSmartStudentsList");
            localStorage.removeItem("eduSmartStudent");
            window.location.href = `/login?code=${code || ""}`;
        }
    };

    const switchStudent = (index) => {
        setActiveStudentIndex(index);
        setActiveTab("dashboard");
        setShowProfileModal(false);
    };

    const addNewChild = async (e) => {
        e.preventDefault();
        if (!currentStudent?.institutionCode) return;

        try {
            const validatedData = childSchema.parse({
                name: addForm.name,
                phone: addForm.phone
            });

            const batchesSnap = await getDocs(collection(firestore, `institutions/${currentStudent.institutionCode}/batches`));
            let found = null;

            batchesSnap.forEach(batchDoc => {
                const list = batchDoc.data().students || [];
                const match = list.find(s =>
                    s.name.trim().toLowerCase() === validatedData.name.trim().toLowerCase() &&
                    s.phone.trim() === validatedData.phone.trim()
                );
                if (match) {
                    found = { ...match, batchName: batchDoc.data().name, batchId: batchDoc.id, institutionCode: currentStudent.institutionCode };
                }
            });

            if (found) {
                if (students.some(s => s.id === found.id)) {
                    toast.error("Student already added to your account."); 
                    return;
                }
                const newList = [...students, found];
                setStudents(newList);
                localStorage.setItem("eduSmartStudentsList", JSON.stringify(newList));
                setActiveStudentIndex(newList.length - 1);
                setShowAddModal(false);
                setAddForm({ name: "", phone: "" });
                toast.success("Child account linked successfully!"); 
            } else {
                toast.error("Student not found in the institute database.");
            }

        } catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.errors[0].message); 
            } else {
                toast.error("Connection failed.");
            }
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (!passForm.current || !passForm.new || !passForm.confirm) {
                return toast.error("All fields are required.");
            }
            if (passForm.new !== passForm.confirm) {
                return toast.error("New passwords do not match.");
            }
            if (passForm.new.length < 6) {
                return toast.error("New password must be at least 6 characters.");
            }

            const actualCurrentPass = currentStudent?.password || currentStudent?.phone;
            if (passForm.current !== actualCurrentPass) {
                return toast.error("Incorrect current password.");
            }

            if (currentStudent?.institutionCode && currentStudent?.batchId && currentStudent?.id) {

                const basePath = currentStudent.branchId
                    ? `institutions/${currentStudent.institutionCode}/branches/${currentStudent.branchId}/batches`
                    : `institutions/${currentStudent.institutionCode}/batches`;

                const batchRef = doc(firestore, basePath, currentStudent.batchId);
                const batchSnap = await getDoc(batchRef);

                if (batchSnap.exists()) {
                    const data = batchSnap.data();
                    const studentsArr = data.students || [];
                    const studentIndex = studentsArr.findIndex(s => s.id === currentStudent.id);

                    if (studentIndex > -1) {
                        studentsArr[studentIndex].password = passForm.new;
                        await updateDoc(batchRef, { students: studentsArr });

                        toast.success("Password changed successfully!");
                        setPassForm({ current: "", new: "", confirm: "" });
                        setSettingsView("main");
                    } else {
                        toast.error("Error syncing student record.");
                    }
                } else {
                    toast.error("Batch document not found.");
                }
            }
        } catch (err) {
            console.error("Password update error:", err);
            toast.error("Failed to update password.");
        }
    };

    const stats = useMemo(() => {
        if (!currentStudent) return { attPercent: 0, feePaid: 0, streak: 0, monthlyData: [], monthLabels: [] };

        const allAttendanceValues = Object.values(currentStudent.attendance || {});
        const validDays = allAttendanceValues.filter(v => v === "present" || v === "absent");
        const attTotal = validDays.length;
        const attPresent = validDays.filter(v => v === "present").length;
        const attPercent = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;

        const currentYear = new Date().getFullYear();
        const feePaid = Object.values(currentStudent.fees?.[currentYear] || {}).filter(v => v === "paid").length;

        const monthlyData = [];
        const monthLabels = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            monthLabels.push(d.toLocaleString('default', { month: 'short' }));

            const daysInMonth = Object.entries(currentStudent.attendance || {}).filter(([k, v]) => {
                const kDate = new Date(k);
                return kDate.getMonth() === d.getMonth() && kDate.getFullYear() === d.getFullYear() && (v === 'present' || v === 'absent');
            });

            const p = daysInMonth.filter(([, v]) => v === 'present').length;
            const t = daysInMonth.length;
            monthlyData.push(t ? Math.round((p / t) * 100) : 0);
        }

        return { attPercent, feePaid, monthlyData, monthLabels };
    }, [currentStudent]);

    if (!mounted || loading) return (
        <div className="min-h-screen bg-[#05050a] text-zinc-100 p-4 space-y-4 select-none relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-1"><Skeleton className="w-24 h-4" /><Skeleton className="w-16 h-3" /></div></div><Skeleton className="w-8 h-8 rounded-full" /></div>
            <Skeleton className="w-full h-40 rounded-[1.5rem] relative z-10" />
            <div className="grid grid-cols-2 gap-3 relative z-10"><Skeleton className="h-28 rounded-[1.5rem]" /><Skeleton className="h-28 rounded-[1.5rem]" /></div>
        </div>
    );

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Home' },
        { id: 'assignments', icon: <BookOpen size={28} />, label: 'Homework', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { id: 'attendance', icon: <CheckCircle size={28} />, label: 'Attendance', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'fees', icon: <IndianRupee size={28} />, label: 'Fees', color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { id: 'notices', icon: <Bell size={28} />, label: 'Inbox', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'analytics', icon: <PieChart size={28} />, label: 'Stats', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { id: 'timing', icon: <Clock size={28} />, label: 'Time', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    ];

    return (
        <div className="flex min-h-screen font-sans transition-colors duration-300 select-none bg-[#05050a] text-zinc-100 relative overflow-hidden">
            
            {/* Ambient Glowing Orbs for Glassmorphism Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[140px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-[140px] mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[50%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen transform -translate-x-1/2"></div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 z-30 p-5 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
                <div className="p-4 mb-6">
                    <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tighter flex items-center gap-2">EduSmart</h1>
                </div>
                <div className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium border ${activeTab === item.id ? 'bg-white/10 border-white/20 text-white shadow-[0_8px_16px_rgba(0,0,0,0.2)]' : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
                        >
                            {item.id === 'dashboard' ? <Home size={20} /> : item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
                {/* Updated Desktop Sidebar Bottom (No Alphabet, Clean Switcher) */}
                <div onClick={() => setShowProfileModal(true)} className="mt-auto flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <Users size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate text-white">Switch Accounts</p>
                        <p className="text-[11px] text-zinc-400 font-medium">Manage profiles</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen">
                
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 bg-black/40 backdrop-blur-2xl px-5 py-4 flex justify-between items-center border-b border-white/10 shadow-lg">
                    {activeTab === 'dashboard' ? (
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                            <div>
                                <h1 className="text-2xl font-black leading-tight text-white tracking-tight">Hello, {currentStudent?.name?.split(" ")[0]}! 👋</h1>
                                <p className="text-xs text-indigo-300 font-medium">Welcome back to EduSmart</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveTab('dashboard')} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm">
                                <ChevronLeft size={20} className="text-zinc-200" />
                            </motion.button>
                            <h1 className="text-lg font-bold text-white">{navItems.find(n => n.id === activeTab)?.label}</h1>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowSettingsModal(true); setSettingsView("main"); }} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm">
                            <Settings size={18} className="text-zinc-300" />
                        </motion.button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-10 py-8">
                    <div>
                        {activeTab === 'dashboard' ? (
                            <h2 className="text-4xl font-black text-white tracking-tight">Welcome back, {currentStudent?.name?.split(" ")[0]}! 👋</h2>
                        ) : (
                            <h2 className="text-3xl font-black text-white tracking-tight">{navItems.find(n => n.id === activeTab)?.label}</h2>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setShowSettingsModal(true); setSettingsView("main"); }} className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg hover:bg-white/10 hover:scale-105 transition-all">
                            <Settings size={20} className="text-zinc-300" />
                        </button>
                    </div>
                </header>

                {/* Tab Content Wrapper */}
                <div className="px-5 md:px-10 pb-12 max-w-6xl mx-auto pt-6 md:pt-0 w-full flex-1">
                    <AnimatePresence mode="wait">

                        {activeTab === 'dashboard' && (
                            <motion.div key="dash" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 md:space-y-8">
                                <div className="md:hidden mt-2 mb-6">
                                    <h2 className="text-3xl font-black text-white tracking-tight">Dashboard</h2>
                                    <p className="text-indigo-300 text-sm font-medium mt-1">What would you like to check today?</p>
                                </div>
                                <div className="hidden md:block mt-2 mb-6">
                                    <p className="text-indigo-300 text-lg font-medium">What would you like to check today?</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                    {navItems.filter(item => item.id !== 'dashboard').map((item, i) => (
                                        <motion.button
                                            key={item.id}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setActiveTab(item.id)}
                                            className="bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-5 aspect-square md:aspect-auto md:py-12 group transition-all"
                                        >
                                            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${item.bg || 'bg-white/5'} ${item.color || 'text-zinc-300'} transition-transform duration-300 group-hover:scale-110 shadow-inner`}>
                                                {item.icon}
                                            </div>
                                            <span className="font-bold text-lg md:text-xl text-white tracking-wide">{item.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'assignments' && (
                            <motion.div key="assignments" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                {assignments.length > 0 ? assignments.map((task, i) => (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={task.id}
                                        className="p-6 rounded-[1.5rem] border shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-white/[0.04] backdrop-blur-xl border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-white/[0.06] transition-colors">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{task.title}</h3>
                                            {task.description && <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{task.description}</p>}
                                        </div>
                                        <div className="shrink-0 sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                            <span className="text-[11px] uppercase font-bold bg-white/10 text-indigo-300 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                                Homework
                                            </span>
                                            <div className="text-xs font-bold text-zinc-400 sm:mt-3">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-32 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-sm">
                                        <BookOpen size={56} className="mx-auto mb-5 text-white/20" />
                                        <p className="text-zinc-400 font-bold text-lg">No homework assigned yet!</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'attendance' && (
                            <motion.div key="att" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                    <div className="flex justify-between items-center mb-8 md:mb-10">
                                        <h3 className="font-black text-xl md:text-2xl text-white tracking-tight">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                        <div className="flex gap-3">
                                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:scale-110 transition"><ChevronLeft size={20} /></button>
                                            <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:scale-110 transition"><ChevronRight size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-8 text-center">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-xs md:text-sm font-black text-indigo-300 uppercase">{d}</span>)}
                                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                            const day = i + 1;
                                            const y = viewDate.getFullYear();
                                            const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                                            const dStr = String(day).padStart(2, '0');
                                            const status = currentStudent.attendance?.[`${y}-${m}-${dStr}`];
                                            return (
                                                <div key={day} className="flex flex-col items-center gap-2">
                                                    <span className={`text-sm md:text-base font-bold ${status ? 'text-white' : 'text-zinc-500'}`}>{day}</span>
                                                    {status === 'present' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />}
                                                    {status === 'absent' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'fees' && (
                            <motion.div key="fees" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="bg-white/[0.04] backdrop-blur-2xl rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                    <div className="p-6 md:p-8 border-b border-white/10 bg-white/[0.02]">
                                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Academic Fee {new Date().getFullYear()}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 p-6 md:p-8">
                                        {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map((m, i) => {
                                            const status = currentStudent.fees?.[new Date().getFullYear()]?.[m] || "pending";
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                    key={m} className={`p-5 rounded-2xl border flex justify-between items-center backdrop-blur-md ${status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]' : 'bg-white/5 border-white/10'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black uppercase ${status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>{m.substring(0, 3)}</div>
                                                        <span className="capitalize font-bold text-base text-zinc-100">{m}</span>
                                                    </div>
                                                    {status === 'paid' ? <CheckCircle size={22} className="text-emerald-400" /> : <div className="text-[11px] bg-white/10 px-3 py-1.5 rounded-full font-bold uppercase text-zinc-400 border border-white/5">Due</div>}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notices' && (
                            <motion.div key="notices" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                {allMessages.length > 0 ? allMessages.map((msg, i) => (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={msg.id}
                                        className={`p-6 rounded-[1.5rem] border shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl flex gap-5 ${msg.type === 'alert' ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.04] border-white/10'}`}
                                    >
                                        <div className={`shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center ${msg.type === 'alert' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {msg.type === 'alert' ? <AlertCircle size={24} /> : <Bell size={24} />}
                                        </div>
                                        <div>
                                            <p className={`text-base font-medium leading-relaxed ${msg.type === 'alert' ? 'text-red-100' : 'text-zinc-100'}`}>{msg.text}</p>
                                            <p className={`text-xs font-bold mt-2 ${msg.type === 'alert' ? 'text-red-400' : 'text-indigo-300'}`}>{new Date(msg.date).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                )) : <div className="text-center py-32 opacity-60"><Bell size={56} className="mx-auto mb-5 text-white/20" /><p className="text-zinc-400 font-bold text-lg">All caught up!</p></div>}
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div key="analytics" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                                <div className="bg-gradient-to-br from-indigo-600/80 to-purple-700/80 backdrop-blur-2xl text-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_16px_40px_rgba(79,70,229,0.3)] relative overflow-hidden border border-white/20">
                                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-[60px] mix-blend-overlay"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3 opacity-90">
                                            <TrendingUp size={20} />
                                            <span className="text-sm font-black uppercase tracking-widest">Overall Performance</span>
                                        </div>
                                        <div className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-lg">
                                            {currentStudent.performance || 0}<span className="text-3xl text-white/60">%</span>
                                        </div>
                                        <p className="text-sm md:text-base font-medium text-white/80 mt-4 max-w-sm">Average based on all recorded test scores throughout the session.</p>
                                    </div>
                                </div>

                                <div className="bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                    <div className="mb-8">
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Test History</p>
                                        <h3 className="text-xl md:text-2xl font-black text-white mt-1">Performance Over Time</h3>
                                    </div>

                                    <div className="h-72 w-full">
                                        {currentStudent.performanceHistory && currentStudent.performanceHistory.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={currentStudent.performanceHistory}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                                                        itemStyle={{ color: '#818cf8', fontWeight: '900' }}
                                                    />
                                                    <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={5} dot={{ r: 6, fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 3 }} activeDot={{ r: 9, fill: '#fff' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-bold border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                                                No test scores recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <div className="bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between h-44 md:h-48">
                                        <div className="w-12 h-12 rounded-[1rem] bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20"><CheckCircle size={24} /></div>
                                        <div>
                                            <div className="text-4xl md:text-5xl font-black tracking-tight text-white">{stats.attPercent}<span className="text-xl md:text-2xl text-zinc-500 ml-1">%</span></div>
                                            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-2">Attendance</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between h-44 md:h-48">
                                        <div className="w-12 h-12 rounded-[1rem] bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/20"><IndianRupee size={24} /></div>
                                        <div>
                                            <div className="text-4xl md:text-5xl font-black tracking-tight text-white">{stats.feePaid}</div>
                                            <div className="text-xs font-black text-orange-400 uppercase tracking-widest mt-2">Months Paid</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'timing' && (
                            <motion.div key="timing" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[50vh]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
                                    <div className="w-28 h-28 bg-white/5 backdrop-blur-2xl border border-white/20 text-purple-400 rounded-full flex items-center justify-center mb-8 shadow-[0_8px_32px_rgba(168,85,247,0.3)] relative z-10"><Clock size={48} /></div>
                                </div>
                                <h2 className="text-3xl font-black mb-2 text-white">Class Schedule</h2>
                                <p className="text-indigo-300 font-medium mb-10 text-lg">{currentStudent.batchName} Batch</p>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/[0.04] backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center w-40 shadow-xl">
                                        <div className="text-xs text-indigo-400 uppercase font-black mb-3 tracking-widest">Start Time</div>
                                        <div className="text-2xl font-black text-white">{currentStudent.batchTiming?.start ? new Date(`1970-01-01T${currentStudent.batchTiming.start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
                                    </div>
                                    <div className="h-1.5 w-6 bg-white/20 rounded-full"></div>
                                    <div className="bg-white/[0.04] backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center w-40 shadow-xl">
                                        <div className="text-xs text-indigo-400 uppercase font-black mb-3 tracking-widest">End Time</div>
                                        <div className="text-2xl font-black text-white">{currentStudent.batchTiming?.end ? new Date(`1970-01-01T${currentStudent.batchTiming.end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showProfileModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.95 }} className="bg-[#0f0f13]/80 backdrop-blur-3xl w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 shadow-[0_16px_60px_rgba(0,0,0,0.6)] border border-white/10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black tracking-tight text-white">Your Accounts</h3>
                                <button onClick={() => setShowProfileModal(false)} className="p-2.5 bg-white/5 border border-white/10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                {students.map((s, idx) => (
                                    <button key={idx} onClick={() => switchStudent(idx)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all ${idx === activeStudentIndex ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 shadow-[0_4px_20px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200'}`}>
                                        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-black text-white">{s.name.charAt(0)}</div>
                                        <span className="font-bold flex-1 text-left text-lg">{s.name}</span>
                                        {idx === activeStudentIndex && <CheckCircle size={22} className="text-indigo-400" />}
                                    </button>
                                ))}
                                <button onClick={() => { setShowProfileModal(false); setShowAddModal(true); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-white/20 text-zinc-300 font-bold hover:bg-white/5 hover:border-white/30 transition mt-4">
                                    <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"><Plus size={20} /></div>
                                    Add Another Child
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSettingsModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ y: "100%", scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: "100%", scale: 0.95 }} className="bg-[#0f0f13]/80 backdrop-blur-3xl w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 shadow-[0_16px_60px_rgba(0,0,0,0.6)] border border-white/10">
                            {settingsView === "main" && (
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-white"><Settings size={28} className="text-indigo-400" /> Settings</h3>
                                        <button onClick={() => setShowSettingsModal(false)} className="p-2.5 bg-white/5 border border-white/10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10"><X size={20} /></button>
                                    </div>

                                    {/* NEW PROFILE SECTION IN SETTINGS */}
                                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-[2rem] border border-white/10 p-6 mb-6 backdrop-blur-md shadow-inner">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-3xl font-black shadow-[0_8px_32px_rgba(99,102,241,0.4)] mb-4 border-2 border-white/20">
                                            {currentStudent?.name?.charAt(0)}
                                        </div>
                                        <h2 className="text-xl font-black text-white">{currentStudent?.name}</h2>
                                        <p className="text-sm font-medium text-indigo-300 mt-1">{currentStudent?.batchName || "Student"}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <button onClick={() => setSettingsView("password")} className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] border border-white/10 backdrop-blur-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                                                <div className="text-left"><p className="font-bold text-white text-lg">Change Password</p><p className="text-xs text-indigo-300 font-medium">Update your credentials</p></div>
                                            </div>
                                            <ChevronRight size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                                        </button>
                                        <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-red-500/10 hover:bg-red-500/20 rounded-[1.5rem] border border-red-500/20 backdrop-blur-md transition-all mt-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center"><LogOut size={24} /></div>
                                                <div className="text-left"><p className="font-bold text-red-400 text-lg">Logout</p></div>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            {settingsView === "password" && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="flex justify-between items-center mb-6">
                                        <button onClick={() => { setSettingsView("main"); setPassMsg({ text: "", type: "" }); }} className="flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-indigo-200 transition-colors"><ChevronLeft size={18} /> Back</button>
                                        <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-white/5 border border-white/10 rounded-full text-zinc-300 hover:text-white hover:bg-white/10"><X size={20} /></button>
                                    </div>
                                    <h3 className="text-2xl font-black mb-6 text-white">Change Password</h3>
                                    <div className="space-y-4">
                                        <input type="password" placeholder="Current Password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-zinc-500 backdrop-blur-sm" />
                                        <input type="password" placeholder="New Password" value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-zinc-500 backdrop-blur-sm" />
                                        <input type="password" placeholder="Confirm New Password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-zinc-500 backdrop-blur-sm" />
                                        {passMsg.text && <p className={`text-xs font-bold p-4 rounded-xl border backdrop-blur-md ${passMsg.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>{passMsg.text}</p>}
                                        <button onClick={handlePasswordChange} className="w-full bg-indigo-600 text-white py-4 rounded-xl text-base font-bold hover:bg-indigo-500 transition shadow-[0_4px_20px_rgba(79,70,229,0.4)] mt-4">Save Password</button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#0f0f13]/80 border border-white/10 backdrop-blur-3xl w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_16px_60px_rgba(0,0,0,0.6)]">
                            <h3 className="text-2xl font-black mb-6 text-white">Add Child</h3>
                            <form onSubmit={addNewChild} className="space-y-4">
                                <input required placeholder="Student Name" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 placeholder:text-zinc-500 backdrop-blur-sm" onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                                <input required placeholder="Phone Number" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 placeholder:text-zinc-500 backdrop-blur-sm" onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
                                {addError && <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl backdrop-blur-md">{addError}</p>}
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-zinc-300 hover:bg-white/10 rounded-2xl border border-transparent hover:border-white/10 transition-all">Cancel</button>
                                    <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-500 shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all">Add</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function StudentPortalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500 font-bold bg-[#05050a]">Loading...</div>}>
            <StudentContent />
        </Suspense>
    );
}