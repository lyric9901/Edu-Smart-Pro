"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, push, onValue, remove } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Trash2, Megaphone, Sun, Moon, Sparkles, Loader2 } from "lucide-react";

export default function NoticesPage() {
  const { user } = useAuth();
  
  // State
  const [msg, setMsg] = useState("");
  const [notices, setNotices] = useState([]);
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading

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
        // Updated to handle sorting by createdAt if available, else standard reverse
        const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotices(list);
      });
    }
  }, [user]);

  // 2. Magic Send Notice (Updated for AI)
  const sendNotice = async () => {
    if (!msg.trim() || !user?.schoolId) return;
    setIsSubmitting(true);

    // We now push specific fields that n8n will watch for
    await push(ref(db, `schools/${user.schoolId}/notices`), {
      original_text: msg, // The rough draft
      final_text: "",     // Empty until AI finishes
      status: "processing", // Triggers the AI workflow
      sender: user.username || "Admin",
      createdAt: Date.now(),
      date: new Date().toISOString()
    });

    setMsg("");
    setIsSubmitting(false);
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
        <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <Megaphone className="text-orange-500" size={32} /> Smart Notice Board
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Type a draft, let AI polish it for you.</p>
            </div>
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition"
            >
                {theme === 'light' ? <Moon size={18} className="text-slate-600"/> : <Sun size={18} className="text-orange-400"/>}
                <span className="text-xs font-bold uppercase tracking-wider">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </motion.button>
        </motion.div>

        {/* INPUT AREA */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-1 rounded-[2rem] shadow-lg border border-slate-200 dark:border-zinc-800"
        >
            <textarea 
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Draft your thought roughly (e.g. 'school closed tmrw rain')..."
                className="w-full p-6 bg-transparent outline-none text-lg min-h-[120px] resize-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
            />
            <div className="flex justify-between items-center px-4 pb-4">
                <div className="flex gap-2 text-slate-400">
                    <Sparkles size={20} className="text-blue-400 animate-pulse" /> 
                    <span className="text-xs font-bold text-blue-400 pt-1">AI Enabled</span>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={sendNotice} 
                    disabled={!msg.trim() || isSubmitting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} 
                    {isSubmitting ? "Generating..." : "Magic Post"}
                </motion.button>
            </div>
        </motion.div>

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
                        {/* PROCESSING STATE */}
                        {notice.status === 'processing' && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="text-blue-500 animate-spin" size={32}/>
                                    <span className="text-xs font-bold text-blue-500 animate-pulse">AI is writing...</span>
                                </div>
                            </div>
                        )}

                        {/* Icon Badge */}
                        <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notice.status === 'processing' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
                                <Bell size={24} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            {/* Logic: Show Final Text if published, otherwise show Draft or standard text (backward compatibility) */}
                            <p className="text-slate-800 dark:text-zinc-200 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                {notice.status === 'published' ? notice.final_text : (notice.text || notice.original_text)}
                            </p>
                            
                            {/* Show Draft Source if AI was used */}
                            {notice.status === 'published' && notice.original_text && (
                                <p className="mt-2 text-xs text-slate-400 dark:text-zinc-600 border-t border-slate-100 dark:border-zinc-800 pt-2">
                                    Draft: "{notice.original_text}"
                                </p>
                            )}

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
                        <motion.button 
                            whileHover={{ scale: 1.1, color: "#ef4444" }} whileTap={{ scale: 0.9 }}
                            onClick={() => deleteNotice(notice.id)} 
                            className="text-slate-300 dark:text-zinc-700 p-2 self-start transition-colors"
                        >
                            <Trash2 size={20} />
                        </motion.button>
                    </motion.div>
                ))
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600"
                >
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No notices posted yet.</p>
                    <p className="text-sm opacity-60">Try the Magic Post button!</p>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
