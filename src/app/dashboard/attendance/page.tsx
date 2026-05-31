// src/app/dashboard/attendance/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

import {
    Calendar,
    Check,
    X,
    Minus,
    Users,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
} from "lucide-react";

const Skeleton = ({ className }) => (
    <div
        className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}
    />
);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 10,
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

    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedDate, setSelectedDate] = useState(getLocalToday());

    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        total: 0,
    });

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

            const unsub = onSnapshot(
                collection(
                    firestore,
                    `institutions/${user.institutionCode}/batches`
                ),
                (snapshot) => {
                    const list = [];

                    snapshot.forEach((doc) => {
                        list.push({
                            id: doc.id,
                            ...doc.data(),
                            students: doc.data().students || [],
                        });
                    });

                    setBatches(list);

                    if (selectedBatch) {
                        const updated = list.find(
                            (b) => b.id === selectedBatch.id
                        );

                        if (updated) setSelectedBatch(updated);
                    }

                    setLoading(false);
                }
            );

            return () => unsub();
        }
    }, [user, selectedBatch?.id]);

    useEffect(() => {
        if (selectedBatch && selectedBatch.students) {
            let p = 0,
                a = 0;

            selectedBatch.students.forEach((s) => {
                const status = s.attendance?.[selectedDate];

                if (status === "present") p++;
                if (status === "absent") a++;
            });

            setStats({
                present: p,
                absent: a,
                total: selectedBatch.students.length,
            });
        }
    }, [selectedBatch, selectedDate]);

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

    const downloadCSV = () => { };

    const getStatus = (student) =>
        student.attendance?.[selectedDate] || "not-marked";

    const getStatusUI = (status) => {
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

    if (!mounted) return null;

    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 text-slate-900 dark:text-white">

            {/* HEADER */}
            <div className="mb-5">
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

            {/* TOP CONTROLS */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 sm:p-5 shadow-sm">

                {/* DATE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-between mb-4">

                    <button
                        onClick={() => changeDate(-1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />

                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) =>
                                setSelectedDate(e.target.value)
                            }
                            className="bg-transparent outline-none text-sm font-bold"
                        />
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* BATCHES */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">

                    {loading ? (
                        <>
                            <Skeleton className="w-24 h-11" />
                            <Skeleton className="w-24 h-11" />
                        </>
                    ) : batches.length > 0 ? (
                        batches.map((batch) => (
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                key={batch.id}
                                onClick={() => setSelectedBatch(batch)}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${selectedBatch?.id === batch.id
                                        ? "bg-[#0B132B] text-white border-[#0B132B]"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                    }`}
                            >
                                {batch.name}
                            </motion.button>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400">
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

                        {/* BATCH HEADER */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">

                            <h2 className="text-3xl font-black tracking-tight">
                                {selectedBatch.name}
                            </h2>

                            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
                                {new Date(selectedDate).toDateString()}
                            </p>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center gap-3 mt-5">

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={downloadCSV}
                                    className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm"
                                >
                                    <Download size={18} />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => markAll("present")}
                                    className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                >
                                    <CheckCircle2 size={18} />
                                    Mark All Present
                                </motion.button>
                            </div>
                        </div>

                        {/* STUDENT LIST */}
                        <div className="p-3 sm:p-4 space-y-3">

                            {selectedBatch.students.map(
                                (student, index) => {
                                    const status = getStatus(student);

                                    const ui = getStatusUI(status);

                                    return (
                                        <motion.div
                                            key={student.id || index}
                                            variants={itemVariants}
                                            whileTap={{ scale: 0.985 }}
                                            onClick={() =>
                                                toggleAttendance(index)
                                            }
                                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition-all"
                                        >

                                            {/* LEFT */}
                                            <div className="flex items-center gap-4 min-w-0">

                                                <div
                                                    className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-black text-lg shrink-0 ${ui.color}`}
                                                >
                                                    {student.name.charAt(0)}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold truncate text-base">
                                                        {student.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400 truncate">
                                                        {student.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div
                                                className={`min-w-[115px] h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-bold px-4 transition-all ${ui.color}`}
                                            >
                                                {ui.icon}
                                                {ui.label}
                                            </div>
                                        </motion.div>
                                    );
                                }
                            )}

                            {selectedBatch.students.length === 0 && (
                                <div className="py-20 text-center text-slate-400">
                                    No students found
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
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}