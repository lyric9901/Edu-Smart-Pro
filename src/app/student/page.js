"use client";
import { z } from "zod";
import toast from "react-hot-toast";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase"; 
import { doc, getDoc, collection, getDocs, onSnapshot, updateDoc } from "firebase/firestore"; 
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
    CheckCircle, IndianRupee, Bell, PieChart, Clock,
    Settings, Plus, LogOut, X, Shield,
    ChevronRight, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle,
    Home, BookOpen, Users
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// --- ZOD SCHEMAS ---
const childSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    phone: z.string().min(1, "Contact detail is required"), 
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
    <div className={`animate-pulse bg-slate-200/75 dark:bg-white/10 backdrop-blur-md rounded-2xl ${className}`} />
);

const springConfig = { duration: 0.22, ease: "easeInOut" };
const fastSpringConfig = { duration: 0.16, ease: "easeInOut" };
const modalSpring = { duration: 0.22, ease: "easeInOut" };

const pageVariants = {
    hidden: { opacity: 0, x: 20, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: springConfig },
    exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } }
};

const viewVariants = {
    hidden: (direction) => ({ opacity: 0, x: direction === 'right' ? 30 : -30 }),
    visible: { opacity: 1, x: 0, transition: fastSpringConfig },
    exit: (direction) => ({ opacity: 0, x: direction === 'right' ? -30 : 30, transition: { duration: 0.15 } })
};

