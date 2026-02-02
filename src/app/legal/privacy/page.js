"use client";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        {/* Header */}
        <Link href="/register" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><ShieldCheck size={28}/></div>
            <h1 className="text-3xl font-black">Privacy Policy</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

        {/* Content */}
        <div className="space-y-6 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">1. Information We Collect</h2>
                <p className="text-slate-600">We collect information you provide directly to us, such as your name, phone number, coaching institute name, and student data entered into the EduSmart platform.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">2. How We Use Your Data</h2>
                <p className="text-slate-600">Your data is used strictly to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                    <li>Provide coaching management services.</li>
                    <li>Send automated attendance and fee reminders via WhatsApp/SMS.</li>
                    <li>Improve app performance and user experience.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">3. Data Security</h2>
                <p className="text-slate-600">We implement industry-standard encryption to protect your data. We do not sell your student data to third parties or other coaching institutes.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">4. Contact Us</h2>
                <p className="text-slate-600">For privacy concerns, email us at <span className="font-medium text-blue-600">support@edusmart.in</span>.</p>
            </section>
        </div>
      </div>
    </div>
  );
}