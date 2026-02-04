"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Shield, Zap, Settings, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 pb-20">
      
      {/* --- HEADER --- */}
      <nav className="w-full bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">EduSmart<span className="text-blue-600">Pro</span></span>
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* --- HERO TEXT --- */}
      <div className="text-center pt-16 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          No monthly subscriptions. No hidden fees. Pay once and use it forever.
        </p>
      </div>

      {/* --- PRICING CARD SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          
          {/* MAIN LIFETIME PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden relative"
          >
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              MOST POPULAR
            </div>

            <div className="p-8 text-center border-b border-slate-50">
              <h3 className="text-slate-500 font-bold tracking-wider uppercase text-sm mb-2">Lifetime Access</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900">₹199</span>
                <span className="text-slate-400 font-medium self-end mb-2">/forever</span>
              </div>
              <p className="text-slate-400 text-xs">One-time payment. No renewal needed.</p>
            </div>

            <div className="p-8 bg-slate-50/50">
              <ul className="space-y-4 mb-8">
                <FeatureItem text="Student Management" included={true} />
                <FeatureItem text="Smart Attendance System" included={true} />
                <FeatureItem text="Fee Tracking & Receipts" included={true} />
                <FeatureItem text="Notice Board" included={true} />
                <FeatureItem text="Student/Parent Login App" included={true} />
                <FeatureItem text="Secure Cloud Storage" included={true} />
                
                {/* Excluded Items */}
                <FeatureItem text="WhatsApp Automation" included={false} />
                <FeatureItem text="Personal App Changes" included={false} />
              </ul>

              <Link href="/register" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-center hover:bg-black transition shadow-lg shadow-slate-200">
                Get Lifetime Access
              </Link>
            </div>
          </motion.div>

          {/* ADD-ONS SECTION */}
          <div className="w-full max-w-sm space-y-6">
             <div className="text-left md:mt-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Power-Up Add-ons</h3>
                <p className="text-sm text-slate-500 mb-6">Need more power? Add these optional extras anytime.</p>
             </div>

            {/* Add-on 1: WhatsApp */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4"
            >
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">WhatsApp Automation</h4>
                <p className="text-xs text-slate-500 mt-1 mb-2">
                  Auto-send attendance & fee alerts to parents on WhatsApp.
                </p>
                <span className="inline-block bg-green-50 text-green-700 text-sm font-bold px-2 py-1 rounded-md border border-green-100">
                  + ₹79 / month
                </span>
              </div>
            </motion.div>

            {/* Add-on 2: Customization */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4"
            >
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Settings size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Personal Changes</h4>
                <p className="text-xs text-slate-500 mt-1 mb-2">
                  Need a custom logo, specific feature, or color change?
                </p>
                <span className="inline-block bg-purple-50 text-purple-700 text-sm font-bold px-2 py-1 rounded-md border border-purple-100">
                  ₹119 / request
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="text-center mt-20 text-slate-400 text-sm">
        <p>Prices are subject to change. 18% GST applicable.</p>
      </div>
    </div>
  );
}

// Helper Component for List Items
function FeatureItem({ text, included }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <div className="bg-blue-100 p-1 rounded-full text-blue-600">
          <Check size={12} strokeWidth={4} />
        </div>
      ) : (
        <div className="bg-slate-100 p-1 rounded-full text-slate-400">
          <X size={12} strokeWidth={4} />
        </div>
      )}
      <span className={`text-sm font-medium ${included ? "text-slate-700" : "text-slate-400 line-through decoration-slate-300"}`}>
        {text}
      </span>
    </li>
  );
}