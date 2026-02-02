"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, CheckCircle, Clock, Users, CalendarDays, Filter } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function FeesPage() {
  const { user } = useAuth();
  
  // Data State
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mounted, setMounted] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Batches
  useEffect(() => {
    if (user?.schoolId) {
      const batchRef = ref(db, `schools/${user.schoolId}/batches`);
      onValue(batchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val,
            students: val.students || []
          }));
          setBatches(list);
          if (selectedBatch) {
             const updated = list.find(b => b.id === selectedBatch.id);
             if (updated) setSelectedBatch(updated);
          }
        }
      });
    }
  }, [user, selectedBatch?.id]);

  // 2. Logic
  const toggleFee = (studentIndex, monthIndex) => {
    if (!selectedBatch) return;
    
    const student = selectedBatch.students[studentIndex];
    const monthKey = MONTHS[monthIndex].toLowerCase();
    const currentStatus = student.fees?.[year]?.[monthKey] || "pending";
    const newStatus = currentStatus === "paid" ? "pending" : "paid";

    const updatedBatch = { ...selectedBatch };
    if (!updatedBatch.students[studentIndex].fees) updatedBatch.students[studentIndex].fees = {};
    if (!updatedBatch.students[studentIndex].fees[year]) updatedBatch.students[studentIndex].fees[year] = {};
    updatedBatch.students[studentIndex].fees[year][monthKey] = newStatus;
    
    setSelectedBatch(updatedBatch);
    set(ref(db, `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${studentIndex}/fees/${year}/${monthKey}`), newStatus);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <IndianRupee className="text-orange-500" size={32} /> Fee Tracker
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Manage student payments</p>
            </div>
        </motion.div>

        {/* CONTROLS CARD */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center"
        >
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-black px-5 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 w-full md:w-auto shadow-inner">
                <CalendarDays size={20} className="text-slate-400" />
                <select 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    className="bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-zinc-200 w-full cursor-pointer appearance-none"
                >
                    <option value="2024">Year 2024</option>
                    <option value="2025">Year 2025</option>
                    <option value="2026">Year 2026</option>
                </select>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar no-scrollbar items-center">
                {batches.length > 0 ? batches.map(batch => (
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        key={batch.id}
                        onClick={() => setSelectedBatch(batch)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                            selectedBatch?.id === batch.id 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg" 
                            : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        }`}
                    >
                        {batch.name}
                    </motion.button>
                )) : (
                    <span className="text-sm text-slate-400 italic px-4">No batches found.</span>
                )}
            </div>
        </motion.div>

        {/* FEE TABLE */}
        <AnimatePresence mode="wait">
        {selectedBatch ? (
            <motion.div 
                key={selectedBatch.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-black/40 text-slate-500 dark:text-zinc-500 text-xs uppercase border-b border-slate-200 dark:border-zinc-800">
                                <th className="p-5 sticky left-0 bg-slate-50 dark:bg-black min-w-[180px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                    Student Name
                                </th>
                                {MONTHS.map(m => <th key={m} className="p-4 text-center min-w-[80px] font-bold tracking-wider">{m}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {selectedBatch.students.map((student, sIdx) => (
                                <motion.tr 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: sIdx * 0.05 }}
                                    key={sIdx} 
                                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition group"
                                >
                                    <td className="p-5 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-100 dark:border-zinc-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] group-hover:bg-slate-50 dark:group-hover:bg-zinc-800/30 transition-colors">
                                        <div className="font-bold text-slate-800 dark:text-zinc-200">{student.name}</div>
                                        <div className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{student.phone}</div>
                                    </td>
                                    {MONTHS.map((m, mIdx) => {
                                        const status = student.fees?.[year]?.[m.toLowerCase()] || "pending";
                                        return (
                                            <td key={m} className="p-3 text-center">
                                                <motion.button 
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => toggleFee(sIdx, mIdx)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mx-auto shadow-sm ${
                                                        status === "paid" 
                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800" 
                                                        : "bg-slate-50 dark:bg-zinc-800 text-slate-300 dark:text-zinc-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 border border-transparent"
                                                    }`}
                                                >
                                                    {status === "paid" ? <CheckCircle size={18} strokeWidth={2.5} /> : <Clock size={18} />}
                                                </motion.button>
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                            {selectedBatch.students.length === 0 && (
                                <tr><td colSpan="13" className="p-20 text-center text-slate-400 italic">No students found in this batch.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-80 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 animate-pulse"
            >
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-full mb-6">
                    <Filter size={48} className="opacity-40" />
                </div>
                <p className="font-bold text-lg">Select a batch to track fees</p>
                <p className="text-sm opacity-60">Revenue data will appear here</p>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}