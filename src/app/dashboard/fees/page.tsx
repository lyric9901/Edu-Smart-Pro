"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    IndianRupee,
    CheckCircle2,
    Clock,
    Search,
    Users,
    Percent,
    X,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    Table as TableIcon,
    Calendar,
    Sparkles,
    Check,
} from "lucide-react";

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

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
            staggerChildren: 0.03,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
};

export default function FeesPage() {
    const { user } = useAuth();

    const currentMonthIndex = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [year, setYear] = useState<number>(currentYear);
    const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(currentMonthIndex);
    const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending">("all");
    const [activeStudentIndex, setActiveStudentIndex] = useState<number | null>(null);

    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [loading, setLoading] = useState(true);

    const selectedMonthName = MONTHS[selectedMonthIdx];
    const selectedMonthKey = selectedMonthName.toLowerCase();

    // Real-time batch subscription
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
                console.error("Failed to fetch batches for fees:", error);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [user?.institutionCode]);

    // Derived active student for modal
    const activeStudent = useMemo(() => {
        if (activeStudentIndex === null || !selectedBatch?.students) return null;
        return selectedBatch.students[activeStudentIndex] || null;
    }, [selectedBatch, activeStudentIndex]);

    // Monthly Fee Stats for active month & year
    const stats = useMemo(() => {
        if (!selectedBatch?.students) {
            return { total: 0, paid: 0, pending: 0, collectionRate: 0 };
        }
        let paid = 0;
        let pending = 0;

        selectedBatch.students.forEach((student: any) => {
            const status = student.fees?.[year]?.[selectedMonthKey] || "pending";
            if (status === "paid") {
                paid++;
            } else {
                pending++;
            }
        });

        const total = selectedBatch.students.length;
        const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;

        return {
            total,
            paid,
            pending,
            collectionRate,
        };
    }, [selectedBatch, year, selectedMonthKey]);

    // Filter students by search and status
    const filteredStudents = useMemo(() => {
        if (!selectedBatch?.students) return [];

        return selectedBatch.students
            .map((student: any, originalIndex: number) => ({
                ...student,
                originalIndex,
            }))
            .filter((student: any) => {
                const matchesQuery =
                    !searchQuery.trim() ||
                    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());

                if (!matchesQuery) return false;

                const currentStatus = student.fees?.[year]?.[selectedMonthKey] || "pending";
                if (filterStatus !== "all" && currentStatus !== filterStatus) return false;

                return true;
            });
    }, [selectedBatch, searchQuery, filterStatus, year, selectedMonthKey]);

    // Toggle fee payment for student
    const toggleFee = async (studentIndex: number, monthIndex: number) => {
        if (!selectedBatch || !user?.institutionCode) return;

        const student = selectedBatch.students[studentIndex];
        const monthKey = MONTHS[monthIndex].toLowerCase();
        const currentStatus = student.fees?.[year]?.[monthKey] || "pending";
        const newStatus = currentStatus === "paid" ? "pending" : "paid";

        // Optimistic update
        const updatedBatch = { ...selectedBatch };
        const updatedStudents = [...updatedBatch.students];
        const updatedStudent = { ...updatedStudents[studentIndex] };

        if (!updatedStudent.fees) updatedStudent.fees = {};
        if (!updatedStudent.fees[year]) updatedStudent.fees[year] = {};
        updatedStudent.fees[year][monthKey] = newStatus;

        updatedStudents[studentIndex] = updatedStudent;
        updatedBatch.students = updatedStudents;

        setSelectedBatch(updatedBatch);

        try {
            await updateDoc(
                doc(
                    firestore,
                    `institutions/${user.institutionCode}/batches`,
                    selectedBatch.id
                ),
                {
                    students: updatedStudents,
                }
            );

            if (newStatus === "paid") {
                toast.success(`${student.name} marked Paid for ${MONTHS[monthIndex]}`);
            }
        } catch (error) {
            console.error("Error updating fee status:", error);
            toast.error("Failed to update fee record. Please try again.");
        }
    };

    // Mark all students as paid for the active month
    const markAllPaid = async () => {
        if (!selectedBatch || !user?.institutionCode || selectedBatch.students.length === 0) return;

        const updatedBatch = { ...selectedBatch };
        const updatedStudents = updatedBatch.students.map((student: any) => {
            const fees = { ...(student.fees || {}) };
            if (!fees[year]) fees[year] = {};
            fees[year][selectedMonthKey] = "paid";
            return {
                ...student,
                fees,
            };
        });

        updatedBatch.students = updatedStudents;
        setSelectedBatch(updatedBatch);

        try {
            await updateDoc(
                doc(
                    firestore,
                    `institutions/${user.institutionCode}/batches`,
                    selectedBatch.id
                ),
                {
                    students: updatedStudents,
                }
            );
            toast.success(`All students marked Paid for ${selectedMonthName} ${year}!`);
        } catch (err) {
            console.error("Error marking all paid:", err);
            toast.error("Failed to mark all as paid.");
        }
    };

    // Month navigation
    const changeMonth = (delta: number) => {
        let newIdx = selectedMonthIdx + delta;
        if (newIdx < 0) {
            newIdx = 11;
            setYear((prev) => prev - 1);
        } else if (newIdx > 11) {
            newIdx = 0;
            setYear((prev) => prev + 1);
        }
        setSelectedMonthIdx(newIdx);
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
                        <IndianRupee className="text-amber-500" size={30} />
                        Fee Tracker
                    </h1>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track monthly student dues, receipts & payment records
                    </p>
                </div>

                {selectedBatch && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === "cards" ? "matrix" : "cards")}
                            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                            {viewMode === "cards" ? (
                                <>
                                    <TableIcon size={16} /> Full Year Matrix
                                </>
                            ) : (
                                <>
                                    <LayoutGrid size={16} /> Card View
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* TOP CONTROLS (MATCHING ATTENDANCE PAGE DESIGN) */}
            <div className="bg-gradient-to-br from-amber-50/80 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 sm:p-5 shadow-sm space-y-4">

                {/* MONTH & YEAR PICKER */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-between">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Previous Month"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm uppercase tracking-wide">
                            <Calendar size={18} />
                            <span>{selectedMonthName}</span>
                        </div>

                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold outline-none cursor-pointer"
                        >
                            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => changeMonth(1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Next Month"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* 12 MONTH PILLS */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {MONTHS.map((m, idx) => {
                        const isSelected = selectedMonthIdx === idx;
                        const isCurrent = idx === currentMonthIndex && year === currentYear;

                        return (
                            <button
                                key={m}
                                onClick={() => setSelectedMonthIdx(idx)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                    isSelected
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm"
                                        : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                                } relative`}
                            >
                                {m}
                                {isCurrent && (
                                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block align-middle" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* BATCH SELECTOR PILLS */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-1">
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
                                className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
                                    selectedBatch?.id === batch.id
                                        ? "bg-[#0B132B] dark:bg-blue-600 text-white border-[#0B132B] dark:border-blue-600 shadow-md"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                            >
                                {batch.name}
                            </motion.button>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 py-2">No batches found</p>
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
                                        Fee Cycle: {selectedMonthName} {year}
                                    </p>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={markAllPaid}
                                        className="px-5 h-12 sm:h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition"
                                    >
                                        <CheckCircle2 size={18} />
                                        Mark All Paid
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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-semibold outline-none focus:border-amber-500 transition"
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
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            filterStatus === "all"
                                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
                                                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                                        }`}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("paid")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            filterStatus === "paid"
                                                ? "bg-emerald-600 text-white border-transparent"
                                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                        }`}
                                    >
                                        Paid ({stats.paid})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("pending")}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                                            filterStatus === "pending"
                                                ? "bg-amber-600 text-white border-transparent"
                                                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                                        }`}
                                    >
                                        Pending ({stats.pending})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA: CARD VIEW (MATCHING ATTENDANCE PAGE) */}
                        {viewMode === "cards" ? (
                            <div className="p-3 sm:p-5 space-y-3">
                                {filteredStudents.map((student: any) => {
                                    const status = student.fees?.[year]?.[selectedMonthKey] || "pending";
                                    const isPaid = status === "paid";

                                    // Compute annual summary for this student
                                    let paidMonthsInYear = 0;
                                    MONTHS.forEach((m) => {
                                        if (student.fees?.[year]?.[m.toLowerCase()] === "paid") {
                                            paidMonthsInYear++;
                                        }
                                    });

                                    return (
                                        <motion.div
                                            key={student.id || student.originalIndex}
                                            variants={itemVariants}
                                            className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                                                isPaid
                                                    ? "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/90 hover:border-emerald-300 dark:hover:border-emerald-800"
                                                    : "bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/90 hover:border-amber-300 dark:hover:border-amber-800"
                                            }`}
                                        >
                                            {/* LEFT: Student info & 12-month dot track */}
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div
                                                    className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center font-black text-lg shrink-0 ${
                                                        isPaid
                                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                                            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                                                    }`}
                                                >
                                                    {(student.name || "S").charAt(0).toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold truncate text-base text-slate-900 dark:text-white">
                                                            {student.name}
                                                        </p>
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                            {paidMonthsInYear}/12 Paid
                                                        </span>
                                                    </div>

                                                    <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                                                        {student.phone ? `Ph: ${student.phone}` : "No phone"} {student.rollNumber ? `• Roll: ${student.rollNumber}` : ""}
                                                    </p>

                                                    {/* 12-MONTH QUICK DOT TIMELINE */}
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {MONTHS.map((m, mIdx) => {
                                                            const mKey = m.toLowerCase();
                                                            const mPaid = student.fees?.[year]?.[mKey] === "paid";
                                                            const isThisMonth = mIdx === selectedMonthIdx;

                                                            return (
                                                                <button
                                                                    key={m}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleFee(student.originalIndex, mIdx);
                                                                    }}
                                                                    title={`${m}: ${mPaid ? "Paid" : "Pending"}. Click to toggle.`}
                                                                    className={`w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center transition-all ${
                                                                        mPaid
                                                                            ? "bg-emerald-500 text-white"
                                                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 hover:bg-slate-300"
                                                                    } ${isThisMonth ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900" : ""}`}
                                                                >
                                                                    {m.charAt(0)}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT: TOGGLE BUTTON & DETAILS */}
                                            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                                                <button
                                                    onClick={() => setActiveStudentIndex(student.originalIndex)}
                                                    className="px-3 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition"
                                                >
                                                    All Months
                                                </button>

                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => toggleFee(student.originalIndex, selectedMonthIdx)}
                                                    className={`min-w-[120px] sm:min-w-[135px] h-11 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-bold px-4 transition-all shadow-xs ${
                                                        isPaid
                                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200"
                                                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-100"
                                                    }`}
                                                >
                                                    {isPaid ? (
                                                        <>
                                                            <Check size={18} strokeWidth={3} />
                                                            <span>Paid</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock size={18} />
                                                            <span>Mark Paid</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {filteredStudents.length === 0 && (
                                    <div className="py-16 text-center text-slate-400">
                                        <p className="font-bold text-base">No students matching criteria</p>
                                        <p className="text-xs text-slate-400 mt-1">Try changing your search or filter</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* FULL YEAR MATRIX TABLE VIEW */
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-400 tracking-wider">
                                            <th className="p-4 text-left sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">
                                                Student
                                            </th>
                                            {MONTHS.map((m, mIdx) => (
                                                <th
                                                    key={m}
                                                    className={`p-3 text-center ${mIdx === selectedMonthIdx ? "text-amber-500 font-black" : ""}`}
                                                >
                                                    {m}
                                                </th>
                                            ))}
                                            <th className="p-4 text-center">Summary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student: any) => {
                                            let paidCount = 0;
                                            return (
                                                <tr
                                                    key={student.id || student.originalIndex}
                                                    className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition"
                                                >
                                                    <td className="p-4 sticky left-0 bg-white dark:bg-slate-950 z-10">
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {student.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {student.phone || "No phone"}
                                                        </div>
                                                    </td>

                                                    {MONTHS.map((m, mIdx) => {
                                                        const mKey = m.toLowerCase();
                                                        const isPaid = student.fees?.[year]?.[mKey] === "paid";
                                                        if (isPaid) paidCount++;

                                                        return (
                                                            <td key={m} className="p-2 text-center">
                                                                <button
                                                                    onClick={() => toggleFee(student.originalIndex, mIdx)}
                                                                    title={`${student.name} - ${m}: ${isPaid ? "Paid" : "Pending"}`}
                                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                                                        isPaid
                                                                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 border border-emerald-300 dark:border-emerald-800"
                                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-300"
                                                                    } ${mIdx === selectedMonthIdx ? "ring-2 ring-amber-400" : ""}`}
                                                                >
                                                                    {isPaid ? <Check size={16} strokeWidth={3} /> : <Clock size={16} />}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}

                                                    <td className="p-4 text-center">
                                                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                            {paidCount}/12
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="mt-5 h-[320px] rounded-[2.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                            <IndianRupee size={38} />
                        </div>
                        <p className="font-bold text-lg">Select a batch</p>
                        <p className="text-xs text-slate-400 mt-1">Choose a batch above to view fee records</p>
                    </div>
                )}
            </AnimatePresence>

            {/* 12-MONTH STUDENT DETAIL MODAL */}
            <AnimatePresence>
                {activeStudentIndex !== null && activeStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-slate-950/60 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-4"
                        onClick={() => setActiveStudentIndex(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ duration: 0.18 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Sparkles size={20} className="text-amber-500" />
                                        {activeStudent.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Annual Fee Tracker • Year {year}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setActiveStudentIndex(null)}
                                    className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* 12 MONTH TOGGLE GRID */}
                            <div className="grid grid-cols-3 gap-3 my-5">
                                {MONTHS.map((m, mIdx) => {
                                    const mKey = m.toLowerCase();
                                    const isPaid = activeStudent.fees?.[year]?.[mKey] === "paid";

                                    return (
                                        <motion.button
                                            whileTap={{ scale: 0.94 }}
                                            key={m}
                                            onClick={() => toggleFee(activeStudentIndex, mIdx)}
                                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                                                isPaid
                                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300"
                                            }`}
                                        >
                                            <span className="text-xs font-extrabold uppercase">{m}</span>
                                            <span className="text-[11px] font-bold flex items-center gap-1">
                                                {isPaid ? (
                                                    <>
                                                        <Check size={14} strokeWidth={3} /> Paid
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={14} /> Pending
                                                    </>
                                                )}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setActiveStudentIndex(null)}
                                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}