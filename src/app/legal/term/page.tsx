import type { Metadata } from "next";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms & Conditions agreement for EduSmart Pro ERP platform operated by SHAHNAWAZ ALI.",
};

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] p-6 md:p-12 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-8 hover:underline text-sm transition">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0"><FileText size={28}/></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Terms & Conditions</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">EduSmart Pro • Operated by SHAHNAWAZ ALI</p>
            </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Last Updated: February 2026</p>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          This Terms & Conditions agreement governs your access to and use of the <strong>EduSmart Pro</strong> software platform, which is owned and operated by the legal entity <strong>SHAHNAWAZ ALI</strong> (&ldquo;Merchant&rdquo;, &ldquo;Service Provider&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        </p>

        <div className="space-y-6 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">1. Acceptance of Terms & Conditions</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">By accessing, registering for, or using EduSmart Pro (operated by <strong>SHAHNAWAZ ALI</strong>), you agree to be legally bound by these Terms & Conditions. You must be an authorized owner, administrator, or educator of a coaching institute, tuition center, or school to create an account and access institutional features.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">2. Usage Policy</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">You agree not to misuse the platform for sending spam, abusive content, or unauthorized bulk messages to students and parents via our communication tools. Compliance with applicable Indian laws, IT regulations, and data privacy norms is mandatory.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">3. Account Responsibility</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">You are responsible for maintaining the confidentiality of your admin login credentials. EduSmart Pro and <strong>SHAHNAWAZ ALI</strong> are not liable for data loss or unauthorized access resulting from shared, weak, or compromised passwords.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">4. Termination & Suspension</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">We reserve the right to suspend or terminate accounts that violate these Terms & Conditions or engage in unlawful, fraudulent, or harmful activity.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">5. Student Tuition & Offline Fee Disclaimers</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">EduSmart Pro operates solely as a digital record-keeping and communication management platform for coaching centers and schools. EduSmart Pro and <strong>SHAHNAWAZ ALI</strong> do not collect, hold, or process student tuition fees directly. Any fee disputes, cancellations, or refund requests concerning tuition, classes, or institute charges remain strictly between the student/guardian and the institute management offline.</p>
            </section>
        </div>
      </div>
    </div>
  );
}