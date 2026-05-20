// src/app/dashboard/fees/page.js
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, CheckCircle, Clock, Users, CalendarDays, Filter, Download } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function FeesPage() {
  const { user } = useAuth();
  
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.institutionCode) {
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
      });
      return () => unsub();
    }
  }, [user, selectedBatch?.id]);

  const toggleFee = async (studentIndex, monthIndex) => {
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
    
    // Save updated students array to Firestore
    await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
        students: updatedBatch.students
    });
  };

  const downloadCSV = () => {
     if (!selectedBatch) return;
     
     const headers = ["Student Name", "Phone", ...MONTHS];
     let csv = headers.join(",") + "\n";
     
     selectedBatch.students.forEach(student => {
         const row = [
             `"${student.name}"`,
             `"${student.phone}"`,
             ...MONTHS.map(m => {
                 const status = student.fees?.[year]?.[m.toLowerCase()];
                 return status === "paid" ? "PAID" : "PENDING";
             })
         ];
         csv += row.join(",") + "\n";
     });
     
     const blob = new Blob([csv], { type: "text/csv" });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = `Fees_${selectedBatch.name}_${year}.csv`;
     a.click();
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
          <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  <IndianRupee className="text-orange-500" size={32} /> Fee Tracker
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage student payments</p>
          </div>
          
          {selectedBatch && (
              <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadCSV}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                  <Download size={18} /> Export Excel/CSV
              </motion.button>
          )}
      </motion.div>

      <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/60 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row gap-4 justify-between items-center"
      >
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 w-full md:w-auto shadow-inner">
              <CalendarDays size={20} className="text-slate-400" />
              <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)} 
                  className="bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-slate-200 w-full cursor-pointer appearance-none"
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
      </motion.div>

      <AnimatePresence mode="wait">
      {selectedBatch ? (
          <motion.div 
              key={selectedBatch.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800/60 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-700/80 overflow-hidden"
          >
              <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-700/80">
                              <th className="p-5 sticky left-0 bg-slate-50 dark:bg-slate-900 min-w-[180px] z-20 border-r border-slate-100 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] backdrop-blur-md">
                                  Student Name
                              </th>
                              {MONTHS.map(m => <th key={m} className="p-4 text-center min-w-[80px] font-bold tracking-wider">{m}</th>)}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 p-2">
                          {selectedBatch.students.map((student, sIdx) => (
                              <motion.tr 
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: sIdx * 0.05 }}
                                  key={sIdx} 
                                  className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition group"
                              >
                                  <td className="p-5 sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] group-hover:bg-slate-50 dark:group-hover:bg-slate-700/40 transition-colors">
                                      <div className="font-bold text-slate-800 dark:text-slate-100">{student.name}</div>
                                      <div className="text-xs text-slate-400 dark:text-slate-400 font-mono mt-0.5">{student.phone}</div>
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
                                                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/60" 
                                                      : "bg-slate-50 dark:bg-slate-700/40 text-slate-300 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 border border-transparent"
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
              className="h-80 flex flex-col items-center justify-center bg-white dark:bg-slate-800/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 animate-pulse"
          >
              <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-full mb-6">
                  <Filter size={48} className="opacity-40" />
              </div>
              <p className="font-bold text-lg">Select a batch to track fees</p>
              <p className="text-sm opacity-60">Revenue data will appear here</p>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}