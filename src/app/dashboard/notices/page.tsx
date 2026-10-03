"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToNotices, createNotice as dbCreateNotice, deleteNotice as dbDeleteNotice } from "@/lib/supabaseDb";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trash2, Megaphone, Send, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function NoticesPage() {
  const { user } = useAuth();
  
  const [msg, setMsg] = useState("");
  const [notices, setNotices] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.institutionCode) {
      const unsubscribe = subscribeToNotices(user.institutionCode, (list) => {
        setNotices(list);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const sendNotice = async () => {
    if (!msg.trim() || !user?.institutionCode) return;
    setIsSubmitting(true);

    try {
        await dbCreateNotice(user.institutionCode, {
            text: msg, 
            sender: user.username || "Admin",
            date: new Date().toISOString(),
            type: "notice" 
        });

        // Dispatch Web Push notification to students
        fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                institutionCode: user.institutionCode,
                title: `${user.username || "Institute"} Announcement`,
                body: msg,
                url: "/student?tab=notices",
                type: "notice",
            }),
        }).catch((e) => console.warn("Failed to dispatch notice push:", e));

        setMsg(""); 
    } catch (dbError) {
        console.error("Database error:", dbError);
        alert("Failed to post notice.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const deleteNotice = async (id: string) => {
    if(confirm("Delete this notice?") && user?.institutionCode) {
       await dbDeleteNotice(user.institutionCode, id);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <Megaphone className="text-orange-500" size={32} /> Notice Board
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Post announcements for the school.</p>
            </div>
            <ThemeToggle />
        </div>

        <div className="glass-card p-1 rounded-[2rem]">
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
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                                <Bell size={24} />
                            </div>
                        </div>

                        <div className="flex-1">
                            <p className="text-slate-800 dark:text-zinc-200 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
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
