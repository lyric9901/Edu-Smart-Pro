"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Save, X, Edit2, Calendar, Plus, Trash2, BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import toast from "react-hot-toast";

export interface TimeSlot {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  room?: string;
  teacher?: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptySubscribe = () => () => {};

export default function TimingPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [timeForm, setTimeForm] = useState({ start: "", end: "" });
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Weekly Timetable Modal State
  const [timetableModalBatch, setTimetableModalBatch] = useState<any | null>(null);
  const [currentSlots, setCurrentSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    subject: "",
    startTime: "",
    endTime: "",
    room: "",
    teacher: ""
  });

  useEffect(() => {
    if (user?.institutionCode) {
      const unsub = onSnapshot(collection(firestore, `institutions/${user.institutionCode}/batches`), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setBatches(list);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user]);

  const startEditing = (batch: any) => {
    setEditingId(batch.id);
    setTimeForm({
      start: batch.timing?.start || "",
      end: batch.timing?.end || ""
    });
  };

  const saveTiming = async (batchId: string) => {
    if (!timeForm.start || !timeForm.end || !user?.institutionCode) return;
    
    try {
      await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, batchId), {
        timing: { start: timeForm.start, end: timeForm.end }
      });
      setEditingId(null);
      toast.success("Batch timing updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update timing.");
    }
  };

  const openTimetableModal = (batch: any) => {
    setTimetableModalBatch(batch);
    const rawTimetable = Array.isArray(batch.timetable) ? batch.timetable : [];
    setCurrentSlots(
      rawTimetable.map((slot: any, idx: number) => ({
        id: slot.id || `slot-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        day: slot.day || "Monday",
        subject: slot.subject || "",
        startTime: slot.startTime || "",
        endTime: slot.endTime || "",
        room: slot.room || "",
        teacher: slot.teacher || ""
      }))
    );
    setNewSlot({
      day: "Monday",
      subject: "",
      startTime: batch.timing?.start || "09:00",
      endTime: batch.timing?.end || "10:00",
      room: "",
      teacher: ""
    });
  };

  const handleAddSlot = () => {
    if (!newSlot.subject.trim() || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Please provide subject, start time, and end time.");
      return;
    }
    const slot: TimeSlot = {
      id: Date.now().toString() + "-" + Math.random().toString(36).substring(2, 8),
      day: newSlot.day,
      subject: newSlot.subject.trim(),
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      room: newSlot.room.trim() || "",
      teacher: newSlot.teacher.trim() || ""
    };
    setCurrentSlots(prev => [...prev, slot]);
    setNewSlot(prev => ({
      ...prev,
      subject: "",
      room: "",
      teacher: ""
    }));
  };

  const handleRemoveSlot = (id: string) => {
    setCurrentSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveTimetable = async () => {
    if (!timetableModalBatch || !user?.institutionCode) return;
    try {
      const sanitizedSlots = currentSlots.map(s => ({
        id: s.id,
        day: s.day,
        subject: s.subject || "",
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        room: s.room || "",
        teacher: s.teacher || ""
      }));
      await updateDoc(doc(firestore, `institutions/${user.institutionCode}/batches`, timetableModalBatch.id), {
        timetable: sanitizedSlots
      });
      toast.success("Weekly timetable saved successfully!");
      setTimetableModalBatch(null);
    } catch (err) {
      console.error("Error saving timetable:", err);
      toast.error("Failed to save weekly timetable.");
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "Not Set";
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-zinc-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                    <Clock className="text-purple-600" size={32} /> Class Schedule & Timetable
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Set batch timings and weekly period schedules</p>
            </div>
            <ThemeToggle compact />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {batches.map((batch) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.96 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    key={batch.id} 
                    className={`gpu-animated p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between ${
                        editingId === batch.id 
                        ? "bg-white dark:bg-zinc-900 border-purple-500 shadow-xl ring-2 ring-purple-500/20" 
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-lg"
                    }`}
                >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{batch.name}</h2>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{batch.students?.length || 0} Students</p>
                          </div>
                          {editingId !== batch.id && (
                              <button onClick={() => startEditing(batch)} className="p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition" title="Edit General Timing">
                                  <Edit2 size={16} />
                              </button>
                          )}
                      </div>

                      {editingId === batch.id ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mb-4">
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Start Time</label>
                                      <input 
                                          type="time" 
                                          value={timeForm.start}
                                          onChange={e => setTimeForm({...timeForm, start: e.target.value})}
                                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-white transition"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">End Time</label>
                                      <input 
                                          type="time" 
                                          value={timeForm.end}
                                          onChange={e => setTimeForm({...timeForm, end: e.target.value})}
                                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-white transition"
                                      />
                                  </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/80 transition">Cancel</button>
                                  <button onClick={() => saveTiming(batch.id)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transition flex items-center justify-center gap-1 shadow-md shadow-purple-600/20"><Save size={14}/> Save</button>
                              </div>
                          </motion.div>
                      ) : (
                          <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                                  <Clock size={20} />
                              </div>
                              <div>
                                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                                      {formatTime(batch.timing?.start)}
                                  </div>
                                  <div className="text-xs font-bold text-slate-400 uppercase">
                                      To {formatTime(batch.timing?.end)}
                                  </div>
                              </div>
                          </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        {Array.isArray(batch.timetable) && batch.timetable.length > 0 
                          ? `${batch.timetable.length} weekly periods` 
                          : "No periods configured"}
                      </span>
                      <button 
                        onClick={() => openTimetableModal(batch)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/50 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Calendar size={14} /> Weekly Schedule
                      </button>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
        </div>

        {batches.length === 0 && !loading && (
            <div className="text-center py-20 text-slate-400">No batches found. Create one in the Dashboard first.</div>
        )}

        {/* WEEKLY TIMETABLE PERIOD EDITOR MODAL */}
        <AnimatePresence>
          {timetableModalBatch && (
            <div className="fixed inset-0 z-[130] bg-black/60 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
              >
                <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={22} className="text-purple-600 dark:text-purple-400"/> Weekly Timetable: {timetableModalBatch.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure class periods for students to view in their portal
                    </p>
                  </div>
                  <button onClick={() => setTimetableModalBatch(null)} className="p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-full hover:rotate-90 transition text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                  {/* Form to Add New Period */}
                  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus size={14} /> Add Period / Time Slot
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Day</label>
                        <select 
                          value={newSlot.day}
                          onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                        >
                          {DAYS_OF_WEEK.map(d => (
                            <option key={d} value={d} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Subject</label>
                        <input 
                          placeholder="e.g. Physics, Mathematics"
                          value={newSlot.subject}
                          onChange={e => setNewSlot({ ...newSlot, subject: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Start Time</label>
                        <input 
                          type="time"
                          value={newSlot.startTime}
                          onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">End Time</label>
                        <input 
                          type="time"
                          value={newSlot.endTime}
                          onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Teacher (Opt)</label>
                        <input 
                          placeholder="e.g. Dr. Verma"
                          value={newSlot.teacher}
                          onChange={e => setNewSlot({ ...newSlot, teacher: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase mb-1 block">Room (Opt)</label>
                        <input 
                          placeholder="e.g. Room 102"
                          value={newSlot.room}
                          onChange={e => setNewSlot({ ...newSlot, room: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 text-sm font-semibold outline-none focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleAddSlot}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                    >
                      <Plus size={16} /> Add to Schedule
                    </button>
                  </div>

                  {/* Existing Slots List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Scheduled Periods ({currentSlots.length})
                    </h4>

                    {currentSlots.length === 0 ? (
                      <p className="text-center py-8 text-sm text-slate-400 dark:text-zinc-500">
                        No periods added yet. Use the form above to add weekly periods.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {currentSlots.map((slot, index) => (
                          <div 
                            key={slot.id || `slot-${index}`} 
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shrink-0">
                                {slot.day.slice(0, 3)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {slot.subject}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  {slot.teacher && ` • ${slot.teacher}`}
                                  {slot.room && ` • ${slot.room}`}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveSlot(slot.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Delete Period"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex gap-3 shrink-0">
                  <button 
                    onClick={() => setTimetableModalBatch(null)} 
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/80 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveTimetable} 
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
                  >
                    <Save size={16} /> Save Timetable
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
