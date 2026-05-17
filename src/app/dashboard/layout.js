"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  BookOpen
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* MOBILE HEADER WITH PURE GLASSMORPHISM & NOTIFICATIONS AT TOP RIGHT */}
      <div className="md:hidden fixed top-0 w-full bg-white/10 dark:bg-black/10 backdrop-blur-2xl border-b border-white/30 dark:border-white/5 z-50 p-4 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
         <div className="flex items-center gap-2 font-black text-xl text-blue-600 dark:text-blue-400">
            <School /> EduSmart
         </div>
         {/* Admin Notification Receiver Button */}
         <button className="relative p-2.5 bg-white/20 dark:bg-white/5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            <Bell size={20} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-zinc-900"></span>
            </span>
         </button>
      </div>

      {/* SIDEBAR (Opens via More button on mobile) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-r border-gray-200 dark:border-zinc-800 flex flex-col shadow-2xl md:shadow-none
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 hidden md:block">
          <div className="flex items-center gap-2 font-black text-xl text-blue-600">
            <School /> EduSmart
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 truncate font-mono opacity-70">
            ID: {user.schoolId}
          </p>
        </div>

        {/* Mobile Sidebar Header & Close Button */}
        <div className="md:hidden p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="font-black text-xl text-blue-600 flex items-center gap-2">
                <School /> EduSmart Menu
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-300">
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
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-bold text-sm ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{user.username}</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-bold">Admin</span>
                </div>
            </div>
            <button 
                onClick={logout} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition"
                title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
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

      {/* MOBILE PURE GLASSMORPHISM BOTTOM NAV */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <nav className="relative bg-white/20 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 py-4">
          
          <Link href="/dashboard/admin" className={`flex flex-col items-center justify-center w-12 transition ${pathname === "/dashboard/admin" ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}>
            <LayoutDashboard size={22} />
          </Link>

          <Link href="/dashboard/attendance" className={`flex flex-col items-center justify-center w-12 transition ${pathname === "/dashboard/attendance" ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}>
            <CheckSquare size={22} />
          </Link>

          <Link href="/dashboard/fees" className={`flex flex-col items-center justify-center w-12 transition ${pathname === "/dashboard/fees" ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}>
            <IndianRupee size={22} />
          </Link>

          <Link href="/dashboard/homework" className={`flex flex-col items-center justify-center w-12 transition ${pathname === "/dashboard/homework" ? "text-blue-600 dark:text-blue-400 scale-110 drop-shadow-md" : "text-gray-600 dark:text-gray-400 hover:text-blue-500"}`}>
            <BookOpen size={22} />
          </Link>

          {/* More Action to open Sidebar */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center justify-center w-12 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition">
            <Menu size={22} />
          </button>

        </nav>
      </div>

    </div>
  );
}