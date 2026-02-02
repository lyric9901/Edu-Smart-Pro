"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, X, Minus, Users, CheckCircle2, ChevronRight } from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function AttendancePage() {
  const { user } = useAuth();
  
  // State
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); 
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
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

  // 2. Stats Calculation
  useEffect(() => {
    if (selectedBatch && selectedBatch.students) {
      let p = 0, a = 0;
      selectedBatch.students.forEach(s => {
        const status = s.attendance?.[selectedDate];
        if (status === "present") p++;
        if (status === "absent") a++;
      });
      setStats({ present: p, absent: a, total: selectedBatch.students.length });
    }
  }, [selectedBatch, selectedDate]);

  // 3. LOGIC
  const toggleAttendance = (studentIndex) => {
    if (!selectedBatch) return;

    const student = selectedBatch.students[studentIndex];
    const currentStatus = student.attendance?.[selectedDate] || "not-marked";
    let newStatus = "present"; 

    if (currentStatus === "present") newStatus = "absent";       
    if (currentStatus === "absent") newStatus = "not-marked";    

    // Optimistic Update
    const updatedBatch = { ...selectedBatch };
    if (!updatedBatch.students[studentIndex].attendance) {
        updatedBatch.students[studentIndex].attendance = {};
    }
    updatedBatch.students[studentIndex].attendance[selectedDate] = newStatus;
    setSelectedBatch(updatedBatch);

    // Save to Firebase
    const path = `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${studentIndex}/attendance/${selectedDate}`;
    set(ref(db, path), newStatus);
  };

  const getStatus = (student) => student.attendance?.[selectedDate] || "not-marked";

  const getStatusUI = (status) => {
    switch (status) {
      case "present": return { 
          color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", 
          icon: <Check size={18} strokeWidth={3} />, 
          label: "Present" 
      };
      case "absent": return { 
          color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", 
          icon: <X size={18} strokeWidth={3} />, 
          label: "Absent" 
      };
      default: return { 
          color: "bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700", 
          icon: <Minus size={18} />, 
          label: "Mark" 
      };
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={32} /> Attendance
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Daily Tracking</p>
            </div>
        </motion.div>

        {/* CONTROLS CARD */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center"
        >
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-black px-5 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800 w-full md:w-auto shadow-inner">
                <Calendar size={20} className="text-slate-400" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-zinc-200 uppercase w-full cursor-pointer"
                />
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
                    <span className="text-sm text-slate-400 italic px-4">No batches found. Create one in Dashboard.</span>
                )}
            </div>
        </motion.div>

        {/* STUDENT LIST */}
        <AnimatePresence mode="wait">
        {selectedBatch ? (
            <motion.div 
                key={selectedBatch.id}
                initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }} variants={containerVariants}
                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                {/* Header Stats */}
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-black/20 gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{selectedBatch.name}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{new Date(selectedDate).toDateString()}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-5 py-3 rounded-2xl text-sm font-bold">
                            <Check size={16} strokeWidth={3}/> {stats.present} <span className="hidden md:inline">Present</span>
                        </div>
                        <div className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-5 py-3 rounded-2xl text-sm font-bold">
                            <X size={16} strokeWidth={3}/> {stats.absent} <span className="hidden md:inline">Absent</span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-2">
                    {selectedBatch.students.map((student, index) => {
                        const status = getStatus(student);
                        const ui = getStatusUI(status);
                        
                        return (
                            <motion.div 
                                key={student.id || index} 
                                variants={itemVariants}
                                onClick={() => toggleAttendance(index)}
                                whileTap={{ scale: 0.99, backgroundColor: "rgba(0,0,0,0.02)" }}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/30 rounded-2xl transition group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-colors border-2 shadow-sm ${ui.color}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-base text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{student.name}</p>
                                        <p className="text-xs text-slate-400 font-mono font-medium">{student.phone}</p>
                                    </div>
                                </div>

                                {/* Status Button */}
                                <div className={`px-5 py-2.5 rounded-xl border-2 flex items-center gap-2 text-sm font-bold transition-all w-32 justify-center shadow-sm ${ui.color}`}>
                                    {ui.icon} {ui.label}
                                </div>
                            </motion.div>
                        );
                    })}
                    {selectedBatch.students.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-medium italic">No students found in this batch.</div>
                    )}
                </div>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-80 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600"
            >
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-full mb-6">
                    <Users size={48} className="opacity-40" />
                </div>
                <p className="font-bold text-lg">Select a batch to start marking</p>
                <p className="text-sm opacity-60">Your active batches will appear here</p>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}