"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    School,
    Download,
    Upload,
    X,
    Users,
    Database,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Calendar,
    IndianRupee,
    FileDown,
} from "lucide-react";

interface InstituteDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    institutionCode: string;
    schoolName: string;
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function InstituteDataModal({
    isOpen,
    onClose,
    institutionCode,
    schoolName,
}: InstituteDataModalProps) {
    const [tab, setTab] = useState<"export" | "import">("export");
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [loadingBatches, setLoadingBatches] = useState(false);

    // Import state
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [parsedStudents, setParsedStudents] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [exportingType, setExportingType] = useState<string | null>(null);

    // Fetch batches when modal opens
    useEffect(() => {
        if (!isOpen || !institutionCode) return;

        getDocs(collection(firestore, `institutions/${institutionCode}/batches`))
            .then((snapshot) => {
                const list: any[] = [];
                snapshot.forEach((d) => {
                    list.push({
                        id: d.id,
                        ...d.data(),
                        students: d.data().students || [],
                    });
                });
                setBatches(list);
                if (list.length > 0) {
                    setSelectedBatchId(list[0].id);
                }
            })
            .catch((err) => {
                console.error("Failed to load batches:", err);
                toast.error("Failed to load institute batches");
            })
            .finally(() => {
                setLoadingBatches(false);
            });
    }, [isOpen, institutionCode]);

    // Download CSV helper
    const triggerDownload = (filename: string, content: string, mimeType = "text/csv;charset=utf-8;") => {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // 1. Export Attendance CSV
    const exportAttendance = async () => {
        setExportingType("attendance");
        try {
            const snap = await getDocs(collection(firestore, `institutions/${institutionCode}/batches`));
            const rows: string[] = [
                ["Batch Name", "Student ID", "Roll Number", "Student Name", "Phone", "Date", "Status"].join(",")
            ];

            const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

            snap.forEach((batchDoc) => {
                const batch = batchDoc.data();
                const students = batch.students || [];
                students.forEach((student: any) => {
                    const attendance = student.attendance || {};
                    const dates = Object.keys(attendance).sort();
                    if (dates.length === 0) {
                        rows.push([
                            escape(batch.name || batchDoc.id),
                            escape(student.id || ""),
                            escape(student.rollNumber || student.rollNo || ""),
                            escape(student.name || ""),
                            escape(student.phone || ""),
                            "No Records",
                            "N/A"
                        ].join(","));
                    } else {
                        dates.forEach((date) => {
                            rows.push([
                                escape(batch.name || batchDoc.id),
                                escape(student.id || ""),
                                escape(student.rollNumber || student.rollNo || ""),
                                escape(student.name || ""),
                                escape(student.phone || ""),
                                escape(date),
                                escape(String(attendance[date]).toUpperCase())
                            ].join(","));
                        });
                    }
                });
            });

            triggerDownload(`Attendance_${institutionCode}_Export.csv`, rows.join("\r\n"));
            toast.success("Attendance records exported successfully!");
        } catch (err) {
            console.error("Attendance export error:", err);
            toast.error("Failed to export attendance records.");
        } finally {
            setExportingType(null);
        }
    };

    // 2. Export Fees CSV
    const exportFees = async () => {
        setExportingType("fees");
        try {
            const currentYear = new Date().getFullYear();
            const snap = await getDocs(collection(firestore, `institutions/${institutionCode}/batches`));
            const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

            const headers = [
                "Batch Name",
                "Student ID",
                "Roll Number",
                "Student Name",
                "Phone",
                "Year",
                ...MONTHS,
                "Paid Count",
                "Pending Count"
            ];
            const rows: string[] = [headers.join(",")];

            snap.forEach((batchDoc) => {
                const batch = batchDoc.data();
                const students = batch.students || [];
                students.forEach((student: any) => {
                    const feesByYear = student.fees?.[currentYear] || {};
                    let paidCount = 0;
                    const monthValues = MONTHS.map((m) => {
                        const status = feesByYear[m.toLowerCase()] || "pending";
                        if (status === "paid") paidCount++;
                        return status.toUpperCase();
                    });

                    rows.push([
                        escape(batch.name || batchDoc.id),
                        escape(student.id || ""),
                        escape(student.rollNumber || student.rollNo || ""),
                        escape(student.name || ""),
                        escape(student.phone || ""),
                        currentYear,
                        ...monthValues,
                        paidCount,
                        12 - paidCount
                    ].join(","));
                });
            });

            triggerDownload(`Fees_${institutionCode}_${currentYear}_Export.csv`, rows.join("\r\n"));
            toast.success("Fee records exported successfully!");
        } catch (err) {
            console.error("Fees export error:", err);
            toast.error("Failed to export fee records.");
        } finally {
            setExportingType(null);
        }
    };

    // 3. Export Student Directory CSV
    const exportStudents = async () => {
        setExportingType("students");
        try {
            const snap = await getDocs(collection(firestore, `institutions/${institutionCode}/batches`));
            const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;

            const rows: string[] = [
                ["Batch Name", "Student ID", "Roll Number", "Student Name", "Phone", "Monthly Fee"].join(",")
            ];

            snap.forEach((batchDoc) => {
                const batch = batchDoc.data();
                const students = batch.students || [];
                students.forEach((student: any) => {
                    rows.push([
                        escape(batch.name || batchDoc.id),
                        escape(student.id || ""),
                        escape(student.rollNumber || student.rollNo || ""),
                        escape(student.name || ""),
                        escape(student.phone || ""),
                        escape(student.monthlyFee || batch.defaultFee || "N/A")
                    ].join(","));
                });
            });

            triggerDownload(`Students_${institutionCode}_Directory.csv`, rows.join("\r\n"));
            toast.success("Students directory exported successfully!");
        } catch (err) {
            console.error("Students export error:", err);
            toast.error("Failed to export students.");
        } finally {
            setExportingType(null);
        }
    };

    // 4. Full JSON Backup
    const exportFullBackup = async () => {
        setExportingType("backup");
        try {
            const snap = await getDocs(collection(firestore, `institutions/${institutionCode}/batches`));
            const batchesData: any[] = [];
            snap.forEach((d) => {
                batchesData.push({ id: d.id, ...d.data() });
            });

            const backup = {
                institutionCode,
                schoolName,
                exportedAt: new Date().toISOString(),
                batches: batchesData,
            };

            triggerDownload(
                `EduSmart_${institutionCode}_Backup.json`,
                JSON.stringify(backup, null, 2),
                "application/json;charset=utf-8;"
            );
            toast.success("Full institute database backup generated!");
        } catch (err) {
            console.error("Full backup error:", err);
            toast.error("Failed to create full backup.");
        } finally {
            setExportingType(null);
        }
    };

    // Parse CSV file for student import
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
            if (lines.length < 2) {
                toast.error("CSV must contain a header row and at least one student row.");
                return;
            }

            const headerLine = lines[0].toLowerCase();
            const headers = headerLine.split(",").map((h) => h.replace(/["\s]/g, ""));

            const nameIdx = headers.findIndex((h) => h.includes("name"));
            const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("contact"));
            const rollIdx = headers.findIndex((h) => h.includes("roll") || h.includes("id"));

            if (nameIdx === -1) {
                toast.error("CSV must contain a 'Name' column header.");
                return;
            }

            const parsed: any[] = [];
            for (let i = 1; i < lines.length; i++) {
                // Basic CSV line parser handling quotes
                const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
                const matches: string[] = [];
                let m;
                while ((m = regex.exec(lines[i])) !== null) {
                    if (m.index === regex.lastIndex) regex.lastIndex++;
                    matches.push(m[1] ? m[1].replace(/^"|"$/g, "").replace(/""/g, '"').trim() : "");
                }

                const name = matches[nameIdx]?.trim();
                if (!name) continue;

                parsed.push({
                    name,
                    phone: phoneIdx !== -1 && matches[phoneIdx] ? matches[phoneIdx].trim() : "",
                    rollNumber: rollIdx !== -1 && matches[rollIdx] ? matches[rollIdx].trim() : "",
                });
            }

            setParsedStudents(parsed);
            if (parsed.length > 0) {
                toast.success(`Parsed ${parsed.length} students from CSV.`);
            } else {
                toast.error("No valid student rows found in CSV.");
            }
        };

        reader.readAsText(file);
    };

    // Download sample CSV template
    const downloadTemplate = () => {
        const sample = "Name,Phone,RollNumber\nRahul Sharma,9876543210,101\nPriya Verma,9876543211,102\nAmit Patel,9876543212,103";
        triggerDownload("Sample_Students_Import_Template.csv", sample);
    };

    // Execute student import
    const handleImportSubmit = async () => {
        if (!selectedBatchId) {
            toast.error("Please select a target batch first.");
            return;
        }
        if (parsedStudents.length === 0) {
            toast.error("Please choose a CSV file with valid student rows.");
            return;
        }

        setImporting(true);
        try {
            const targetBatch = batches.find((b) => b.id === selectedBatchId);
            const currentStudents: any[] = targetBatch?.students || [];

            const newStudents = parsedStudents.map((s, idx) => ({
                id: `student_${Date.now()}_${idx}`,
                name: s.name,
                phone: s.phone || "",
                rollNumber: s.rollNumber || "",
                attendance: {},
                fees: {},
                createdAt: new Date().toISOString(),
            }));

            const merged = [...currentStudents, ...newStudents];

            await updateDoc(
                doc(firestore, `institutions/${institutionCode}/batches`, selectedBatchId),
                {
                    students: merged,
                }
            );

            toast.success(`Successfully imported ${newStudents.length} students into ${targetBatch?.name || "batch"}!`);
            setCsvFile(null);
            setParsedStudents([]);
            onClose();
        } catch (err) {
            console.error("Failed to import students:", err);
            toast.error("Failed to save imported students.");
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    transition={{ duration: 0.18 }}
                    className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* MODAL HEADER */}
                    <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                <School size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    My Institute Data
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">
                                    {schoolName} • ID: {institutionCode}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="px-6 pt-4 shrink-0 flex gap-2">
                        <button
                            onClick={() => setTab("export")}
                            className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                                tab === "export"
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10"
                            }`}
                        >
                            <Download size={16} /> Export Data
                        </button>

                        <button
                            onClick={() => setTab("import")}
                            className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                                tab === "import"
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/10"
                            }`}
                        >
                            <Upload size={16} /> Import Data
                        </button>
                    </div>

                    {/* CONTENT BODY */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        {tab === "export" ? (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                                    Export your institute reports into CSV or JSON with zero vendor lock-in.
                                </p>

                                {/* ATTENDANCE EXPORT */}
                                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">Attendance Records</p>
                                            <p className="text-xs text-slate-400 truncate">All batch dates, presence & absence history (CSV)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={exportAttendance}
                                        disabled={exportingType === "attendance"}
                                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm"
                                    >
                                        <Download size={14} />
                                        {exportingType === "attendance" ? "Exporting..." : "Download"}
                                    </button>
                                </div>

                                {/* FEES EXPORT */}
                                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                            <IndianRupee size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">Fee Ledgers & Dues</p>
                                            <p className="text-xs text-slate-400 truncate">12-month student fee statuses & paid counts (CSV)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={exportFees}
                                        disabled={exportingType === "fees"}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm"
                                    >
                                        <Download size={14} />
                                        {exportingType === "fees" ? "Exporting..." : "Download"}
                                    </button>
                                </div>

                                {/* STUDENTS DIRECTORY */}
                                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">Students Directory</p>
                                            <p className="text-xs text-slate-400 truncate">Student names, phones, roll numbers & batches (CSV)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={exportStudents}
                                        disabled={exportingType === "students"}
                                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm"
                                    >
                                        <Download size={14} />
                                        {exportingType === "students" ? "Exporting..." : "Download"}
                                    </button>
                                </div>

                                {/* FULL BACKUP */}
                                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                                            <Database size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">Complete Institute Backup</p>
                                            <p className="text-xs text-slate-400 truncate">Full institutional snapshot with all records (JSON)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={exportFullBackup}
                                        disabled={exportingType === "backup"}
                                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm"
                                    >
                                        <Download size={14} />
                                        {exportingType === "backup" ? "Exporting..." : "Backup"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                            Target Batch
                                        </label>
                                        <button
                                            onClick={downloadTemplate}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <FileDown size={14} /> Download Sample CSV
                                        </button>
                                    </div>

                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        disabled={loadingBatches || batches.length === 0}
                                        className="w-full p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-sm font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        {batches.length === 0 ? (
                                            <option value="">No batches available</option>
                                        ) : (
                                            batches.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name} ({b.students?.length || 0} students)
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* FILE UPLOADER */}
                                <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-6 text-center hover:border-blue-500 transition-colors">
                                    <FileSpreadsheet size={36} className="mx-auto text-blue-500 mb-2 opacity-80" />
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        {csvFile ? csvFile.name : "Select or Drop Student CSV"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Headers: <span className="font-mono font-bold">Name, Phone, RollNumber</span>
                                    </p>

                                    <label className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-sm">
                                        Browse CSV File
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>

                                {/* PARSED PREVIEW */}
                                {parsedStudents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                Ready to import: {parsedStudents.length} students
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setParsedStudents([]);
                                                    setCsvFile(null);
                                                }}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <div className="max-h-36 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-2 space-y-1">
                                            {parsedStudents.slice(0, 10).map((st, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs px-2 py-1 bg-white dark:bg-white/5 rounded-lg">
                                                    <span className="font-bold text-slate-800 dark:text-white truncate">{st.name}</span>
                                                    <span className="text-slate-400 font-mono">{st.phone || "No phone"}</span>
                                                </div>
                                            ))}
                                            {parsedStudents.length > 10 && (
                                                <p className="text-[11px] text-center text-slate-400 py-1 font-semibold">
                                                    + {parsedStudents.length - 10} more students
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleImportSubmit}
                                            disabled={importing}
                                            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                                        >
                                            {importing ? "Importing..." : `Import ${parsedStudents.length} Students Now`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
