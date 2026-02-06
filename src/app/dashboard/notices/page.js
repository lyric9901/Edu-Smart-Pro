"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, push, onValue, remove } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, Megaphone, Sun, Moon, Send, Loader2 } from "lucide-react";

export default function NoticesPage() {
  const { user } = useAuth();
  
  // State
  const [msg, setMsg] = useState("");
  const [notices, setNotices] = useState([]);
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

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

  // 1. Fetch Notices
  useEffect(() => {
    if (user?.schoolId) {
      const noticeRef = ref(db, `schools/${user.schoolId}/notices`);
      onValue(noticeRef, (snapshot) => {
        const data = snapshot.val();
        const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotices(list);
      });
    }
  }, [user]);

  // 2. Simple Send Notice (Direct)
  const sendNotice = async () => {
    if (!msg.trim() || !user?.schoolId) return;
    setIsSubmitting(true);

    try {
        await push(ref(db, `schools/${user.schoolId}/notices`), {
            text: msg, 
            sender: user.username || "Admin",
            createdAt: Date.now(),
            date: new Date().toISOString(),
            type: "notice" // Explicit type for better client-side handling
        });
        setMsg(""); // Clear input
    } catch (dbError) {
        console.error("Firebase error:", dbError);
        alert("Failed to post notice.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // 3. Delete Notice
  const deleteNotice = async (id) => {
    if(confirm("Delete this notice?")) {
       await remove(ref(db, `schools/${user.schoolId}/notices/${id}`));
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <Megaphone className="text-orange-500" size={32} /> Notice Board
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Post announcements for the school.</p>
            </div>
            <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition"
            >
                {theme === 'light' ? <Moon size={18} className="text-slate-600"/> : <Sun size={18} className="text-orange-400"/>}
            </button>
        </div>

        {/* INPUT AREA */}
        <div className="bg-white dark:bg-zinc-900 p-1 rounded-[2rem] shadow-lg border border-slate-200 dark:border-zinc-800">
            <textarea 
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Type your notice here..."
                className="w-full p-6 bg-transparent outline-none text-lg min-h-[120px] resize-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                disabled={isSubmitting}
            />
            <div className="flex justify-end items-center px-4 pb-4">
                <button 
                    onClick={sendNotice} 
                    disabled={!msg.trim() || isSubmitting}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/20"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} 
                    {isSubmitting ? "Posting..." : "Post Notice"}
                </button>
            </div>
        </div>

        {/* NOTICE LIST */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">Recent Posts</h2>
            
            <AnimatePresence mode="popLayout">
            {notices.length > 0 ? (
                notices.map((notice) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={notice.id} 
                        className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 flex gap-5 group relative overflow-hidden"
                    >
                        {/* Icon Badge */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                                <Bell size={24} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p className="text-slate-800 dark:text-zinc-200 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                {/* Fallback support for old data */}
                                {notice.text || notice.final_text || notice.original_text}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">
                                    {new Date(notice.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full"></span>
                                <span className="text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2 py-1 rounded-md">
                                    {notice.sender}
                                </span>
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button 
                            onClick={() => deleteNotice(notice.id)} 
                            className="text-slate-300 dark:text-zinc-700 p-2 self-start transition-colors hover:text-red-500"
                        >
                            <Trash2 size={20} />
                        </button>
                    </motion.div>
                ))
            ) : (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600">
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No notices posted yet.</p>
                </div>
            )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
