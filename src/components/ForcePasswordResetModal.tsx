"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, KeyRound, Check, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

interface ForcePasswordResetModalProps {
  isOpen: boolean;
}

export default function ForcePasswordResetModal({ isOpen }: ForcePasswordResetModalProps) {
  const { user, clearForcePasswordReset } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Please enter your current temporary password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          institutionCode: user.institutionCode,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update password.");
      }

      toast.success("Password updated successfully! Welcome to your dashboard.");
      clearForcePasswordReset();
    } catch (err: any) {
      toast.error(err.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 dark:text-white my-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto relative"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
          <ShieldAlert size={26} className="sm:w-7 sm:h-7" />
        </div>

        <div className="text-center mb-5 sm:mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block mb-2">
            First-Time Security Setup
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Create Your Permanent Password</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            For institutional data security, you must replace your temporary onboarding password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Temporary Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Current Temporary Password
            </label>
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Enter temporary password from email"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 sm:px-4 py-3 text-base sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition min-h-[44px]"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                New Password (min 8 chars)
              </label>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold p-1 min-h-[36px] flex items-center"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Enter new strong password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 sm:px-4 py-3 text-base sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition min-h-[44px]"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 sm:px-4 py-3 text-base sm:text-sm font-medium focus:outline-none focus:border-blue-500 transition min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 min-h-[48px]"
          >
            {loading ? "Updating Credentials..." : "Save Password & Continue"} <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
