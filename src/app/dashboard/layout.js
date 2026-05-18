"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore"; 
import { firestore } from "@/lib/firebase"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  CheckSquare, 
  IndianRupee, 
  Bell, 
  LogOut, 
  School,
  Menu,
  X,
  Clock,
  BookOpen,
  MessageCircleQuestion,
  Settings as SettingsIcon,
  User
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("Loading...");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const modalSpring = { duration: 0.22, ease: "easeInOut" };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.institutionCode) {
      getDoc(doc(firestore, "institutions", user.institutionCode)).then(snap => {
        if (snap.exists()) setSchoolName(snap.data().name);
      });
    }
  }, [user?.institutionCode]);

  const handleSupportClick = () => {
    const text = encodeURIComponent(`Hello Shah, I need support for my institution. My code is: ${user?.institutionCode}`);
    window.open(`https://wa.me/917388739691?text=${text}`, "_blank");
  };

  const handleSwitchToStudent = () => {
    const existing = localStorage.getItem("eduSmartStudentsList");
    if (!existing) {
        // Create a temporary dummy profile so the admin can explore the student UI
        const dummy = {
            id: "admin-preview",
            name: user.username || "Admin Preview",
            phone: "N/A",
            institutionCode: user.institutionCode || user.schoolId,
            batchId: "preview",
            batchName: "Admin Preview"
        };
        localStorage.setItem("eduSmartStudentsList", JSON.stringify([dummy]));
    }
    router.push("/student");
    setShowSettingsModal(false);
  };

  if (loading || !user) return null;

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/dashboard/attendance", label: "Attendance", icon: <CheckSquare size={20} /> },
    { href: "/dashboard/fees", label: "Fees", icon: <IndianRupee size={20} /> },
    { href: "/dashboard/notices", label: "Notifications", icon: <Bell size={20} /> },
    { href: "/dashboard/timing", label: "Schedule", icon: <Clock size={20} /> },
    { href: "/dashboard/homework", label: "Homework", icon: <BookOpen size={20} /> }
  ];

  return (
    <div className="app-shell flex h-screen transition-colors duration-300">
      
      {/* MOBILE HEADER (removed on mobile) */}
      <div className="glass-panel hidden fixed top-0 w-full z-50 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2 font-black text-xl text-blue-600 dark:text-blue-400">
            <School /> {schoolName}
         </div>
         <div className="flex items-center gap-2">
         <button className="touch-target relative rounded-2xl glass-card text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-900"></span>
            </span>
         </button>
         </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        glass-panel flex flex-col md:m-4 md:mr-0 md:rounded-[1.75rem]
      `}>
        <div className="p-6 border-b border-white/40 dark:border-white/10 hidden md:block">
          <div className="flex items-center gap-2 font-black text-xl text-blue-600">
            <School /> {schoolName}
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 truncate font-mono opacity-70">
            ID: {user.schoolId || user.institutionCode}
          </p>
        </div>

        <div className="md:hidden p-6 border-b border-white/40 dark:border-white/10 flex justify-between items-center">
            <div className="font-black text-xl text-blue-600 flex items-center gap-2">
                <School /> Menu
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="touch-target glass-card rounded-2xl text-gray-600 dark:text-gray-300">
                <X size={20} />
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`touch-target gpu-animated flex items-center gap-3 rounded-xl px-3 transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? "bg-white/80 dark:bg-white/10 text-blue-600 dark:text-blue-300 shadow-sm" 
                    : "text-gray-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-zinc-100"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM PROFILE / SETTINGS BUTTON */}
        <div className="p-4 border-t border-white/40 dark:border-white/10">
          <button 
            onClick={() => setShowSettingsModal(true)} 
            className="glass-card w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden text-left flex-1">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{user.username}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-bold">Settings</span>
            </div>
            <SettingsIcon size={18} className="text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </aside>

      {/* BACKGROUND OVERLAY (Mobile Only) */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0 scroll-smooth pb-28 md:pb-0 relative z-0">
        {children}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <nav className="glass-panel relative rounded-[2rem] flex justify-between items-center px-3 py-3">
          <Link href="/dashboard/admin" className={`touch-target gpu-animated flex flex-col items-center justify-center rounded-2xl transition ${pathname === "/dashboard/admin" ? "bg-white/70 text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}><LayoutDashboard size={22} /></Link>
          <Link href="/dashboard/attendance" className={`touch-target gpu-animated flex flex-col items-center justify-center rounded-2xl transition ${pathname === "/dashboard/attendance" ? "bg-white/70 text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}><CheckSquare size={22} /></Link>
          <Link href="/dashboard/fees" className={`touch-target gpu-animated flex flex-col items-center justify-center rounded-2xl transition ${pathname === "/dashboard/fees" ? "bg-white/70 text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}><IndianRupee size={22} /></Link>
          <Link href="/dashboard/homework" className={`touch-target gpu-animated flex flex-col items-center justify-center rounded-2xl transition ${pathname === "/dashboard/homework" ? "bg-white/70 text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}><BookOpen size={22} /></Link>
          <button onClick={() => setIsMobileMenuOpen(true)} className="touch-target gpu-animated flex flex-col items-center justify-center rounded-2xl text-gray-600 dark:text-gray-400 hover:text-blue-500 transition"><Menu size={22} /></button>
        </nav>
      </div>

      {/* ADMIN SETTINGS MODAL */}
      <AnimatePresence>
          {showSettingsModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-slate-950/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={modalSpring} className="glass-panel w-full sm:w-[28rem] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-950 dark:text-white"><SettingsIcon size={28} className="text-slate-600 dark:text-zinc-300" /> Settings</h3>
                          <button onClick={() => setShowSettingsModal(false)} className="touch-target glass-card rounded-2xl text-slate-600 dark:text-zinc-300"><X size={20} /></button>
                      </div>

                      <div className="flex flex-col items-center justify-center glass-card rounded-[2rem] p-6 mb-6 border border-white/40 dark:border-white/10">
                          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center text-3xl font-black shadow-inner mb-4 border-2 border-white/50 dark:border-white/20">
                              {user.username.charAt(0).toUpperCase()}
                          </div>
                          <h2 className="text-xl font-black text-slate-950 dark:text-white">{user.username}</h2>
                          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Admin • ID: {user.schoolId || user.institutionCode}</p>
                      </div>

                      <div className="space-y-4">
                          <div className="glass-card w-full flex items-center justify-between p-4 rounded-[1.5rem] border border-white/40 dark:border-white/10">
                              <span className="font-bold text-slate-950 dark:text-white pl-2">App Theme</span>
                              <ThemeToggle />
                          </div>

                          <button onClick={handleSupportClick} className="glass-card w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-colors group border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/5">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform"><MessageCircleQuestion size={24} /></div>
                                  <div className="text-left"><p className="font-bold text-slate-950 dark:text-white text-lg">Contact Support</p></div>
                              </div>
                          </button>

                          {/* MAGICAL SWITCH TO STUDENT BUTTON */}
                          <button onClick={handleSwitchToStudent} className="glass-card w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-colors group border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/5">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform"><User size={24} /></div>
                                  <div className="text-left"><p className="font-bold text-slate-950 dark:text-white text-lg">Switch to Student View</p><p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Test as a student</p></div>
                              </div>
                          </button>

                          <button onClick={logout} className="w-full flex items-center justify-between p-5 bg-red-500/10 hover:bg-red-500/20 rounded-[1.5rem] border border-red-500/20 backdrop-blur-md transition-all mt-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center"><LogOut size={24} /></div>
                                  <div className="text-left"><p className="font-bold text-red-500 text-lg">Logout</p></div>
                              </div>
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}