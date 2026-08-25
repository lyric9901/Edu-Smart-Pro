"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Shield, 
  Zap, 
  Menu, 
  X,
  Star,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Bell,
  LayoutDashboard,
  CreditCard,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    if (isContactOpen || isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isContactOpen, isMenuOpen]);

  // Scroll Appear Animations
  const scrollReveal = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Floating Animation for Mockups
  const floatingAnimation = {
    animate: { y: [0, -12, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  };

  const reviews = [
    {
      name: "Rahul Sharma",
      role: "Director, Sharma Classes",
      text: "EduSmart Pro transformed how we manage fees. Parents love the instant updates!",
      rating: 5
    },
    {
      name: "Priya Verma",
      role: "Tutor, Excel Academy",
      text: "So clean and easy to use. I manage my entire coaching from my phone now.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Institute Owner",
      text: "Best decision for my business. It looks professional and students find it cool.",
      rating: 4
    },
    {
      name: "Sneha Iyer",
      role: "Math Educator",
      text: "The WhatsApp automation saves me hours every week. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200 dark:bg-[#0B0F19] dark:text-slate-100 dark:selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz48L3N2Zz4=')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent_85%)]"></div>
      </div>

      {/* --- HEADER & NAVBAR --- */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 dark:bg-[#0B0F19]/80 dark:border-slate-800/80 transition-colors">
        <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8" aria-label="Main Navigation">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 z-50 relative">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
                <Shield className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                EduSmart<span className="text-blue-600 dark:text-blue-400">Pro</span>
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">Features</a>
              <a href="#reviews" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">Reviews</a>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">Pricing</Link>
              <button onClick={() => setIsContactOpen(true)} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">
                Contact Us
              </button>
              <ThemeToggle compact />
              <div className="flex items-center gap-3 ml-2 border-l pl-6 border-slate-200 dark:border-slate-800">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white">Institute Login</Link>
                <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">Register Free</Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="lg:hidden p-2 -mr-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors z-50 relative dark:text-slate-200 dark:hover:bg-slate-800" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden absolute w-full top-16 left-0 bg-white border-b border-slate-200 shadow-2xl dark:bg-[#0B0F19] dark:border-slate-800 flex flex-col"
            >
              <div className="p-5 flex flex-col gap-2">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="px-4 py-3.5 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 transition-colors">Features</a>
                <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="px-4 py-3.5 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 transition-colors">Reviews</a>
                <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="px-4 py-3.5 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 transition-colors">Pricing</Link>
                <button onClick={() => { setIsContactOpen(true); setIsMenuOpen(false); }} className="px-4 py-3.5 text-base font-semibold text-slate-900 rounded-xl hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 transition-colors text-left">
                  Contact Us
                </button>
                <div className="px-4 mt-2 mb-4"><ThemeToggle className="w-full justify-start" /></div>
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-900 text-center transition-colors dark:border-slate-700 dark:text-white">
                    Institute Login
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full py-4 rounded-xl bg-blue-600 font-bold text-white text-center shadow-lg shadow-blue-500/25 transition-colors">
                    Register Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 pt-24 lg:pt-32">
        
        {/* --- HERO SECTION --- */}
        <section className="px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20" aria-labelledby="hero-heading">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-10">
            
            <motion.div 
              className="flex-1 text-left w-full pt-8 lg:pt-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-[11px] sm:text-xs font-semibold mb-6 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 shadow-sm"
              >
                <Zap size={14} className="fill-current" aria-hidden="true" /> 
                New: Automated WhatsApp Notices
              </motion.div>
              
              <h1 id="hero-heading" className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-5 dark:text-white">
                Manage your Coaching <br />
                <span className="text-blue-600 dark:text-blue-500">Like a Pro.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed dark:text-slate-400">
                Attendance, Fees, Notices, and Student Tracking—all in one beautiful app. 
                Give your institute the digital upgrade it deserves.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="w-full sm:w-auto px-6 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  Get Started for Free <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-6 py-4 bg-white text-slate-800 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center dark:bg-[#111827] dark:text-slate-200 dark:border-slate-700">
                  Existing User Login
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0B0F19] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider dark:text-slate-400">
                  Trusted by 100+ Institutes in India
                </p>
              </div>
            </motion.div>

            {/* FLOATING HERO MOCKUP */}
            <motion.div 
              className="flex-1 w-full relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div {...floatingAnimation} className="relative z-10">
                {/* Mobile Specific UI Widget (Hidden on Desktop) */}
                <div className="lg:hidden w-full max-w-sm mx-auto bg-white rounded-[2rem] border-[6px] border-slate-100 shadow-2xl overflow-hidden dark:bg-[#111827] dark:border-slate-800">
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 flex justify-center items-center">
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Today's Revenue</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 24,500</div>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-500/10 dark:text-blue-400">
                        <TrendingUp size={24} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-[#1A2235] dark:border-slate-700">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-3 w-20 bg-slate-300 rounded mb-2 dark:bg-slate-600"></div>
                            <div className="h-2 w-12 bg-slate-200 rounded dark:bg-slate-700"></div>
                          </div>
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Specific Mockup (Hidden on Mobile) */}
                <div className="hidden lg:block w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden dark:bg-[#111827] dark:border-slate-800">
                  <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 dark:bg-[#1A2235] dark:border-slate-800">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-amber-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
                  </div>
                  <div className="flex h-[400px]">
                    <div className="w-56 border-r border-slate-100 bg-slate-50/50 p-4 space-y-2 dark:border-slate-800 dark:bg-[#111827]">
                      {[LayoutDashboard, Users, CreditCard, MessageSquare].map((Icon, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
                          <Icon size={18} />
                          <div className={`h-2.5 rounded w-20 ${i === 0 ? 'bg-blue-400/50' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 p-8 bg-white dark:bg-[#0B0F19]">
                      <div className="flex gap-6 mb-8">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex-1 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 mb-3 dark:bg-blue-500/10"></div>
                            <div className="w-20 h-3 bg-slate-200 rounded mb-2 dark:bg-slate-700"></div>
                            <div className="w-12 h-5 bg-slate-800 rounded dark:bg-slate-300"></div>
                          </div>
                        ))}
                      </div>
                      <div className="border border-slate-100 rounded-xl dark:border-slate-800">
                        <div className="h-10 bg-slate-50 border-b border-slate-100 dark:bg-[#1A2235] dark:border-slate-800"></div>
                        {[1, 2].map((i) => (
                          <div key={i} className="p-4 border-b border-slate-50 flex items-center gap-4 dark:border-slate-800/50">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            <div className="w-32 h-3 bg-slate-200 rounded dark:bg-slate-700"></div>
                            <div className="ml-auto w-16 h-3 bg-green-100 rounded dark:bg-green-500/20"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 rounded-full blur-[80px] -z-10"></div>
            </motion.div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-20 lg:py-28 bg-white border-y border-slate-200 dark:bg-[#111827] dark:border-slate-800" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div {...scrollReveal} className="text-left md:text-center mb-14 max-w-2xl mx-auto">
              <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                Everything you need
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Stop using WhatsApp groups and Excel sheets.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            >
              {/* Feature 1 */}
              <motion.div variants={staggerItem} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col dark:bg-[#0B0F19] dark:border-slate-800">
                <div className="p-8 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5 dark:bg-blue-500/20">
                    <Users className="text-blue-600 dark:text-blue-400" size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Student Management</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base">Track academic journeys in one click.</p>
                </div>
                <div className="mt-auto px-8 pb-0">
                  <motion.div whileHover={{ y: -5 }} className="w-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-md p-5 pb-0 dark:bg-[#1A2235] dark:border-slate-700 transition-transform">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                        <div className="flex-1">
                          <div className="w-24 h-2.5 bg-slate-300 rounded mb-2 dark:bg-slate-600"></div>
                          <div className="w-16 h-2 bg-slate-200 rounded dark:bg-slate-700"></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={staggerItem} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col dark:bg-[#0B0F19] dark:border-slate-800">
                <div className="p-8 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-5 dark:bg-purple-500/20">
                    <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Smart Attendance</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base">Instant alerts for absent students.</p>
                </div>
                <div className="mt-auto px-8 pb-0">
                  <motion.div whileHover={{ y: -5 }} className="w-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-md p-5 pb-4 dark:bg-[#1A2235] dark:border-slate-700 transition-transform">
                    <div className="grid grid-cols-7 gap-2">
                      {[...Array(14)].map((_, i) => (
                        <div key={i} className={`aspect-square rounded-md ${i === 4 || i === 11 ? 'bg-red-100 dark:bg-red-500/20' : i === 7 ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-green-100 dark:bg-green-500/20'}`}></div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={staggerItem} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col dark:bg-[#0B0F19] dark:border-slate-800">
                <div className="p-8 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-5 dark:bg-green-500/20">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Fee Tracking</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base">Automated reminders & receipts.</p>
                </div>
                <div className="mt-auto px-8 pb-0">
                  <motion.div whileHover={{ y: -5 }} className="w-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-md p-5 pb-0 flex flex-col gap-4 dark:bg-[#1A2235] dark:border-slate-700 transition-transform">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700/50">
                        <div className="w-28 h-3 bg-slate-200 rounded dark:bg-slate-600"></div>
                        <div className={`w-20 h-4 rounded-full ${i === 1 ? 'bg-green-100 dark:bg-green-500/20' : 'bg-amber-100 dark:bg-amber-500/20'}`}></div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div variants={staggerItem} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col dark:bg-[#0B0F19] dark:border-slate-800">
                <div className="p-8 pb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-5 dark:bg-orange-500/20">
                    <MessageSquare className="text-orange-600 dark:text-orange-400" size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Notice Board</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-base">Broadcast updates to everyone instantly.</p>
                </div>
                <div className="mt-auto px-8 pb-0">
                  <motion.div whileHover={{ y: -5 }} className="w-full bg-white rounded-t-2xl border-x border-t border-slate-200 shadow-md p-5 pb-0 flex flex-col gap-4 dark:bg-[#1A2235] dark:border-slate-700 transition-transform">
                    <div className="w-[80%] bg-slate-100 rounded-xl rounded-tl-none p-4 dark:bg-slate-700">
                      <div className="w-full h-2 bg-slate-300 rounded mb-2 dark:bg-slate-500"></div>
                      <div className="w-2/3 h-2 bg-slate-200 rounded dark:bg-slate-600"></div>
                    </div>
                    <div className="w-[70%] bg-blue-50 self-end rounded-xl rounded-tr-none p-4 dark:bg-blue-500/10 mb-4">
                      <div className="w-full h-2 bg-blue-200 rounded mb-2 dark:bg-blue-500/30"></div>
                      <div className="w-1/2 h-2 bg-blue-200 rounded dark:bg-blue-500/20"></div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* --- REVIEWS SECTION --- */}
        <section id="reviews" className="py-20 lg:py-28" aria-labelledby="reviews-heading">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div {...scrollReveal} className="text-left md:text-center mb-14">
              <h2 id="reviews-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Loved by Owners
              </h2>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8"
            >
              {reviews.map((review, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full dark:bg-[#111827] dark:border-slate-800"
                >
                  <div className="flex gap-1.5 mb-5" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-8 text-base sm:text-lg leading-relaxed flex-grow">
                    "{review.text}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black text-lg shrink-0 dark:bg-slate-800 dark:text-slate-300" aria-hidden="true">
                      {review.name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{review.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8 dark:bg-[#0B0F19] dark:border-slate-800" aria-label="Site Footer">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-slate-900 p-1.5 rounded-lg dark:bg-white">
                <Shield className="text-white w-5 h-5 dark:text-slate-900" aria-hidden="true" />
              </div>
              <h3 className="text-slate-900 font-bold text-xl dark:text-white">EduSmart Pro</h3>
            </div>
            <p className="text-base text-slate-500 leading-relaxed max-w-sm dark:text-slate-400">
              The #1 Management Platform for Coaching Institutes, Tuition Centers, and Schools in India.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 font-bold mb-3 text-base dark:text-white">Product</h4>
            <ul className="flex flex-col text-base text-slate-500 dark:text-slate-400 font-medium">
              <li><Link href="/login" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Login</Link></li>
              <li><Link href="/register" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Register</Link></li>
              <li><Link href="/pricing" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Pricing</Link></li>
              <li><button onClick={() => setIsContactOpen(true)} className="block py-2 text-left w-full hover:text-slate-900 transition-colors dark:hover:text-white">Contact Us</button></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 font-bold mb-3 text-base dark:text-white">Legal</h4>
            <ul className="flex flex-col text-base text-slate-500 dark:text-slate-400 font-medium">
              <li><Link href="/legal/privacy" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/legal/term" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Terms of Service</Link></li>
              <li><Link href="/legal/refund" className="block py-2 hover:text-slate-900 transition-colors dark:hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-5 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <div>© {new Date().getFullYear()} EduSmart Pro. All rights reserved.</div>
          <div>Made with ❤️ in India.</div>
        </div>
      </footer>

      {/* --- CONTACT US MODAL --- */}
      <AnimatePresence>
        {isContactOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/70"
              aria-hidden="true"
            />
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white dark:bg-[#111827] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 mt-20"
            >
              <div className="p-6 sm:p-8 flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 id="modal-title" className="text-2xl font-black text-slate-900 dark:text-white">Get in touch</h3>
                  <button 
                    onClick={() => setIsContactOpen(false)}
                    aria-label="Close contact modal"
                    className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <X size={24} aria-hidden="true" />
                  </button>
                </div>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsContactOpen(false); }}>
                  <div>
                    <label htmlFor="name-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                    <input id="name-input" type="text" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base" placeholder="Your Name" />
                  </div>
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input id="email-input" type="email" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="msg-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                    <textarea id="msg-input" required rows={4} className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-base" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                    Send Message <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </form>

                <div className="mt-8 flex flex-col items-start sm:flex-row sm:items-center sm:justify-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                    <Mail size={18} className="text-slate-400" aria-hidden="true" /> shanibrooo@gmail.com
                  </div>
                  <div className="hidden sm:block text-slate-300 dark:text-slate-700">•</div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                    <Phone size={18} className="text-slate-400" aria-hidden="true" /> +91 73887-39691
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}