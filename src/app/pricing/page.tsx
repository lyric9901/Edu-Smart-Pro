"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Refs for auto-scroll functionality
  const scrollContainerRef = useRef(null);
  const popularCardRef = useRef(null);

  const plans = [
    {
      name: "Starter",
      bestFor: "Home tutors / Individual batch teachers",
      limit: "Up to 40 Students",
      price: "299",
      originalPrice: "499",
      popular: true, // Note: Set to false if Growth is the only popular one
      features: [
        { text: "Student Management", included: true },
        { text: "Smart Attendance System", included: true },
        { text: "Fee Tracking & Receipts", included: true },
        { text: "Notice Board", included: true },
        { text: "Student/Parent Login App", included: true },
        { text: "WhatsApp Automation", included: false },
        { text: "Personal App Changes", included: false },
      ],
    },
    {
      name: "Growth",
      bestFor: "Growing tuition centers & classes",
      limit: "Up to 150 Students",
      price: "499",
      originalPrice: null,
      popular: true, // This is the target for auto-scroll
      features: [
        { text: "Student Management", included: true },
        { text: "Smart Attendance System", included: true },
        { text: "Fee Tracking & Receipts", included: true },
        { text: "Notice Board", included: true },
        { text: "Student/Parent Login App", included: true },
        { text: "WhatsApp Automation", included: true },
        { text: "Personal App Changes", included: false },
      ],
    },
    {
      name: "Premium",
      bestFor: "Established local institutes",
      limit: "Up to 400 Students",
      price: "2,499",
      originalPrice: null,
      popular: false,
      features: [
        { text: "Student Management", included: true },
        { text: "Smart Attendance System", included: true },
        { text: "Fee Tracking & Receipts", included: true },
        { text: "Notice Board", included: true },
        { text: "Student/Parent Login App", included: true },
        { text: "WhatsApp Automation", included: true },
        { text: "Personal App Changes", included: true },
      ],
    },
  ];

  // Auto-scroll to the Popular card on Mobile after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current && popularCardRef.current) {
        // Only auto-scroll on mobile screens
        if (window.innerWidth < 768) {
          const container = scrollContainerRef.current;
          const targetCard = popularCardRef.current;
          
          // Calculate the exact center of the screen
          const scrollPosition = targetCard.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
          
          container.scrollTo({
            left: scrollPosition,
            behavior: "smooth"
          });
        }
      }
    }, 600); // 600ms delay lets them see it load before sliding

    return () => clearTimeout(timer);
  }, []);

  // Updates the dot indicator when the user scrolls horizontally
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = e.target.offsetWidth;
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
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* --- HERO TEXT --- */}
      <div className="text-center pt-16 pb-8 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
          Simple, Monthly Subscriptions
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          No lifetime contracts. No weird one-time fees. Just a clean, transparent monthly subscription. Choose the plan that fits your institute and upgrade anytime.
        </p>
      </div>

      {/* --- MOBILE UX HINT (Hidden on Desktop) --- */}
      <div className="md:hidden flex items-center justify-center gap-2 text-slate-500 text-sm font-bold mb-6 animate-pulse">
        <ArrowRight size={16} className="text-blue-600" />
        <span>Swipe to compare plans</span>
      </div>

      {/* --- PRICING CARDS SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {plans.map((plan, index) => {
            // We only want the auto-scroll target ref on the Growth plan 
            // (Assuming it's the specific one you want to push, index 1)
            const isAutoScrollTarget = index === 1;

            return (
              <motion.div
                key={plan.name}
                ref={isAutoScrollTarget ? popularCardRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`min-w-[90vw] sm:min-w-[320px] snap-center shrink-0 md:min-w-0 md:w-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden relative flex flex-col ${
                  plan.popular ? "border-2 border-blue-600" : "border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 text-center uppercase tracking-wider">
                    Most Selling
                  </div>
                )}

                <div className={`p-8 text-center border-b border-slate-50 ${plan.popular ? 'pt-10' : ''}`}>
                  <h3 className="text-slate-900 font-black text-2xl mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4 h-10">{plan.bestFor}</p>
                  
                  <div className="inline-block bg-slate-100 text-slate-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">
                    {plan.limit}
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                    <span className="text-slate-400 font-medium self-end mb-2">/mo</span>
                  </div>
                  {plan.originalPrice ? (
                    <p className="text-slate-400 text-sm">
                      Normally <span className="line-through">₹{plan.originalPrice}</span> /mo
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm opacity-0">Spacer</p>
                  )}
                </div>

                <div className="p-8 bg-slate-50/50 flex-grow flex flex-col">
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <FeatureItem key={i} text={feature.text} included={feature.included} />
                    ))}
                  </ul>

                  <Link
                    href={`https://wa.me/7388739691/?plan=${plan.name.toLowerCase()}`}
                    className={`block w-full py-4 font-bold rounded-xl text-center transition shadow-lg ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"
                        : "bg-slate-900 text-white hover:bg-black shadow-slate-200"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- CAROUSEL DOTS (Hidden on Desktop) --- */}
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
      
      {/* Footer Text */}
      <div className="text-center mt-16 text-slate-400 text-sm font-medium">
        <p>This is a recurring monthly subscription. Cancel anytime. 18% GST applicable.</p>
      </div>
    </div>
  );
}

// Helper Component for List Items
function FeatureItem({ text, included }) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <div className="bg-blue-100 p-1 rounded-full text-blue-600 shrink-0">
          <Check size={12} strokeWidth={4} />
        </div>
      ) : (
        <div className="bg-slate-100 p-1 rounded-full text-slate-400 shrink-0">
          <X size={12} strokeWidth={4} />
        </div>
      )}
      <span className={`text-sm font-medium ${included ? "text-slate-700" : "text-slate-400 line-through decoration-slate-300"}`}>
        {text}
      </span>
    </li>
  );
}