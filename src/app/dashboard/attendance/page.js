// src/app/dashboard/attendance/page.js
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Check, X, Minus, Users, CheckCircle2, 
  ChevronLeft, ChevronRight, Download 
} from "lucide-react";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />
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

  useEffect(() => {
    if (user?.institutionCode) {
      setLoading(true);
      const unsub = onSnapshot(collection(firestore, `institutions/${user.institutionCode}/batches`), (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
            list.push({
                id: doc.id,
                ...doc.data(),
                students: doc.data().students || []
            });
        });
        setBatches(list);
        
        if (selectedBatch) {
             const updated = list.find(b => b.id === selectedBatch.id);
             if (updated) setSelectedBatch(updated);
        }
        setLoading(false); 
      });
      return () => unsub();
    }
  }, [user, selectedBatch?.id]);

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

  const toggleAttendance = async (studentIndex) => {
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

    // Handle absent notifications and revocation
    if (newStatus === "absent") {
        if (!updatedBatch.students[studentIndex].notifications) {
            updatedBatch.students[studentIndex].notifications = [];
        }
        updatedBatch.students[studentIndex].notifications.push({
            id: Date.now().toString(),
            text: `You were marked absent for ${new Date(selectedDate).toDateString()}.`,
            date: new Date().toISOString(),
            type: "alert",
            read: false,
            attendanceDate: selectedDate 
        });
    } else if (currentStatus === "absent") {
        // Revoke the notification if status changes from absent to something else
        if (updatedBatch.students[studentIndex].notifications) {
            const absentText = `You were marked absent for ${new Date(selectedDate).toDateString()}.`;
            updatedBatch.students[studentIndex].notifications = updatedBatch.students[studentIndex].notifications.filter(
                (n) => n.attendanceDate !== selectedDate && n.text !== absentText
            );
        }
    }

    setSelectedBatch(updatedBatch);

    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedBatch.students
    });
  };

  const markAll = async (status) => {
    if (!selectedBatch) return;
    
    const updatedBatch = { ...selectedBatch };
    updatedBatch.students.forEach((student, index) => {
        const currentStatus = student.attendance?.[selectedDate] || "not-marked";

        if (!updatedBatch.students[index].attendance) updatedBatch.students[index].attendance = {};
        updatedBatch.students[index].attendance[selectedDate] = status;

        // If marking all as something other than absent, clean up prior absent alerts
        if (status !== "absent" && currentStatus === "absent") {
             if (updatedBatch.students[index].notifications) {
                 const absentText = `You were marked absent for ${new Date(selectedDate).toDateString()}.`;
                 updatedBatch.students[index].notifications = updatedBatch.students[index].notifications.filter(
                     (n) => n.attendanceDate !== selectedDate && n.text !== absentText
                 );
             }
        }
    });
    
    setSelectedBatch(updatedBatch);

    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedBatch.students
    });
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const offset = d.getTimezoneOffset() * 60000;
    const newDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const downloadCSV = () => {
    if (!selectedBatch) return;

    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); 
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let csv = "Student Name,Phone";
    for(let d=1; d<=daysInMonth; d++) {
        csv += `,${d} ${monthName.slice(0,3)}`;
    }
    csv += ",Total Present\n";

    selectedBatch.students.forEach(student => {
        let row = `"${student.name}","${student.phone}"`;
        let presentCount = 0;
        
        for(let d=1; d<=daysInMonth; d++) {
             const dayStr = String(d).padStart(2, '0');
             const monthStr = String(month + 1).padStart(2, '0');
             const dateKey = `${year}-${monthStr}-${dayStr}`;
             
             const status = student.attendance?.[dateKey];
             let code = "-";
             if (status === "present") { code = "P"; presentCount++; }
             else if (status === "absent") code = "A";
             
             row += `,${code}`;
        }
        row += `,${presentCount}`;
        csv += `${row}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${selectedBatch.name}_${monthName}_${year}.csv`;
    a.click();
  };

  const getStatus = (student) => student.attendance?.[selectedDate] || "not-marked";

  const getStatusUI = (status) => {
    switch (status) {
      case "present": return { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/60", icon: <Check size={18} strokeWidth={3} />, label: "Present" };
      case "absent": return { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60", icon: <X size={18} strokeWidth={3} />, label: "Absent" };
      default: return { color: "bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-700", icon: <Minus size={18} />, label: "Mark" };
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={32} /> Attendance
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {isPastDate ? "Managing Past Records" : "Today's Tracker"}
              </p>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-800/60 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className={`flex items-center gap-2 px-2 py-2 rounded-2xl border w-full md:w-auto transition-colors ${isPastDate ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-700'}`}>
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"><ChevronLeft size={20} /></button>
              <div className="flex items-center gap-2 px-2">
                  <Calendar size={18} className={isPastDate ? "text-orange-500" : "text-slate-400"} />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-slate-200 uppercase cursor-pointer" />
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition"><ChevronRight size={20} /></button>
          </div>

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
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-lg" 
                          : "bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                  >
                      {batch.name}
                  </motion.button>
              )) : (
                  <span className="text-sm text-slate-400 italic px-4">No batches found.</span>
              )}
          </div>
      </div>

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
              className="bg-white dark:bg-slate-800/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-700/80 overflow-hidden"
          >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/80 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-slate-900/40 gap-4">
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
                          onClick={downloadCSV}
                          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          title="Download Monthly Report"
                      >
                          <Download size={18} /> <span className="hidden sm:inline">Export CSV</span>
                      </motion.button>

                      <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markAll("present")}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 transition"
                      >
                          <CheckCircle2 size={16} /> Mark All Present
                      </motion.button>
                  </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700/60 p-2">
                  {selectedBatch.students.map((student, index) => {
                      const status = getStatus(student);
                      const ui = getStatusUI(status);
                      
                      return (
                          <motion.div 
                              key={student.id || index} 
                              variants={itemVariants}
                              onClick={() => toggleAttendance(index)}
                              whileTap={{ scale: 0.99, backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-2xl transition group"
                          >
                              <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-colors border-2 shadow-sm ${ui.color}`}>
                                      {student.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{student.name}</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-80 flex flex-col items-center justify-center bg-white dark:bg-slate-800/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-full mb-6"><Users size={48} className="opacity-40" /></div>
              <p className="font-bold text-lg">Select a batch</p>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}