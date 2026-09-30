// src/app/dashboard/attendance/page.js
"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
    Calendar,
    Check,
    X,
    Minus,
    Users,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCheck,
    UserX,
    Percent,
} from "lucide-react";

const Skeleton = ({ className }: { className?: string }) => (
    <div
        className={`animate-pulse bg-slate-200 dark:bg-slate-750 rounded-xl ${className}`}
    />
);

const emptySubscribe = () => () => {};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 8,
    },
    visible: {
        opacity: 1,
        y: 0,
    },
};

export default function AttendancePage() {
    const { user } = useAuth();

    const getLocalToday = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;

        return new Date(d.getTime() - offset)
            .toISOString()
            .split("T")[0];
    };

    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(getLocalToday());
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent" | "not-marked">("all");

    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [loading, setLoading] = useState(true);

    const isPastDate = selectedDate !== getLocalToday();

    const stats = useMemo(() => {
        if (!selectedBatch?.students) {
            return { present: 0, absent: 0, total: 0, unmarked: 0, rate: 0 };
        }
        let p = 0, a = 0;
        selectedBatch.students.forEach((s: any) => {
            const status = s.attendance?.[selectedDate];
            if (status === "present") p++;
            if (status === "absent") a++;
        });
        const total = selectedBatch.students.length;
        const unmarked = Math.max(0, total - (p + a));
        const rate = total > 0 ? Math.round((p / total) * 100) : 0;
        return {
            present: p,
            absent: a,
            total,
            unmarked,
            rate,
        };
    }, [selectedBatch, selectedDate]);

    useEffect(() => {
        if (!user?.institutionCode) return;

        const unsub = onSnapshot(
            collection(
                firestore,
                `institutions/${user.institutionCode}/batches`
            ),
            (snapshot) => {
                const list: any[] = [];

                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        ...doc.data(),
                        students: doc.data().students || [],
                    });
                });

                setBatches(list);

                setSelectedBatch((prev: any) => {
                    if (prev) {
                        return list.find((b: any) => b.id === prev.id) || (list.length > 0 ? list[0] : null);
                    }
                    return list.length > 0 ? list[0] : null;
                });

                setLoading(false);
            },
            (error) => {
                console.error("Batches snapshot error:", error);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [user?.institutionCode]);

    const filteredStudents = useMemo(() => {
        if (!selectedBatch?.students) return [];
        return selectedBatch.students.map((student: any, originalIndex: number) => ({
            ...student,
            originalIndex
        })).filter((student: any) => {
            const matchesQuery = !searchQuery.trim() || 
                (student.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (student.phone?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
            
            if (!matchesQuery) return false;

            const currentStatus = student.attendance?.[selectedDate] || "not-marked";
            if (filterStatus !== "all" && currentStatus !== filterStatus) return false;

            return true;
        });
    }, [selectedBatch, searchQuery, filterStatus, selectedDate]);

    const toggleAttendance = async (studentIndex) => {
        if (!selectedBatch) return;

        const student = selectedBatch.students[studentIndex];

        const currentStatus =
            student.attendance?.[selectedDate] || "not-marked";

        let newStatus = "present";

        if (currentStatus === "present") newStatus = "absent";

        if (currentStatus === "absent")
            newStatus = "not-marked";

        const updatedBatch = { ...selectedBatch };

        if (!updatedBatch.students[studentIndex].attendance) {
            updatedBatch.students[studentIndex].attendance = {};
        }

        updatedBatch.students[studentIndex].attendance[
            selectedDate
        ] = newStatus;

        setSelectedBatch(updatedBatch);

        await updateDoc(
            doc(
                firestore,
                `institutions/${user.institutionCode}/batches`,
                selectedBatch.id
            ),
            {
                students: updatedBatch.students,
            }
        );

        if (newStatus === "absent") {
            const studentId = student.id || student.phone || student.rollNumber || student.name;
            if (studentId) {
                fetch("/api/notifications/attendance-alert", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentId: String(studentId),
                        studentName: student.name || "Student",
                        date: selectedDate,
                        institutionCode: user?.institutionCode,
                        batchId: selectedBatch?.id,
                    }),
                }).catch((err) => console.error("Failed to dispatch absent alert:", err));
            }
        }
    };

    const markAll = async (status) => {
        if (!selectedBatch) return;

        const updatedBatch = { ...selectedBatch };

        updatedBatch.students.forEach((student, index) => {
            if (!updatedBatch.students[index].attendance)
                updatedBatch.students[index].attendance = {};

            updatedBatch.students[index].attendance[
                selectedDate
            ] = status;
        });

        setSelectedBatch(updatedBatch);

        await updateDoc(
            doc(
                firestore,
                `institutions/${user.institutionCode}/batches`,
                selectedBatch.id
            ),
            {
                students: updatedBatch.students,
            }
        );

        if (status === "absent") {
            updatedBatch.students.forEach((student) => {
                const studentId = student.id || student.phone || student.rollNumber || student.name;
                if (studentId) {
                    fetch("/api/notifications/attendance-alert", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            studentId: String(studentId),
                            studentName: student.name || "Student",
                            date: selectedDate,
                            institutionCode: user?.institutionCode,
                            batchId: selectedBatch?.id,
                        }),
                    }).catch((err) => console.error("Failed to dispatch absent alert:", err));
                }
            });
        }
    };

    const changeDate = (days) => {
        const d = new Date(selectedDate);

        d.setDate(d.getDate() + days);

        const offset = d.getTimezoneOffset() * 60000;

        const newDate = new Date(d.getTime() - offset)
            .toISOString()
            .split("T")[0];

        setSelectedDate(newDate);
    };

    const getStatus = (student: any) =>
        student.attendance?.[selectedDate] || "not-marked";

    const getStatusUI = (status: string) => {
        switch (status) {
            case "present":
                return {
                    color:
                        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/60",
                    icon: <Check size={18} strokeWidth={3} />,
                    label: "Present",
                };

            case "absent":
                return {
                    color:
                        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60",
                    icon: <X size={18} strokeWidth={3} />,
                    label: "Absent",
                };

            default:
                return {
                    color:
                        "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                    icon: <Minus size={18} />,
                    label: "Mark",
                };
        }
    };

    if (!mounted) {
        return (
            <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 space-y-4">
                <Skeleton className="w-48 h-10 rounded-2xl" />
                <Skeleton className="w-full h-32 rounded-3xl" />
                <Skeleton className="w-full h-64 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 text-slate-900 dark:text-white">

            {/* HEADER */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                        <Calendar className="text-blue-600" size={30} />
                        Attendance
                    </h1>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {isPastDate
                            ? "Managing Past Records"
                            : "Today's Tracker"}
                    </p>
                </div>
            </div>

            {/* TOP CONTROLS */}
            <div className="bg-gradient-to-br from-blue-50/80 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 sm:p-5 shadow-sm space-y-4">

                {/* DATE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-between">

                    <button
                        onClick={() => changeDate(-1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Previous Day"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600 dark:text-blue-400" />

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                            className="bg-transparent outline-none text-sm font-bold cursor-pointer"
                        />
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Next Day"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* BATCHES */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {loading ? (
                        <>
                            <Skeleton className="w-28 h-12" />
                            <Skeleton className="w-28 h-12" />
                            <Skeleton className="w-28 h-12" />
                        </>
                    ) : batches.length > 0 ? (
                        batches.map((batch) => (
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                key={batch.id}
                                onClick={() => {
                                    setSelectedBatch(batch);
                                    setSearchQuery("");
                                }}
                                className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${selectedBatch?.id === batch.id
                                        ? "bg-[#0B132B] dark:bg-blue-600 text-white border-[#0B132B] dark:border-blue-600 shadow-md"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                            >
                                {batch.name}
                            </motion.button>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 py-2">
                            No batches found
                        </p>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">

                {loading ? (
                    <div className="space-y-4 mt-5">
                        <Skeleton className="w-full h-32 rounded-3xl" />
                        <Skeleton className="w-full h-20 rounded-2xl" />
                        <Skeleton className="w-full h-20 rounded-2xl" />
                    </div>
                ) : selectedBatch ? (

                    <motion.div
                        key={selectedBatch.id}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        variants={containerVariants}
                        className="mt-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm"
                    >

                        {/* BATCH HEADER & STATS */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-5">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {selectedBatch.name}
                                    </h2>

                                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
                                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => markAll("present")}
                                        className="px-5 h-12 sm:h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 text-sm transition"
                                    >
                                        <CheckCircle2 size={18} />
                                        Mark All Present
                                    </motion.button>
                                </div>
                            </div>

                            {/* SEARCH & FILTER CONTROLS */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <div className="relative flex-1">
                                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search student by name or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold outline-none focus:border-blue-500 transition"
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                                    <button
                                        onClick={() => setFilterStatus("all")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${filterStatus === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"}`}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("present")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${filterStatus === "present" ? "bg-emerald-600 text-white border-transparent" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"}`}
                                    >
                                        Present ({stats.present})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("absent")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${filterStatus === "absent" ? "bg-rose-600 text-white border-transparent" : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"}`}
                                    >
                                        Absent ({stats.absent})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("not-marked")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${filterStatus === "not-marked" ? "bg-amber-600 text-white border-transparent" : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"}`}
                                    >
                                        Unmarked ({stats.unmarked})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STUDENT LIST */}
                        <div className="p-3 sm:p-5 space-y-3">

                            {filteredStudents.map(
                                (student: any) => {
                                    const status = getStatus(student);
                                    const ui = getStatusUI(status);

                                    return (
                                        <motion.div
                                            key={student.id || student.originalIndex}
                                            variants={itemVariants}
                                            whileTap={{ scale: 0.985 }}
                                            onClick={() =>
                                                toggleAttendance(student.originalIndex)
                                            }
                                            className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                                        >

                                            {/* LEFT */}
                                            <div className="flex items-center gap-3.5 min-w-0">

                                                <div
                                                    className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center font-black text-lg shrink-0 ${ui.color}`}
                                                >
                                                    {(student.name || "S").charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold truncate text-base text-slate-900 dark:text-white">
                                                        {student.name}
                                                    </p>

                                                    <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                                                        {student.phone ? `Ph: ${student.phone}` : "No phone"} {student.rollNumber ? `• Roll: ${student.rollNumber}` : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT BUTTON */}
                                            <div
                                                className={`min-w-[110px] sm:min-w-[125px] h-11 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-bold px-4 transition-all shrink-0 ${ui.color}`}
                                            >
                                                {ui.icon}
                                                {ui.label}
                                            </div>
                                        </motion.div>
                                    );
                                }
                            )}

                            {filteredStudents.length === 0 && (
                                <div className="py-16 text-center text-slate-400">
                                    <p className="font-bold text-base">No students matching criteria</p>
                                    <p className="text-xs text-slate-400 mt-1">Try changing your search or filter</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="mt-5 h-[320px] rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">

                        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                            <Users size={38} />
                        </div>

                        <p className="font-bold text-lg">
                            Select a batch
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Choose a batch above to start marking attendance
                        </p>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
} 