"use client";
import { ArrowLeft, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        <Link href="/register" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full"><IndianRupee size={28}/></div>
            <h1 className="text-3xl font-black">Refund & Cancellation</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Last Updated: February 2026</p>

        <div className="space-y-6 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">1. "Paisa Vasool" Guarantee</h2>
                <p className="text-slate-600">We stand by our product. If you face technical issues that prevent you from using the app within the first 7 days of purchase, you are eligible for a full refund.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">2. Non-Refundable Cases</h2>
                <p className="text-slate-600">Refunds are not applicable if:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                    <li>You simply change your mind after 7 days.</li>
                    <li>The service was used to send bulk spam messages.</li>
                    <li>Discounted or promotional plans (like the ₹199 Offer) are generally non-refundable unless a service failure occurs.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900">3. Processing Time</h2>
                <p className="text-slate-600">Approved refunds are processed within 5-7 business days to the original payment method.</p>
            </section>
        </div>
      </div>
    </div>
  );
}