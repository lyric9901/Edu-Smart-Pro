"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Building2, User, Phone, Lock, CheckCircle2, Copy, 
  TrendingUp, ShieldCheck, Clock, IndianRupee, Star, ChevronRight, FileText, LockKeyhole
} from "lucide-react";

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", owner: "", phone: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const schoolId = Date.now().toString(); // Simple Unique ID
    const updates = {};
    
    // Create Admin
    updates[`admins/${form.username}`] = { 
        password: form.password, 
        schoolId: schoolId,
        role: "admin"
    };
    
    // Create School Profile
    updates[`schools/${schoolId}/info`] = {
        name: form.name,
        owner: form.owner,
        phone: form.phone,
        plan: "premium", 
        createdAt: Date.now()
    };

    try {
        await update(ref(db), updates);
        
        // --- FIXED LINK GENERATION ---
        // Old (Wrong): .../login?schoolId=...
        // New (Correct): .../?schoolId=... (Points to Root Page)
        const link = `${window.location.origin}/?schoolId=${schoolId}`;
        setMagicLink(link);
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(magicLink);
    alert("Magic Link Copied! Send this to your students.");
  };

  // --- SUCCESS VIEW ---
  if (magicLink) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-green-100"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600 w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Registration Successful!</h1>
                <p className="text-gray-500 mb-8 font-medium">Congratulations! Your coaching is now online.</p>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg">ADMIN ACCESS</div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Magic Link</label>
                    <div className="flex gap-3 items-center mt-2">
                        <code className="flex-1 bg-white p-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">
                            {magicLink}
                        </code>
                        <button onClick={copyLink} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            <Copy size={18}/>
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-green-600"/> Save this link safely. It's your key.
                    </p>
                </div>

                <button onClick={() => router.push(magicLink.replace(window.location.origin, ""))} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition shadow-xl">
                    Go to Login Portal
                </button>
            </motion.div>
        </div>
    );
  }

  // --- REGISTRATION VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 lg:flex overflow-hidden">
      
      {/* LEFT SIDE: SALES PITCH */}
      <motion.div 
        initial="hidden" animate="visible" variants={stagger}
        className="lg:w-1/2 p-8 lg:p-16 bg-blue-600 text-white flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/30 rounded-full blur-3xl -ml-10 -mb-10"></div>

        <motion.div variants={fadeInUp} className="relative z-10">
            <span className="bg-yellow-400 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block shadow-lg">
                Lucknow's #1 Coaching App
            </span>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
                Ab Coaching Chalegi <br/> <span className="text-yellow-300">Digital.</span>
            </h1>
            <p className="text-blue-100 text-lg mb-10 max-w-md leading-relaxed">
                Attendance register aur fees ki notebook ko bolo bye-bye. Manage everything from your phone. **Bas 2 min mein setup.**
            </p>

            <div className="grid gap-6 mb-12">
                {[
                    { icon: <Clock size={24}/>, title: "Save 10+ Hours/Week", desc: "Auto-attendance & instant reports." },
                    { icon: <IndianRupee size={24}/>, title: "100% Fees Recovery", desc: "Auto-reminders on WhatsApp." },
                    { icon: <TrendingUp size={24}/>, title: "Grow Your Brand", desc: "Professional app for students & parents." }
                ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-blue-200 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 relative">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                    70% OFF TILL FEB 31
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Lifetime Premium Access</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-black text-white">₹199</span>
                            <span className="text-lg text-blue-300 line-through decoration-red-400 decoration-2">₹599</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex text-yellow-400 mb-1">
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor"/>)}
                        </div>
                        <p className="text-xs text-blue-200">20+ Happy Tutors in UP - 2025</p>
                    </div>
                </div>
            </div>
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE: FORM */}
      <div className="lg:w-1/2 p-4 lg:p-12 flex flex-col items-center justify-center bg-white h-full overflow-y-auto">
        <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="w-full max-w-md space-y-8 my-auto"
        >
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900">Get Started</h2>
                <p className="text-slate-500 mt-2">Join the digital revolution. Create your account.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
                
                {/* Coaching Details */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Institute Details</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500 transition-all">
                        <div className="p-3 text-slate-400"><Building2 size={20}/></div>
                        <input required placeholder="Coaching Name (e.g. Toppers Academy)" className="bg-transparent w-full outline-none text-slate-800 font-medium placeholder:font-normal" onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500 transition-all w-1/2">
                            <div className="p-3 text-slate-400"><User size={20}/></div>
                            <input required placeholder="Owner Name" className="bg-transparent w-full outline-none text-slate-800 font-medium" onChange={e => setForm({...form, owner: e.target.value})} />
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500 transition-all w-1/2">
                            <div className="p-3 text-slate-400"><Phone size={20}/></div>
                            <input required placeholder="Mobile" type="tel" className="bg-transparent w-full outline-none text-slate-800 font-medium" onChange={e => setForm({...form, phone: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Login Credentials */}
                <div className="space-y-4 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Create Login</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500 transition-all">
                        <div className="p-3 text-blue-500"><User size={20}/></div>
                        <input required placeholder="Choose Username (e.g. shani123)" className="bg-transparent w-full outline-none text-slate-800 font-bold placeholder:font-normal placeholder:text-blue-300" onChange={e => setForm({...form, username: e.target.value})} />
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500 transition-all">
                        <div className="p-3 text-blue-500"><Lock size={20}/></div>
                        <input required type="password" placeholder="Set Password" className="bg-transparent w-full outline-none text-slate-800 font-bold placeholder:font-normal placeholder:text-blue-300" onChange={e => setForm({...form, password: e.target.value})} />
                    </div>
                </div>

                <div className="pt-4">
                    <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2">
                        {loading ? (
                            <span className="animate-pulse">Creating Account...</span>
                        ) : (
                            <>Claim Offer & Register <ChevronRight size={20} strokeWidth={3}/></>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By registering, you agree to our Terms & "Paisa Vasool" Policy.
                    </p>
                </div>
            </form>

 {/* --- UPDATED FOOTER SECTION --- */}
<footer className="mt-10 border-t border-slate-100 pt-6">
    <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-400 mb-4">
        {/* Use Link component for faster navigation */}
        <a href="/legal/privacy" className="flex items-center gap-1 hover:text-slate-600 transition">
            <ShieldCheck size={14}/> Privacy Policy
        </a>
        <span>•</span>
        <a href="/legal/refund" className="flex items-center gap-1 hover:text-slate-600 transition">
            <IndianRupee size={14}/> Refund Policy
        </a>
        <span>•</span>
        <a href="/legal/terms" className="flex items-center gap-1 hover:text-slate-600 transition">
            <FileText size={14}/> Terms of Service
        </a>
    </div>
    <div className="text-center">
        <p className="text-[10px] text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1">
            <LockKeyhole size={10}/> 100% Secure & Encrypted
        </p>
        <p className="text-[10px] text-slate-300 mt-1">© 2026 EduSmart India.</p>
    </div>
</footer>

        </motion.div>
      </div>

    </div>
  );
}
