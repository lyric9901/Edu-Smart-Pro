// src/app/dashboard/homework/page.js
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Plus, Trash2, CheckCircle, X, LayoutGrid, 
  Calendar, Clock, ChevronRight, AlertCircle, ChevronDown, Search
} from "lucide-react";

const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] border backdrop-blur-md ${
      type === "error" 
      ? "bg-red-900/90 text-red-100 border-red-800" 
      : "bg-zinc-900/90 text-white border-zinc-800"
    }`}
  >
    {type === "error" ? <X size={20} className="text-red-400"/> : <CheckCircle size={20} className="text-green-400"/>}
    <span className="font-bold text-sm">{message}</span>
  </motion.div>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200/80 dark:bg-zinc-800/50 rounded-xl ${className}`} />
);

export default function HomeworkDashboard() {
  const { user } = useAuth();
  
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "" });
  
  // Mobile specific states
  const [isMobileSelectOpen, setIsMobileSelectOpen] = useState(false);
  const [batchSearchQuery, setBatchSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- AUTOMATIC HOMEWORK CLEANUP (Older than 1.5 months / 45 days) ---
  const cleanUpOldHomework = async (batchId, assignments) => {
    if (!assignments || Object.keys(assignments).length === 0) return;
    
    const now = new Date();
    const FORTY_FIVE_DAYS = 45 * 24 * 60 * 60 * 1000;
    let needsUpdate = false;
    const updatedAssignments = { ...assignments };

    Object.keys(updatedAssignments).forEach(key => {
        const hwDate = new Date(updatedAssignments[key].createdAt);
        if (now - hwDate > FORTY_FIVE_DAYS) {
            delete updatedAssignments[key];
            needsUpdate = true;
        }
    });

    if (needsUpdate && user?.institutionCode) {
        try {
            await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, batchId), {
                assignments: updatedAssignments
            });
            console.log(`Auto-cleaned expired homework for batch: ${batchId}`);
        } catch (error) {
            console.error("Cleanup error:", error);
        }
    }
  };

  // --- FETCH BATCHES & SYNC REALTIME ---
  useEffect(() => {
    if (!user?.institutionCode) return;
    
    const batchesRef = collection(firestore, `institutions/${user.institutionCode}/batches`);
    const unsub = onSnapshot(batchesRef, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Run background cleanup on fetch
            cleanUpOldHomework(docSnap.id, data.assignments);

            list.push({
                id: docSnap.id,
                ...data,
                assignments: data.assignments || {}
            });
        });
        
        // Use numeric collation to properly sort Class 7, Class 8, Class 9, Class 10, etc.
        list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        setBatches(list);

        // Keep selected batch up to date if data changes
        setSelectedBatch(prev => {
            if (!prev) return null; // Default to null so "Select" is shown initially
            return list.find(b => b.id === prev.id) || null;
        });
        
        setLoading(false);
    });

    return () => unsub();
  }, [user?.institutionCode]);

  const createAssignment = async () => {
    if (!selectedBatch || !newAssignment.title.trim() || !user?.institutionCode) {
        showToast("Title is required!", "error");
        return;
    }
    
    const id = Date.now().toString();
    const updatedAssignments = {
        ...(selectedBatch.assignments || {}),
        [id]: {
            id,
            title: newAssignment.title.trim(),
            description: newAssignment.description.trim(),
            createdAt: new Date().toISOString()
        }
    };

    try {
        await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
            assignments: updatedAssignments
        });
        setNewAssignment({ title: "", description: "" });
        showToast("Homework assigned successfully!");
    } catch (err) {
        showToast("Failed to assign homework", "error");
    }
  };

  const deleteAssignment = async (assignmentId) => {
    if (!selectedBatch || !user?.institutionCode) return;
    if (!confirm("Are you sure you want to delete this homework?")) return;

    const updatedAssignments = { ...selectedBatch.assignments };
    delete updatedAssignments[assignmentId];

    try {
        await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, selectedBatch.id), {
            assignments: updatedAssignments
        });
        showToast("Homework removed");
    } catch (err) {
        showToast("Failed to delete homework", "error");
    }
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(batchSearchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-zinc-100 font-sans p-4 md:p-8">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <BookOpen className="text-indigo-500" size={32} /> Homework Manager
                </h1>
                <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium mt-1">
                    Assign, manage, and automatically clear old tasks across batches.
                </p>
            </div>
        </motion.div>

        {/* Mobile Batch Selector */}
        <div className="block lg:hidden relative z-[60]">
            <button
                onClick={() => setIsMobileSelectOpen(!isMobileSelectOpen)}
                className="w-full bg-white/55 dark:bg-black/35 p-4 rounded-[1.5rem] border border-white/60 dark:border-zinc-800 flex justify-between items-center shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <LayoutGrid size={18} className="text-indigo-500"/>
                    <span className="font-bold text-slate-700 dark:text-zinc-200">
                        {selectedBatch ? selectedBatch.name : "Select"}
                    </span>
                </div>
                <ChevronDown size={20} className={`text-slate-500 transition-transform ${isMobileSelectOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isMobileSelectOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[1.5rem] shadow-xl p-4 z-50 flex flex-col max-h-[350px]"
                    >
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={batchSearchQuery}
                                onChange={(e) => setBatchSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-zinc-800/50 pl-10 pr-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-indigo-500 transition-colors dark:text-white"
                            />
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1">
                            {filteredBatches.length > 0 ? (
                                filteredBatches.map(batch => {
                                    const hwCount = Object.keys(batch.assignments || {}).length;
                                    return (
                                        <button
                                            key={batch.id}
                                            onClick={() => {
                                                setSelectedBatch(batch);
                                                setIsMobileSelectOpen(false);
                                                setBatchSearchQuery("");
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex justify-between items-center ${
                                                selectedBatch?.id === batch.id
                                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black"
                                                : "hover:bg-slate-100 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300 font-bold"
                                            }`}
                                        >
                                            <span>{batch.name}</span>
                                            <span className="text-[10px] bg-slate-200 dark:bg-zinc-700 px-2 py-1 rounded-md text-slate-600 dark:text-zinc-300">
                                                {hwCount}
                                            </span>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-sm font-medium">No batches found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          
          {/* Desktop Left Sidebar: Batches (Hidden on mobile) */}
          <motion.div 
            initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.2, ease: "easeInOut" }} 
            className="hidden lg:flex glass-card lg:col-span-1 p-5 rounded-[2rem] h-fit flex-col max-h-[85vh]"
          >
            <h2 className="font-bold text-slate-600 dark:text-zinc-300 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid size={16}/> Select Batch
            </h2>

            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {loading ? (
                  <>
                    <Skeleton className="h-16 w-full"/>
                    <Skeleton className="h-16 w-full"/>
                    <Skeleton className="h-16 w-full"/>
                  </>
              ) : batches.length > 0 ? (
                  batches.map(batch => {
                      const hwCount = Object.keys(batch.assignments || {}).length;
                      return (
                        <motion.button 
                            key={batch.id}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedBatch(batch)}
                            className={`w-full p-4 rounded-2xl flex flex-col items-start transition-all duration-200 border text-left ${
                                selectedBatch?.id === batch.id 
                                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800/50 dark:text-indigo-400 shadow-sm" 
                                : "bg-white/55 hover:bg-white/80 text-slate-600 border-white/60 dark:bg-black/30 dark:hover:bg-zinc-800/70 dark:text-zinc-400 dark:border-zinc-800/50"
                            }`}
                        >
                            <span className="font-bold text-base text-slate-900 dark:text-zinc-200">{batch.name}</span>
                            <span className={`text-xs mt-1 font-medium ${selectedBatch?.id === batch.id ? "text-indigo-600/80 dark:text-indigo-400/80" : "text-slate-500 dark:text-zinc-500"}`}>
                                {hwCount} Active Assignment{hwCount !== 1 ? 's' : ''}
                            </span>
                        </motion.button>
                      );
                  })
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
                      <p className="text-slate-500 dark:text-zinc-600 text-sm font-medium">No batches available.</p>
                  </div>
              )}
            </div>
          </motion.div>

          {/* Right Panel: Homework Management */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeInOut" }} 
            className="lg:col-span-3"
          >
            {selectedBatch ? (
              <div className="glass-card p-6 md:p-8 rounded-[2rem] min-h-[500px] flex flex-col gap-8">
                
                {/* Header inside Panel */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/70 dark:border-zinc-800 pb-6 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                            {selectedBatch.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium bg-white/60 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5">
                                <AlertCircle size={14} className="text-yellow-500"/> 
                                Auto-deletes after 45 days
                            </span>
                        </div>
                    </div>
                </div>

                {/* Create Assignment Form */}
                <div className="bg-white/55 dark:bg-black/35 p-5 rounded-[1.5rem] border border-white/60 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                    <input 
                        placeholder="Task Title (e.g., Chapter 4 Exercises)" 
                        value={newAssignment.title}
                        onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                        className="flex-1 w-full bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors font-medium"
                    />
                    <input 
                        placeholder="Instructions / Details (optional)" 
                        value={newAssignment.description}
                        onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                        className="flex-[2] w-full bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 rounded-xl text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-colors font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && createAssignment()}
                    />
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={createAssignment} 
                        className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap flex justify-center items-center gap-2"
                    >
                        <Plus size={18}/> Assign Task
                    </motion.button>
                </div>
                
                {/* Assignments List */}
                <div className="space-y-4 flex-1">
                    <h3 className="font-bold text-lg text-slate-950 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-400"/> Current Assignments
                    </h3>
                    
                    {selectedBatch.assignments && Object.keys(selectedBatch.assignments).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {Object.values(selectedBatch.assignments)
                                .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map(assign => {
                                    const createdDate = new Date(assign.createdAt);
                                    const daysAgo = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: "easeInOut" }}
                                            key={assign.id} 
                                            className="p-6 bg-white/55 dark:bg-zinc-900/50 border border-white/60 dark:border-zinc-800 rounded-[1.5rem] flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:bg-white/80 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-950 dark:text-white text-lg tracking-tight">{assign.title}</h4>
                                                {assign.description && (
                                                    <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1.5 font-medium leading-relaxed max-w-3xl">
                                                        {assign.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-4">
                                                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-bold bg-white/70 dark:bg-black px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800/80 flex items-center gap-1.5">
                                                        <Clock size={12}/> {createdDate.toLocaleDateString()}
                                                    </span>
                                                    <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border ${daysAgo > 30 ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/30' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800'}`}>
                                                        {daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="shrink-0 flex justify-end">
                                                <button 
                                                    onClick={() => deleteAssignment(assign.id)} 
                                                    className="text-slate-500 dark:text-zinc-500 hover:text-red-500 p-2.5 bg-white/70 dark:bg-black hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-800/30 rounded-xl transition-all" 
                                                    title="Delete Homework"
                                                >
                                                    <Trash2 size={18}/>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            }
                        </div>
                    ) : (
                        <div className="text-center py-24 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-[2rem] bg-white/35 dark:bg-zinc-900/20 flex flex-col items-center justify-center">
                            <div className="bg-slate-100 dark:bg-zinc-800/50 p-5 rounded-full mb-4">
                                <BookOpen size={40} className="text-slate-400 dark:text-zinc-600" />
                            </div>
                            <p className="text-slate-700 dark:text-zinc-300 text-lg font-black tracking-tight">No active homework</p>
                            <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1 max-w-sm font-medium">Use the input above to assign tasks to the students in {selectedBatch.name}.</p>
                        </div>
                    )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center glass-card rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-zinc-800 text-slate-500 dark:text-zinc-600 p-10 min-h-[500px]">
                <div className="bg-slate-100 dark:bg-zinc-800 p-6 rounded-full mb-5 shadow-inner">
                  <LayoutGrid size={48} className="opacity-30"/>
                </div>
                <p className="font-black text-xl text-slate-700 dark:text-zinc-400">Select a batch to view homework</p>
                <p className="text-sm font-medium mt-2">Manage assignments seamlessly from the panel.</p>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}