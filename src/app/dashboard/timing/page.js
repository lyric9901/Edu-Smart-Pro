"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Save, X, Edit2, CheckCircle2, Sun, Moon } from "lucide-react";

export default function TimingPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [timeForm, setTimeForm] = useState({ start: "", end: "" });
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

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

  // --- FETCH BATCHES ---
  useEffect(() => {
    if (user?.schoolId) {
      const batchRef = ref(db, `schools/${user.schoolId}/batches`);
      onValue(batchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val,
          }));
          setBatches(list);
        }
        setLoading(false);
      });
    }
  }, [user]);

  // --- HANDLERS ---
  const startEditing = (batch) => {
    setEditingId(batch.id);
    setTimeForm({
      start: batch.timing?.start || "",
      end: batch.timing?.end || ""
    });
  };

  const saveTiming = async (batchId) => {
    if (!timeForm.start || !timeForm.end) return;
    
    await update(ref(db, `schools/${user.schoolId}/batches/${batchId}/timing`), {
      start: timeForm.start,
      end: timeForm.end
    });
    setEditingId(null);
  };

  // Helper to format 24h time to 12h AM/PM
  const formatTime = (time) => {
    if (!time) return "Not Set";
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <Clock className="text-purple-600" size={32} /> Class Schedule
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Set timings for your batches</p>
            </div>
            <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:scale-105 transition"
            >
                {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
            </button>
        </div>

        {/* BATCH GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {batches.map((batch) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    key={batch.id} 
                    className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                        editingId === batch.id 
                        ? "bg-white dark:bg-zinc-900 border-purple-500 shadow-xl ring-2 ring-purple-500/20" 
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md"
                    }`}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold">{batch.name}</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{batch.students?.length || 0} Students</p>
                        </div>
                        {editingId !== batch.id && (
                            <button onClick={() => startEditing(batch)} className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition">
                                <Edit2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {editingId === batch.id ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Start Time</label>
                                    <input 
                                        type="time" 
                                        value={timeForm.start}
                                        onChange={e => setTimeForm({...timeForm, start: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-sm font-bold outline-none focus:border-purple-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">End Time</label>
                                    <input 
                                        type="time" 
                                        value={timeForm.end}
                                        onChange={e => setTimeForm({...timeForm, end: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 rounded-xl p-2 text-sm font-bold outline-none focus:border-purple-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition">Cancel</button>
                                <button onClick={() => saveTiming(batch.id)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition flex items-center justify-center gap-1"><Save size={14}/> Save</button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-lg font-bold">
                                    {formatTime(batch.timing?.start)}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    To {formatTime(batch.timing?.end)}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}
            </AnimatePresence>
        </div>

        {batches.length === 0 && !loading && (
            <div className="text-center py-20 text-slate-400">No batches found. Create one in the Dashboard first.</div>
        )}
      </div>
    </div>
  );
}