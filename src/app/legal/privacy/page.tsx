"use client";
import { ArrowLeft, ShieldCheck, HeartHandshake, Phone, Mail, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><ShieldCheck size={28}/></div>
            <div>
              <h1 className="text-3xl font-black">Privacy Policy & Trust Commitment</h1>
              <p className="text-xs text-slate-500 mt-1">EduSmart Pro - School & Coaching Management App and ERP Software</p>
            </div>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last Updated: September 2026</p>

        {/* Content */}
        <div className="space-y-7 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">1. Information We Collect</h2>
                <p className="text-slate-600">We collect information provided directly by school administrators, tuition educators, and institute owners during registration and usage, including name, phone number, institute/school name, email address, and student profile details entered into the EduSmart Pro platform.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">2. Purpose & Data Usage</h2>
                <p className="text-slate-600">Your data is strictly utilized to deliver school and coaching management ERP services:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                    <li>Automating student attendance tracking and absentee alerts.</li>
                    <li>Generating instant fee payment receipts, ledger records, and WhatsApp alerts.</li>
                    <li>Broadcasting homework assignments, schedules, and digital notices to parents and students.</li>
                    <li>Ensuring high system availability and real-time cloud data synchronization.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">3. 100% Data Ownership & Easy Import/Export</h2>
                <p className="text-slate-600">We firmly respect institutional data sovereignty. You retain full 100% ownership of all student, fee, and academic records. EduSmart Pro offers seamless one-click data import and export (CSV/Excel) with zero vendor lock-in. You may download, backup, or request deletion of your entire institutional dataset at any time without penalty or friction.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">4. Transparent Subscriptions & 7 Days Free Trial</h2>
                <p className="text-slate-600">EduSmart Pro operates with complete pricing honesty. We provide a full-featured 7 days trial with zero hidden charges, zero surprise setup fees, and no mandatory credit card upfront. Institute owners can pause or cancel their monthly subscription at any moment directly without questions asked.</p>
            </section>

            <section className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-lg">
                  <HeartHandshake size={22} className="text-blue-600" />
                  <span>5. Supporting Homegrown Innovation — Help India Grow</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  EduSmart Pro is an independent, homegrown Indian software platform founded with the core mission to digitally empower grassroots educators, tuition centers, and schools nationwide. By choosing our platform, you directly champion indigenous software development for educational institutes and help India grow into a self-reliant technological leader. Please note: EduSmart Pro is a privately developed commercial software platform with no governmental affiliation, ensuring complete operational neutrality, privacy, and dedicated institute-first innovation.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">6. Data Security & Confidentiality</h2>
                <p className="text-slate-600">We employ industry-standard SSL encryption and secured Firebase cloud architecture. We strictly enforce a zero-commercialization policy: we never sell, rent, or lease student information or institute records to third-party marketing companies, advertisers, or competing educational entities.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-3 text-slate-900">7. Official Support & Inquiries</h2>
                <p className="text-slate-600 mb-3">If you have any questions regarding your data privacy, data export, or technical support, please contact our founder & support team directly:</p>
                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-100 border border-slate-200 text-sm">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Phone size={16} className="text-blue-600" /> +91 73887-39691
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Mail size={16} className="text-blue-600" /> shanibrooo@gmail.com
                  </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}