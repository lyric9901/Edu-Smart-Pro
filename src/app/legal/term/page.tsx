"use client";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        <Link href="/register" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><FileText size={28}/></div>
            <h1 className="text-3xl font-black">Terms of Service</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

        <div className="space-y-6 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">1. Acceptance of Terms</h2>
                <p className="text-slate-600">By registering for EduSmart, you agree to these terms. You must be an authorized owner or administrator of a coaching institute to create an account.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">2. Usage Policy</h2>
                <p className="text-slate-600">You agree not to misuse the platform for sending spam, offensive content, or unauthorized advertising to students/parents via our notification system.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">3. Account Responsibility</h2>
                <p className="text-slate-600">You are responsible for maintaining the confidentiality of your admin login credentials. EduSmart is not liable for data loss due to shared passwords.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">4. Termination</h2>
                <p className="text-slate-600">We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity.</p>
            </section>
        </div>
      </div>
    </div>
  );
}