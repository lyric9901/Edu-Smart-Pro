"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { DBInstitution } from "@/lib/supabaseDb";

interface TrialBannerProps {
  institution: DBInstitution | null;
}

export default function TrialBanner({ institution }: TrialBannerProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!institution || institution.plan !== "trial") {
    // If not on trial (e.g. paid premium/basic), don't show trial warnings
    return null;
  }

  const now = Date.now();
  const trialEnd = institution.trialEndDate ? new Date(institution.trialEndDate).getTime() : now + 7 * 86400000;
  const msRemaining = trialEnd - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isExpired = institution.planStatus === "expired" || msRemaining <= 0;

  const upiId = "7388739691@ptsbi";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Shah, I am renewing the subscription for my institute: ${institution.name} (Code: ${institution.id}). I have completed the UPI payment to ${upiId}.`
  );

  return (
    <>
      {/* 1. NON-INTRUSIVE TOP BANNER (Shown when trial <= 3 days and not expired) */}
      {!isExpired && daysRemaining <= 3 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-slate-950 px-3.5 sm:px-6 py-2.5 shadow-md relative z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="bg-black/25 text-black px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
                ⏳ {daysRemaining === 0 ? "Expires Today" : `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left`}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-950 leading-snug line-clamp-2 sm:line-clamp-1">
                Enjoying EduSmart Pro? Upgrade to ensure uninterrupted coaching operations for your students.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full sm:w-auto bg-slate-950 hover:bg-black active:scale-[0.98] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm min-h-[38px] sm:min-h-[36px]"
              >
                Upgrade Now <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HARD-LOCK PAYWALL MODAL (Shown when trial has expired) */}
      {isExpired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl text-slate-900 dark:text-white my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
              <Lock size={26} className="sm:w-7 sm:h-7" />
            </div>

            <div className="text-center mb-5 sm:mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-block mb-2">
                Trial Ended
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Your 7-Day Trial Has Expired</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                All attendance, batch schedules, and student records for <strong className="text-slate-800 dark:text-slate-200">{institution.name}</strong> ({institution.id}) are safely preserved.
              </p>
            </div>

            {/* UPI PAYMENT CARD */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Instant UPI Activation
              </span>
              <div className="flex items-center justify-center gap-2 mt-2 mb-3 flex-wrap">
                <code className="text-sm sm:text-base font-black font-mono text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm break-all">
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow min-h-[42px] min-w-[42px] flex items-center justify-center active:scale-[0.98]"
                  title="Copy UPI ID"
                  aria-label="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="font-bold text-slate-800 dark:text-white">Basic Plan</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">₹299/mo</div>
                  <div className="text-[10px] text-slate-400">Up to 40 students</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <div className="font-bold text-slate-800 dark:text-white">Growth Plan</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">₹499/mo</div>
                  <div className="text-[10px] text-slate-400">Up to 150 students + WhatsApp</div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/917388739691?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 min-h-[48px] active:scale-[0.98]"
              >
                <span className="sm:hidden">Send Screenshot on WhatsApp</span>
                <span className="hidden sm:inline">Send Payment Screenshot on WhatsApp (+91 7388739691)</span>
                <ArrowRight size={15} className="shrink-0" />
              </a>

              <Link
                href="/pricing"
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center min-h-[44px]"
              >
                View Detailed Plan Features
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3.5 sm:mt-4">
              ⚡ Instant reactivation within 5 minutes of verification.
            </p>
          </motion.div>
        </div>
      )}

      {/* 3. OPTIONAL UPGRADE MODAL (TRIGGERED BY BANNER CTA) */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl relative my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-bold rounded-lg"
                aria-label="Close modal"
              >
                ✕ Close
              </button>

              <div className="flex items-center gap-2.5 mb-4 pr-10">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Upgrade EduSmart Pro</h3>
                  <p className="text-xs text-slate-500">Uninterrupted school & coaching management</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 gap-2">
                  <span>Institute:</span>
                  <strong className="text-slate-900 dark:text-white truncate text-right">{institution.name}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Institute Code:</span>
                  <strong className="font-mono text-blue-600 dark:text-blue-400">{institution.id}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>UPI ID:</span>
                  <strong className="font-mono">{upiId}</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px] active:scale-[0.98]"
                >
                  {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                  {copiedUpi ? "UPI Copied" : "Copy UPI ID"}
                </button>

                <a
                  href={`https://wa.me/917388739691?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px] active:scale-[0.98]"
                >
                  Pay via WhatsApp →
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
