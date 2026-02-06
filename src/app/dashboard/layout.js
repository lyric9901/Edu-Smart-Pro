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
  Clock // <--- Added Clock Icon Import
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
    { href: "/dashboard/timing", label: "Schedule", icon: <Clock size={20} /> }, // <--- Added Timing Link
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 z-50 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2 font-black text-xl text-blue-600">
            <School /> EduSmart
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col
      `}>
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 hidden md:block">
          <div className="flex items-center gap-2 font-black text-xl text-blue-600">
            <School /> EduSmart
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 truncate font-mono opacity-70">
            ID: {user.schoolId}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0 overflow-y-auto custom-scrollbar">
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

        {/* User Profile Footer */}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 scroll-smooth">
        {children}
      </main>

    </div>
  );
}