function StudentContent() {
    const router = useRouter();
    const { user: adminUser } = useAuth(); 

    const [students, setStudents] = useState([]);
    const [activeStudentIndex, setActiveStudentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(true);
    const [notices, setNotices] = useState([]);
    const [mounted, setMounted] = useState(false);
    const [schoolName, setSchoolName] = useState("Loading...");

    const [assignments, setAssignments] = useState([]);
    const [viewDate, setViewDate] = useState(new Date());

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsView, setSettingsView] = useState("main");
    const [settingsDirection, setSettingsDirection] = useState('right');
    const [showAddModal, setShowAddModal] = useState(false);

    const [addForm, setAddForm] = useState({ name: "", phone: "" });
    const [addError, setAddError] = useState("");
    const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });
    const [passMsg, setPassMsg] = useState({ text: "", type: "" });

    useEffect(() => {
        setMounted(true);

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
        if (currentStudent?.institutionCode) {
            getDoc(doc(firestore, "institutions", currentStudent.institutionCode)).then(snap => {
                if (snap.exists()) setSchoolName(snap.data().name);
            });
        }
    }, [currentStudent?.institutionCode]);

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

    const navigateSettings = (view) => {
        setSettingsDirection(view === 'password' ? 'right' : 'left');
        setSettingsView(view);
    };

    const addNewChild = async (e) => {
        e.preventDefault();
        setAddError("");
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
                    (s.phone || "").trim() === validatedData.phone.trim() 
                );
                if (match) {
                    found = { ...match, batchName: batchDoc.data().name, batchId: batchDoc.id, institutionCode: currentStudent.institutionCode };
                }
            });

            if (found) {
                if (students.some(s => s.id === found.id)) {
                    setAddError("Student already added to your account."); 
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
                setAddError("Student not found in the institute database. Please check exactly how your school typed it.");
            }

        } catch (err) {
            if (err instanceof z.ZodError) {
                setAddError(err.errors[0].message); 
            } else {
                setAddError("Connection failed.");
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
                        navigateSettings("main");
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
        <div className="app-shell min-h-screen p-4 space-y-4 select-none relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-1"><Skeleton className="w-24 h-4" /><Skeleton className="w-16 h-3" /></div></div><Skeleton className="w-8 h-8 rounded-full" /></div>
            <Skeleton className="w-full h-40 rounded-[1.5rem] relative z-10" />
            <div className="grid grid-cols-2 gap-3 relative z-10"><Skeleton className="h-28 rounded-[1.5rem]" /><Skeleton className="h-28 rounded-[1.5rem]" /></div>
        </div>
    );

    // --- REFINED UI ITEMS ---
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'assignments', icon: BookOpen, label: 'Homework', desc: 'View and manage your assignments', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { id: 'attendance', icon: CheckCircle, label: 'Attendance', desc: 'Check your attendance and records', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { id: 'fees', icon: IndianRupee, label: 'Fees', desc: 'View fee structure and payments', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
        { id: 'notices', icon: Bell, label: 'Inbox', desc: 'Messages and announcements', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
        { id: 'analytics', icon: PieChart, label: 'Stats', desc: 'View your academic performance', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' },
        { id: 'timing', icon: Clock, label: 'Time', desc: 'Manage your schedule and deadlines', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
        { id: 'settings', icon: Settings, label: 'Settings', desc: 'Customize your preferences and account settings', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    ];

    return (
        <div className="app-shell flex min-h-screen font-sans transition-colors duration-300 select-none text-slate-900 dark:text-zinc-100 relative overflow-hidden">
            
            {/* Ambient Glowing Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[140px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[140px] mix-blend-screen"></div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 fixed h-full glass-panel z-30 p-5 border-r border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#06080f]/80 backdrop-blur-2xl">
                <div className="p-4 mb-6">
                    <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter flex items-center gap-2">
                        {schoolName}
                    </h1>
                </div>
                <div className="flex-1 space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'settings') {
                                        setShowSettingsModal(true);
                                        setSettingsView("main");
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors duration-200 font-medium border ${activeTab === item.id ? 'bg-white shadow-sm border-slate-200 text-blue-600 dark:bg-white/10 dark:border-white/10 dark:text-white' : 'border-transparent text-slate-600 hover:bg-white/60 hover:text-slate-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'}`}
                            >
                                {item.id === 'dashboard' ? <Home size={20} /> : <Icon size={20} />}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
                {/* Desktop Sidebar Bottom */}
                <ThemeToggle className="mb-3 w-full justify-center" />
                <div onClick={() => setShowProfileModal(true)} className="mt-auto flex items-center gap-3 p-4 rounded-2xl glass-card cursor-pointer transition border border-slate-200/50 dark:border-white/5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-white flex items-center justify-center font-bold">
                        <Users size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate text-slate-900 dark:text-white">Switch Accounts</p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Manage profiles</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 relative z-10 flex flex-col min-h-screen overflow-x-hidden pt-4 md:pt-10">
                
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 px-5 py-4 flex justify-between items-center bg-white/70 dark:bg-[#06080f]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
                    {activeTab === 'dashboard' ? (
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileModal(true)}>
                            <div>
                                <h1 className="text-xl font-black leading-tight text-slate-950 dark:text-white tracking-tight">{schoolName}</h1>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">Student Dashboard</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('dashboard')} className="touch-target rounded-2xl glass-card flex items-center justify-center">
                                <ChevronLeft size={20} className="text-slate-700 dark:text-zinc-200" />
                            </motion.button>
                            <h1 className="text-lg font-bold text-slate-950 dark:text-white">{navItems.find(n => n.id === activeTab)?.label}</h1>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <ThemeToggle compact />
                        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowProfileModal(true)} className="touch-target rounded-2xl glass-card flex items-center justify-center">
                            <Users size={18} className="text-slate-600 dark:text-zinc-300" />
                        </motion.button>
                    </div>
                </header>

                {/* Tab Content Wrapper */}
                <div className="px-5 md:px-10 pb-12 max-w-6xl mx-auto pt-6 md:pt-0 w-full flex-1 mt-2">
                    <AnimatePresence mode="wait">

                        {activeTab === 'dashboard' && (
                            <motion.div key="dash" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 md:space-y-6">

                                {/* Beautiful Welcome Banner */}
                                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#f0f4ff] to-[#e0e7ff] dark:from-[#1e293b] dark:to-[#0f172a] p-6 md:p-8 flex items-center justify-between border border-blue-200/40 dark:border-white/5 shadow-sm">
                                    <div className="relative z-10">
                                        <h2 className="hidden md:flex text-xl md:text-2xl font-black text-slate-900 dark:text-white items-center gap-2 mb-1.5">
                                            Welcome back, {currentStudent?.name?.split(' ')[0] || "Student"}! 👋
                                        </h2>
                                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                                            Let's make today productive.
                                        </p>
                                    </div>
                                    <div className="relative z-10 w-20 h-20 md:w-32 md:h-32 hidden md:flex items-center justify-center right-4">
                                        <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-2xl"></div>
                                        <span className="text-6xl md:text-7xl drop-shadow-2xl">📚</span>
                                    </div>
                                </div>

                                {/* Clean UI Grid matching the image exactly */}
                                <div className="grid grid-cols-2 gap-4 md:gap-5 mt-2">
                                    {navItems.filter(item => item.id !== 'dashboard' && item.id !== 'settings').map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                whileTap={{ scale: 0.96 }}
                                                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ ...fastSpringConfig, delay: Math.min(i * 0.02, 0.08) }}
                                                onClick={() => setActiveTab(item.id)}
                                                className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 p-5 md:p-6 rounded-[2rem] flex flex-col items-start justify-between text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-lg transition-all aspect-[4/4.5] sm:aspect-auto sm:h-52 relative group"
                                            >
                                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4 shrink-0 ${item.bg}`}>
                                                    <Icon className={item.color} size={24} strokeWidth={2.5} />
                                                </div>
                                                <div className="mt-auto pr-2 sm:pr-6">
                                                    <span className="font-bold text-base md:text-lg text-slate-900 dark:text-white block mb-1">{item.label}</span>
                                                    <span className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 leading-snug hidden sm:block line-clamp-2">{item.desc}</span>
                                                </div>
                                                <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#151f32] flex items-center justify-center text-slate-400 group-hover:text-current transition-colors">
                                                    <ChevronRight size={16} className={item.color} />
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Full Width Settings Card */}
                                {navItems.filter(item => item.id === 'settings').map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.button
                                            key={item.id}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ ...fastSpringConfig, delay: 0.15 }}
                                            onClick={() => { setShowSettingsModal(true); setSettingsView("main"); }}
                                            className="w-full bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 p-5 md:p-6 rounded-[2.5rem] flex items-center gap-5 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-lg transition-all relative group"
                                        >
                                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                                                <Icon className={item.color} size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 pr-10">
                                                <span className="font-bold text-base md:text-lg text-slate-900 dark:text-white block mb-1">{item.label}</span>
                                                <span className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">{item.desc}</span>
                                            </div>
                                            <div className="absolute right-5 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#151f32] flex items-center justify-center text-slate-400 group-hover:text-current transition-colors">
                                                <ChevronRight size={16} className={item.color} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}

                        {activeTab === 'assignments' && (
                            <motion.div key="assignments" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                {assignments.length > 0 ? assignments.map((task, i) => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springConfig, delay: Math.min(i * 0.02, 0.08) }} key={task.id}
                                        className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm p-6 rounded-[1.5rem] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-colors">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-950 dark:text-white">{task.title}</h3>
                                            {task.description && <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">{task.description}</p>}
                                        </div>
                                        <div className="shrink-0 sm:text-right flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                            <span className="text-[11px] uppercase font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-500/20">
                                                Homework
                                            </span>
                                            <div className="text-xs font-bold text-slate-500 dark:text-zinc-500 sm:mt-3">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-32 border-2 border-dashed border-slate-300/70 dark:border-white/10 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm">
                                        <BookOpen size={56} className="mx-auto mb-5 text-slate-300 dark:text-white/20" />
                                        <p className="text-slate-500 dark:text-zinc-400 font-bold text-lg">No homework assigned yet!</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'attendance' && (
                            <motion.div key="att" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm p-6 md:p-8 rounded-[2.5rem]">
                                    <div className="flex justify-between items-center mb-8 md:mb-10">
                                        <h3 className="font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                        <div className="flex gap-3">
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition"><ChevronLeft size={20} /></motion.button>
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-white/5 dark:border-white/10 dark:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition"><ChevronRight size={20} /></motion.button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-8 text-center">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-xs md:text-sm font-black text-emerald-500 uppercase">{d}</span>)}
                                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                            const day = i + 1;
                                            const y = viewDate.getFullYear();
                                            const m = String(viewDate.getMonth() + 1).padStart(2, '0');
                                            const dStr = String(day).padStart(2, '0');
                                            const status = currentStudent.attendance?.[`${y}-${m}-${dStr}`];
                                            return (
                                                <div key={day} className="flex flex-col items-center gap-2">
                                                    <span className={`text-sm md:text-base font-bold ${status ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`}>{day}</span>
                                                    {status === 'present' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: fastSpringConfig }} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />}
                                                    {status === 'absent' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: fastSpringConfig }} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'fees' && (
                            <motion.div key="fees" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
                                <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm rounded-[2.5rem] overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Academic Fee {new Date().getFullYear()}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 p-6 md:p-8">
                                        {["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map((m, i) => {
                                            const status = currentStudent.fees?.[new Date().getFullYear()]?.[m] || "pending";
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springConfig, delay: i * 0.04 }}
                                                    key={m} className={`p-5 rounded-2xl border flex justify-between items-center ${status === 'paid' ? 'bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10' : 'bg-white border-slate-100 dark:bg-[#06080f] dark:border-white/5'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black uppercase ${status === 'paid' ? 'bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-zinc-400'}`}>{m.substring(0, 3)}</div>
                                                        <span className="capitalize font-bold text-base text-slate-900 dark:text-zinc-100">{m}</span>
                                                    </div>
                                                    {status === 'paid' ? <CheckCircle size={22} className="text-emerald-500" /> : <div className="text-[11px] bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-zinc-400 px-3 py-1.5 rounded-full font-bold uppercase border border-slate-200 dark:border-white/5">Due</div>}
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
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springConfig, delay: i * 0.05 }} key={msg.id}
                                        className={`p-6 rounded-[1.5rem] border shadow-sm flex gap-5 ${msg.type === 'alert' ? 'bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/30' : 'bg-white border-slate-100 dark:bg-[#0b1120] dark:border-white/5'}`}
                                    >
                                        <div className={`shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center ${msg.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400'}`}>
                                            {msg.type === 'alert' ? <AlertCircle size={24} /> : <Bell size={24} />}
                                        </div>
                                        <div>
                                            <p className={`text-base font-medium leading-relaxed ${msg.type === 'alert' ? 'text-red-800 dark:text-red-100' : 'text-slate-800 dark:text-zinc-100'}`}>{msg.text}</p>
                                            <p className={`text-xs font-bold mt-2 ${msg.type === 'alert' ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-zinc-400'}`}>{new Date(msg.date).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                )) : <div className="text-center py-32 opacity-60"><Bell size={56} className="mx-auto mb-5 text-slate-300 dark:text-white/20" /><p className="text-slate-500 dark:text-zinc-400 font-bold text-lg">All caught up!</p></div>}
                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div key="analytics" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">

                                <div className="bg-gradient-to-br from-slate-900 to-black dark:from-zinc-800/80 dark:to-black/80 text-white p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-800 dark:border-white/10">
                                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-[60px] mix-blend-overlay"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3 opacity-90">
                                            <TrendingUp size={20} />
                                            <span className="text-sm font-black uppercase tracking-widest">Overall Performance</span>
                                        </div>
                                        <div className="text-7xl md:text-8xl font-black tracking-tighter drop-shadow-lg">
                                            {currentStudent.performance || 0}<span className="text-3xl text-white/60">%</span>
                                        </div>
                                        <p className="text-sm md:text-base font-medium text-slate-400 dark:text-zinc-400 mt-4 max-w-sm">Average based on all recorded test scores throughout the session.</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm p-6 md:p-8 rounded-[2.5rem]">
                                    <div className="mb-8">
                                        <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Test History</p>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">Performance Over Time</h3>
                                    </div>

                                    <div className="h-72 w-full">
                                        {currentStudent.performanceHistory && currentStudent.performanceHistory.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={currentStudent.performanceHistory}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                                                        itemStyle={{ color: '#f43f5e', fontWeight: '900' }}
                                                    />
                                                    <Line type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={5} dot={{ r: 6, fill: '#fff', stroke: '#f43f5e', strokeWidth: 3 }} activeDot={{ r: 9, fill: '#f43f5e' }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-sm font-bold border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02]">
                                                No test scores recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm p-6 md:p-8 rounded-[2rem] flex flex-col justify-between h-44 md:h-48">
                                        <div className="w-12 h-12 rounded-[1rem] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20"><CheckCircle size={24} /></div>
                                        <div>
                                            <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{stats.attPercent}<span className="text-xl md:text-2xl text-slate-400 dark:text-zinc-500 ml-1">%</span></div>
                                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-2">Attendance</div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 shadow-sm p-6 md:p-8 rounded-[2rem] flex flex-col justify-between h-44 md:h-48">
                                        <div className="w-12 h-12 rounded-[1rem] bg-slate-100 text-slate-600 dark:bg-zinc-500/20 dark:text-zinc-300 flex items-center justify-center border border-slate-200 dark:border-zinc-500/20"><IndianRupee size={24} /></div>
                                        <div>
                                            <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">{stats.feePaid}</div>
                                            <div className="text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-2">Months Paid</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'timing' && (
                            <motion.div key="timing" variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[50vh]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                    <div className="w-28 h-28 bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/10 text-yellow-500 rounded-full flex items-center justify-center mb-8 shadow-lg relative z-10"><Clock size={48} /></div>
                                </div>
                                <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Class Schedule</h2>
                                <p className="text-slate-500 dark:text-zinc-400 font-medium mb-10 text-lg">{currentStudent.batchName} Batch</p>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 p-6 rounded-3xl text-center w-40 shadow-sm">
                                        <div className="text-xs text-yellow-500 uppercase font-black mb-3 tracking-widest">Start Time</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{currentStudent.batchTiming?.start ? new Date(`1970-01-01T${currentStudent.batchTiming.start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
                                    </div>
                                    <div className="h-1.5 w-6 bg-slate-200 dark:bg-white/20 rounded-full"></div>
                                    <div className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/5 p-6 rounded-3xl text-center w-40 shadow-sm">
                                        <div className="text-xs text-yellow-500 uppercase font-black mb-3 tracking-widest">End Time</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{currentStudent.batchTiming?.end ? new Date(`1970-01-01T${currentStudent.batchTiming.end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</div>
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.12 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0, transition: modalSpring }} exit={{ y: "100%", transition: { duration: 0.16, ease: "easeInOut" } }} className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/10 w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Your Accounts</h3>
                                <button onClick={() => setShowProfileModal(false)} className="touch-target bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-zinc-300 transition flex items-center justify-center"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                {students.map((s, idx) => (
                                    <motion.button whileTap={{ scale: 0.99 }} key={idx} onClick={() => switchStudent(idx)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-colors ${idx === activeStudentIndex ? 'bg-blue-50 border-blue-200 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-[#06080f] dark:hover:bg-white/5 dark:text-zinc-300'}`}>
                                        <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-white/10 flex items-center justify-center font-black text-blue-600 dark:text-white">{s.name.charAt(0)}</div>
                                        <span className="font-bold flex-1 text-left text-lg">{s.name}</span>
                                        {idx === activeStudentIndex && <CheckCircle size={22} className="text-blue-600 dark:text-white" />}
                                    </motion.button>
                                ))}
                                <motion.button whileTap={{ scale: 0.99 }} onClick={() => { setShowProfileModal(false); setShowAddModal(true); setAddError(""); }} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 text-slate-600 dark:text-zinc-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition mt-4">
                                    <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><Plus size={20} /></div>
                                    Add Another Child
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSettingsModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.12 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0, transition: modalSpring }} exit={{ y: "100%", transition: { duration: 0.16, ease: "easeInOut" } }} className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/10 w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                            <AnimatePresence mode="wait" custom={settingsDirection}>
                                {settingsView === "main" && (
                                    <motion.div key="main" custom={settingsDirection} variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="w-full p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-950 dark:text-white"><Settings size={28} className="text-slate-600 dark:text-zinc-300" /> Settings</h3>
                                            <button onClick={() => setShowSettingsModal(false)} className="touch-target bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl text-slate-600 dark:text-zinc-300 flex items-center justify-center"><X size={20} /></button>
                                        </div>

                                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-[#06080f] border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 mb-6">
                                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white flex items-center justify-center text-3xl font-black shadow-inner mb-4 border-2 border-white dark:border-white/20">
                                                {currentStudent?.name?.charAt(0)}
                                            </div>
                                            <h2 className="text-xl font-black text-slate-950 dark:text-white">{currentStudent?.name}</h2>
                                            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{currentStudent?.batchName || "Student"}</p>
                                        </div>

                                        <div className="space-y-4">
                                            
                                            {adminUser && (
                                                <motion.button whileTap={{ scale: 0.99 }} onClick={() => router.push('/dashboard/admin')} className="w-full flex items-center justify-between p-5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-[1.5rem] border border-purple-200 dark:border-purple-800/30 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-purple-200 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                                                        <div className="text-left"><p className="font-bold text-slate-950 dark:text-white text-lg">Switch to Admin</p><p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Return to dashboard</p></div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-slate-400 dark:text-zinc-500 transition-colors" />
                                                </motion.button>
                                            )}

                                            <motion.button whileTap={{ scale: 0.99 }} onClick={() => navigateSettings("password")} className="w-full flex items-center justify-between p-5 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-[#06080f] dark:border-white/5 dark:hover:bg-white/5 rounded-[1.5rem] transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Shield size={24} /></div>
                                                    <div className="text-left"><p className="font-bold text-slate-950 dark:text-white text-lg">Change Password</p><p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Update your credentials</p></div>
                                                </div>
                                                <ChevronRight size={20} className="text-slate-400 dark:text-zinc-500 transition-colors" />
                                            </motion.button>

                                            <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-red-50 hover:bg-red-100 border border-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20 rounded-[1.5rem] transition-all mt-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center"><LogOut size={24} /></div>
                                                    <div className="text-left"><p className="font-bold text-red-600 dark:text-red-400 text-lg">Logout</p></div>
                                                </div>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                                {settingsView === "password" && (
                                    <motion.div key="password" custom={settingsDirection} variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="w-full p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <button onClick={() => { navigateSettings("main"); setPassMsg({ text: "", type: "" }); }} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white transition-colors"><ChevronLeft size={18} /> Back</button>
                                            <button onClick={() => setShowSettingsModal(false)} className="touch-target bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl text-slate-600 dark:text-zinc-300 flex items-center justify-center"><X size={20} /></button>
                                        </div>
                                        <h3 className="text-2xl font-black mb-6 text-slate-950 dark:text-white">Change Password</h3>
                                        <div className="space-y-4">
                                            <input type="password" placeholder="Current Password" value={passForm.current} onChange={e => setPassForm({ ...passForm, current: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors" />
                                            <input type="password" placeholder="New Password" value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors" />
                                            <input type="password" placeholder="Confirm New Password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors" />
                                            {passMsg.text && <p className={`text-xs font-bold p-4 rounded-xl border ${passMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'}`}>{passMsg.text}</p>}
                                            <motion.button whileTap={{ scale: 0.99 }} onClick={handlePasswordChange} className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 py-4 rounded-xl text-base font-bold hover:bg-black dark:hover:bg-slate-200 transition mt-4">Save Password</motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.12 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0, transition: modalSpring }} exit={{ y: "100%", transition: { duration: 0.16, ease: "easeInOut" } }} className="bg-white dark:bg-[#0b1120] border border-slate-100 dark:border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
                            <h3 className="text-2xl font-black mb-6 text-slate-950 dark:text-white">Add Child</h3>
                            <form onSubmit={addNewChild} className="space-y-4">
                                <input required placeholder="Student Name" className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors" onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                                <input required placeholder="Contact / Phone Info" className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-colors" onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
                                {addError && <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 p-3 rounded-xl">{addError}</p>}
                                <div className="flex gap-3 pt-4">
                                    <motion.button whileTap={{ scale: 0.99 }} type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl border border-transparent transition-all">Cancel</motion.button>
                                    <motion.button whileTap={{ scale: 0.99 }} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-bold hover:bg-black dark:hover:bg-slate-200 transition-all shadow-lg">Add</motion.button>
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
        <Suspense fallback={<div className="app-shell min-h-screen flex items-center justify-center text-slate-500 dark:text-zinc-500 font-bold">Loading...</div>}>
            <StudentContent />
        </Suspense>
    );
}