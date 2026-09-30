import type { Metadata } from "next";
import { ArrowLeft, Mail, Phone, MapPin, Clock, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact EduSmart Pro and merchant operator SHAHNAWAZ ALI for inquiries, technical support, and billing assistance.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] p-6 md:p-12 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-8 hover:underline text-sm transition"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Contact Us</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Official merchant & support directory for EduSmart Pro ERP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold w-fit mb-6">
          <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
          <span>Verified Merchant Operations • Active Support</span>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-8 text-sm leading-relaxed">
          Need help with your account, billing, onboarding, or technical queries? Contact our official operating administration directly using the verified contact channels below.
        </p>

        {/* Contact Information Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Legal Operating Entity */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <UserCheck size={22} />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Legal Entity / Merchant Name</h2>
              <p className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                SHAHNAWAZ ALI
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Authorized Platform Proprietor
              </p>
            </div>
          </div>

          {/* Email Support */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Mail size={22} />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Official Email</h2>
              <a
                href="mailto:shahnawaz.23120@gmail.com"
                className="block font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline mt-0.5 truncate"
              >
                shahnawaz.23120@gmail.com
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                24-48 hours response time
              </p>
            </div>
          </div>

          {/* Phone Helpline */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-xl shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Phone / WhatsApp Support</h2>
              <a
                href="tel:7388739691"
                className="block font-bold text-base text-green-700 dark:text-green-400 hover:underline mt-0.5 font-mono"
              >
                +91 7388739691
              </a>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct helpline: 7388739691
              </p>
            </div>
          </div>

          {/* Operational Hours */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Working Hours</h2>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Mon – Sat: 9:00 AM – 7:00 PM IST
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sunday: Emergency Email Support
              </p>
            </div>
          </div>
        </div>

        {/* Physical Address Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <MapPin size={22} />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Physical Operating Address</h2>
            <address className="not-italic text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1">
              <strong>EduSmart Pro Technologies</strong> (Operated by SHAHNAWAZ ALI)<br />
              Gorakhpur, Uttar Pradesh - 273001, India
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
