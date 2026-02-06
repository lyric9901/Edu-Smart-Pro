"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set, update, push } from "firebase/database"; // Added push
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Check, X, Minus, Users, CheckCircle2, 
  ChevronLeft, ChevronRight 
} from "lucide-react";

// --- SKELETON COMPONENT ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-xl ${className}`} />
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function AttendancePage() {
  const { user } = useAuth();
  
  const getLocalToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  // State
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalToday()); 
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [isPastDate, setIsPastDate] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsPastDate(selectedDate !== getLocalToday());
  }, [selectedDate]);

  // Fetch Batches
  useEffect(() => {
    if (user?.schoolId) {
      setLoading(true);
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
        setLoading(false); 
      });
    }
  }, [user]);

  // Stats Calculation
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

  const toggleAttendance = (studentIndex) => {
    if (!selectedBatch) return;

    const student = selectedBatch.students[studentIndex];
    const currentStatus = student.attendance?.[selectedDate] || "not-marked";
    let newStatus = "present"; 

    if (currentStatus === "present") newStatus = "absent";       
    if (currentStatus === "absent") newStatus = "not-marked";    

    const updatedBatch = { ...selectedBatch };
    if (!updatedBatch.students[studentIndex].attendance) {
        updatedBatch.students[studentIndex].attendance = {};
    }
    updatedBatch.students[studentIndex].attendance[selectedDate] = newStatus;
    setSelectedBatch(updatedBatch);

    const path = `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${studentIndex}/attendance/${selectedDate}`;
    set(ref(db, path), newStatus);

    // --- SEND PRIVATE NOTIFICATION IF ABSENT ---
    // This sends "1 message" to the specific student's personal notification list
    if (newStatus === "absent") {
      const notifPath = `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${studentIndex}/notifications`;
      push(ref(db, notifPath), {
        text: `You were marked absent for ${new Date(selectedDate).toDateString()}.`,
        date: new Date().toISOString(),
        type: "alert", // 'alert' helps us style it red in the student view
        read: false
      });
    }
  };

  const markAll = (status) => {
    if (!selectedBatch) return;
    const updates = {};
    const updatedBatch = { ...selectedBatch };
    updatedBatch.students.forEach((student, index) => {
        if (!updatedBatch.students[index].attendance) updatedBatch.students[index].attendance = {};
        updatedBatch.students[index].attendance[selectedDate] = status;
        const path = `schools/${user.schoolId}/batches/${selectedBatch.id}/students/${index}/attendance/${selectedDate}`;
        updates[path] = status;
    });
    setSelectedBatch(updatedBatch);
    update(ref(db), updates);
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const offset = d.getTimezoneOffset() * 60000;
    const newDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const getStatus = (student) => student.attendance?.[selectedDate] || "not-marked";

  const getStatusUI = (status) => {
    switch (status) {
      case "present": return { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", icon: <Check size={18} strokeWidth={3} />, label: "Present" };
      case "absent": return { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", icon: <X size={18} strokeWidth={3} />, label: "Absent" };
      default: return { color: "bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700", icon: <Minus size={18} />, label: "Mark" };
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="text-blue-600" size={32} /> Attendance
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
                  {isPastDate ? "Managing Past Records" : "Today's Tracker"}
                </p>
            </div>
        </div>

        {/* CONTROLS CARD */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Date Navigator */}
            <div className={`flex items-center gap-2 px-2 py-2 rounded-2xl border w-full md:w-auto transition-colors ${isPastDate ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800' : 'bg-slate-50 border-slate-100 dark:bg-black dark:border-zinc-800'}`}>
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"><ChevronLeft size={20} /></button>
                <div className="flex items-center gap-2 px-2">
                    <Calendar size={18} className={isPastDate ? "text-orange-500" : "text-slate-400"} />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-zinc-200 uppercase cursor-pointer" />
                </div>
                <button onClick={() => changeDate(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"><ChevronRight size={20} /></button>
            </div>

            {/* Batch Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar no-scrollbar items-center">
                {loading ? (
                    <>
                      <Skeleton className="w-24 h-10 rounded-2xl" />
                      <Skeleton className="w-24 h-10 rounded-2xl" />
                    </>
                ) : batches.length > 0 ? batches.map(batch => (
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
        </div>

        {/* STUDENT LIST */}
        <AnimatePresence mode="wait">
        {loading ? (
           <div className="space-y-4">
              <Skeleton className="w-full h-24 rounded-[2.5rem]" />
              <Skeleton className="w-full h-20 rounded-2xl" />
              <Skeleton className="w-full h-20 rounded-2xl" />
              <Skeleton className="w-full h-20 rounded-2xl" />
           </div>
        ) : selectedBatch ? (
            <motion.div 
                key={selectedBatch.id}
                initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }} variants={containerVariants}
                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                {/* Header Stats */}
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-black/20 gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{selectedBatch.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs font-bold uppercase tracking-wider ${isPastDate ? "text-orange-500" : "text-slate-400"}`}>
                            {new Date(selectedDate).toDateString()}
                          </p>
                          {isPastDate && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">HISTORY MODE</span>}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markAll("present")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition"
                        >
                            <CheckCircle2 size={16} /> Mark All Present
                        </motion.button>
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
                                        <p className="text-xs text-slate-400 font-mono font-medium hidden md:block">{student.phone}</p>
                                    </div>
                                </div>

                                <div className={`px-5 py-2.5 rounded-xl border-2 flex items-center gap-2 text-sm font-bold transition-all w-32 justify-center shadow-sm ${ui.color}`}>
                                    {ui.icon} {ui.label}
                                </div>
                            </motion.div>
                        );
                    })}
                    {selectedBatch.students.length === 0 && (
                        <div className="p-20 text-center text-slate-400 font-medium italic">No students found.</div>
                    )}
                </div>
            </motion.div>
        ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-80 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600">
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-full mb-6"><Users size={48} className="opacity-40" /></div>
                <p className="font-bold text-lg">Select a batch</p>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
