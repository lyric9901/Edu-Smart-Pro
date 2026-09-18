"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, ArrowRight, Phone, Mail, FileSpreadsheet, Sparkles, HeartHandshake } from "lucide-react";

export default function PricingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Refs for auto-scroll functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const popularCardRef = useRef<HTMLDivElement>(null);

  const plans = [
    {
      name: "Starter",
      bestFor: "Home tutors & individual coaching batches",
      limit: "Up to 40 Students",
      price: "299",
      originalPrice: "499",
      popular: false,
      features: [
        { text: "Complete Student & Batch Management", included: true },
        { text: "Smart Daily Attendance & Absentee Tracker", included: true },
        { text: "Fee Tracking & Instant Digital Receipts", included: true },
        { text: "Digital Notice Board & Timetable", included: true },
        { text: "Student & Parent Login Mobile App (PWA)", included: true },
        { text: "Easy CSV/Excel Data Import & Export", included: true },
        { text: "7 Days Free Trial (Zero Hidden Charges)", included: true },
        { text: "Automated WhatsApp Notices & Receipts", included: false },
        { text: "Custom Branding & Institute Personalization", included: false },
      ],
    },
    {
      name: "Growth",
      bestFor: "Growing tuition centers, coaching institutes & schools",
      limit: "Up to 150 Students",
      price: "499",
      originalPrice: "799",
      popular: true, // Auto-scroll target
      features: [
        { text: "Complete Student & Batch Management", included: true },
        { text: "Smart Daily Attendance & Absentee Tracker", included: true },
        { text: "Fee Tracking & Instant Digital Receipts", included: true },
        { text: "Digital Notice Board & Timetable", included: true },
        { text: "Student & Parent Login Mobile App (PWA)", included: true },
        { text: "Easy CSV/Excel Data Import & Export", included: true },
        { text: "7 Days Free Trial (Zero Hidden Charges)", included: true },
        { text: "Automated WhatsApp Notices & Receipts", included: true },
        { text: "Custom Branding & Institute Personalization", included: false },
      ],
    },
    {
      name: "Premium",
      bestFor: "Established institutes, multi-batch centers & academies",
      limit: "Up to 400 Students",
      price: "2,499",
      originalPrice: "3,999",
      popular: false,
      features: [
        { text: "Complete Student & Batch Management", included: true },
        { text: "Smart Daily Attendance & Absentee Tracker", included: true },
        { text: "Fee Tracking & Instant Digital Receipts", included: true },
        { text: "Digital Notice Board & Timetable", included: true },
        { text: "Student & Parent Login Mobile App (PWA)", included: true },
        { text: "Easy CSV/Excel Data Import & Export", included: true },
        { text: "7 Days Free Trial (Zero Hidden Charges)", included: true },
        { text: "Automated WhatsApp Notices & Receipts", included: true },
        { text: "Custom Branding & Institute Personalization", included: true },
      ],
    },
  ];

  // Auto-scroll to the Popular card on Mobile after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current && popularCardRef.current) {
        if (window.innerWidth < 768) {
          const container = scrollContainerRef.current;
          const targetCard = popularCardRef.current;
          
          const scrollPosition = targetCard.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
          
          container.scrollTo({
            left: scrollPosition,
            behavior: "smooth"
          });
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const cardWidth = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 pb-20">
      {/* --- HEADER --- */}
      <nav className="w-full bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              EduSmart<span className="text-blue-600">Pro</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">
              ← Back to Home
            </Link>
            <Link href="/register" className="hidden sm:inline-flex px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Start 7-Day Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* --- TRUST BANNER: HELP INDIA GROW --- */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-bold">
        <span>🇮🇳 Proudly Homegrown Indian Startup — Help India Grow by Empowering Educators</span>
        <span className="mx-2 hidden md:inline">•</span>
        <span className="hidden md:inline">7 Days Free Trial • No Hidden Charges • Cancel Anytime</span>
      </div>

      {/* --- HERO TEXT --- */}
      <div className="text-center pt-12 pb-6 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
          <Sparkles size={14} /> School & Coaching Management App and ERP Software
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3">
          Transparent Subscriptions, Zero Lock-In
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          No ₹50,000 legacy contracts. No hidden charges. Enjoy a full-access <strong>7-day free trial</strong>, cancel subscription anytime, and seamlessly import/export your data in Excel/CSV.
        </p>

        {/* TRUST PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs sm:text-sm font-semibold text-slate-700">
          <span className="px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
            <Check size={14} className="text-green-600" /> 7 Days Free Trial
          </span>
          <span className="px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
            <Check size={14} className="text-green-600" /> No Hidden Charges
          </span>
          <span className="px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
            <Check size={14} className="text-green-600" /> Cancel Anytime
          </span>
          <span className="px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5">
            <FileSpreadsheet size={14} className="text-blue-600" /> Easy CSV/Excel Import & Export
          </span>
        </div>
      </div>

      {/* --- MOBILE UX HINT --- */}
      <div className="md:hidden flex items-center justify-center gap-2 text-slate-500 text-sm font-bold mb-6 animate-pulse">
        <ArrowRight size={16} className="text-blue-600" />
        <span>Swipe to compare plans</span>
      </div>

      {/* --- PRICING CARDS SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mt-4">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {plans.map((plan, index) => {
            const isAutoScrollTarget = index === 1;

            return (
              <motion.div
                key={plan.name}
                ref={isAutoScrollTarget ? popularCardRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`min-w-[88vw] sm:min-w-[320px] snap-center shrink-0 md:min-w-0 md:w-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col ${
                  plan.popular ? "border-2 border-blue-600" : "border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 text-center uppercase tracking-wider">
                    Most Popular for Coaching & Schools
                  </div>
                )}

                <div className={`p-8 text-center border-b border-slate-50 ${plan.popular ? 'pt-8' : ''}`}>
                  <h3 className="text-slate-900 font-black text-2xl mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mb-4 h-9">{plan.bestFor}</p>
                  
                  <div className="inline-block bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-5">
                    {plan.limit}
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                    <span className="text-slate-400 font-medium self-end mb-2">/month</span>
                  </div>
                  {plan.originalPrice ? (
                    <p className="text-slate-400 text-xs">
                      Normally <span className="line-through">₹{plan.originalPrice}</span>/mo • Save instantly
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs opacity-0">Spacer</p>
                  )}
                </div>

                <div className="p-7 bg-slate-50/60 flex-grow flex flex-col justify-between">
                  <ul className="space-y-3.5 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <FeatureItem key={i} text={feature.text} included={feature.included} />
                    ))}
                  </ul>

                  <div className="space-y-2.5">
                    <Link
                      href="/register"
                      className={`block w-full py-3.5 font-bold rounded-xl text-center transition shadow-md ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                          : "bg-slate-900 text-white hover:bg-black shadow-slate-200"
                      }`}
                    >
                      Start 7-Day Free Trial
                    </Link>
                    <a
                      href={`https://wa.me/917388739691?text=${encodeURIComponent(`Hi Shah, I am interested in the ${plan.name} plan for my institute.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-xs text-slate-500 hover:text-blue-600 font-semibold"
                    >
                      Questions? Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- CAROUSEL DOTS (Mobile Only) --- */}
        <div className="flex justify-center items-center gap-2 mt-2 md:hidden">
          {plans.map((_, index) => (
            <div 
              key={index} 
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex 
                  ? "w-6 h-2 bg-blue-600" 
                  : "w-2 h-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* --- SUPPORT & EASY DATA MIGRATION SECTION --- */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
              <HeartHandshake size={16} /> Help India Grow • Dedicated Local Support
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Switching from another ERP or Excel sheet?
            </h3>
            <p className="text-slate-600 text-sm max-w-xl">
              Our team will personally help you import all your students and batches for free. 100% data privacy with zero downtime.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="https://wa.me/917388739691?text=Hello%20Shah,%20I%20want%20to%20know%20more%20about%20EduSmart%20Pro%20ERP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition"
            >
              <Phone size={16} /> +91 73887-39691
            </a>
            <a
              href="mailto:shanibrooo@gmail.com"
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <Mail size={16} /> shanibrooo@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="text-center mt-12 text-slate-500 text-xs sm:text-sm font-medium">
        <p>Monthly subscription • Cancel anytime with one click • No hidden charges.</p>
        <p className="mt-1">
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Click here to try full features free for 7 days without paying!
          </Link>
        </p>
      </div>
    </div>
  );
}

// Helper Component for List Items
function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {included ? (
        <div className="bg-blue-100 p-0.5 rounded-full text-blue-600 shrink-0 mt-0.5">
          <Check size={12} strokeWidth={4} />
        </div>
      ) : (
        <div className="bg-slate-100 p-0.5 rounded-full text-slate-400 shrink-0 mt-0.5">
          <X size={12} strokeWidth={3} />
        </div>
      )}
      <span className={`text-xs sm:text-sm font-medium leading-snug ${included ? "text-slate-800" : "text-slate-400 line-through decoration-slate-300"}`}>
        {text}
      </span>
    </li>
  );
}