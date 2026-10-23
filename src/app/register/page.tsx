"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  School,
  MapPin,
  Tag,
  FileText,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

// Helper to generate a strong random temporary password
function generateStrongPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let pass = "EduSmart#";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  }),
};

export default function RegisterWizard() {
  const router = useRouter();

  // Wizard Step (1: Admin, 2: Institution, 3: Credentials, 4: Finish)
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- Step 1: Admin Profile ---
  const [adminName, setAdminName] = useState("");
  const [adminAge, setAdminAge] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [emailError, setEmailError] = useState("");

  // --- Step 2: Institution Setup ---
  const [instName, setInstName] = useState("");
  const [instType, setInstType] = useState<"Coaching" | "School">("Coaching");
  const [instAddress, setInstAddress] = useState("");
  const [instCategory, setInstCategory] = useState("IIT-JEE / NEET / Foundation");
  const [instDescription, setInstDescription] = useState("");
  const [branches, setBranches] = useState<string[]>(["Main Branch"]);

  // --- Step 3: Account Credentials & Terms ---
  const [username, setUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // --- Finish / Result State ---
  const [registeredData, setRegisteredData] = useState<{
    institutionCode: string;
    username: string;
    tempPassword: string;
    email: string;
    trialEndDate: string;
  } | null>(null);

  // Initialize random strong temporary password on mount
  useEffect(() => {
    setTempPassword(generateStrongPassword());
  }, []);

  // Auto-suggest username when adminName or instName changes if username is empty
  useEffect(() => {
    if (!username && (instName || adminName)) {
      const base = (instName || adminName)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 10);
      if (base) {
        setUsername(`${base}${Math.floor(100 + Math.random() * 900)}`);
      }
    }
  }, [instName, adminName, username]);

  // Live email validation on blur or debounce
  const checkEmailValidity = async (emailToCheck: string) => {
    const trimmed = emailToCheck.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailStatus("invalid");
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailStatus("checking");
    setEmailError("");

    try {
      const res = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();
      if (data.valid) {
        setEmailStatus("valid");
        setEmailError("");
      } else {
        setEmailStatus("invalid");
        setEmailError(data.error || "This email is disposable or already registered.");
      }
    } catch {
      setEmailStatus("idle");
    }
  };

  // Branch handlers
  const handleAddBranch = () => setBranches([...branches, ""]);
  const handleUpdateBranch = (idx: number, val: string) => {
    const next = [...branches];
    next[idx] = val;
    setBranches(next);
  };
  const handleRemoveBranch = (idx: number) => {
    if (branches.length > 1) {
      setBranches(branches.filter((_, i) => i !== idx));
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!adminName.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }
    if (!adminPhone.trim() || adminPhone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!adminEmail.trim()) {
      toast.error("Work email address is required.");
      return false;
    }
    if (emailStatus === "invalid") {
      toast.error(emailError || "Please provide a valid, non-disposable work email.");
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!instName.trim()) {
      toast.error("Please enter your institution name.");
      return false;
    }
    if (!instAddress.trim()) {
      toast.error("Please enter your city or campus location.");
      return false;
    }
    return true;
  };

  // Step 3 & Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || username.trim().length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }
    if (!tempPassword.trim() || tempPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: instName.trim(),
          owner: adminName.trim(),
          fullName: adminName.trim(),
          phone: adminPhone.trim(),
          email: adminEmail.trim().toLowerCase(),
          age: adminAge ? parseInt(adminAge, 10) : undefined,
          institutionType: instType,
          address: instAddress.trim(),
          category: instCategory.trim(),
          description: instDescription.trim(),
          username: username.trim(),
          password: tempPassword.trim(),
          branches: branches.filter((b) => b.trim() !== ""),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      setRegisteredData({
        institutionCode: data.institutionCode,
        username: data.username,
        tempPassword: data.tempPassword,
        email: adminEmail.trim(),
        trialEndDate: data.trialEndDate,
      });

      setDirection(1);
      setStep(4);
      toast.success("7-Day Free Trial activated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Registration error. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const copyCredentials = () => {
    if (!registeredData) return;
    const text = `EduSmart Pro Login Credentials:\nInstitute Code: ${registeredData.institutionCode}\nUsername: ${registeredData.username}\nTemporary Password: ${registeredData.tempPassword}\nLogin: ${window.location.origin}/login?code=${registeredData.institutionCode}`;
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopiedPass(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B0F19] to-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* --- TOP BRAND BAR --- */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 sm:py-3 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-base sm:text-lg shrink-0">
            E
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              EduSmart Pro <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">ERP Setup</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400">7-Day Free Trial Onboarding</div>
          </div>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="text-xs text-slate-400 hover:text-white transition font-medium flex items-center gap-1 min-h-[44px] px-2"
        >
          <span className="hidden sm:inline">Already registered?</span> <span className="text-blue-400 font-bold underline">Sign In</span>
        </button>
      </div>

      {/* --- WIZARD WINDOW SHELL (Windows Setup Wizard Styled) --- */}
      <div className="max-w-3xl mx-auto w-full my-3 sm:my-6 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 sm:flex-initial">
        {/* Wizard Header Progress Indicator */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-400 min-w-0">
              <Sparkles size={14} className="shrink-0" />
              <span className="shrink-0">Step {Math.min(step, 3)} of 3</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 truncate hidden sm:inline">
                {step === 1 && "Administrator Profile"}
                {step === 2 && "Institute Setup & Campuses"}
                {step === 3 && "Credentials & Terms"}
                {step === 4 && "Setup Complete"}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
              {step === 1 ? "33%" : step === 2 ? "66%" : "100%"}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full"
              initial={{ width: "33%" }}
              animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Wizard Content Canvas */}
        <div className="p-4 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between overflow-y-auto">
          <AnimatePresence custom={direction} mode="wait">
            {/* STEP 1: ADMIN PROFILE */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Tell us about yourself</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Enter your primary director or administrator details. We will send credentials to this verified email.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-blue-400 shrink-0" /> Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                    />
                  </div>

                  {/* Work Email */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={14} className="text-blue-400 shrink-0" /> Official Work Email <span className="text-red-400">*</span>
                      </label>
                      {emailStatus === "checking" && (
                        <span className="text-[11px] text-blue-400 flex items-center gap-1">
                          <RefreshCw size={11} className="animate-spin" /> Checking eligibility...
                        </span>
                      )}
                      {emailStatus === "valid" && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 size={12} /> Eligible Work Email
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. director@toppersacademy.com"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          setEmailStatus("idle");
                          setEmailError("");
                        }}
                        onBlur={() => checkEmailValidity(adminEmail)}
                        className={`w-full bg-slate-950/80 border rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition text-base sm:text-sm font-medium min-h-[44px] ${
                          emailStatus === "valid"
                            ? "border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            : emailStatus === "invalid"
                            ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                            : "border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium">
                        <AlertCircle size={12} className="shrink-0" /> <span>{emailError}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Zero spam. Disposable emails (mailinator, 10minutemail, etc.) are blocked.
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={14} className="text-blue-400 shrink-0" /> WhatsApp Mobile <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                    />
                  </div>

                  {/* Age (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Age <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 34"
                      value={adminAge}
                      onChange={(e) => setAdminAge(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: INSTITUTION SETUP */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Configure your Institute</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Set up your campus details. You can add branches or departments right away.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Institution Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={14} className="text-blue-400 shrink-0" /> Institute / School Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex IIT-JEE Academy"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                    />
                  </div>

                  {/* Institution Type Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setInstType("Coaching")}
                      className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition min-h-[48px] sm:min-h-[44px] ${
                        instType === "Coaching"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <GraduationCap size={18} className="shrink-0" /> Coaching / Tuition Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstType("School")}
                      className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition min-h-[48px] sm:min-h-[44px] ${
                        instType === "School"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <School size={18} className="shrink-0" /> School / K-12 Academy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Location / City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-400 shrink-0" /> City / Campus Location <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gomti Nagar, Lucknow"
                        value={instAddress}
                        onChange={(e) => setInstAddress(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={14} className="text-blue-400 shrink-0" /> Focus Category
                      </label>
                      <select
                        value={instCategory}
                        onChange={(e) => setInstCategory(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-medium min-h-[44px]"
                      >
                        <option value="IIT-JEE / NEET / Foundation">IIT-JEE / NEET / Foundation</option>
                        <option value="CBSE / ICSE Board Tuition">CBSE / ICSE Board Tuition</option>
                        <option value="Competitive Exam Coaching">Competitive Exam Coaching</option>
                        <option value="Commerce & CA Foundation">Commerce & CA Foundation</option>
                        <option value="K-12 School">K-12 School</option>
                        <option value="Languages & Skill Center">Languages & Skill Center</option>
                      </select>
                    </div>
                  </div>

                  {/* Branches Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Campuses & Branches
                      </label>
                      <button
                        type="button"
                        onClick={handleAddBranch}
                        className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 min-h-[36px] px-2 py-1"
                      >
                        <Plus size={14} /> Add Branch
                      </button>
                    </div>
                    <div className="space-y-2">
                      {branches.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => handleUpdateBranch(idx, e.target.value)}
                            placeholder={`Branch ${idx + 1}`}
                            className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-base sm:text-xs font-medium focus:border-blue-500 outline-none min-h-[42px]"
                          />
                          {branches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBranch(idx)}
                              className="text-slate-500 hover:text-rose-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition"
                              aria-label={`Remove branch ${idx + 1}`}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CREDENTIALS & TERMS */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Set Account Credentials</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Review your login username and secure auto-generated temporary password.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Desired Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-blue-400 shrink-0" /> Desired Admin Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. apexadmin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 sm:px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-base sm:text-sm font-mono font-bold min-h-[44px]"
                    />
                  </div>

                  {/* RESERVED USERNAME DISCLAIMER CALLOUT */}
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex gap-2.5 sm:gap-3 text-amber-200/90 text-xs leading-relaxed">
                    <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-bold block mb-0.5">Username Reservation Policy:</strong>
                      This username is reserved for your institute while on an active plan and will be released if unpaid for 15+ consecutive days.
                    </div>
                  </div>

                  {/* Auto-generated Temporary Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound size={14} className="text-blue-400 shrink-0" /> Auto-Generated Strong Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setTempPassword(generateStrongPassword())}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 min-h-[36px] px-2"
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-3.5 sm:pl-4 pr-24 py-3 text-blue-400 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-base sm:text-sm font-bold tracking-wider min-h-[44px]"
                      />
                      <div className="absolute right-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-lg"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tempPassword);
                            toast.success("Password copied!");
                          }}
                          className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-white transition rounded-lg"
                          title="Copy password"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      🔒 For safety, a password reset will be required upon your very first login.
                    </p>
                  </div>

                  {/* TRIAL ACTIVATION SUMMARY BANNER */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-xs space-y-1 text-slate-300">
                    <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                      <ShieldCheck size={14} className="text-emerald-400 shrink-0" /> Zero Upfront Payment Required
                    </div>
                    <p>• 7-Day trial period commences immediately upon activation.</p>
                    <p>• Full administrative access with instant WhatsApp notices and student PWA.</p>
                    <p>• No automatic credit card charges; upgrade anytime via UPI or Net Banking.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINISH / SUCCESS SCREEN */}
            {step === 4 && registeredData && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5 sm:space-y-6 text-center py-2 sm:py-4"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={32} className="sm:w-9 sm:h-9" />
                </div>

                <div>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full inline-block mb-2 sm:mb-3">
                    7-Day Free Trial Active
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Institute is Online!</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                    We have dispatched your starter pack and credentials to{" "}
                    <strong className="text-slate-200 break-all">{registeredData.email}</strong>.
                  </p>
                </div>

                {/* CREDENTIALS CARD */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-left max-w-md mx-auto space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Login Details</span>
                    <button
                      onClick={copyCredentials}
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg"
                    >
                      {copiedPass ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copiedPass ? "Copied" : "Copy All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 block">Institute Code:</span>
                      <strong className="text-white font-mono text-sm">{registeredData.institutionCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Username:</span>
                      <strong className="text-white font-mono text-sm">{registeredData.username}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Temporary Password:</span>
                      <strong className="text-blue-400 font-mono text-sm bg-blue-950/40 px-2 py-1 rounded border border-blue-500/20 inline-block mt-0.5 break-all">
                        {registeredData.tempPassword}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 max-w-md mx-auto">
                  <button
                    onClick={() => router.push(`/login?code=${registeredData.institutionCode}`)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 min-h-[48px] text-sm sm:text-base active:scale-[0.98]"
                  >
                    Launch Dashboard Portal <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WIZARD BOTTOM ACTIONS (Steps 1 to 3) */}
          {step <= 3 && (
            <div className="pt-6 sm:pt-8 border-t border-slate-800/80 flex items-center justify-between mt-6 gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs sm:text-sm font-bold transition flex items-center gap-2 min-h-[44px] active:scale-[0.98]"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 sm:px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20 min-h-[44px] active:scale-[0.98]"
                >
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-5 sm:px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xl shadow-blue-600/30 disabled:opacity-50 min-h-[44px] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin shrink-0" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate 7-Day Free Trial</span>
                      <ArrowRight size={16} className="shrink-0" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER TRUST BADGES --- */}
      <div className="max-w-3xl mx-auto w-full text-center text-[11px] sm:text-xs text-slate-500 space-y-1 py-2 px-2">
        <p>🔒 256-bit encrypted • 100% data ownership • Zero lock-in • Dedicated WhatsApp support: +91 7388739691</p>
        <p>© 2026 EduSmart Pro ERP. Lucknow, India.</p>
      </div>
    </div>
  );
}
