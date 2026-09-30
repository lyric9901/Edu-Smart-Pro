import type { Metadata } from "next";
import { ArrowLeft, IndianRupee } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refunds & Cancellations",
  description: "Refunds & Cancellations policy for EduSmart Pro ERP platform operated by SHAHNAWAZ ALI.",
};

export default function RefundsAndCancellations() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] p-6 md:p-12 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-8 hover:underline text-sm transition">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl shrink-0"><IndianRupee size={28}/></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Refunds & Cancellations</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">EduSmart Pro • Operated by SHAHNAWAZ ALI</p>
            </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Last Updated: February 2026</p>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          This Refunds & Cancellations policy applies to all subscriptions, software licenses, and services provided under the brand name <strong>EduSmart Pro</strong>, which is owned and operated by the legal entity <strong>SHAHNAWAZ ALI</strong> (&ldquo;Proprietor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        </p>

        <div className="space-y-6 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">1. &quot;Paisa Vasool&quot; Guarantee & Cancellations</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">We stand by our product. EduSmart Pro, operated by <strong>SHAHNAWAZ ALI</strong>, offers a transparent cancellation policy. You may cancel your subscription at any time. If you face technical issues that prevent you from using the platform within the first 7 days of purchase, you are eligible for a full refund under our Refunds & Cancellations policy.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">2. Non-Refundable Cases</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Refunds are not applicable if:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                    <li>You simply change your mind after 7 days.</li>
                    <li>The service was used to send bulk spam or unauthorized messages.</li>
                    <li>You have violated the Terms & Conditions.</li>
                    <li>Refund requests made after 30 days of purchase.</li>
                    <li>Discounted or promotional plans (like the ₹199 Offer) are generally non-refundable unless a verified service failure occurs.</li>
                    <li>Refunds will not be issued for issues arising from user error, such as incorrect data entry or failure to follow setup instructions.</li>
                    <li>If our database has more than 10 entries of your institution, refunds will not be issued.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">3. Processing Time for Refunds & Cancellations</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">Approved refunds requested through official channels (email: <a href="mailto:shahnawaz.23120@gmail.com" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">shahnawaz.23120@gmail.com</a>) are processed within 7-14 business days directly to the original payment method.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">4. Student & Coaching Tuition Fee Settlements</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">EduSmart Pro provides software tools for coaching centers and schools to track student fees, dues, and receipts. All tuition fees, admission payments, and coaching dues collected from students or parents are transactions directly between the student/parent and the coaching institute. EduSmart Pro and <strong>SHAHNAWAZ ALI</strong> do not process, hold, or arbitrate student tuition fees, and any dispute, cancellation, or refund regarding coaching fees must be settled directly with the respective institute administration offline.</p>
            </section>
        </div>
      </div>
    </div>
  );
}