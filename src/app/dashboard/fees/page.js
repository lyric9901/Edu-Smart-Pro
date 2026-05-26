"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    IndianRupee,
    CheckCircle,
    Clock,
    CalendarDays,
    Filter,
    Download,
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
                }
            );

            return () => unsub();
        }
    }, [user, selectedBatch?.id]);

    const toggleFee = async (studentIndex, monthIndex) => {
        if (!selectedBatch) return;

        const student = selectedBatch.students[studentIndex];

        const monthKey = MONTHS[monthIndex].toLowerCase();

        const currentStatus =
            student.fees?.[year]?.[monthKey] || "pending";

        const newStatus =
            currentStatus === "paid" ? "pending" : "paid";

        const updatedBatch = { ...selectedBatch };

        if (!updatedBatch.students[studentIndex].fees)
            updatedBatch.students[studentIndex].fees = {};

        if (
            !updatedBatch.students[studentIndex].fees[year]
        )
            updatedBatch.students[studentIndex].fees[year] = {};

        updatedBatch.students[studentIndex].fees[year][
            monthKey
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

    const downloadCSV = () => {
        if (!selectedBatch) return;

        const headers = [
            "Student Name",
            "Phone",
            ...MONTHS,
        ];

        let csv = headers.join(",") + "\n";

        selectedBatch.students.forEach((student) => {
            const row = [
                `"${student.name}"`,
                `"${student.phone}"`,
                ...MONTHS.map((m) => {
                    const status =
                        student.fees?.[year]?.[m.toLowerCase()];

                    return status === "paid"
                        ? "PAID"
                        : "PENDING";
                }),
            ];

            csv += row.join(",") + "\n";
        });

        const blob = new Blob([csv], {
            type: "text/csv",
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = `Fees_${selectedBatch.name}_${year}.csv`;

        a.click();
    };

    if (!mounted) return null;

    return (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 space-y-5 text-slate-900 dark:text-slate-100">

            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
                        <IndianRupee
                            className="text-orange-500"
                            size={32}
                        />
                        Fee Tracker
                    </h1>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage student payments
                    </p>
                </div>

                {selectedBatch && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadCSV}
                        className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition w-full sm:w-fit"
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>
                )}
            </motion.div>

            {/* FILTER BAR */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-4 shadow-sm"
            >
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                    {/* YEAR */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3 border border-slate-200 dark:border-slate-700 w-full xl:w-fit">
                        <CalendarDays
                            size={20}
                            className="text-slate-400"
                        />

                        <select
                            value={year}
                            onChange={(e) =>
                                setYear(e.target.value)
                            }
                            className="bg-transparent outline-none text-sm font-semibold w-full appearance-none cursor-pointer"
                        >
                            <option value="2024">
                                Year 2024
                            </option>

                            <option value="2025">
                                Year 2025
                            </option>

                            <option value="2026">
                                Year 2026
                            </option>
                        </select>
                    </div>

                    {/* BATCHES */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full xl:w-auto">
                        {batches.length > 0 ? (
                            batches.map((batch) => (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    key={batch.id}
                                    onClick={() =>
                                        setSelectedBatch(batch)
                                    }
                                    className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${selectedBatch?.id === batch.id
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                        }`}
                                >
                                    {batch.name}
                                </motion.button>
                            ))
                        ) : (
                            <span className="text-sm text-slate-400 px-2">
                                No batches found
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">

                {selectedBatch ? (
                    <motion.div
                        key={selectedBatch.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm"
                    >

                        {/* MOBILE UI */}
                        <div className="block lg:hidden">

                            {/* MONTH HEADER */}
                            <div className="flex border-b border-slate-200 dark:border-slate-700">

                                <div className="min-w-[130px] bg-slate-50 dark:bg-slate-800 px-4 py-4 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-20">
                                    <p className="text-xs font-bold text-slate-500 uppercase">
                                        Student
                                    </p>
                                </div>

                                <div className="flex overflow-x-auto no-scrollbar">

                                    {MONTHS.map((m) => (
                                        <div
                                            key={m}
                                            className="min-w-[74px] flex items-center justify-center text-xs font-bold uppercase text-slate-500 bg-slate-50 dark:bg-slate-800 py-4 border-r border-slate-200 dark:border-slate-700"
                                        >
                                            {m}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* STUDENTS */}
                            <div>

                                {selectedBatch.students.map(
                                    (student, sIdx) => (
                                        <div
                                            key={sIdx}
                                            className="flex border-b border-slate-100 dark:border-slate-800"
                                        >

                                            {/* STUDENT INFO */}
                                            <div className="min-w-[130px] bg-white dark:bg-slate-900 px-4 py-5 border-r border-slate-100 dark:border-slate-800 sticky left-0 z-10">

                                                <h2 className="font-bold text-sm truncate">
                                                    {student.name}
                                                </h2>

                                                <p className="text-xs text-slate-400 mt-1 truncate">
                                                    {student.phone}
                                                </p>
                                            </div>

                                            {/* MONTHS */}
                                            <div className="flex overflow-x-auto no-scrollbar">

                                                {MONTHS.map((m, mIdx) => {
                                                    const status =
                                                        student.fees?.[
                                                        year
                                                        ]?.[
                                                        m.toLowerCase()
                                                        ] || "pending";

                                                    return (
                                                        <div
                                                            key={m}
                                                            className="min-w-[74px] flex items-center justify-center py-4 border-r border-slate-100 dark:border-slate-800"
                                                        >
                                                            <motion.button
                                                                whileTap={{
                                                                    scale: 0.88,
                                                                }}
                                                                onClick={() =>
                                                                    toggleFee(
                                                                        sIdx,
                                                                        mIdx
                                                                    )
                                                                }
                                                                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm ${status ===
                                                                        "paid"
                                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 border border-green-200 dark:border-green-800"
                                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                                                    }`}
                                                            >
                                                                {status ===
                                                                    "paid" ? (
                                                                    <CheckCircle
                                                                        size={18}
                                                                    />
                                                                ) : (
                                                                    <Clock
                                                                        size={18}
                                                                    />
                                                                )}
                                                            </motion.button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* DESKTOP UI */}
                        <div className="hidden lg:block overflow-x-auto">

                            <table className="w-full min-w-[1000px]">

                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">

                                        <th className="p-5 text-left sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 min-w-[220px]">
                                            Student
                                        </th>

                                        {MONTHS.map((m) => (
                                            <th
                                                key={m}
                                                className="p-4 text-center text-xs uppercase tracking-wider text-slate-500"
                                            >
                                                {m}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>

                                    {selectedBatch.students.map(
                                        (student, sIdx) => (
                                            <tr
                                                key={sIdx}
                                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                                            >

                                                <td className="p-5 sticky left-0 bg-white dark:bg-slate-900 z-10">

                                                    <div className="font-bold">
                                                        {student.name}
                                                    </div>

                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {student.phone}
                                                    </div>
                                                </td>

                                                {MONTHS.map(
                                                    (m, mIdx) => {
                                                        const status =
                                                            student.fees?.[
                                                            year
                                                            ]?.[
                                                            m.toLowerCase()
                                                            ] || "pending";

                                                        return (
                                                            <td
                                                                key={m}
                                                                className="p-3 text-center"
                                                            >
                                                                <motion.button
                                                                    whileTap={{
                                                                        scale: 0.85,
                                                                    }}
                                                                    onClick={() =>
                                                                        toggleFee(
                                                                            sIdx,
                                                                            mIdx
                                                                        )
                                                                    }
                                                                    className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto transition-all ${status ===
                                                                            "paid"
                                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 border border-green-200 dark:border-green-800"
                                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                                                        }`}
                                                                >
                                                                    {status ===
                                                                        "paid" ? (
                                                                        <CheckCircle
                                                                            size={18}
                                                                        />
                                                                    ) : (
                                                                        <Clock
                                                                            size={18}
                                                                        />
                                                                    )}
                                                                </motion.button>
                                                            </td>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-[350px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-400"
                    >

                        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-5">
                            <Filter
                                size={45}
                                className="opacity-40"
                            />
                        </div>

                        <p className="font-bold text-lg">
                            Select a batch
                        </p>

                        <p className="text-sm opacity-60 mt-1">
                            Fee data will appear here
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}